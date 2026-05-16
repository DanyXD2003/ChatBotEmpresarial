"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Send,
  Bot,
  User,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import {
  listConversations,
  sendMessage,
  type ConversationFrontend,
  type MessageFrontend,
} from "./actions";

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  const fetchConversations = useCallback(async () => {
    try {
      setError(null);
      const data = await listConversations("activa");
      setConversations(data);
      if (data.length > 0 && !selectedConversationId) {
        setSelectedConversationId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar conversaciones");
    } finally {
      setLoading(false);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const filteredConversations = conversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, unread: false } : c
      )
    );
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;
    setSending(true);
    try {
      const userMsg = await sendMessage(selectedConversation.id, message);

      const newUserMessage: MessageFrontend = {
        id: userMsg.id,
        sender: "user",
        content: message,
        timestamp: "Ahora",
      };

      // Simulated bot response (backend doesn't have bot endpoint)
      const botResponses = [
        "Entiendo tu consulta. Déjame verificar esa información para ti.",
        "Gracias por tu mensaje. Estoy procesando tu solicitud.",
        "He registrado tu petición. Un agente se comunicará contigo pronto.",
        "Perfecto, ¿hay algo más en lo que pueda ayudarte?",
        "Estoy revisando los detalles. Te confirmo en un momento.",
      ];

      const newBotMessage: MessageFrontend = {
        id: `${Date.now() + 1}`,
        sender: "bot",
        content: botResponses[Math.floor(Math.random() * botResponses.length)],
        timestamp: "Ahora",
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? {
                ...c,
                messages: [...c.messages, newUserMessage, newBotMessage],
                lastMessage: message,
                timestamp: "Ahora",
              }
            : c
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar mensaje");
    } finally {
      setSending(false);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedConversation) return null;

  return (
    <div className="flex h-full">
      {/* Conversations List */}
      <div className="flex w-80 flex-col border-r border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Conversaciones
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar conversación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-input pl-9 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors",
                  selectedConversationId === conversation.id
                    ? "bg-primary/10 text-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                    conversation.unread
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {conversation.userAvatar}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{conversation.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unread && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Window */}
      <div className="flex flex-1 flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {selectedConversation.userAvatar}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {selectedConversation.userName}
              </h3>
              <p className="text-sm text-muted-foreground">En línea</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {selectedConversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-3",
                  msg.sender === "user" ? "flex-row-reverse" : ""
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    msg.sender === "user"
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {msg.sender === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5",
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-card-foreground border border-border"
                  )}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      msg.sender === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Smile className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Escribe un mensaje..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-input text-foreground placeholder:text-muted-foreground"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
