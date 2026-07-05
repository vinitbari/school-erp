import { useState, useEffect } from 'react';
import { feesApi } from '../api';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Landmark, RotateCcw, Search } from 'lucide-react';

interface ChequeReceipt {
  id: string;
  chequeDate: string | null;
  chequeNumber: string | null;
  studentName: string;
  bankName: string | null;
  bankBranch: string | null;
  amount: number;
  admissionType: string;
}

export default function DepositSlipPage() {
  const [data, setData] = useState<ChequeReceipt[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositing, setIsDepositing] = useState(false);

  const fetchPending = async () => {
    setIsLoading(true);
    try {
      const res = await feesApi.getPendingDeposits({ search: search || undefined } as any);
      if (res.data.success && res.data.data) {
        setData(res.data.data.map((r: any) => ({
          id: r.id,
          chequeDate: r.chequeDate,
          chequeNumber: r.chequeNumber,
          studentName: `${r.admission?.student?.firstName || ''} ${r.admission?.student?.lastName || ''}`.trim(),
          bankName: r.bankName,
          bankBranch: r.bankBranch,
          amount: Number(r.amount),
          admissionType: r.admission?.admissionType || 'Offline',
        })));
      }
    } catch (error) {
      console.error('Failed to fetch pending cheques', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((r) => r.id)));
    }
  };

  const handleDeposit = async () => {
    if (selected.size === 0) return;
    setIsDepositing(true);
    try {
      await feesApi.createDeposit({ receiptIds: Array.from(selected) });
      setSelected(new Set());
      fetchPending();
    } catch (error) {
      console.error('Deposit failed', error);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleClear = () => {
    setSelected(new Set());
  };

  const filtered = search
    ? data.filter((r) =>
        r.studentName.toLowerCase().includes(search.toLowerCase()) ||
        r.chequeNumber?.toLowerCase().includes(search.toLowerCase()) ||
        r.bankName?.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  const selectedTotal = filtered.filter((r) => selected.has(r.id)).reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deposit Cheques"
        description="Select cheque receipts to create a bank deposit slip"
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-600 border-blue-500/20">
                ☑ Kindly select the same cheque number at once and do the deposit.
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDeposit}
                disabled={selected.size === 0 || isDepositing}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Landmark className="h-4 w-4 mr-2" />
                {isDepositing ? 'Depositing...' : `Deposit (${selected.size})`}
              </Button>
              <Button variant="outline" onClick={handleClear} disabled={selected.size === 0}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Search */}
          <div className="px-4 pb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, cheque no, or bank..."
              className="h-8 max-w-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {selected.size > 0 && (
              <span className="ml-auto text-sm font-medium">
                Selected Total: <span className="text-primary font-bold">{formatCurrency(selectedTotal)}</span>
              </span>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-y border-border">
                  <th className="p-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selected.size === filtered.length}
                      onChange={toggleAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="p-3 text-left font-semibold">Cheque Date</th>
                  <th className="p-3 text-left font-semibold">Cheque Number</th>
                  <th className="p-3 text-left font-semibold">Student Name</th>
                  <th className="p-3 text-left font-semibold">Bank Name</th>
                  <th className="p-3 text-left font-semibold">Bank Branch</th>
                  <th className="p-3 text-right font-semibold">Amount</th>
                  <th className="p-3 text-center font-semibold">Admission Type</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">Loading...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">No data available in table</td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-b border-border hover:bg-muted/30 transition-colors ${selected.has(row.id) ? 'bg-primary/5' : ''}`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.has(row.id)}
                          onChange={() => toggleSelect(row.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="p-3">{row.chequeDate ? formatDate(row.chequeDate) : '-'}</td>
                      <td className="p-3 font-mono text-xs">{row.chequeNumber || '-'}</td>
                      <td className="p-3 font-medium">{row.studentName}</td>
                      <td className="p-3">{row.bankName || '-'}</td>
                      <td className="p-3">{row.bankBranch || '-'}</td>
                      <td className="p-3 text-right font-mono font-bold text-primary">{formatCurrency(row.amount)}</td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className="text-xs">{row.admissionType}</Badge>
                      </td>
                    </tr>
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
