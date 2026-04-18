// Mock data for ChatDesk platform

export interface Message {
  id: string;
  sender: "user" | "bot";
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  messages: Message[];
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: "admin" | "supervisor" | "agente";
  status: "online" | "away" | "offline";
  conversationsToday: number;
}

export const initialConversations: Conversation[] = [
  {
    id: "1",
    userName: "María García",
    userAvatar: "MG",
    lastMessage: "Gracias por la ayuda con mi pedido",
    timestamp: "Hace 5 min",
    unread: true,
    messages: [
      {
        id: "1",
        sender: "user",
        content: "Hola, necesito ayuda con mi pedido #12345",
        timestamp: "10:30 AM",
      },
      {
        id: "2",
        sender: "bot",
        content: "¡Hola María! Soy el asistente virtual de ChatDesk. Con gusto te ayudo con tu pedido #12345. Déjame verificar el estado...",
        timestamp: "10:30 AM",
      },
      {
        id: "3",
        sender: "bot",
        content: "Tu pedido #12345 fue enviado ayer y está en camino. El tiempo estimado de entrega es de 2-3 días hábiles. ¿Hay algo más en lo que pueda ayudarte?",
        timestamp: "10:31 AM",
      },
      {
        id: "4",
        sender: "user",
        content: "¿Puedo cambiar la dirección de entrega?",
        timestamp: "10:32 AM",
      },
      {
        id: "5",
        sender: "bot",
        content: "Para cambiar la dirección de entrega de un pedido en tránsito, necesitaré transferirte con un agente humano. ¿Te parece bien?",
        timestamp: "10:32 AM",
      },
      {
        id: "6",
        sender: "user",
        content: "Sí, por favor",
        timestamp: "10:33 AM",
      },
      {
        id: "7",
        sender: "bot",
        content: "Perfecto, te estoy transfiriendo con uno de nuestros agentes de soporte. El tiempo de espera estimado es de 2 minutos. ¡Gracias por tu paciencia!",
        timestamp: "10:33 AM",
      },
    ],
  },
  {
    id: "2",
    userName: "Carlos Rodríguez",
    userAvatar: "CR",
    lastMessage: "¿Cuándo llega mi envío?",
    timestamp: "Hace 15 min",
    unread: true,
    messages: [
      {
        id: "1",
        sender: "user",
        content: "Hola, hice un pedido hace 5 días y aún no llega",
        timestamp: "09:45 AM",
      },
      {
        id: "2",
        sender: "bot",
        content: "¡Hola Carlos! Lamento escuchar que tu pedido aún no ha llegado. ¿Podrías proporcionarme tu número de pedido para verificar el estado?",
        timestamp: "09:45 AM",
      },
      {
        id: "3",
        sender: "user",
        content: "Es el pedido #78901",
        timestamp: "09:46 AM",
      },
      {
        id: "4",
        sender: "bot",
        content: "Gracias Carlos. Verificando el pedido #78901... Tu pedido está actualmente en el centro de distribución local. Debería llegar mañana entre las 9 AM y 6 PM.",
        timestamp: "09:46 AM",
      },
      {
        id: "5",
        sender: "user",
        content: "¿Cuándo llega mi envío?",
        timestamp: "09:47 AM",
      },
    ],
  },
  {
    id: "3",
    userName: "Ana Martínez",
    userAvatar: "AM",
    lastMessage: "Necesito cambiar mi contraseña",
    timestamp: "Hace 1 hora",
    unread: false,
    messages: [
      {
        id: "1",
        sender: "user",
        content: "No puedo acceder a mi cuenta, olvidé mi contraseña",
        timestamp: "08:15 AM",
      },
      {
        id: "2",
        sender: "bot",
        content: "¡Hola Ana! No te preocupes, puedo ayudarte a recuperar tu contraseña. Te enviaré un enlace de recuperación a tu correo electrónico registrado.",
        timestamp: "08:15 AM",
      },
      {
        id: "3",
        sender: "bot",
        content: "Listo, he enviado el enlace de recuperación a a***@email.com. El enlace expira en 24 horas. ¿Recibiste el correo?",
        timestamp: "08:16 AM",
      },
      {
        id: "4",
        sender: "user",
        content: "Sí, ya lo recibí. Gracias!",
        timestamp: "08:20 AM",
      },
      {
        id: "5",
        sender: "bot",
        content: "¡Excelente! Me alegra haberte ayudado. Si tienes alguna otra consulta, no dudes en escribirme. ¡Que tengas un excelente día!",
        timestamp: "08:20 AM",
      },
    ],
  },
  {
    id: "4",
    userName: "Luis Fernández",
    userAvatar: "LF",
    lastMessage: "¿Tienen servicio técnico?",
    timestamp: "Hace 2 horas",
    unread: false,
    messages: [
      {
        id: "1",
        sender: "user",
        content: "Mi producto dejó de funcionar después de una semana",
        timestamp: "07:30 AM",
      },
      {
        id: "2",
        sender: "bot",
        content: "Lamento escuchar eso, Luis. ¿Podrías describirme qué problema específico presenta el producto?",
        timestamp: "07:30 AM",
      },
      {
        id: "3",
        sender: "user",
        content: "No enciende, ya probé cargándolo toda la noche",
        timestamp: "07:32 AM",
      },
      {
        id: "4",
        sender: "bot",
        content: "Entiendo. Como tu producto está dentro del período de garantía, tienes derecho a servicio técnico gratuito. Te puedo agendar una cita o enviarte una guía de devolución.",
        timestamp: "07:32 AM",
      },
      {
        id: "5",
        sender: "user",
        content: "¿Tienen servicio técnico?",
        timestamp: "07:35 AM",
      },
    ],
  },
  {
    id: "5",
    userName: "Elena Sánchez",
    userAvatar: "ES",
    lastMessage: "Quiero hacer una devolución",
    timestamp: "Hace 3 horas",
    unread: false,
    messages: [
      {
        id: "1",
        sender: "user",
        content: "Hola, el producto que recibí no es lo que esperaba",
        timestamp: "06:00 AM",
      },
      {
        id: "2",
        sender: "bot",
        content: "¡Hola Elena! Lamento que el producto no haya cumplido tus expectativas. ¿Podrías contarme más sobre qué esperabas y qué recibiste?",
        timestamp: "06:00 AM",
      },
      {
        id: "3",
        sender: "user",
        content: "El color es diferente al de la foto, pedí azul marino y llegó azul claro",
        timestamp: "06:02 AM",
      },
      {
        id: "4",
        sender: "bot",
        content: "Entiendo tu frustración, Elena. Tienes dos opciones: podemos enviarte el producto correcto en azul marino, o procesar una devolución completa. ¿Qué preferirías?",
        timestamp: "06:02 AM",
      },
      {
        id: "5",
        sender: "user",
        content: "Quiero hacer una devolución",
        timestamp: "06:05 AM",
      },
      {
        id: "6",
        sender: "bot",
        content: "Perfecto, iniciaré el proceso de devolución. Te enviaré una etiqueta de envío prepagada a tu correo. Una vez recibamos el producto, procesaremos el reembolso en 3-5 días hábiles.",
        timestamp: "06:05 AM",
      },
    ],
  },
];

