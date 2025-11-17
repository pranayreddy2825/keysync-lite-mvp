export interface Persona {
  id: string;
  name: string;
  specialty: string;
  areas: string[];
  type: string;
  description: string;
}

export interface Analysis {
  intent: "buy" | "rent";
  budget: number | null;
  area: string;
  timeframe: string;
  client_type: "investor" | "end-user" | "unknown";
  language: string;
  lead_score: number;
  priority: "low" | "medium" | "high";
  qdrant_context?: QdrantSnippet[];
}

export interface QdrantSnippet {
  text: string;
  score: number;
  payload: Record<string, any>;
}

export interface LeadResponse {
  analysis: Analysis;
  persona: Persona;
  knowledge: string[];
  reply: string;
  handling_mode: "ai" | "human";
  needs_human: boolean;
  recommendedProperties?: Property[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "client" | "ai";
  timestamp: Date;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  area: string;
  bedrooms: number;
  price: number;
  currency: string;
  images: string[];
}

