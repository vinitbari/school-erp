import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import prisma from '../../config/database';
import { config } from '../../config';
import { AppError } from '../../middleware/errorHandler';
import { createAuditLog } from '../../utils/helpers';
import { LoginInput } from './schema';

export class AuthService {
  /**
   * Authenticate user and return tokens
   */
  async login(input: LoginInput, ip?: string, userAgent?: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: input.username },
          { email: input.username },
        ],
        isActive: true,
        deletedAt: null,
      },
      include: {
        school: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.role, user.schoolId);
    const refreshToken = await this.generateRefreshToken(user.id);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      ipAddress: ip,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        school: user.school,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refresh(refreshToken: string) {
    // Verify refresh token exists and is valid
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          select: { id: true, role: true, schoolId: true, isActive: true },
        },
      },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      // Clean up expired token if exists
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      throw new AppError('Invalid or expired refresh token', 401, true, 'REFRESH_TOKEN_EXPIRED');
    }

    if (!storedToken.user.isActive) {
      throw new AppError('User account is deactivated', 401);
    }

    // Rotate refresh token (invalidate old, create new)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const newAccessToken = this.generateAccessToken(
      storedToken.user.id,
      storedToken.user.role,
      storedToken.user.schoolId
    );
    const newRefreshToken = await this.generateRefreshToken(storedToken.user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout - invalidate refresh token
   */
  async logout(refreshToken?: string, userId?: string) {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }
    
    // Optionally invalidate all refresh tokens for user
    if (userId) {
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        lastLoginAt: true,
        school: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Create a new user (admin only)
   */
  async createUser(data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    schoolId?: string;
    phone?: string;
  }) {
    // Check for existing user
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          { email: data.email },
        ],
      },
    });

    if (existing) {
      throw new AppError('Username or email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as any,
        schoolId: data.schoolId,
        phone: data.phone,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return user;
  }

  // ── Private methods ──────────────────────────────────────────

  private generateAccessToken(userId: string, role: string, schoolId?: string | null): string {
    return jwt.sign(
      { userId, role, schoolId: schoolId || undefined },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = `rt_${randomBytes(32).toString('hex')}`;
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }
}

export const authService = new AuthService();
