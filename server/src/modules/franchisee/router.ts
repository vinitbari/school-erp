import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { authenticate, schoolScope } from '../../middleware';

const router = Router();
router.use(authenticate);
router.use(schoolScope);

// GET /api/franchisee/invoices - Get franchisee invoices (SOA entries)
router.get('/invoices', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user!.schoolId!;
    const { from, to, type } = req.query;

    const where: any = { schoolId };
    if (type) where.entryType = type;
    if (from || to) {
      where.entryDate = {};
      if (from) where.entryDate.gte = new Date(from as string);
      if (to) where.entryDate.lte = new Date(to as string);
    }

    const entries = await prisma.sOAEntry.findMany({
      where,
      orderBy: { entryDate: 'desc' },
    });

    const totalInvoice = entries.reduce((sum, e) => sum + Number(e.invoiceAmount || 0), 0);
    const totalReceipt = entries.reduce((sum, e) => sum + Number(e.receiptAmount || 0), 0);

    res.json({
      success: true,
      data: entries,
      total: entries.length,
      summary: {
        totalInvoice,
        totalReceipt,
        balance: totalInvoice - totalReceipt,
      },
    });
  } catch (error) { next(error); }
});

// GET /api/franchisee/royalty-forecast - Forecasted royalties
router.get('/royalty-forecast', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schoolId = req.user!.schoolId!;

    const forecasts = await prisma.forecastedRoyalty.findMany({
      where: { admission: { schoolId } },
      include: {
        admission: {
          include: {
            student: { select: { firstName: true, lastName: true, uin: true } },
            program: { select: { name: true, shortName: true } },
          },
        },
      },
      orderBy: [{ month: 'asc' }],
    });

    // Group by month
    const byMonth: Record<string, { month: string; amount: number; studentCount: number }> = {};
    forecasts.forEach((f) => {
      const key = f.month.toISOString().substring(0, 7);
      if (!byMonth[key]) byMonth[key] = { month: key, amount: 0, studentCount: 0 };
      byMonth[key].amount += Number(f.amount);
      byMonth[key].studentCount++;
    });

    res.json({
      success: true,
      data: {
        details: forecasts,
        monthly: Object.values(byMonth),
        totalForecast: forecasts.reduce((sum, f) => sum + Number(f.amount), 0),
      },
    });
  } catch (error) { next(error); }
});

export default router;
