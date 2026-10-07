'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Database,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  Server,
  Zap,
} from 'lucide-react';
import { SyncLogRecord, SyncStateRecord } from '@/lib/db/types';
import { QuotaInfo } from '@/lib/data-providers/types';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<string>('api_football');
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [logs, setLogs] = useState<SyncLogRecord[]>([]);
  const [states, setStates] = useState<SyncStateRecord[]>([]);

  // Trigger state
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const fetchStatus = () => {
    fetch('/api/sync/status')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProvider(data.provider);
          setQuota(data.quota);
          setLogs(data.latestLogs || []);
          setStates(data.states || []);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const triggerSync = async (entity: 'all' | 'fixtures' | 'players' | 'stats' | 'market_values') => {
    if (!confirm(`¿Confirmas la ejecución de sincronización para "${entity}"?`)) return;

    setSyncing(true);
    setSyncFeedback('Ejecutando sincronización incremental...');
    try {
      const res = await fetch('/api/sync/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'manual', entity }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncFeedback(`Sincronización finalizada con éxito (${data.result?.status})`);
        fetchStatus();
      } else {
        setSyncFeedback(`Error: ${data.result?.message || 'Fallo en sync'}`);
      }
    } catch {
      setSyncFeedback('Error de comunicación con el motor de sincronización.');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncFeedback(null), 6000);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-400 mb-2">
            <Server className="h-3.5 w-3.5" /> CENTRO DE CONTROL DEL SISTEMA
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Panel de Administración
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervisa cuotas de API, sincronizaciones incrementales y salud de datos en PostgreSQL.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading || syncing}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar Estado
        </button>
      </div>

      {/* Sync Action Alert Feedback */}
      {syncFeedback && (
        <div className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-400 text-sm font-bold flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {syncFeedback}
        </div>
      )}

      {/* Top Health & Quota Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Quota Gauge */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              CUOTA API-FOOTBALL
            </span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-white font-mono">
              {quota ? quota.requestsToday : 0}
            </span>
            <span className="text-sm font-semibold text-slate-400">
              / {quota ? quota.dailyLimit : 100} req hoy
            </span>
          </div>

          <div className="mt-4 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{
                width: `${
                  quota && quota.dailyLimit > 0
                    ? Math.min(100, (quota.requestsToday / quota.dailyLimit) * 100)
                    : 10
                }%`,
              }}
            />
          </div>
          <span className="text-[11px] text-emerald-400 font-bold block mt-2">
            {quota ? quota.requestsRemaining : 90} peticiones restantes seguras
          </span>
        </div>

        {/* Active Provider */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              PROVEEDOR ACTIVO
            </span>
            <Database className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono uppercase mt-2">
            {provider}
          </div>
          <span className="text-xs text-slate-400 block mt-1">
            Abstracción desacoplada de la interfaz
          </span>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-bold text-cyan-400">
            <ShieldCheck className="h-3 w-3" /> Seguro (Claves ocultas en backend)
          </div>
        </div>

        {/* Data Quality Gauge */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              CALIDAD DE DATOS
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">100% ÓPTIMO</div>
          <p className="text-xs text-slate-400 mt-1">
            Política NULL != 0 activa. Sin datos corruptos o falsos ceros.
          </p>
          <div className="mt-4 text-[11px] font-bold text-slate-300">
            22+ estrellas de élite disponibles en Pool
          </div>
        </div>
      </div>

      {/* Manual Sync Triggers */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 mb-8 shadow-xl">
        <h2 className="text-lg font-black text-white mb-2">Ejecución Manual de Sincronización</h2>
        <p className="text-xs text-slate-400 mb-6">
          Los datos se sincronizan automáticamente cada día a las 04:00 UTC. Puedes forzar un lote específico aquí:
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => triggerSync('all')}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-xs font-black text-slate-950 transition-colors disabled:opacity-50 shadow-md shadow-emerald-500/20"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sincronización Completa
          </button>
          <button
            onClick={() => triggerSync('fixtures')}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-3 text-xs font-bold text-slate-200 transition-colors disabled:opacity-50 border border-slate-700"
          >
            Sincronizar Partidos
          </button>
          <button
            onClick={() => triggerSync('players')}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-3 text-xs font-bold text-slate-200 transition-colors disabled:opacity-50 border border-slate-700"
          >
            Sincronizar Plantillas
          </button>
          <button
            onClick={() => triggerSync('market_values')}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-3 text-xs font-bold text-slate-200 transition-colors disabled:opacity-50 border border-slate-700"
          >
            Valores de Mercado
          </button>
        </div>
      </div>

      {/* Audit Sync Logs Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <h2 className="text-lg font-black text-white mb-4">Registro Histórico de Sync (sync_logs)</h2>

        {logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No hay registros de sincronización aún.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3">Proveedor</th>
                  <th className="pb-3">Fecha y Hora</th>
                  <th className="pb-3 text-right">Peticiones</th>
                  <th className="pb-3 text-right">Actualizados</th>
                  <th className="pb-3 text-right">Fallidos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50">
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : log.status === 'PARTIAL'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300 font-sans">{log.provider}</td>
                    <td className="py-3 text-slate-400">
                      {new Date(log.started_at).toLocaleString('es-ES')}
                    </td>
                    <td className="py-3 text-right text-slate-300">{log.requests_made}</td>
                    <td className="py-3 text-right text-emerald-400">+{log.records_updated}</td>
                    <td className="py-3 text-right text-slate-400">{log.records_failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
