import {
  Channel,
  ConversationStatus,
  MessageSender,
  MessageType,
  UserRole,
  OrderStatus,
  IntegrationType,
  IntegrationStatus,
  HandoffReason,
} from "./enums";

export interface TenantDTO {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface UserDTO {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface CustomerDTO {
  id: string;
  tenantId: string;
  channel: Channel;
  externalId: string;
  name: string | null;
  phone: string | null;
  tags: string[];
  churnScore: number | null;
  lifetimeValue: number;
  createdAt: string;
}

export interface ConversationDTO {
  id: string;
  tenantId: string;
  customerId: string;
  customer?: CustomerDTO;
  channel: Channel;
  status: ConversationStatus;
  aiEnabled: boolean;
  assignedAgentId: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  unreadCount?: number;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  tenantId: string;
  sender: MessageSender;
  senderId: string | null;
  type: MessageType;
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface InternalNoteDTO {
  id: string;
  conversationId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface KnowledgeDocumentDTO {
  id: string;
  tenantId: string;
  title: string;
  sourceType: string;
  content: string;
  chunkCount: number;
  createdAt: string;
}

export interface ProductDTO {
  id: string;
  tenantId: string;
  externalId: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  inventory: number;
  syncedAt: string;
}

export interface OrderItemDTO {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderDTO {
  id: string;
  tenantId: string;
  conversationId: string | null;
  customerId: string;
  status: OrderStatus;
  items: OrderItemDTO[];
  total: number;
  currency: string;
  createdAt: string;
}

export interface HandoffEventDTO {
  id: string;
  conversationId: string;
  reason: HandoffReason;
  fromAi: boolean;
  toAgentId: string | null;
  note: string | null;
  createdAt: string;
}

export interface IntegrationDTO {
  id: string;
  tenantId: string;
  type: IntegrationType;
  status: IntegrationStatus;
  config: Record<string, unknown>;
  updatedAt: string;
}

export interface AnalyticsSummaryDTO {
  conversationVolume: number;
  aiResolutionRate: number;
  avgResponseTimeSeconds: number;
  handoffRate: number;
  conversionRate: number;
  revenueGenerated: number;
  activeConversations: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
