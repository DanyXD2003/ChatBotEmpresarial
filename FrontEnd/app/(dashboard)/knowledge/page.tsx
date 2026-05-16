"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  MoreHorizontal,
  Trash2,
  LoaderCircle,
  MessageSquare,
  Edit,
  Eye,
  EyeOff,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  listIntenciones,
  createIntencion,
  updateIntencion,
  deleteIntencion,
  listRespuestas,
  createRespuesta,
  updateRespuesta,
  deleteRespuesta,
  type IntencionFrontend,
  type RespuestaFrontend,
} from "./actions";

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState("intenciones");

  // --- Intenciones state ---
  const [intenciones, setIntenciones] = useState<IntencionFrontend[]>([]);
  const [loadingIntenciones, setLoadingIntenciones] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Add/Edit Intencion dialog
  const [isIntencionDialogOpen, setIsIntencionDialogOpen] = useState(false);
  const [editingIntencion, setEditingIntencion] = useState<IntencionFrontend | null>(null);
  const [intencionForm, setIntencionForm] = useState({ nombre: "", descripcion: "" });
  const [savingIntencion, setSavingIntencion] = useState(false);

  // Delete Intencion
  const [deleteIntencionTarget, setDeleteIntencionTarget] = useState<IntencionFrontend | null>(null);
  const [deletingIntencion, setDeletingIntencion] = useState(false);

  // --- Respuestas state ---
  const [respuestas, setRespuestas] = useState<RespuestaFrontend[]>([]);
  const [loadingRespuestas, setLoadingRespuestas] = useState(true);
  const [selectedIntencionId, setSelectedIntencionId] = useState<string | null>(null);

  // Add/Edit Respuesta dialog
  const [isRespuestaDialogOpen, setIsRespuestaDialogOpen] = useState(false);
  const [editingRespuesta, setEditingRespuesta] = useState<RespuestaFrontend | null>(null);
  const [respuestaForm, setRespuestaForm] = useState<{ contenido: string; publicada: boolean; id_intencion?: string }>({ contenido: "", publicada: false });
  const [savingRespuesta, setSavingRespuesta] = useState(false);

  // Delete Respuesta
  const [deleteRespuestaTarget, setDeleteRespuestaTarget] = useState<RespuestaFrontend | null>(null);
  const [deletingRespuesta, setDeletingRespuesta] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // --- Fetch Intenciones ---
  const fetchIntenciones = useCallback(async () => {
    try {
      setError(null);
      setLoadingIntenciones(true);
      const data = await listIntenciones();
      setIntenciones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar intenciones");
    } finally {
      setLoadingIntenciones(false);
    }
  }, []);

  useEffect(() => {
    fetchIntenciones();
  }, [fetchIntenciones]);

  // --- Fetch Respuestas ---
  const fetchRespuestas = useCallback(async (idIntencion?: string) => {
    try {
      setError(null);
      setLoadingRespuestas(true);
      const data = await listRespuestas(idIntencion);
      setRespuestas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar respuestas");
    } finally {
      setLoadingRespuestas(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "respuestas") {
      fetchRespuestas(selectedIntencionId ?? undefined);
    }
  }, [activeTab, selectedIntencionId, fetchRespuestas]);

  // --- Intenciones CRUD ---
  const handleOpenAddIntencion = () => {
    setEditingIntencion(null);
    setIntencionForm({ nombre: "", descripcion: "" });
    setIsIntencionDialogOpen(true);
  };

  const handleOpenEditIntencion = (intencion: IntencionFrontend) => {
    setEditingIntencion(intencion);
    setIntencionForm({ nombre: intencion.nombre, descripcion: intencion.descripcion });
    setIsIntencionDialogOpen(true);
  };

  const handleSaveIntencion = async () => {
    if (!intencionForm.nombre.trim()) return;
    setSavingIntencion(true);
    try {
      if (editingIntencion) {
        const updated = await updateIntencion(editingIntencion.id, intencionForm);
        setIntenciones((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const created = await createIntencion(intencionForm);
        setIntenciones((prev) => [...prev, created]);
      }
      setIsIntencionDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar intencion");
    } finally {
      setSavingIntencion(false);
    }
  };

  const handleDeleteIntencion = async () => {
    if (!deleteIntencionTarget) return;
    setDeletingIntencion(true);
    try {
      await deleteIntencion(deleteIntencionTarget.id);
      setIntenciones((prev) => prev.filter((i) => i.id !== deleteIntencionTarget.id));
      setDeleteIntencionTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar intencion");
    } finally {
      setDeletingIntencion(false);
    }
  };

  // --- Respuestas CRUD ---
  const handleOpenAddRespuesta = () => {
    setEditingRespuesta(null);
    setRespuestaForm({ contenido: "", publicada: false, id_intencion: selectedIntencionId ?? undefined });
    setIsRespuestaDialogOpen(true);
  };

  const handleOpenEditRespuesta = (respuesta: RespuestaFrontend) => {
    setEditingRespuesta(respuesta);
    setRespuestaForm({ contenido: respuesta.contenido, publicada: respuesta.publicada, id_intencion: respuesta.id_intencion ?? undefined });
    setIsRespuestaDialogOpen(true);
  };

  const handleSaveRespuesta = async () => {
    if (!respuestaForm.contenido.trim()) return;
    setSavingRespuesta(true);
    try {
      const payload: Record<string, unknown> = {
        contenido: respuestaForm.contenido,
        publicada: respuestaForm.publicada,
      };
      if (respuestaForm.id_intencion) {
        payload.id_intencion = respuestaForm.id_intencion;
      }

      if (editingRespuesta) {
        const updated = await updateRespuesta(editingRespuesta.id, {
          contenido: respuestaForm.contenido,
          publicada: respuestaForm.publicada,
          id_intencion: respuestaForm.id_intencion,
        });
        setRespuestas((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      } else {
        const created = await createRespuesta(payload as { contenido: string; id_intencion?: string; publicada?: boolean });
        setRespuestas((prev) => [...prev, created]);
      }
      setIsRespuestaDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar respuesta");
    } finally {
      setSavingRespuesta(false);
    }
  };

  const handleDeleteRespuesta = async () => {
    if (!deleteRespuestaTarget) return;
    setDeletingRespuesta(true);
    try {
      await deleteRespuesta(deleteRespuestaTarget.id);
      setRespuestas((prev) => prev.filter((r) => r.id !== deleteRespuestaTarget.id));
      setDeleteRespuestaTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar respuesta");
    } finally {
      setDeletingRespuesta(false);
    }
  };

  const handleTogglePublicada = async (respuesta: RespuestaFrontend) => {
    try {
      const updated = await updateRespuesta(respuesta.id, { publicada: !respuesta.publicada });
      setRespuestas((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar estado");
    }
  };

  const filteredIntenciones = intenciones.filter(
    (i) =>
      i.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Base de Conocimiento
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona las intenciones y respuestas que alimentan tu ChatBot
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Cerrar</button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="border-border bg-muted">
          <TabsTrigger value="intenciones" className="data-[state=active]:bg-card">
            Intenciones
          </TabsTrigger>
          <TabsTrigger value="respuestas" className="data-[state=active]:bg-card">
            Respuestas
          </TabsTrigger>
        </TabsList>

        {/* ============ INTENCIONES TAB ============ */}
        <TabsContent value="intenciones" className="mt-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar intenciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-input pl-9 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button onClick={handleOpenAddIntencion} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nueva intencion
            </Button>
          </div>

          {loadingIntenciones ? (
            <div className="flex items-center justify-center py-12">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Nombre</TableHead>
                    <TableHead className="text-muted-foreground">Descripcion</TableHead>
                    <TableHead className="text-muted-foreground">Fecha creacion</TableHead>
                    <TableHead className="w-[50px] text-muted-foreground"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIntenciones.map((intencion) => (
                    <TableRow key={intencion.id} className="border-border hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <span className="font-medium text-foreground">
                            {intencion.nombre}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-md truncate">
                        {intencion.descripcion || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(intencion.timestamp_creacion).toLocaleDateString("es-ES")}
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
                              onClick={() => {
                                setSelectedIntencionId(intencion.id);
                                setActiveTab("respuestas");
                                fetchRespuestas(intencion.id);
                              }}
                              className="text-popover-foreground focus:bg-muted focus:text-foreground"
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Ver respuestas
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenEditIntencion(intencion)}
                              className="text-popover-foreground focus:bg-muted focus:text-foreground"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteIntencionTarget(intencion)}
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
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {filteredIntenciones.length} de {intenciones.length} intenciones
          </div>
        </TabsContent>

        {/* ============ RESPUESTAS TAB ============ */}
        <TabsContent value="respuestas" className="mt-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <select
                value={selectedIntencionId ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedIntencionId(val || null);
                  fetchRespuestas(val || undefined);
                }}
                className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground"
              >
                <option value="">Todas las intenciones</option>
                {intenciones.map((i) => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleOpenAddRespuesta} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nueva respuesta
            </Button>
          </div>

          {loadingRespuestas ? (
            <div className="flex items-center justify-center py-12">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Contenido</TableHead>
                    <TableHead className="text-muted-foreground">Intencion</TableHead>
                    <TableHead className="text-muted-foreground">Estado</TableHead>
                    <TableHead className="w-[50px] text-muted-foreground"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {respuestas.map((respuesta) => {
                    const intencion = intenciones.find((i) => i.id === respuesta.id_intencion);
                    return (
                      <TableRow key={respuesta.id} className="border-border hover:bg-muted/50">
                        <TableCell className="max-w-lg">
                          <span className="font-medium text-foreground line-clamp-2">
                            {respuesta.contenido}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {intencion?.nombre ?? "General"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <button onClick={() => handleTogglePublicada(respuesta)}>
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-normal cursor-pointer",
                                respuesta.publicada
                                  ? "border-green-500/50 bg-green-500/10 text-green-400"
                                  : "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
                              )}
                            >
                              {respuesta.publicada ? (
                                <><Eye className="mr-1 h-3 w-3" /> Publicada</>
                              ) : (
                                <><EyeOff className="mr-1 h-3 w-3" /> Borrador</>
                              )}
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
                                onClick={() => handleOpenEditRespuesta(respuesta)}
                                className="text-popover-foreground focus:bg-muted focus:text-foreground"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteRespuestaTarget(respuesta)}
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {respuestas.length} respuestas
          </div>
        </TabsContent>
      </Tabs>

      {/* ============ INTENCION DIALOG ============ */}
      <Dialog open={isIntencionDialogOpen} onOpenChange={setIsIntencionDialogOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingIntencion ? "Editar intencion" : "Nueva intencion"}
            </DialogTitle>
            <DialogDescription>
              {editingIntencion
                ? "Modifica los datos de la intencion."
                : "Define una nueva intencion para el ChatBot."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="int-nombre" className="text-foreground">
                Nombre *
              </Label>
              <Input
                id="int-nombre"
                placeholder="saludo"
                value={intencionForm.nombre}
                onChange={(e) => setIntencionForm((prev) => ({ ...prev, nombre: e.target.value }))}
                className="bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="int-desc" className="text-foreground">
                Descripcion
              </Label>
              <Textarea
                id="int-desc"
                placeholder="Describe que tipo de consultas cubre esta intencion..."
                value={intencionForm.descripcion}
                onChange={(e) => setIntencionForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                className="bg-input text-foreground placeholder:text-muted-foreground"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIntencionDialogOpen(false)}
              className="border-border text-foreground hover:bg-muted">
              Cancelar
            </Button>
            <Button onClick={handleSaveIntencion}
              disabled={!intencionForm.nombre.trim() || savingIntencion}
              className="bg-primary text-primary-foreground hover:bg-primary/90">
              {savingIntencion ? (
                <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
              ) : (
                editingIntencion ? "Guardar cambios" : "Crear intencion"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ RESPUESTA DIALOG ============ */}
      <Dialog open={isRespuestaDialogOpen} onOpenChange={setIsRespuestaDialogOpen}>
        <DialogContent className="border-border bg-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingRespuesta ? "Editar respuesta" : "Nueva respuesta"}
            </DialogTitle>
            <DialogDescription>
              {editingRespuesta
                ? "Modifica el contenido de la respuesta."
                : "Agrega una nueva respuesta que el ChatBot podra utilizar."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-foreground">
                Intencion
              </Label>
              <select
                value={respuestaForm.id_intencion ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setRespuestaForm((prev) => ({ ...prev, id_intencion: val || undefined }));
                }}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground"
              >
                <option value="">General (sin intencion especifica)</option>
                {intenciones.map((i) => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resp-contenido" className="text-foreground">
                Contenido *
              </Label>
              <Textarea
                id="resp-contenido"
                placeholder="Escribe la respuesta del ChatBot..."
                value={respuestaForm.contenido}
                onChange={(e) => setRespuestaForm((prev) => ({ ...prev, contenido: e.target.value }))}
                className="bg-input text-foreground placeholder:text-muted-foreground"
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="resp-publicada"
                checked={respuestaForm.publicada}
                onCheckedChange={(checked) => setRespuestaForm((prev) => ({ ...prev, publicada: checked }))}
              />
              <Label htmlFor="resp-publicada" className="text-foreground">
                Publicada (disponible para el ChatBot)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRespuestaDialogOpen(false)}
              className="border-border text-foreground hover:bg-muted">
              Cancelar
            </Button>
            <Button onClick={handleSaveRespuesta}
              disabled={!respuestaForm.contenido.trim() || savingRespuesta}
              className="bg-primary text-primary-foreground hover:bg-primary/90">
              {savingRespuesta ? (
                <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
              ) : (
                editingRespuesta ? "Guardar cambios" : "Crear respuesta"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Intencion Confirmation */}
      <AlertDialog open={!!deleteIntencionTarget} onOpenChange={(open) => !open && setDeleteIntencionTarget(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Eliminar intencion</AlertDialogTitle>
            <AlertDialogDescription>
              Estas seguro de eliminar la intencion <strong>{deleteIntencionTarget?.nombre}</strong>? Tambien se eliminaran las respuestas asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteIntencion} disabled={deletingIntencion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deletingIntencion ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Eliminando...</> : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Respuesta Confirmation */}
      <AlertDialog open={!!deleteRespuestaTarget} onOpenChange={(open) => !open && setDeleteRespuestaTarget(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Eliminar respuesta</AlertDialogTitle>
            <AlertDialogDescription>
              Estas seguro de eliminar esta respuesta? Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRespuesta} disabled={deletingRespuesta}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deletingRespuesta ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Eliminando...</> : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
