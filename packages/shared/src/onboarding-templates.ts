export type Region = "PK" | "KSA" | "GLOBAL";

export interface OnboardingKnowledgeDoc {
  title: string;
  sourceType: "faq" | "policy" | "product" | "manual" | "menu";
  content: string;
}

export interface OnboardingProduct {
  title: string;
  description: string;
  price: number;
  currency: string;
  inventory: number;
}

export interface OnboardingTemplate {
  id: string;
  label: string;
  regions: Region[];
  icon: string;
  description: string;
  agentTone: string;
  defaultLanguage: "en" | "ur" | "ar";
  knowledgeDocs: OnboardingKnowledgeDoc[];
  products: OnboardingProduct[];
}

export const ONBOARDING_TEMPLATES: OnboardingTemplate[] = [
  {
    id: "restaurant_cloud_kitchen",
    label: "Restaurants & Cloud Kitchens",
    regions: ["PK"],
    icon: "🍰",
    description: "Take food orders, answer menu questions, and manage delivery inquiries over WhatsApp.",
    agentTone:
      "You're warm, quick, and food-focused — help customers pick dishes, mention today's specials when relevant, and confirm delivery timing clearly.",
    defaultLanguage: "ur",
    knowledgeDocs: [
      {
        title: "Delivery & Timing",
        sourceType: "policy",
        content:
          "We deliver within Lahore, Karachi, and Islamabad city limits, typically within 45-60 minutes of order confirmation. Delivery is free for orders over Rs. 2,000, otherwise a flat Rs. 150 delivery fee applies. We're open daily from 12pm to 11pm. Cash on delivery and card payments are both accepted.",
      },
      {
        title: "Custom Orders & Cakes",
        sourceType: "faq",
        content:
          "Custom cake orders (birthday, wedding, corporate) need at least 24 hours notice. We can write names/messages on cakes for free. Half/full-day event catering needs 48 hours notice and a minimum order of Rs. 10,000. We accommodate common dietary requests (eggless, less sugar) with advance notice.",
      },
    ],
    products: [
      { title: "Chocolate Fudge Cake (Serves 15)", description: "Rich chocolate fudge cake, perfect for large gatherings.", price: 2800, currency: "PKR", inventory: 20 },
      { title: "Chicken Karahi (Full)", description: "Classic chicken karahi, serves 3-4.", price: 1650, currency: "PKR", inventory: 40 },
      { title: "Biryani Family Pack", description: "Chicken biryani, serves 4-5, with raita and salad.", price: 1400, currency: "PKR", inventory: 40 },
    ],
  },
  {
    id: "fashion_retail",
    label: "Fashion & Retail (D2C)",
    regions: ["PK"],
    icon: "👗",
    description: "Help shoppers find sizes/colors, answer exchange questions, and close sales in-chat.",
    agentTone:
      "You're stylish and helpful — suggest sizes/colors confidently, mention if an item is trending or low in stock, and make checkout feel effortless.",
    defaultLanguage: "en",
    knowledgeDocs: [
      {
        title: "Sizing & Exchanges",
        sourceType: "policy",
        content:
          "We offer easy exchanges within 7 days of delivery for a different size or color, provided tags are intact and the item is unworn. Refunds are issued as store credit. A size chart is available on request — most customers find our fit runs true to international sizing (S/M/L/XL).",
      },
      {
        title: "Shipping",
        sourceType: "faq",
        content:
          "We ship nationwide across Pakistan via TCS/Leopards, typically arriving in 2-4 business days. Free shipping on orders over Rs. 5,000. Cash on delivery is available everywhere; card/bank transfer gets 5% off.",
      },
    ],
    products: [
      { title: "Embroidered Lawn 3-Piece Suit", description: "Unstitched lawn suit with embroidered dupatta, summer collection.", price: 4500, currency: "PKR", inventory: 30 },
      { title: "Men's Slim Fit Kurta", description: "Cotton kurta, available in navy, black, and white.", price: 2200, currency: "PKR", inventory: 50 },
      { title: "Chiffon Party Wear Dress", description: "Hand-embellished chiffon dress for formal occasions.", price: 8900, currency: "PKR", inventory: 15 },
    ],
  },
  {
    id: "real_estate",
    label: "Real Estate Agencies",
    regions: ["PK"],
    icon: "🏠",
    description: "Qualify property inquiries, share listing details, and schedule viewings over chat.",
    agentTone:
      "You're professional and consultative — ask clarifying questions (budget, area, purpose) before recommending listings, and always offer to schedule a viewing with an agent.",
    defaultLanguage: "en",
    knowledgeDocs: [
      {
        title: "How We Work",
        sourceType: "faq",
        content:
          "We handle sale and rental of residential and commercial properties across DHA, Bahria Town, and Gulberg. Our commission is 1% of sale value or one month's rent for rentals, paid by the party we represent. Property viewings can be scheduled same-day with 2 hours notice, Saturday through Thursday, 10am-7pm.",
      },
      {
        title: "Documentation Needed",
        sourceType: "policy",
        content:
          "For rentals, tenants need CNIC copies and 2 months' rent as security deposit. For sales, buyers need to provide proof of funds before we share exact addresses of premium listings. We assist with transfer paperwork for an additional service fee.",
      },
    ],
    products: [
      { title: "5 Marla House — DHA Phase 6", description: "3 bed, 3 bath, corner plot, ready to move.", price: 32500000, currency: "PKR", inventory: 1 },
      { title: "2 Bed Apartment — Bahria Town", description: "Fully furnished, gated community, near commercial area.", price: 8500000, currency: "PKR", inventory: 1 },
      { title: "1 Kanal Plot — Gulberg", description: "Corner plot, all utilities available, prime location.", price: 65000000, currency: "PKR", inventory: 1 },
    ],
  },
  {
    id: "clinic_healthcare",
    label: "Clinics & Healthcare",
    regions: ["PK"],
    icon: "🩺",
    description: "Handle appointment requests, answer service/pricing questions, and triage urgent cases to staff.",
    agentTone:
      "You're calm, reassuring, and precise — never give medical advice or diagnoses, always confirm appointment details clearly, and hand off anything urgent to a human immediately.",
    defaultLanguage: "ur",
    knowledgeDocs: [
      {
        title: "Appointments & Hours",
        sourceType: "faq",
        content:
          "We're open Monday-Saturday, 9am-9pm, closed Sundays. Walk-ins are welcome but appointments are recommended to avoid waiting — typical wait for a booked slot is under 15 minutes. Consultation fee is Rs. 2,000 for general physicians, Rs. 3,500 for specialists. We accept cash and card.",
      },
      {
        title: "Emergency Policy",
        sourceType: "policy",
        content:
          "For any emergency, chest pain, breathing difficulty, severe injury, or bleeding, tell the patient to call our emergency line or go to the nearest ER immediately — do not attempt to schedule a routine appointment for these cases. Always hand off urgent-sounding messages to a human staff member.",
      },
    ],
    products: [],
  },
  {
    id: "logistics_trucking",
    label: "Logistics & Trucking Dispatch",
    regions: ["KSA"],
    icon: "🚚",
    description: "Help drivers and fleet operators with load matching, document reminders, and dispatch questions.",
    agentTone:
      "You're direct and efficient, speaking driver-to-driver — confirm load details (pickup, drop-off, weight, pay) clearly and flag any missing documentation.",
    defaultLanguage: "ar",
    knowledgeDocs: [
      {
        title: "Driver Requirements",
        sourceType: "policy",
        content:
          "All drivers must have a valid Saudi driving license (heavy vehicle category where applicable), Istimara (vehicle registration), and valid insurance on file before accepting any load. Licenses and Istimara must be renewed at least 30 days before expiry — we send reminders, but drivers are responsible for keeping documents current.",
      },
      {
        title: "Load Matching & Payment",
        sourceType: "faq",
        content:
          "Loads are matched by route, vehicle type, and availability. Standard payment terms are 50% on pickup confirmation and 50% on delivery confirmation (POD), released within 3 business days. Cancellations within 2 hours of scheduled pickup may incur a cancellation fee.",
      },
    ],
    products: [],
  },
  {
    id: "ecommerce_retail",
    label: "E-commerce & Retail",
    regions: ["KSA"],
    icon: "🛍️",
    description: "Answer product questions, process orders, and handle delivery/return questions over WhatsApp.",
    agentTone:
      "You're friendly and sales-oriented — help customers find products quickly, mention available sizes/colors, and make ordering fast.",
    defaultLanguage: "ar",
    knowledgeDocs: [
      {
        title: "Shipping & Delivery",
        sourceType: "policy",
        content:
          "We deliver across Riyadh, Jeddah, and Dammam within 1-2 business days, and nationwide within 3-5 business days. Free shipping on orders over 200 SAR. Cash on delivery, Mada, and credit cards are all accepted.",
      },
      {
        title: "Returns & Exchanges",
        sourceType: "faq",
        content:
          "Items can be returned or exchanged within 14 days of delivery if unused and in original packaging. Refunds are processed within 5-7 business days to the original payment method. Sale items are final sale unless defective.",
      },
    ],
    products: [
      { title: "Wireless Earbuds Pro", description: "Noise-cancelling wireless earbuds with 30hr battery case.", price: 249, currency: "SAR", inventory: 60 },
      { title: "Smart Fitness Watch", description: "Heart-rate and sleep tracking, 7-day battery life.", price: 399, currency: "SAR", inventory: 35 },
      { title: "Portable Blender Bottle", description: "USB-rechargeable personal blender for smoothies on the go.", price: 89, currency: "SAR", inventory: 100 },
    ],
  },
  {
    id: "home_services",
    label: "Home Services & Maintenance",
    regions: ["KSA"],
    icon: "🛠️",
    description: "Book cleaning, AC maintenance, and repair visits, and answer pricing questions.",
    agentTone:
      "You're practical and reassuring — confirm the service needed, preferred time slot, and address, and let the customer know a technician will confirm shortly.",
    defaultLanguage: "ar",
    knowledgeDocs: [
      {
        title: "Services & Pricing",
        sourceType: "faq",
        content:
          "We offer home cleaning (starting 120 SAR), AC servicing and repair (starting 150 SAR per unit), and general handyman work (hourly rate 80 SAR, 1-hour minimum). Exact quotes depend on job size and are confirmed by a technician before work begins.",
      },
      {
        title: "Booking & Cancellation",
        sourceType: "policy",
        content:
          "Bookings can be made for same-day (subject to availability) or scheduled up to 2 weeks ahead. We operate 7 days a week, 8am-8pm. Cancellations made less than 2 hours before the appointment may incur a 50 SAR fee.",
      },
    ],
    products: [],
  },
  {
    id: "general",
    label: "General / Other",
    regions: ["GLOBAL"],
    icon: "💬",
    description: "A blank starting point — add your own knowledge base and catalog after setup.",
    agentTone: "You're helpful, professional, and concise.",
    defaultLanguage: "en",
    knowledgeDocs: [
      {
        title: "Welcome",
        sourceType: "faq",
        content:
          "This is a starter knowledge base document. Replace this with your business's real FAQs, policies, and product information from the Knowledge Base page.",
      },
    ],
    products: [],
  },
];
