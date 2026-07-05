import { useState, useEffect } from 'react';
import api from '@/api/client';

import { type ColumnDef } from '@tanstack/react-table';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import { Download, Plus, Eye, Printer, Filter } from 'lucide-react';

interface PurchaseOrder {
  id: string;
  poNo: string;
  date: string;
  supplier: string;
  itemsCount: number;
  totalValue: number;
  status: string;
  remarks: string;
}

const dummyPOs: PurchaseOrder[] = [
  { id: '1', poNo: 'PO-2026-001', date: '2026-06-05', supplier: 'EuroKids HQ Supply', itemsCount: 45, totalValue: 125000, status: 'DELIVERED', remarks: 'Delivered via Blue Dart LR No 519315' },
  { id: '2', poNo: 'PO-2026-002', date: '2026-06-08', supplier: 'EduMaterials Corp', itemsCount: 12, totalValue: 45000, status: 'DISPATCHED', remarks: 'Expected delivery by 15th Jun' },
  { id: '3', poNo: 'PO-2026-003', date: '2026-06-10', supplier: 'Smart Toys Inc', itemsCount: 8, totalValue: 22000, status: 'PENDING', remarks: 'Awaiting stock confirmation' },
  { id: '4', poNo: 'PO-2026-004', date: '2026-06-11', supplier: 'Uniforms & Co', itemsCount: 150, totalValue: 85000, status: 'PARTIALLY_DELIVERED', remarks: 'Summer uniforms pending' },
];

const columns: ColumnDef<PurchaseOrder, any>[] = [
  {
    accessorKey: 'poNo',
    header: 'PO Number',
    cell: ({ getValue }) => <span className="font-mono font-medium text-sm">{getValue() as string}</span>,
  },
  {
    accessorKey: 'date',
    header: 'PO Date',
    cell: ({ getValue }) => <span className="text-sm">{formatDate(getValue() as string)}</span>,
  },
  {
    accessorKey: 'supplier',
    header: 'Supplier',
    cell: ({ getValue }) => <span className="text-sm font-medium">{getValue() as string}</span>,
  },
  {
    accessorKey: 'itemsCount',
    header: () => <div className="text-right">Qty</div>,
    cell: ({ getValue }) => <div className="text-right text-sm">{getValue() as number}</div>,
  },
  {
    accessorKey: 'totalValue',
    header: () => <div className="text-right">Total Value</div>,
    cell: ({ getValue }) => <div className="text-right font-mono font-medium">{formatCurrency(getValue() as number)}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return <Badge className={getStatusColor(status)}>{status.replace('_', ' ')}</Badge>;
    },
  },
  {
    accessorKey: 'remarks',
    header: 'Remarks',
    cell: ({ getValue }) => <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{getValue() as string}</span>,
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    cell: () => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" title="View Details">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" title="Print PO" className="text-primary">
          <Printer className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export default function PurchaseOrderPage() {
  const [data, setData] = useState(dummyPOs);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const res = await api.get('/operations/purchase-orders');
        if (res.data.success && res.data.data && res.data.data.length > 0) {
          const apiData = res.data.data.map((item: any) => ({
            id: item.id,
            poNo: item.orderNumber,
            date: new Date(item.createdAt).toLocaleDateString(),
            supplier: 'EuroKids HQ Supply', // In a real app this might come from item data
            itemsCount: Array.isArray(item.items) ? item.items.length : 0,
            totalValue: item.totalAmount,
            status: item.status,
            remarks: item.notes || 'No remarks',
          }));
          setData(apiData);
        }
      } catch (error) {
        console.warn('Failed to fetch purchase orders, falling back to dummy data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPurchaseOrders();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Manage your kit inventory, educational materials, and uniform orders"
      >
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter Status
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search by PO number or supplier..."
      />
    </div>
  );
}
