import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Table } from '@/components/ui/Table';
import { Select } from '@/components/ui/Select';
import { Loader } from '@/components/ui/Loader';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/format';

interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  actorName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface AuditResponse {
  data: AuditLog[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

const ENTITY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'store', label: 'Store' },
  { value: 'category', label: 'Category' },
  { value: 'product', label: 'Product' },
  { value: 'order', label: 'Order' },
  { value: 'courier', label: 'Courier' },
  { value: 'staff', label: 'Staff' },
  { value: 'user', label: 'User' },
];

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entityTypeFilter, setEntityTypeFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, [page, entityTypeFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      let url = `/audit?page=${page}&pageSize=25`;
      if (entityTypeFilter) {
        url += `&entityType=${entityTypeFilter}`;
      }
      const result = await api.get<AuditResponse>(url);
      setLogs(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (log: AuditLog) => formatDate(log.createdAt),
    },
    {
      key: 'entityType',
      header: 'Entity Type',
      render: (log: AuditLog) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
          {log.entityType}
        </span>
      ),
    },
    {
      key: 'entityId',
      header: 'Entity ID',
      render: (log: AuditLog) => (
        <span className="font-mono text-xs text-gray-600">{log.entityId.slice(0, 12)}...</span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (log: AuditLog) => {
        const colorMap: Record<string, string> = {
          CREATE: 'text-green-700 bg-green-50',
          UPDATE: 'text-blue-700 bg-blue-50',
          DELETE: 'text-red-700 bg-red-50',
        };
        const color = colorMap[log.action.toUpperCase()] || 'text-gray-700 bg-gray-50';
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
            {log.action}
          </span>
        );
      },
    },
    {
      key: 'actorId',
      header: 'Actor',
      render: (log: AuditLog) => (
        <span className="text-xs text-gray-600">
          {log.actorName || log.actorId.slice(0, 12) + '...'}
        </span>
      ),
    },
  ];

  if (loading && logs.length === 0) return <Loader />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
      </div>

      {/* Filter */}
      <div className="mb-4 max-w-xs">
        <Select
          label="Filter by Entity Type"
          value={entityTypeFilter}
          onChange={(e) => {
            setEntityTypeFilter(e.target.value);
            setPage(1);
          }}
          options={ENTITY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
        />
      </div>

      <Table
        columns={columns}
        data={logs as unknown as Record<string, unknown>[]}
        emptyMessage="No audit logs found"
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
