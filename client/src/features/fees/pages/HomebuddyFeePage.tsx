import { useState, useEffect } from 'react';
import { feesApi } from '../api';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, FileDown } from 'lucide-react';

interface HomebuddyReceipt {
  id: string;
  uin: string;
  studentName: string;
  program: string;
  receiptNumber: string;
  amount: number;
  receiptDate: string;
}

function downloadCSV(data: HomebuddyReceipt[], filename: string) {
  const headers = ['Student UIN', 'Student Name', 'Program Name', 'Receipt Number', 'Amount', 'Payment Date'];
  const rows = data.map((r) => [r.uin, r.studentName, r.program, r.receiptNumber, r.amount.toString(), r.receiptDate]);
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function HomebuddyFeePage() {
  const [data, setData] = useState<HomebuddyReceipt[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await feesApi.getHomebuddyReceipts({ search: search || undefined } as any);
      if (res.data.success && res.data.data) {
        const mapped = res.data.data.map((r: any) => ({
          id: r.id,
          uin: r.admission?.uin || '-',
          studentName: `${r.admission?.student?.firstName || ''} ${r.admission?.student?.lastName || ''}`.trim(),
          program: r.admission?.program?.name || '-',
          receiptNumber: r.receiptNumber,
          amount: Number(r.amount),
          receiptDate: r.receiptDate,
        }));
        setData(mapped);
        setTotal(res.data.total || mapped.length);
      }
    } catch (error) {
      console.error('Failed to fetch homebuddy receipts', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = search
    ? data.filter((r) =>
        r.studentName.toLowerCase().includes(search.toLowerCase()) ||
        r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
        r.uin.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  const totalAmount = filtered.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Fee Collection through Homebuddy App" description="Track payments received through the Homebuddy mobile app" />

      {/* Summary Card */}
      <Card className="max-w-xs">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">≡ Fee Collection through Homebuddy</p>
          <p className="text-2xl font-bold">{total}</p>
          <div className="w-full h-1 bg-gradient-to-r from-green-400 to-green-600 rounded mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          {/* Download button */}
          <div className="mb-4">
            <Button className="bg-slate-700 hover:bg-slate-800 text-white" onClick={() => downloadCSV(filtered, 'homebuddy_payment_report.csv')}>
              <FileDown className="h-4 w-4 mr-2" />
              Download Homebuddy Payment Report
            </Button>
          </div>

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
                  <th className="p-3 text-left font-semibold">Student UIN</th>
                  <th className="p-3 text-left font-semibold">Student Name</th>
                  <th className="p-3 text-center font-semibold">Program Name</th>
                  <th className="p-3 text-center font-semibold">ReceiptNumber</th>
                  <th className="p-3 text-right font-semibold">Amount</th>
                  <th className="p-3 text-center font-semibold">Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No data available in table</td></tr>
                ) : (
                  filtered.slice(0, pageSize).map((row) => (
                    <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-xs">{row.uin}</td>
                      <td className="p-3 font-medium">{row.studentName}</td>
                      <td className="p-3 text-center">{row.program}</td>
                      <td className="p-3 text-center font-mono text-xs">{row.receiptNumber}</td>
                      <td className="p-3 text-right font-mono font-bold text-primary">{formatCurrency(row.amount)}</td>
                      <td className="p-3 text-center">{formatDate(row.receiptDate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > pageSize && (
            <div className="text-xs text-muted-foreground mt-3 text-center">
              Showing {Math.min(pageSize, filtered.length)} of {filtered.length} entries
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
