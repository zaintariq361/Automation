import Anthropic from "@anthropic-ai/sdk";

export const AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: "search_catalog",
    description:
      "Search the store's product catalog by keyword and/or maximum price. Use this whenever the customer asks about products, prices, or availability.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keyword(s) to search product titles/descriptions for." },
        max_price: { type: "number", description: "Optional maximum price filter." },
      },
    },
  },
  {
    name: "search_knowledge_base",
    description:
      "Search the business's uploaded FAQs, policies, delivery details, and other knowledge base documents. Use this for questions about policies, hours, delivery, or anything not covered by the product catalog.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The customer's question, or key terms from it." },
      },
      required: ["query"],
    },
  },
  {
    name: "create_order",
    description:
      "Create a draft order for the current customer once they've confirmed which products and quantities they want. Only call this after the customer has explicitly confirmed the order.",
    input_schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              product_id: { type: "string", description: "The product's internal id, from a prior search_catalog result." },
              quantity: { type: "integer", minimum: 1 },
            },
            required: ["product_id", "quantity"],
          },
        },
      },
      required: ["items"],
    },
  },
  {
    name: "handoff_to_human",
    description:
      "Transfer the conversation to a human agent. Use this when you cannot resolve the customer's request, when they explicitly ask for a human, or for complaints/refunds that require human judgement.",
    input_schema: {
      type: "object",
      properties: {
        reason: { type: "string", description: "Short reason for the handoff, shown to the human agent." },
      },
      required: ["reason"],
    },
  },
];
