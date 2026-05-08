"use client";

import { useState } from "react";
import { documents } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Upload,
  FileText,
  MoreHorizontal,
  Download,
  Trash2,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    return <FileText className="h-5 w-5" />;
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge
        variant="outline"
        className={cn(
          "font-normal",
          status === "Procesado"
            ? "border-green-500/50 bg-green-500/10 text-green-400"
            : "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
        )}
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Base de Conocimiento
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona los documentos que alimentan tu ChatBot
        </p>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-input pl-9 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Upload className="mr-2 h-4 w-4" />
          Subir documento
        </Button>
      </div>

      {/* Documents Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Nombre</TableHead>
              <TableHead className="text-muted-foreground">Tipo</TableHead>
              <TableHead className="text-muted-foreground">Tamaño</TableHead>
              <TableHead className="text-muted-foreground">
                Fecha de subida
              </TableHead>
              <TableHead className="text-muted-foreground">Estado</TableHead>
              <TableHead className="w-[50px] text-muted-foreground"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map((doc) => (
              <TableRow
                key={doc.id}
                className="border-border hover:bg-muted/50"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      {getFileIcon(doc.type)}
                    </div>
                    <span className="font-medium text-foreground">
                      {doc.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {doc.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {doc.size}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {doc.uploadedAt}
                </TableCell>
                <TableCell>{getStatusBadge(doc.status)}</TableCell>
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
                        <Eye className="mr-2 h-4 w-4" />
                        Ver documento
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-popover-foreground focus:bg-muted focus:text-foreground">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
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

      {/* Summary */}
      <div className="mt-4 text-sm text-muted-foreground">
        Mostrando {filteredDocuments.length} de {documents.length} documentos
      </div>
    </div>
  );
}
