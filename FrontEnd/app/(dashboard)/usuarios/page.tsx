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
  User,
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
import { cn } from "@/lib/utils";
import {
  listUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  type UsuarioFrontend,
} from "./actions";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Add/Edit dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<UsuarioFrontend | null>(null);
  const [usuarioForm, setUsuarioForm] = useState({
    nombre_completo: "",
    email: "",
    password: "",
    estado: "activo",
    canal_origen: "web",
  });
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<UsuarioFrontend | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    try {
      setError(null);
      const data = await listUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingUsuario(null);
    setUsuarioForm({
      nombre_completo: "",
      email: "",
      password: "",
      estado: "activo",
      canal_origen: "web",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (usuario: UsuarioFrontend) => {
    setEditingUsuario(usuario);
    setUsuarioForm({
      nombre_completo: usuario.nombre_completo,
      email: usuario.email ?? "",
      password: "",
      estado: usuario.estado ?? "activo",
      canal_origen: usuario.canal_origen ?? "web",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!usuarioForm.nombre_completo.trim()) return;
    setSaving(true);
    try {
      if (editingUsuario) {
        const updated = await updateUsuario(editingUsuario.id, {
          nombre_completo: usuarioForm.nombre_completo,
          email: usuarioForm.email || undefined,
          estado: usuarioForm.estado,
          canal_origen: usuarioForm.canal_origen,
        });
        setUsuarios((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      } else {
        const created = await createUsuario({
          nombre_completo: usuarioForm.nombre_completo,
          email: usuarioForm.email || undefined,
          password: usuarioForm.password || undefined,
          estado: usuarioForm.estado,
          canal_origen: usuarioForm.canal_origen,
        });
        setUsuarios((prev) => [...prev, created]);
      }
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUsuario(deleteTarget.id);
      setUsuarios((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar usuario");
    } finally {
      setDeleting(false);
    }
  };

  const getEstadoBadge = (estado: string | null) => {
    const config: Record<string, { label: string; className: string }> = {
      activo: { label: "Activo", className: "border-green-500/50 bg-green-500/10 text-green-400" },
      inactivo: { label: "Inactivo", className: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400" },
      bloqueado: { label: "Bloqueado", className: "border-red-500/50 bg-red-500/10 text-red-400" },
    };
    const conf = config[estado ?? ""] ?? { label: estado ?? "Desconocido", className: "" };
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
        <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona los usuarios finales que interactuan con tu ChatBot
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
          <p className="text-sm text-muted-foreground">Total Usuarios</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">{usuarios.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Activos</p>
          <p className="mt-1 text-2xl font-bold text-green-400">
            {usuarios.filter((u) => u.estado === "activo").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Bloqueados</p>
          <p className="mt-1 text-2xl font-bold text-red-400">
            {usuarios.filter((u) => u.estado === "bloqueado").length}
          </p>
        </div>
      </div>

      {/* Search + Add */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-input pl-9 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Nombre</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Estado</TableHead>
              <TableHead className="text-muted-foreground">Canal origen</TableHead>
              <TableHead className="text-muted-foreground">Registro</TableHead>
              <TableHead className="w-[50px] text-muted-foreground"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsuarios.map((usuario) => (
              <TableRow key={usuario.id} className="border-border hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <User className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-foreground">
                      {usuario.nombre_completo}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {usuario.email || "-"}
                </TableCell>
                <TableCell>{getEstadoBadge(usuario.estado)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {usuario.canal_origen ?? "web"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(usuario.timestamp_registro).toLocaleDateString("es-ES")}
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
                        onClick={() => handleOpenEdit(usuario)}
                        className="text-popover-foreground focus:bg-muted focus:text-foreground"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(usuario)}
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
            {filteredUsuarios.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No hay usuarios registrados. Crea tu primer usuario.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingUsuario ? "Editar usuario" : "Nuevo usuario"}
            </DialogTitle>
            <DialogDescription>
              {editingUsuario ? "Modifica los datos del usuario." : "Agrega un nuevo usuario final."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="usu-nombre" className="text-foreground">Nombre completo *</Label>
              <Input
                id="usu-nombre"
                placeholder="Juan Perez"
                value={usuarioForm.nombre_completo}
                onChange={(e) => setUsuarioForm((prev) => ({ ...prev, nombre_completo: e.target.value }))}
                className="bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usu-email" className="text-foreground">Email</Label>
              <Input
                id="usu-email"
                type="email"
                placeholder="juan@ejemplo.com"
                value={usuarioForm.email}
                onChange={(e) => setUsuarioForm((prev) => ({ ...prev, email: e.target.value }))}
                className="bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {!editingUsuario && (
              <div className="space-y-2">
                <Label htmlFor="usu-password" className="text-foreground">Contrasena</Label>
                <Input
                  id="usu-password"
                  type="password"
                  placeholder="••••••••"
                  value={usuarioForm.password}
                  onChange={(e) => setUsuarioForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="bg-input text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="usu-estado" className="text-foreground">Estado</Label>
              <Select
                value={usuarioForm.estado}
                onValueChange={(value) => setUsuarioForm((prev) => ({ ...prev, estado: value }))}
              >
                <SelectTrigger className="bg-input text-foreground">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usu-canal" className="text-foreground">Canal de origen</Label>
              <Select
                value={usuarioForm.canal_origen}
                onValueChange={(value) => setUsuarioForm((prev) => ({ ...prev, canal_origen: value }))}
              >
                <SelectTrigger className="bg-input text-foreground">
                  <SelectValue placeholder="Selecciona un canal" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="messenger">Messenger</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}
              className="border-border text-foreground hover:bg-muted">
              Cancelar
            </Button>
            <Button onClick={handleSave}
              disabled={!usuarioForm.nombre_completo.trim() || saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? (
                <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
              ) : (
                editingUsuario ? "Guardar cambios" : "Crear usuario"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estas seguro de eliminar a <strong>{deleteTarget?.nombre_completo}</strong>? Esta accion no se puede deshacer.
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
