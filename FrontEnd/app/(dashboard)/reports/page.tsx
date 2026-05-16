"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LoaderCircle, Plus, Trash2, BarChart3, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listReportes,
  createReporte,
  deleteReporte,
  type ReporteFrontend,
} from "./actions";

export default function ReportsPage() {
  const [reportes, setReportes] = useState<ReporteFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newReporte, setNewReporte] = useState({
    tipo: "",
    data_json: "",
  });
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<ReporteFrontend | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReportes = useCallback(async () => {
    try {
      setError(null);
      const data = await listReportes();
      setReportes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar reportes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportes();
  }, [fetchReportes]);

  const getTipoBadge = (tipo: string | null) => {
    const colores: Record<string, string> = {
      diario: "border-blue-500/50 bg-blue-500/10 text-blue-400",
      semanal: "border-purple-500/50 bg-purple-500/10 text-purple-400",
      mensual: "border-green-500/50 bg-green-500/10 text-green-400",
      personalizado: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
    };
    return (
      <Badge
        variant="outline"
        className={`font-normal ${colores[tipo ?? ""] || "border-muted-foreground/50 bg-muted text-muted-foreground"}`}
      >
        {tipo ?? "Sin tipo"}
      </Badge>
    );
  };

  const handleAddReporte = async () => {
    if (!newReporte.tipo.trim()) return;
    setSaving(true);
    try {
      let data: Record<string, unknown> | undefined;
      if (newReporte.data_json.trim()) {
        try {
          data = JSON.parse(newReporte.data_json);
        } catch {
          setError("El JSON ingresado no es valido. Debe ser un objeto valido.");
          setSaving(false);
          return;
        }
      }
      const created = await createReporte({
        tipo: newReporte.tipo,
        data,
      });
      setReportes((prev) => [...prev, created]);
      setNewReporte({ tipo: "", data_json: "" });
      setIsAddDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear reporte");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReporte = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteReporte(deleteTarget.id);
      setReportes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar reporte");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
        <p className="mt-1 text-muted-foreground">
          Metricas operativas y analiticas de tu ChatBot
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Cerrar</button>
        </div>
      )}

      {/* Actions Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Total de reportes: {reportes.length}
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo reporte
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reportes</p>
                <p className="mt-1 text-2xl font-bold text-card-foreground">
                  {reportes.length}
                </p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tipos disponibles</p>
                <p className="mt-1 text-2xl font-bold text-card-foreground">
                  {new Set(reportes.map((r) => r.tipo).filter(Boolean)).size}
                </p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ultimo reporte</p>
                <p className="mt-1 text-2xl font-bold text-card-foreground">
                  {reportes.length > 0
                    ? new Date(reportes[0].timestamp_creacion).toLocaleDateString("es-ES")
                    : "---"}
                </p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Tipo</TableHead>
              <TableHead className="text-muted-foreground">Fecha inicio</TableHead>
              <TableHead className="text-muted-foreground">Fecha fin</TableHead>
              <TableHead className="text-muted-foreground">Datos</TableHead>
              <TableHead className="text-muted-foreground">Creado</TableHead>
              <TableHead className="w-[50px] text-muted-foreground"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportes.map((reporte) => (
              <TableRow key={reporte.id} className="border-border hover:bg-muted/50">
                <TableCell>{getTipoBadge(reporte.tipo)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {reporte.fecha_inicio
                    ? new Date(reporte.fecha_inicio).toLocaleDateString("es-ES")
                    : "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {reporte.fecha_fin
                    ? new Date(reporte.fecha_fin).toLocaleDateString("es-ES")
                    : "-"}
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {reporte.data ? JSON.stringify(reporte.data).slice(0, 60) + "..." : "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(reporte.timestamp_creacion).toLocaleDateString("es-ES")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(reporte)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {reportes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No hay reportes registrados. Crea tu primer reporte.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Report Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Crear nuevo reporte</DialogTitle>
            <DialogDescription>
              Define el tipo y los datos del reporte.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-foreground">
                Tipo de reporte *
              </Label>
              <Input
                id="tipo"
                placeholder="diario, semanal, mensual, personalizado..."
                value={newReporte.tipo}
                onChange={(e) =>
                  setNewReporte((prev) => ({ ...prev, tipo: e.target.value }))
                }
                className="bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data" className="text-foreground">
                Datos (JSON opcional)
              </Label>
              <Textarea
                id="data"
                placeholder='{"metricas": {"conversaciones": 100}}'
                value={newReporte.data_json}
                onChange={(e) =>
                  setNewReporte((prev) => ({ ...prev, data_json: e.target.value }))
                }
                className="bg-input text-foreground placeholder:text-muted-foreground"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddReporte}
              disabled={!newReporte.tipo.trim() || saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Crear reporte"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Eliminar reporte</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estas seguro de eliminar el reporte <strong>{deleteTarget?.tipo}</strong>? Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReporte}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
