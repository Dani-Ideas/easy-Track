"use client";

import { useState, useCallback } from "react";
import {
  ClipboardList, Clock, PlayCircle, CheckCircle2,
  TrendingUp, Timer, Loader2,
} from "lucide-react";
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import type { AnaliticasData } from "@/lib/analiticas";

type Preset = "7d" | "30d" | "90d" | "all";

const PRESET_LABELS: Record<Preset, string> = {
  "7d":  "7 días",
  "30d": "30 días",
  "90d": "90 días",
  "all": "Todo",
};

function presetDates(preset: Preset): { desde: string; hasta: string } {
  const hasta = new Date();
  hasta.setHours(23, 59, 59, 999);
  const desde = new Date();
  if (preset === "7d")  { desde.setDate(desde.getDate() - 6); }
  else if (preset === "30d") { desde.setDate(desde.getDate() - 29); }
  else if (preset === "90d") { desde.setDate(desde.getDate() - 89); }
  else { desde.setFullYear(2000, 0, 1); }
  desde.setHours(0, 0, 0, 0);
  return {
    desde: desde.toISOString(),
    hasta: hasta.toISOString(),
  };
}

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6"];

interface Props {
  initialData: AnaliticasData;
}

export function AnaliticasClient({ initialData }: Props) {
  const [preset, setPreset]   = useState<Preset>("30d");
  const [data,   setData]     = useState<AnaliticasData>(initialData);
  const [loading, setLoading] = useState(false);

  const changePreset = useCallback(async (next: Preset) => {
    setPreset(next);
    setLoading(true);
    const { desde, hasta } = presetDates(next);
    try {
      const res = await fetch(
        `/api/analiticas?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`,
      );
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const { kpis, tendencia, porArea, porEdificio, porTipoEspacio } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analíticas</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Métricas operativas del sistema de reportes
          </p>
        </div>

        {/* Preset selector */}
        <div className="flex gap-1 rounded-lg border p-1 self-start sm:self-auto">
          {(Object.keys(PRESET_LABELS) as Preset[]).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={preset === p ? "default" : "ghost"}
              className="h-7 px-3 text-xs"
              onClick={() => changePreset(p)}
              disabled={loading}
            >
              {PRESET_LABELS[p]}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading overlay indicator */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Actualizando...
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatsCard
          title="Total reportes"
          value={kpis.total}
          icon={ClipboardList}
          iconColor="text-primary"
        />
        <StatsCard
          title="Pendientes"
          value={kpis.pendientes}
          icon={Clock}
          iconColor="text-amber-500"
        />
        <StatsCard
          title="En proceso"
          value={kpis.enProceso}
          icon={PlayCircle}
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Atendidos"
          value={kpis.atendidos}
          icon={CheckCircle2}
          iconColor="text-emerald-500"
        />
        <StatsCard
          title="Nuevos (7 días)"
          value={kpis.nuevosSemana}
          icon={TrendingUp}
          iconColor="text-violet-500"
        />
        <StatsCard
          title="Tiempo prom."
          value={kpis.tiempoPromedioHoras != null ? `${kpis.tiempoPromedioHoras}h` : "—"}
          description="Promedio de resolución"
          icon={Timer}
          iconColor="text-rose-500"
        />
      </div>

      {/* Row 1: Trend + By Area */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trend line */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Reportes nuevos por día</CardTitle>
          </CardHeader>
          <CardContent>
            {tendencia.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Sin datos en este período.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={tendencia} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="fecha"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v: string) => v.slice(5)} // MM-DD
                  />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12 }}
                    labelFormatter={(v) => `Fecha: ${v}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Reportes"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* By area — horizontal bars */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Reportes por área responsable</CardTitle>
          </CardHeader>
          <CardContent>
            {porArea.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Sin reportes asignados en este período.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={porArea}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 4, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="area"
                    tick={{ fontSize: 10 }}
                    width={90}
                    tickFormatter={(v: string) => v.length > 14 ? `${v.slice(0, 13)}…` : v}
                  />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="total"    name="Total"     fill="hsl(var(--primary))" radius={[0, 3, 3, 0]} />
                  <Bar dataKey="atendidos" name="Atendidos" fill="#10b981"              radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: By building + by space type */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* By building */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Reportes por edificio (top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            {porEdificio.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Sin datos en este período.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={porEdificio}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 4, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="edificio"
                    tick={{ fontSize: 10 }}
                    width={110}
                    tickFormatter={(v: string) => v.length > 16 ? `${v.slice(0, 15)}…` : v}
                  />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="total" name="Reportes" fill="#6366f1" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* By space type — pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribución por tipo de espacio</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {porTipoEspacio.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Sin datos en este período.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={porTipoEspacio}
                    dataKey="total"
                    nameKey="tipo"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    label={({ name, percent }: { name?: string; percent?: number }) => {
                      const n = name ?? "";
                      const pct = ((percent ?? 0) * 100).toFixed(0);
                      return `${n.length > 10 ? n.slice(0, 9) + "…" : n} (${pct}%)`;
                    }}
                    labelLine={false}
                  >
                    {porTipoEspacio.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Efficiency table */}
      {porArea.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Eficiencia por área</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Área</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Total</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Atendidos</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">% Cumplimiento</th>
                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Tiempo prom.</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {porArea.map((row) => {
                    const pct = row.total > 0 ? Math.round((row.atendidos / row.total) * 100) : 0;
                    return (
                      <tr key={row.area} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-medium">{row.area}</td>
                        <td className="px-4 py-2.5 text-right">{row.total}</td>
                        <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400">
                          {row.atendidos}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={pct >= 80 ? "text-emerald-600 dark:text-emerald-400" : pct >= 50 ? "text-amber-600 dark:text-amber-400" : "text-destructive"}>
                            {pct}%
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground">
                          {row.tiempoPromedioHoras != null ? `${row.tiempoPromedioHoras}h` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
