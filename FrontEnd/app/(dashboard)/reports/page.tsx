"use client";

import { kpis } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const kpiCards = [
  {
    title: "Total Conversaciones",
    value: kpis.totalConversations.toLocaleString(),
    change: kpis.conversationsChange,
    changeType: "positive" as const,
    icon: MessageSquare,
    description: "vs. mes anterior",
  },
  {
    title: "Calificación CSAT",
    value: `${kpis.csatScore}/5`,
    change: kpis.csatChange,
    changeType: "positive" as const,
    icon: Star,
    description: "vs. mes anterior",
  },
  {
    title: "Tasa de Escalamiento",
    value: `${kpis.escalationRate}%`,
    change: kpis.escalationChange,
    changeType: "positive" as const,
    icon: ArrowUpRight,
    description: "vs. mes anterior",
  },
  {
    title: "Tiempo de Respuesta",
    value: kpis.avgResponseTime,
    change: kpis.responseTimeChange,
    changeType: "positive" as const,
    icon: Clock,
    description: "vs. mes anterior",
  },
  {
    title: "Conversaciones Resueltas",
    value: kpis.resolvedConversations.toLocaleString(),
    change: kpis.resolvedChange,
    changeType: "positive" as const,
    icon: CheckCircle2,
    description: "vs. mes anterior",
  },
  {
    title: "Agentes Activos",
    value: kpis.activeAgents.toString(),
    change: kpis.agentsChange,
    changeType: "positive" as const,
    icon: Users,
    description: "conectados ahora",
  },
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
        <p className="mt-1 text-muted-foreground">
          Métricas operativas y analíticas de tu ChatBot
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className="rounded-lg bg-muted p-2">
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-card-foreground">
                  {kpi.value}
                </span>
                <div
                  className={cn(
                    "flex items-center text-sm font-medium",
                    kpi.change.startsWith("+") || kpi.change.startsWith("-")
                      ? kpi.change.startsWith("-") &&
                        kpi.title === "Tasa de Escalamiento"
                        ? "text-green-400"
                        : kpi.change.startsWith("+")
                        ? "text-green-400"
                        : "text-red-400"
                      : "text-green-400"
                  )}
                >
                  {kpi.change.startsWith("-") ? (
                    <ArrowDownRight className="mr-0.5 h-4 w-4" />
                  ) : (
                    <TrendingUp className="mr-0.5 h-4 w-4" />
                  )}
                  {kpi.change}
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats Section */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Performance Overview */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">
              Resumen de Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Resolución en Primera Respuesta
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: "78%" }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    78%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Satisfacción del Cliente
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: "92%" }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    92%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Automatización
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-chart-1"
                      style={{ width: "85%" }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    85%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Retención de Usuarios
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-chart-2"
                      style={{ width: "67%" }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    67%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Topics */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">
              Temas Más Consultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { topic: "Estado de pedidos", count: 3245, percentage: 28 },
                { topic: "Devoluciones", count: 2156, percentage: 19 },
                { topic: "Soporte técnico", count: 1834, percentage: 16 },
                { topic: "Facturación", count: 1523, percentage: 13 },
                { topic: "Información de productos", count: 1289, percentage: 11 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="text-sm text-foreground">{item.topic}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {item.count.toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
