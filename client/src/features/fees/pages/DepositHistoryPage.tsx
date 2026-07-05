import { useState, useEffect } from 'react';
import { feesApi } from '../api';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, Printer, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface DepositSlip {
  id: string;
  slipNumber: string;
  depositDate: string;
  bankName: string;
  bankBranch: string;
  totalAmount: number;
  status: string;
  receipts: any[];
}

export default function DepositHistoryPage() {
  const [data, setData] = useState<DepositSlip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);

  const fetchDeposits = async () => {
    setIsLoading(true);
    try {
      const res = await feesApi.listDeposits();
      if (res.data.success && res.data.data) {
        setData(res.data.data.map((d: any) => ({
          id: d.id,
          slipNumber: d.slipNumber,
          depositDate: d.depositDate,
          bankName: d.bankName || '-',
          bankBranch: d.bankBranch || '-',
          totalAmount: Number(d.totalAmount),
          status: d.status,
          receipts: d.receipts || [],
        })));
      }
    } catch (error) {
      console.error('Failed to fetch deposits', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDeposits(); }, []);

  const handlePrint = (slip: DepositSlip) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptRows = slip.receipts.map((r: any) => `
      <tr>
        <td style="padding:6px;border:1px solid #ddd">${r.chequeNumber || '-'}</td>
        <td style="padding:6px;border:1px solid #ddd">${r.admission?.student ? `${r.admission.student.firstName} ${r.admission.student.lastName}` : '-'}</td>
        <td style="padding:6px;border:1px solid #ddd">${r.bankName || '-'}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right">₹${Number(r.amount).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html><head><title>Deposit Slip - ${slip.slipNumber}</title></head>
      <body style="font-family:Arial,sans-serif;padding:20px">
        <h2>Deposit Slip</h2>
        <p><strong>Slip No:</strong> ${slip.slipNumber}</p>
        <p><strong>Date:</strong> ${new Date(slip.depositDate).toLocaleDateString('en-IN')}</p>
        <p><strong>Bank:</strong> ${slip.bankName} - ${slip.bankBranch}</p>
        <p><strong>Total:</strong> ₹${slip.totalAmount.toLocaleString('en-IN')}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <thead><tr style="background:#f5f5f5">
            <th style="padding:6px;border:1px solid #ddd;text-align:left">Cheque No</th>
            <th style="padding:6px;border:1px solid #ddd;text-align:left">Student</th>
            <th style="padding:6px;border:1px solid #ddd;text-align:left">Bank</th>
            <th style="padding:6px;border:1px solid #ddd;text-align:right">Amount</th>
          </tr></thead>
          <tbody>${receiptRows}</tbody>
        </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const filtered = search
    ? data.filter((d) => d.slipNumber.toLowerCase().includes(search.toLowerCase()))
    : data;

  return (
    <div className="space-y-6">
      <PageHeader title="Manage Deposit Screen" description="View and print deposit slip details" />

      <Card>
        <CardContent className="p-4">
          {/* Search + page size */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="h-8 max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              Show
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border rounded px-1 py-0.5 bg-background">
                <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
              </select>
              entries
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60 border-b">
                  <th className="p-3 text-left font-semibold">Slip No</th>
                  <th className="p-3 text-left font-semibold">Deposit Date</th>
                  <th className="p-3 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No data available in table</td></tr>
                ) : (
                  filtered.slice(0, pageSize).map((row) => (
                    <>
                      <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono text-sm font-medium text-primary">{row.slipNumber}</td>
                        <td className="p-3">{formatDate(row.depositDate)}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon-sm" title="Print Slip" onClick={() => handlePrint(row)}>
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" title="View Details" onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}>
                              {expandedId === row.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {expandedId === row.id && (
                        <tr key={`${row.id}-detail`}>
                          <td colSpan={3} className="p-4 bg-muted/20">
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Bank: {row.bankName} • Branch: {row.bankBranch} • Total: <strong>{formatCurrency(row.totalAmount)}</strong> • Receipts: {row.receipts.length}
                              </p>
                              <table className="w-full text-xs border rounded">
                                <thead>
                                  <tr className="bg-muted/40">
                                    <th className="p-2 text-left">Receipt No</th>
                                    <th className="p-2 text-left">Student</th>
                                    <th className="p-2 text-left">Cheque No</th>
                                    <th className="p-2 text-right">Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {row.receipts.map((r: any) => (
                                    <tr key={r.id} className="border-b">
                                      <td className="p-2 font-mono">{r.receiptNumber}</td>
                                      <td className="p-2">{r.admission?.student ? `${r.admission.student.firstName} ${r.admission.student.lastName}` : '-'}</td>
                                      <td className="p-2 font-mono">{r.chequeNumber || '-'}</td>
                                      <td className="p-2 text-right font-mono">{formatCurrency(Number(r.amount))}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
