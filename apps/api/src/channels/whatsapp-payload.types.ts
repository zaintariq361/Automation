export interface WhatsappInboundMessage {
  phoneNumberId: string;
  from: string;
  customerName?: string;
  type: "text" | "image" | "audio" | "unknown";
  text?: string;
  mediaId?: string;
  waMessageId: string;
  timestamp: string;
}

/**
 * Parses a Meta WhatsApp Cloud API webhook payload into a flat list of
 * inbound messages. Status callbacks (delivered/read) are ignored.
 */
export function parseWhatsappWebhook(body: any): WhatsappInboundMessage[] {
  const results: WhatsappInboundMessage[] = [];
  const entries = body?.entry ?? [];

  for (const entry of entries) {
    for (const change of entry?.changes ?? []) {
      const value = change?.value;
      const phoneNumberId = value?.metadata?.phone_number_id;
      const contacts = value?.contacts ?? [];
      const messages = value?.messages ?? [];

      for (const msg of messages) {
        const contact = contacts.find((c: any) => c.wa_id === msg.from);
        let type: WhatsappInboundMessage["type"] = "unknown";
        let text: string | undefined;
        let mediaId: string | undefined;

        if (msg.type === "text") {
          type = "text";
          text = msg.text?.body;
        } else if (msg.type === "image") {
          type = "image";
          mediaId = msg.image?.id;
        } else if (msg.type === "audio") {
          type = "audio";
          mediaId = msg.audio?.id;
        }

        results.push({
          phoneNumberId,
          from: msg.from,
          customerName: contact?.profile?.name,
          type,
          text,
          mediaId,
          waMessageId: msg.id,
          timestamp: msg.timestamp,
        });
      }
    }
  }

  return results;
}
