import { useState, useEffect } from 'react';
import { feesApi } from '../api';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, FileDown, RefreshCw, ChevronDown, ChevronUp, Eye } from 'lucide-react';

interface OnlinePayment {
  id: string;
  uin: string;
  studentName: string;
  program: string;
  transactionDate: string;
  merchant: string;
  amount: number;
  orderStatus: string;
  transactionId: string;
  paymentMode: string;
}

function downloadCSV(data: OnlinePayment[], filename: string) {
  const headers = ['UIN', 'Student Name', 'Program Name', 'Transaction Date', 'Merchant', 'Amount', 'Order Status', 'Transaction ID'];
  const rows = data.map((r) => [r.uin, r.studentName, r.program, r.transactionDate, r.merchant, r.amount.toString(), r.orderStatus, r.transactionId]);
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function OnlinePaymentsPage() {
  const [data, setData] = useState<OnlinePayment[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Advanced search filters
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [paymentGateway, setPaymentGateway] = useState('All');
  const [paymentStatus, setPaymentStatus] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (paymentGateway !== 'All') params.paymentGateway = paymentGateway;
      if (paymentStatus !== 'All') params.paymentStatus = paymentStatus;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      if (search) params.search = search;

      const res = await feesApi.getOnlinePayments(params);
      if (res.data.success && res.data.data) {
        setData(res.data.data.map((r: any) => ({
          id: r.id,
          uin: r.admission?.uin || '-',
          studentName: `${r.admission?.student?.firstName || ''} ${r.admission?.student?.lastName || ''}`.trim(),
          program: r.admission?.program?.name || '-',
          transactionDate: r.receiptDate,
          merchant: r.transactionId ? (r.paymentMode === 'PAYTM_POS' ? 'Paytm' : 'HDFC') : '-',
          amount: Number(r.amount),
          orderStatus: r.isCancelled ? 'Cancelled' : 'Success',
          transactionId: r.transactionId || '-',
          paymentMode: r.paymentMode,
        })));
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch online payments', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = () => fetchData();

  const handleClearSearch = () => {
    setPaymentGateway('All');
    setPaymentStatus('All');
    setFromDate('');
    setToDate('');
    setSearch('');
    setTimeout(fetchData, 0);
  };

  const handleGetPaymentStatus = () => {
    // Refresh status for selected items
    fetchData();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === data.length) setSelected(new Set());
    else setSelected(new Set(data.map((r) => r.id)));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Online Payment Details" description="View and manage all online payment transactions" />

      {/* Advanced Search */}
      <Card>
        <CardContent className="p-0">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium hover:bg-muted/30 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Advance Search
            </span>
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showAdvanced && (
            <div className="px-4 pb-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Payment GateWay</label>
                  <select
                    className="w-full h-9 border rounded px-3 text-sm bg-background"
                    value={paymentGateway}
                    onChange={(e) => setPaymentGateway(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="HDFC">HDFC Online</option>
                    <option value="PAYTM">Paytm POS</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Payment Status</label>
                  <select
                    className="w-full h-9 border rounded px-3 text-sm bg-background"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="SUCCESS">Success</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Franchisee</label>
                  <Input value="EK-Yavatmal-Arni" readOnly className="h-9 bg-muted/20" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">From Date</label>
                  <Input type="date" className="h-9" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">To Date</label>
                  <Input type="date" className="h-9" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="outline" onClick={handleClearSearch}>Clear Search</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-4">
          {/* Header with buttons */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-600 border-blue-500/20">
              ☑ Online Payment Details
            </Badge>
            <div className="flex gap-2">
              <Button onClick={handleGetPaymentStatus} className="bg-blue-600 hover:bg-blue-700 text-white">
                <RefreshCw className="h-4 w-4 mr-2" />
                Get payment Status
              </Button>
              <Button onClick={() => downloadCSV(data, 'online_payments.csv')} className="bg-blue-700 hover:bg-blue-800 text-white">
                <FileDown className="h-4 w-4 mr-2" />
                Download to excel
              </Button>
            </div>
          </div>

          {/* Search + pagination */}
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

          <p className="text-sm font-medium mb-3">Total Record : {total}</p>

          {/* Table */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60 border-b">
                  <th className="p-3 text-left w-10">
                    <input type="checkbox" checked={data.length > 0 && selected.size === data.length} onChange={toggleAll} className="rounded" />
                  </th>
                  <th className="p-3 text-left font-semibold">UIN</th>
                  <th className="p-3 text-left font-semibold">Student Name</th>
                  <th className="p-3 text-center font-semibold">Program Name</th>
                  <th className="p-3 text-center font-semibold">Transaction Date Time</th>
                  <th className="p-3 text-center font-semibold">Merchant</th>
                  <th className="p-3 text-right font-semibold">Amount</th>
                  <th className="p-3 text-center font-semibold">Order Status</th>
                  <th className="p-3 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No data available in table</td></tr>
                ) : (
                  data.slice(0, pageSize).map((row) => (
                    <tr key={row.id} className={`border-b hover:bg-muted/30 transition-colors ${selected.has(row.id) ? 'bg-primary/5' : ''}`}>
                      <td className="p-3"><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} className="rounded" /></td>
                      <td className="p-3 font-mono text-xs">{row.uin}</td>
                      <td className="p-3 font-medium">{row.studentName}</td>
                      <td className="p-3 text-center">{row.program}</td>
                      <td className="p-3 text-center text-xs">{formatDate(row.transactionDate)}</td>
                      <td className="p-3 text-center">{row.merchant}</td>
                      <td className="p-3 text-right font-mono font-bold text-primary">{formatCurrency(row.amount)}</td>
                      <td className="p-3 text-center">
                        <Badge className={row.orderStatus === 'Success' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}>
                          {row.orderStatus}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Button variant="ghost" size="icon-sm" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.length > pageSize && (
            <div className="text-xs text-muted-foreground mt-3 text-center">
              Showing {Math.min(pageSize, data.length)} of {total} entries
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