export const documents = [
  {
    id: "1",
    name: "Manual de Usuario v2.1.pdf",
    type: "PDF",
    size: "2.4 MB",
    uploadedAt: "2024-01-15",
    status: "Procesado",
  },
  {
    id: "2",
    name: "FAQ Producto Principal.docx",
    type: "DOCX",
    size: "856 KB",
    uploadedAt: "2024-01-14",
    status: "Procesado",
  },
  {
    id: "3",
    name: "Políticas de Devolución.pdf",
    type: "PDF",
    size: "1.2 MB",
    uploadedAt: "2024-01-12",
    status: "Procesado",
  },
  {
    id: "4",
    name: "Guía de Instalación.pdf",
    type: "PDF",
    size: "3.8 MB",
    uploadedAt: "2024-01-10",
    status: "En proceso",
  },
  {
    id: "5",
    name: "Especificaciones Técnicas.xlsx",
    type: "XLSX",
    size: "512 KB",
    uploadedAt: "2024-01-08",
    status: "Procesado",
  },
  {
    id: "6",
    name: "Términos y Condiciones.pdf",
    type: "PDF",
    size: "980 KB",
    uploadedAt: "2024-01-05",
    status: "Procesado",
  },
];

export const kpis = {
  totalConversations: 12847,
  conversationsChange: "+12.5%",
  csatScore: 4.6,
  csatChange: "+0.3",
  escalationRate: 15.2,
  escalationChange: "-2.1%",
  avgResponseTime: "1.2s",
  responseTimeChange: "-0.3s",
  resolvedConversations: 10234,
  resolvedChange: "+8.7%",
  activeAgents: 24,
  agentsChange: "+2",
};

export const initialAgents: Agent[] = [
  {
    id: "1",
    name: "Roberto Méndez",
    email: "roberto.mendez@empresa.com",
    role: "admin",
    status: "online",
    conversationsToday: 45,
  },
  {
    id: "2",
    name: "Patricia López",
    email: "patricia.lopez@empresa.com",
    role: "supervisor",
    status: "online",
    conversationsToday: 32,
  },
  {
    id: "3",
    name: "Miguel Ángel Torres",
    email: "miguel.torres@empresa.com",
    role: "agente",
    status: "online",
    conversationsToday: 28,
  },
  {
    id: "4",
    name: "Laura Jiménez",
    email: "laura.jimenez@empresa.com",
    role: "agente",
    status: "away",
    conversationsToday: 15,
  },
  {
    id: "5",
    name: "Fernando Castro",
    email: "fernando.castro@empresa.com",
    role: "agente",
    status: "offline",
    conversationsToday: 0,
  },
  {
    id: "6",
    name: "Claudia Vargas",
    email: "claudia.vargas@empresa.com",
    role: "supervisor",
    status: "online",
    conversationsToday: 38,
  },
  {
    id: "7",
    name: "Diego Morales",
    email: "diego.morales@empresa.com",
    role: "agente",
    status: "online",
    conversationsToday: 22,
  },
];
