export enum Channel {
  WHATSAPP = "WHATSAPP",
  INSTAGRAM = "INSTAGRAM",
  MESSENGER = "MESSENGER",
}

export enum ConversationStatus {
  OPEN = "OPEN",
  PENDING = "PENDING",
  HANDED_OFF = "HANDED_OFF",
  CLOSED = "CLOSED",
}

export enum MessageSender {
  CUSTOMER = "CUSTOMER",
  AI = "AI",
  AGENT = "AGENT",
  SYSTEM = "SYSTEM",
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  ORDER = "ORDER",
  PRODUCT = "PRODUCT",
}

export enum UserRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  AGENT = "AGENT",
}

export enum OrderStatus {
  DRAFT = "DRAFT",
  PENDING_PAYMENT = "PENDING_PAYMENT",
  CONFIRMED = "CONFIRMED",
  FULFILLED = "FULFILLED",
  CANCELLED = "CANCELLED",
}

export enum IntegrationType {
  WHATSAPP = "WHATSAPP",
  INSTAGRAM = "INSTAGRAM",
  MESSENGER = "MESSENGER",
  SHOPIFY = "SHOPIFY",
}

export enum IntegrationStatus {
  DISCONNECTED = "DISCONNECTED",
  CONNECTED = "CONNECTED",
  ERROR = "ERROR",
}

export enum HandoffReason {
  AI_LOW_CONFIDENCE = "AI_LOW_CONFIDENCE",
  CUSTOMER_REQUESTED = "CUSTOMER_REQUESTED",
  AGENT_TOOL_CALL = "AGENT_TOOL_CALL",
  ESCALATION_KEYWORD = "ESCALATION_KEYWORD",
  MANUAL = "MANUAL",
}
