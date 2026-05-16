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
  UserPlus,
  MoreHorizontal,
  Trash2,
  LoaderCircle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { cn } from "@/lib/utils";
import {
  listAgents,
  createAgent,
  deleteAgent,
  updateAgent,
  type AgentFrontend,
} from "./actions";

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Add dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    role: "agente" as AgentFrontend["role"],
  });
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<AgentFrontend | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      setError(null);
      const data = await listAgents();
      setAgents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar agentes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddAgent = async () => {
    if (!newAgent.name || !newAgent.email) return;
    setSaving(true);
    try {
      const created = await createAgent({
        nombre: newAgent.name,
        email: newAgent.email,
        rol: newAgent.role,
      });
      setAgents((prev) => [...prev, created]);
      setNewAgent({ name: "", email: "", role: "agente" });
      setIsAddDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear agente");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAgent = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAgent(deleteTarget.id);
      setAgents((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar agente");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (agent: AgentFrontend) => {
    // Toggle: online -> offline, offline -> online
    const newDisponible = agent.status !== "online";
    try {
      const updated = await updateAgent(agent.id, { disponible: newDisponible });
      setAgents((prev) => prev.map((a) => (a.id === agent.id ? updated : a)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar estado");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      online: {
        label: "En línea",
        className: "border-green-500/50 bg-green-500/10 text-green-400",
      },
      away: {
        label: "Ausente",
        className: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
      },
      offline: {
        label: "Desconectado",
        className: "border-red-500/50 bg-red-500/10 text-red-400",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: "",
    };

    return (
      <Badge variant="outline" className={cn("font-normal cursor-pointer", config.className)}>
        <span className="mr-1.5 h-2 w-2 rounded-full bg-current" />
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: {
        label: "Administrador",
        className: "border-primary/50 bg-primary/10 text-primary",
      },
      supervisor: {
        label: "Supervisor",
        className: "border-chart-2/50 bg-chart-2/10 text-chart-2",
      },
      agente: {
        label: "Agente",
        className: "border-muted-foreground/50 bg-muted text-muted-foreground",
      },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || {
      label: role,
      className: "",
    };

    return (
      <Badge variant="outline" className={cn("font-normal", config.className)}>
        {config.label}
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
        <h1 className="text-2xl font-bold text-foreground">Agentes</h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona el personal de soporte de tu organización
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar agentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-input pl-9 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar agente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Agentes</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">
            {agents.length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">En Línea</p>
          <p className="mt-1 text-2xl font-bold text-green-400">
            {agents.filter((a) => a.status === "online").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Disponibles</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">
            {agents.filter((a) => a.status === "online" || a.status === "away").length}
          </p>
        </div>
      </div>

      {/* Agents Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Nombre</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Rol</TableHead>
              <TableHead className="text-muted-foreground">Estado</TableHead>
              <TableHead className="w-[50px] text-muted-foreground"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgents.map((agent) => (
              <TableRow
                key={agent.id}
                className="border-border hover:bg-muted/50"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium",
                        agent.status === "online"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {agent.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <span className="font-medium text-foreground">
                      {agent.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {agent.email}
                </TableCell>
                <TableCell>{getRoleBadge(agent.role)}</TableCell>
                <TableCell>
                  <button onClick={() => handleToggleStatus(agent)}>
                    {getStatusBadge(agent.status)}
                  </button>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="border-border bg-popover"
                    >
                      <DropdownMenuItem 
                        onClick={() => setDeleteTarget(agent)}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar agente
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-muted-foreground">
        Mostrando {filteredAgents.length} de {agents.length} agentes
      </div>

      {/* Add Agent Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Agregar nuevo agente</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo agente para agregarlo al equipo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Nombre completo
              </Label>
              <Input
                id="name"
                placeholder="Juan Pérez"
                value={newAgent.name}
                onChange={(e) =>
                  setNewAgent((prev) => ({ ...prev, name: e.target.value }))
                }
                className="bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="juan.perez@empresa.com"
                value={newAgent.email}
                onChange={(e) =>
                  setNewAgent((prev) => ({ ...prev, email: e.target.value }))
                }
                className="bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-foreground">
                Rol
              </Label>
              <Select
                value={newAgent.role}
                onValueChange={(value: AgentFrontend["role"]) =>
                  setNewAgent((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger className="bg-input text-foreground">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  <SelectItem value="agente">Agente</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
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
              onClick={handleAddAgent}
              disabled={!newAgent.name || !newAgent.email || saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Agregar agente"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Eliminar agente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar a <strong>{deleteTarget?.name}</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAgent}
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
