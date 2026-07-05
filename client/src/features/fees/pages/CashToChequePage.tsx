import { useState, useEffect } from 'react';
import { feesApi } from '../api';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, FileCheck, X } from 'lucide-react';

interface CashReceipt {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  studentName: string;
  program: string;
  amount: number;
  admissionType: string;
}

interface ConvertModalData {
  receipt: CashReceipt;
  receiptDate: string;
  receiptAmount: string;
  bankName: string;
  bankBranch: string;
  chequeNumber: string;
  confirmChequeNumber: string;
  chequeDate: string;
}

export default function CashToChequePage() {
  const [data, setData] = useState<CashReceipt[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<ConvertModalData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCashReceipts = async () => {
    setIsLoading(true);
    try {
      const res = await feesApi.getCashReceipts({ search: search || undefined } as any);
      if (res.data.success && res.data.data) {
        setData(res.data.data.map((r: any) => ({
          id: r.id,
          receiptNumber: r.receiptNumber,
          receiptDate: r.receiptDate,
          studentName: `${r.admission?.student?.firstName || ''} ${r.admission?.student?.lastName || ''}`.trim(),
          program: r.admission?.program?.name || '-',
          amount: Number(r.amount),
          admissionType: r.admission?.admissionType || 'Offline',
        })));
      }
    } catch (error) {
      console.error('Failed to fetch cash receipts', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCashReceipts(); }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  };

  const handleGenerateCheque = () => {
    if (selected.size === 0) return;
    // Pick first selected receipt for the modal
    const receipt = filtered.find((r) => selected.has(r.id))!;
    setModal({
      receipt,
      receiptDate: '',
      receiptAmount: receipt.amount.toString(),
      bankName: '',
      bankBranch: '',
      chequeNumber: '',
      confirmChequeNumber: '',
      chequeDate: '',
    });
  };

  const handleSave = async () => {
    if (!modal) return;
    if (modal.chequeNumber !== modal.confirmChequeNumber) {
      alert('Cheque numbers do not match!');
      return;
    }
    if (!modal.chequeNumber || !modal.bankName) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      // Convert each selected receipt
      for (const id of Array.from(selected)) {
        await feesApi.convertPayment({
          receiptId: id,
          newPaymentMode: 'CHEQUE',
          bankName: modal.bankName,
          bankBranch: modal.bankBranch,
          chequeNumber: modal.chequeNumber,
          chequeDate: modal.chequeDate || undefined,
        });
      }
      setModal(null);
      setSelected(new Set());
      fetchCashReceipts();
    } catch (error) {
      console.error('Conversion failed', error);
      alert('Failed to convert receipts. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = search
    ? data.filter((r) =>
        r.studentName.toLowerCase().includes(search.toLowerCase()) ||
        r.receiptNumber.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  const selectedReceipts = filtered.filter((r) => selected.has(r.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Convert Cash To Cheque"
        description="Select cash receipts and convert their payment mode to cheque"
      />

      <Card>
        <CardContent className="p-4">
          {/* Generate Cheque button */}
          <div className="mb-4">
            <Button
              onClick={handleGenerateCheque}
              disabled={selected.size === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Generate Cheque
            </Button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="h-8 max-w-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60 border-b">
                  <th className="p-3 text-left w-12">
                    <input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleAll} className="rounded" />
                  </th>
                  <th className="p-3 text-left font-semibold">Student Name</th>
                  <th className="p-3 text-center font-semibold">Program</th>
                  <th className="p-3 text-center font-semibold">Receipt Date</th>
                  <th className="p-3 text-right font-semibold">Amount</th>
                  <th className="p-3 text-center font-semibold">Admission Type</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No cash receipts found</td></tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className={`border-b hover:bg-muted/30 transition-colors ${selected.has(row.id) ? 'bg-primary/5' : ''}`}>
                      <td className="p-3"><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} className="rounded" /></td>
                      <td className="p-3 font-medium">{row.studentName}</td>
                      <td className="p-3 text-center">{row.program}</td>
                      <td className="p-3 text-center">{formatDate(row.receiptDate)}</td>
                      <td className="p-3 text-right font-mono font-bold text-primary">{formatCurrency(row.amount)}</td>
                      <td className="p-3 text-center"><Badge variant="outline" className="text-xs">{row.admissionType}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Convert Cash to Cheque */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
              <h2 className="text-lg font-bold">Convert Cash To Cheque</h2>
              <Button variant="ghost" size="icon" onClick={() => setModal(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <span className="text-base">≡</span> Convert Cash To Cheque
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Receipt Date</label>
                  <Input type="date" value={modal.receiptDate} onChange={(e) => setModal({ ...modal, receiptDate: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Enter Receipt Amount</label>
                  <Input value={modal.receiptAmount} readOnly className="bg-muted/20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-red-500">Bank Name *</label>
                  <Input placeholder="Enter bank name" value={modal.bankName} onChange={(e) => setModal({ ...modal, bankName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Bank Branch</label>
                  <Input placeholder="Enter branch" value={modal.bankBranch} onChange={(e) => setModal({ ...modal, bankBranch: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-red-500">Cheque Number *</label>
                  <Input placeholder="Cheque number" value={modal.chequeNumber} onChange={(e) => setModal({ ...modal, chequeNumber: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-red-500">Confirm Cheque Number *</label>
                  <Input placeholder="Confirm cheque no" value={modal.confirmChequeNumber} onChange={(e) => setModal({ ...modal, confirmChequeNumber: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Cheque Date</label>
                  <Input type="date" value={modal.chequeDate} onChange={(e) => setModal({ ...modal, chequeDate: e.target.value })} />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
              </div>

              {/* Selected receipts summary */}
              <div className="mt-4 border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="p-2.5 text-left font-semibold">Student Name</th>
                      <th className="p-2.5 text-center font-semibold">Program</th>
                      <th className="p-2.5 text-center font-semibold">Receipt Date</th>
                      <th className="p-2.5 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReceipts.map((r) => (
                      <tr key={r.id} className="border-b">
                        <td className="p-2.5">{r.studentName}</td>
                        <td className="p-2.5 text-center">{r.program}</td>
                        <td className="p-2.5 text-center">{formatDate(r.receiptDate)}</td>
                        <td className="p-2.5 text-right font-mono font-bold">{formatCurrency(r.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
