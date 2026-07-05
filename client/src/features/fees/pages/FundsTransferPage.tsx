import { useState, useEffect } from 'react';
import { feesApi } from '../api';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, FileDown } from 'lucide-react';

interface TransferRow {
  dateOfTransfer: string;
  receiptType: string;
  franchiseeShare: number;
  llplShare: number;
  taxAmount: number;
  welcomeKit: number;
  totalLLPLShare: number;
  chequeAmount: number;
}

function downloadCSV(data: TransferRow[], filename: string) {
  const headers = ['Date Of Transfer', 'Receipt Type', 'Sum of Franchisee Share', 'Sum of LLPL Share', 'Sum of TaxAmount', 'Sum of Welcome Kit(Reconciled)', 'Sum of Total LLPL Share', 'Sum of Cheque Amount'];
  const rows = data.map((r) => [
    r.dateOfTransfer,
    r.receiptType,
    r.franchiseeShare.toFixed(2),
    r.llplShare.toFixed(2),
    r.taxAmount.toFixed(2),
    r.welcomeKit.toFixed(2),
    r.totalLLPLShare.toFixed(2),
    r.chequeAmount.toFixed(2),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function FundsTransferPage() {
  const [data, setData] = useState<TransferRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await feesApi.getFundsTransfer();
      if (res.data.success && res.data.data) {
        setData(res.data.data.map((r: any) => ({
          dateOfTransfer: r.dateOfTransfer,
          receiptType: r.receiptType || 'Fee Collection',
          franchiseeShare: r.franchiseeShare || 0,
          llplShare: r.llplShare || 0,
          taxAmount: r.taxAmount || 0,
          welcomeKit: r.welcomeKit || 0,
          totalLLPLShare: r.totalLLPLShare || 0,
          chequeAmount: r.chequeAmount || 0,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch funds transfer data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = search
    ? data.filter((r) => r.dateOfTransfer.includes(search) || r.receiptType.toLowerCase().includes(search.toLowerCase()))
    : data;

  return (
    <div className="space-y-6">
      <PageHeader title="Funds Transfer Summary Report" description="View and download funds transfer summary" />

      <Card>
        <CardContent className="p-4">
          {/* Download buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white" onClick={() => downloadCSV(filtered, 'funds_transfer_summary.csv')}>
              <FileDown className="h-4 w-4 mr-2" />
              Funds Transfer Summary Report To Excel
            </Button>
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white" onClick={() => downloadCSV(filtered, 'funds_transfer_detail.csv')}>
              <FileDown className="h-4 w-4 mr-2" />
              Download Detail Report To Excel
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
                  <th className="p-3 text-left font-semibold">Date Of Transfer</th>
                  <th className="p-3 text-left font-semibold">Receipt Type</th>
                  <th className="p-3 text-right font-semibold">Sum of Franchisee Share</th>
                  <th className="p-3 text-right font-semibold">Sum of LLPL Share</th>
                  <th className="p-3 text-right font-semibold">Sum of TaxAmount</th>
                  <th className="p-3 text-right font-semibold">Sum of Welcome Kit(Reconciled)</th>
                  <th className="p-3 text-right font-semibold">Sum of Total LLPL Share</th>
                  <th className="p-3 text-right font-semibold">Sum of Cheque Amount</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No data available in table</td></tr>
                ) : (
                  filtered.slice(0, pageSize).map((row, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3">{formatDate(row.dateOfTransfer)}</td>
                      <td className="p-3">{row.receiptType}</td>
                      <td className="p-3 text-right font-mono">{formatCurrency(row.franchiseeShare)}</td>
                      <td className="p-3 text-right font-mono">{formatCurrency(row.llplShare)}</td>
                      <td className="p-3 text-right font-mono">{formatCurrency(row.taxAmount)}</td>
                      <td className="p-3 text-right font-mono">{formatCurrency(row.welcomeKit)}</td>
                      <td className="p-3 text-right font-mono">{formatCurrency(row.totalLLPLShare)}</td>
                      <td className="p-3 text-right font-mono">{formatCurrency(row.chequeAmount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > pageSize && (
            <div className="flex items-center justify-center gap-1 mt-4">
              <span className="text-xs text-muted-foreground">Showing {Math.min(pageSize, filtered.length)} of {filtered.length} entries</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
