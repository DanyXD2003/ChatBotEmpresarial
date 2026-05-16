"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  MoreHorizontal,
  Trash2,
  LoaderCircle,
  Globe,
  Hash,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  listCanales,
  createCanal,
  updateCanal,
  deleteCanal,
  type CanalFrontend,
} from "./actions";

export default function CanalesPage() {
  const [canales, setCanales] = useState<CanalFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Add/Edit dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCanal, setEditingCanal] = useState<CanalFrontend | null>(null);
  const [canalForm, setCanalForm] = useState({
    nombre: "",
    tipo: "web",
    webhook_url: "",
    activo: true,
  });
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<CanalFrontend | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCanales = useCallback(async () => {
    try {
      setError(null);
      const data = await listCanales();
      setCanales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar canales");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCanales();
  }, [fetchCanales]);

  const filteredCanales = canales.filter(
    (c) =>
      (c.nombre ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.tipo ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingCanal(null);
    setCanalForm({ nombre: "", tipo: "web", webhook_url: "", activo: true });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (canal: CanalFrontend) => {
    setEditingCanal(canal);
    setCanalForm({
      nombre: canal.nombre ?? "",
      tipo: canal.tipo ?? "web",
      webhook_url: canal.webhook_url ?? "",
      activo: canal.activo ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!canalForm.tipo.trim()) return;
    setSaving(true);
    try {
      if (editingCanal) {
        const updated = await updateCanal(editingCanal.id, {
          nombre: canalForm.nombre || undefined,
          tipo: canalForm.tipo,
          webhook_url: canalForm.webhook_url || undefined,
          activo: canalForm.activo,
        });
        setCanales((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await createCanal({
          nombre: canalForm.nombre || undefined,
          tipo: canalForm.tipo,
          webhook_url: canalForm.webhook_url || undefined,
          activo: canalForm.activo,
        });
        setCanales((prev) => [...prev, created]);
      }
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar canal");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCanal(deleteTarget.id);
      setCanales((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar canal");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActivo = async (canal: CanalFrontend) => {
    try {
      const updated = await updateCanal(canal.id, { activo: !canal.activo });
      setCanales((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar estado");
    }
  };

  const getTipoBadge = (tipo: string | null) => {
    const config: Record<string, { label: string; className: string }> = {
      web: { label: "Web", className: "border-primary/50 bg-primary/10 text-primary" },
      api: { label: "API", className: "border-chart-2/50 bg-chart-2/10 text-chart-2" },
      whatsapp: { label: "WhatsApp", className: "border-green-500/50 bg-green-500/10 text-green-400" },
      messenger: { label: "Messenger", className: "border-blue-500/50 bg-blue-500/10 text-blue-400" },
    };
    const conf = config[tipo ?? ""] ?? { label: tipo ?? "Desconocido", className: "" };
    return (
      <Badge variant="outline" className={cn("font-normal", conf.className)}>
        {conf.label}
      </Badge>
    );
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
        <h1 className="text-2xl font-bold text-foreground">Canales</h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona los canales de comunicacion de tu ChatBot
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Cerrar</button>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Canales</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">{canales.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Activos</p>
          <p className="mt-1 text-2xl font-bold text-green-400">
            {canales.filter((c) => c.activo).length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Inactivos</p>
          <p className="mt-1 text-2xl font-bold text-red-400">
            {canales.filter((c) => !c.activo).length}
          </p>
        </div>
      </div>

      {/* Search + Add */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar canales..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-input pl-9 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo canal
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Nombre</TableHead>
              <TableHead className="text-muted-foreground">Tipo</TableHead>
              <TableHead className="text-muted-foreground">Webhook URL</TableHead>
              <TableHead className="text-muted-foreground">Estado</TableHead>
              <TableHead className="w-[50px] text-muted-foreground"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCanales.map((canal) => (
              <TableRow key={canal.id} className="border-border hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      {canal.tipo === "api" ? (
                        <Hash className="h-5 w-5" />
                      ) : (
                        <Globe className="h-5 w-5" />
                      )}
                    </div>
                    <span className="font-medium text-foreground">
                      {canal.nombre ?? "Sin nombre"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getTipoBadge(canal.tipo)}</TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {canal.webhook_url || "-"}
                </TableCell>
                <TableCell>
                  <button onClick={() => handleToggleActivo(canal)}>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-normal cursor-pointer",
                        canal.activo
                          ? "border-green-500/50 bg-green-500/10 text-green-400"
                          : "border-red-500/50 bg-red-500/10 text-red-400"
                      )}
                    >
                      <span className="mr-1.5 h-2 w-2 rounded-full bg-current" />
                      {canal.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </button>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-border bg-popover">
                      <DropdownMenuItem
                        onClick={() => handleOpenEdit(canal)}
                        className="text-popover-foreground focus:bg-muted focus:text-foreground"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(canal)}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredCanales.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  No hay canales registrados. Crea tu primer canal.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Mostrando {filteredCanales.length} de {canales.length} canales
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingCanal ? "Editar canal" : "Nuevo canal"}
            </DialogTitle>
            <DialogDescription>
              {editingCanal ? "Modifica los datos del canal." : "Agrega un nuevo canal de comunicacion."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="canal-nombre" className="text-foreground">Nombre</Label>
              <Input
                id="canal-nombre"
                placeholder="Chat Web"
                value={canalForm.nombre}
                onChange={(e) => setCanalForm((prev) => ({ ...prev, nombre: e.target.value }))}
                className="bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="canal-tipo" className="text-foreground">Tipo *</Label>
              <Select
                value={canalForm.tipo}
                onValueChange={(value) => setCanalForm((prev) => ({ ...prev, tipo: value }))}
              >
                <SelectTrigger className="bg-input text-foreground">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="messenger">Messenger</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="canal-webhook" className="text-foreground">Webhook URL</Label>
              <Input
                id="canal-webhook"
                placeholder="https://ejemplo.com/webhook"
                value={canalForm.webhook_url}
                onChange={(e) => setCanalForm((prev) => ({ ...prev, webhook_url: e.target.value }))}
                className="bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="canal-activo"
                checked={canalForm.activo}
                onCheckedChange={(checked) => setCanalForm((prev) => ({ ...prev, activo: checked }))}
              />
              <Label htmlFor="canal-activo" className="text-foreground">Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}
              className="border-border text-foreground hover:bg-muted">
              Cancelar
            </Button>
            <Button onClick={handleSave}
              disabled={!canalForm.tipo.trim() || saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? (
                <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
              ) : (
                editingCanal ? "Guardar cambios" : "Crear canal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Eliminar canal</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estas seguro de eliminar el canal <strong>{deleteTarget?.nombre || deleteTarget?.tipo}</strong>? Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Eliminando...</> : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
