"use client";

import { useState } from "react";
import { initialAgents, type Agent } from "@/lib/data";
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
  Mail,
  Settings,
  Trash2,
  X,
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
import { cn } from "@/lib/utils";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    email: "",
    role: "agente" as Agent["role"],
  });

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddAgent = () => {
    if (!newAgent.name || !newAgent.email) return;

    const agent: Agent = {
      id: `${Date.now()}`,
      name: newAgent.name,
      email: newAgent.email,
      role: newAgent.role,
      status: "offline",
      conversationsToday: 0,
    };

    setAgents((prev) => [...prev, agent]);
    setNewAgent({ name: "", email: "", role: "agente" });
    setIsAddDialogOpen(false);
  };

  const handleDeleteAgent = (agentId: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== agentId));
  };

  const handleToggleStatus = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? {
              ...a,
              status:
                a.status === "online"
                  ? "away"
                  : a.status === "away"
                  ? "offline"
                  : "online",
            }
          : a
      )
    );
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

  return (
    <div className="flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Agentes</h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona el personal de soporte de tu organización
        </p>
      </div>

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
          <p className="text-sm text-muted-foreground">Conversaciones Hoy</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">
            {agents.reduce((acc, agent) => acc + agent.conversationsToday, 0)}
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
              <TableHead className="text-muted-foreground">
                Conversaciones Hoy
              </TableHead>
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
                  <button onClick={() => handleToggleStatus(agent.id)}>
                    {getStatusBadge(agent.status)}
                  </button>
                </TableCell>
                <TableCell className="text-foreground">
                  {agent.conversationsToday}
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
                      <DropdownMenuItem className="text-popover-foreground focus:bg-muted focus:text-foreground">
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar mensaje
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-popover-foreground focus:bg-muted focus:text-foreground">
                        <Settings className="mr-2 h-4 w-4" />
                        Editar permisos
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteAgent(agent.id)}
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
                onValueChange={(value: Agent["role"]) =>
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
              disabled={!newAgent.name || !newAgent.email}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Agregar agente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
