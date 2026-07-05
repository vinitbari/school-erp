import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware';

const router = Router();

// All lookup routes require authentication
router.use(authenticate);

// GET /api/lookups/programs
router.get('/programs', async (_req, res, next) => {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, shortName: true },
    });
    res.json({ success: true, data: programs });
  } catch (error) { next(error); }
});

// GET /api/lookups/academic-years
router.get('/academic-years', async (_req, res, next) => {
  try {
    const years = await prisma.academicYear.findMany({
      orderBy: { startDate: 'desc' },
      select: { id: true, label: true, isCurrent: true },
    });
    res.json({ success: true, data: years });
  } catch (error) { next(error); }
});

// GET /api/lookups/media-sources
router.get('/media-sources', async (_req, res, next) => {
  try {
    const sources = await prisma.mediaSource.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });
    res.json({ success: true, data: sources });
  } catch (error) { next(error); }
});

// GET /api/lookups/batches
router.get('/batches', async (req, res, next) => {
  try {
    const { programId, schoolId } = req.query;
    const batches = await prisma.batch.findMany({
      where: {
        ...(programId && { programId: programId as string }),
        ...(schoolId && { schoolId: schoolId as string }),
      },
      select: { id: true, timeSlot: true, capacity: true, program: { select: { name: true } } },
    });
    res.json({ success: true, data: batches });
  } catch (error) { next(error); }
});

// GET /api/lookups/discount-types
router.get('/discount-types', async (req, res, next) => {
  try {
    const { schoolId } = req.query;
    const discounts = await prisma.discountType.findMany({
      where: schoolId ? { schoolId: schoolId as string } : {},
      select: { id: true, name: true, percentage: true, flatAmount: true },
    });
    res.json({ success: true, data: discounts });
  } catch (error) { next(error); }
});

export default router;
