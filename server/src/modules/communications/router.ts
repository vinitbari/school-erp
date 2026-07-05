import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { authenticate, schoolScope } from '../../middleware';

const router = Router();
router.use(authenticate);
router.use(schoolScope);

// GET /api/communications/business-visits
router.get('/business-visits', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user!.schoolId!;
    // Return school info and recent enquiry activity as "business visits" context
    const [school, recentEnquiries, sources] = await Promise.all([
      prisma.school.findUnique({
        where: { id: schoolId },
        select: { name: true, code: true, city: true, state: true },
      }),
      prisma.enquiry.count({ where: { schoolId, deletedAt: null } }),
      prisma.enquiry.groupBy({
        by: ['mediaSourceId'],
        where: { schoolId, deletedAt: null },
        _count: { id: true },
      }),
    ]);

    const mediaSources = await prisma.mediaSource.findMany({ select: { id: true, name: true } });
    const sourceData = sources.map((s) => ({
      source: mediaSources.find((m) => m.id === s.mediaSourceId)?.name || 'Unknown',
      count: s._count.id,
    }));

    res.json({
      success: true,
      data: { school, totalEnquiries: recentEnquiries, sourceBreakdown: sourceData },
    });
  } catch (error) { next(error); }
});

// GET /api/communications/academics-visits
router.get('/academics-visits', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user!.schoolId!;

    const [totalAdmissions, programs] = await Promise.all([
      prisma.admission.count({ where: { schoolId, status: 'ACTIVE', deletedAt: null } }),
      prisma.program.findMany({ orderBy: { sortOrder: 'asc' } }),
    ]);

    const programData = await Promise.all(programs.map(async (p) => ({
      program: p.name,
      shortName: p.shortName,
      students: await prisma.admission.count({
        where: { schoolId, programId: p.id, status: 'ACTIVE', deletedAt: null },
      }),
    })));

    res.json({
      success: true,
      data: { totalActiveStudents: totalAdmissions, programWise: programData },
    });
  } catch (error) { next(error); }
});

export default router;
