
import { type ColumnDef } from '@tanstack/react-table';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Download } from 'lucide-react';

interface GenericListPageProps {
  title: string;
  description: string;
  columns?: ColumnDef<any, any>[];
  data?: any[];
  searchPlaceholder?: string;
}

export default function GenericListPage({ 
  title, 
  description, 
  columns = [], 
  data = [], 
  searchPlaceholder = "Search records..." 
}: GenericListPageProps) {
  
  // Default columns if none provided
  const defaultCols: ColumnDef<any, any>[] = columns.length > 0 ? columns : [
    { accessorKey: 'id', header: 'ID', cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() as string}</span> },
    { accessorKey: 'name', header: 'Name / Title' },
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'status', header: 'Status', cell: () => <Badge variant="secondary">Active</Badge> },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" title="View"><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon-sm" title="Edit"><Edit className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  const defaultData = data.length > 0 ? data : [
    { id: 'REC-001', name: 'Sample Record Alpha', date: '2026-06-12' },
    { id: 'REC-002', name: 'Sample Record Beta', date: '2026-06-11' },
    { id: 'REC-003', name: 'Sample Record Gamma', date: '2026-06-10' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description}>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </PageHeader>
      
      <DataTable
        columns={defaultCols}
        data={defaultData}
        searchPlaceholder={searchPlaceholder}
      />
    </div>
  );
}
