import React, { useState } from 'react';
import { useAuditLogs } from '@/api/hooks/useAdmin';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import {
  FileText,
  Filter,
  Download,
  Eye,
  User,
  Calendar,
} from 'lucide-react';
import type { AuditLog } from '@/api/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const actionLabels: Record<string, string> = {
  login: 'Connexion',
  logout: 'Déconnexion',
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  approve: 'Approbation',
  reject: 'Rejet',
  export: 'Export',
};

const actionBadgeVariants: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary'> = {
  login: 'success',
  logout: 'secondary',
  create: 'default',
  update: 'warning',
  delete: 'destructive',
  approve: 'success',
  reject: 'destructive',
  export: 'outline',
};

const resourceLabels: Record<string, string> = {
  user: 'Utilisateur',
  project: 'Projet',
  conversation: 'Conversation',
  api_key: 'Clé API',
  webhook: 'Webhook',
  document: 'Document',
};

export const AuditLogsPage: React.FC = () => {
  const [filters, setFilters] = useState({
    user_id: '',
    action: '',
    resource_type: '',
    start_date: '',
    end_date: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useAuditLogs({
    limit: 20,
    offset: (page - 1) * 20,
    ...(filters.user_id && { user_id: filters.user_id }),
    ...(filters.action && { action: filters.action }),
    ...(filters.resource_type && { resource_type: filters.resource_type }),
    ...(filters.start_date && { start_date: filters.start_date }),
    ...(filters.end_date && { end_date: filters.end_date }),
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      user_id: '',
      action: '',
      resource_type: '',
      start_date: '',
      end_date: '',
    });
    setPage(1);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export audit logs');
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Date',
      sortable: true,
      render: (log) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {log.timestamp
              ? format(new Date(log.timestamp), 'dd MMM yyyy HH:mm:ss', { locale: fr })
              : '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'user_email',
      header: 'Utilisateur',
      render: (log) => (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs">
            <User className="h-3 w-3" />
          </div>
          <span className="text-sm">{log.user_email || log.user_id || '-'}</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: (log) => (
        <Badge variant={actionBadgeVariants[log.action] || 'secondary'}>
          {actionLabels[log.action] || log.action}
        </Badge>
      ),
    },
    {
      key: 'resource_type',
      header: 'Ressource',
      sortable: true,
      render: (log) => (
        <span className="text-sm">
          {resourceLabels[log.resource_type] || log.resource_type}
          {log.resource_id && (
            <span className="ml-1 text-muted-foreground">#{log.resource_id.slice(0, 8)}</span>
          )}
        </span>
      ),
    },
    {
      key: 'ip_address',
      header: 'IP',
      render: (log) => (
        <span className="text-sm text-muted-foreground font-mono">
          {log.ip_address || '-'}
        </span>
      ),
    },
    {
      key: 'details',
      header: '',
      className: 'w-12',
      render: (log) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedLog(log)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Logs d'audit</h1>
          <p className="text-muted-foreground">
            Historique des actions effectuées sur la plateforme
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? 'border-primary' : ''}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtres
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                Actifs
              </Badge>
            )}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="rounded-lg border bg-card p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="text-sm font-medium">Utilisateur (ID)</label>
              <Input
                placeholder="ID utilisateur"
                value={filters.user_id}
                onChange={(e) => handleFilterChange('user_id', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Action</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Toutes</option>
                {Object.entries(actionLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Type de ressource</label>
              <select
                value={filters.resource_type}
                onChange={(e) => handleFilterChange('resource_type', e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Tous</option>
                {Object.entries(resourceLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Date début</label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date fin</label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => refetch()}>Appliquer</Button>
            <Button variant="outline" onClick={clearFilters}>
              Réinitialiser
            </Button>
          </div>
        </div>
      )}

      {/* Logs table */}
      {isLoading ? (
        <LoadingSpinner text="Chargement des logs..." />
      ) : data?.logs && data.logs.length > 0 ? (
        <>
          <DataTable
            data={data.logs}
            columns={columns}
            searchable={false}
            pageSize={20}
          />

          {/* Pagination info */}
          {data.pagination && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {data.pagination.total} logs au total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.pagination.has_more}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={FileText}
          title="Aucun log trouvé"
          description={
            hasActiveFilters
              ? 'Aucun log ne correspond à vos critères de recherche.'
              : "Il n'y a pas encore de logs d'audit enregistrés."
          }
          action={
            hasActiveFilters
              ? { label: 'Réinitialiser les filtres', onClick: clearFilters }
              : undefined
          }
        />
      )}

      {/* Log details modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Détails du log"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <p className="mt-1">
                  {selectedLog.timestamp
                    ? format(new Date(selectedLog.timestamp), 'dd MMMM yyyy à HH:mm:ss', { locale: fr })
                    : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Utilisateur</label>
                <p className="mt-1">{selectedLog.user_email || selectedLog.user_id || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Action</label>
                <p className="mt-1">
                  <Badge variant={actionBadgeVariants[selectedLog.action] || 'secondary'}>
                    {actionLabels[selectedLog.action] || selectedLog.action}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ressource</label>
                <p className="mt-1">
                  {resourceLabels[selectedLog.resource_type] || selectedLog.resource_type}
                  {selectedLog.resource_id && ` (${selectedLog.resource_id})`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Adresse IP</label>
                <p className="mt-1 font-mono text-sm">{selectedLog.ip_address || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                <p className="mt-1 text-sm truncate">{selectedLog.user_agent || '-'}</p>
              </div>
            </div>

            {selectedLog.details && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Détails</label>
                <pre className="mt-1 rounded-lg bg-muted p-4 text-xs overflow-auto max-h-64">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
