// Shared types for CRM components
export interface Stage {
    id: string;
    name: string;
    color: string;
    order: number;
    pipelineId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Lead {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    budget: string | null;
    stageId: string | null;
    pipelineId: string | null;
    status: string;
    priority: string;
    expectedValue: number | null; // ✅ Already number (converted from Decimal)
    source: string;
    score: number;
    assignedTo: string | null;
    campaignId?: string | null; // 🎯 NEW: Campaign ID
    conversationId?: string | null; // 🎯 NEW: Conversation ID
    createdAt: Date;
    updatedAt: Date;
  
  // Relations (optional)
  stage?: Stage | null;
  pipeline?: Pipeline | null;
  campaign?: { id: string; name: string } | null; // 🎯 NEW: Campaign relation
}

export interface Pipeline {
    id: string;
    name: string;
    isDefault: boolean;
    stages: Stage[];
    createdAt: Date;
    updatedAt: Date;
}
