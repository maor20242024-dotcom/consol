-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT,
    "country" TEXT,
    "language" TEXT,
    "isWhatsappPreferred" BOOLEAN NOT NULL DEFAULT false,
    "budgetRange" TEXT,
    "timeToInvest" TEXT,
    "investmentGoal" TEXT,
    "budget" TEXT,
    "marketingChannel" TEXT,
    "pageSlug" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "landingPath" TEXT,
    "referer" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "score" INTEGER NOT NULL DEFAULT 0,
    "pipelineId" TEXT,
    "stageId" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "expectedValue" DECIMAL DEFAULT 0,
    "assignedTo" TEXT,
    "campaignId" TEXT,
    "conversationId" TEXT,
    CONSTRAINT "Lead_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lead_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeadEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "meta" TEXT,
    "leadId" TEXT NOT NULL,
    CONSTRAINT "LeadEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pipeline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pipelineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL DEFAULT '#000000',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Stage_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "performedBy" TEXT,
    "scheduledFor" DATETIME,
    "aiSummary" TEXT,
    "duration" INTEGER,
    "isCompleted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zadarmaCallId" TEXT,
    "leadId" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "duration" INTEGER,
    "recordingUrl" TEXT,
    "transcript" TEXT,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Call_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "objective" TEXT,
    "budget" DECIMAL DEFAULT 0,
    "spent" DECIMAL DEFAULT 0,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "platform" TEXT NOT NULL DEFAULT 'FACEBOOK',
    "externalId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "budget" DECIMAL,
    "targeting" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "externalId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdSet_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adSetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "creativeId" TEXT,
    "externalId" TEXT,
    "previewUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ad_adSetId_fkey" FOREIGN KEY ("adSetId") REFERENCES "AdSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "campaignId" TEXT,
    "adSetId" TEXT,
    "adId" TEXT,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "spend" DECIMAL NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "ctr" DECIMAL DEFAULT 0,
    "cpc" DECIMAL DEFAULT 0,
    "cpm" DECIMAL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Insight_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Insight_adSetId_fkey" FOREIGN KEY ("adSetId") REFERENCES "AdSet" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Insight_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstagramAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "instagramUserId" TEXT NOT NULL,
    "instagramUsername" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "businessAccountId" TEXT NOT NULL,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastSyncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InstagramPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "caption" TEXT,
    "mediaUrl" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL DEFAULT 'IMAGE',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledFor" DATETIME,
    "publishedAt" DATETIME,
    "instagramMediaId" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstagramPost_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "InstagramAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstagramCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "budget" DECIMAL NOT NULL DEFAULT 0,
    "targetAudience" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstagramCampaign_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "InstagramAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstagramAd" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "adAccountId" TEXT,
    "adType" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "callToAction" TEXT NOT NULL DEFAULT 'SHOP_NOW',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "spend" DECIMAL NOT NULL DEFAULT 0,
    "ctr" REAL NOT NULL DEFAULT 0,
    "cpc" DECIMAL NOT NULL DEFAULT 0,
    "cpa" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstagramAd_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "InstagramAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InstagramAd_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "InstagramCampaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adId" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "altText" TEXT,
    "dimensions" TEXT,
    "fileSize" INTEGER,
    "duration" INTEGER,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdAsset_adId_fkey" FOREIGN KEY ("adId") REFERENCES "InstagramAd" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adId" TEXT NOT NULL,
    "variantName" TEXT NOT NULL,
    "headline" TEXT,
    "description" TEXT,
    "imageId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "spend" DECIMAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdVariant_adId_fkey" FOREIGN KEY ("adId") REFERENCES "InstagramAd" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdPerformance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "spend" DECIMAL NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "saveCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdPerformance_adId_fkey" FOREIGN KEY ("adId") REFERENCES "InstagramAd" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "displayName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "externalId" TEXT,
    "contactId" TEXT,
    "contactName" TEXT,
    "contactHandle" TEXT,
    "lastMessageAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "Conversation_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "externalId" TEXT,
    "direction" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "text" TEXT,
    "payload" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstagramMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "senderId" TEXT,
    "recipientId" TEXT,
    "username" TEXT,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "messageId" TEXT NOT NULL,
    "isFromUser" BOOLEAN NOT NULL DEFAULT true,
    "direction" TEXT NOT NULL DEFAULT 'inbound',
    "instagramAccountId" TEXT,
    "leadId" TEXT,
    "campaignId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstagramMessage_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InstagramMessage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InstagramMessage_instagramAccountId_fkey" FOREIGN KEY ("instagramAccountId") REFERENCES "InstagramAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WhatsappAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "phoneNumberId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "businessName" TEXT,
    "accessToken" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastSyncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WhatsappMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "senderId" TEXT,
    "recipientId" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "messageId" TEXT NOT NULL,
    "isFromUser" BOOLEAN NOT NULL DEFAULT true,
    "direction" TEXT NOT NULL DEFAULT 'INBOUND',
    "whatsappAccountId" TEXT,
    "leadId" TEXT,
    "campaignId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WhatsappMessage_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WhatsappMessage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WhatsappMessage_whatsappAccountId_fkey" FOREIGN KEY ("whatsappAccountId") REFERENCES "WhatsappAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIAssistant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "role" TEXT,
    "systemPrompt" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "title" TEXT,
    "mode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ai_conversation_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_conversation_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ai_conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ad_campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "objective" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "platform" TEXT,
    "dailyBudget" REAL,
    "totalBudget" REAL,
    "currency" TEXT DEFAULT 'AED',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "instagramCampaignId" TEXT,
    CONSTRAINT "ad_campaigns_instagramCampaignId_fkey" FOREIGN KEY ("instagramCampaignId") REFERENCES "InstagramCampaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ad_creatives" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "callToAction" TEXT,
    "placement" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ad_creatives_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ad_campaigns" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_auto_reply_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyword" TEXT,
    "response" TEXT,
    "useAI" BOOLEAN NOT NULL DEFAULT false,
    "assistantId" TEXT,
    "platform" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "timeRestrictionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "endTime" TEXT,
    "timezone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ai_auto_reply_rules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Lead_pipelineId_idx" ON "Lead"("pipelineId");

-- CreateIndex
CREATE INDEX "Lead_stageId_idx" ON "Lead"("stageId");

-- CreateIndex
CREATE INDEX "Lead_assignedTo_idx" ON "Lead"("assignedTo");

-- CreateIndex
CREATE INDEX "Lead_campaignId_idx" ON "Lead"("campaignId");

-- CreateIndex
CREATE INDEX "Lead_conversationId_idx" ON "Lead"("conversationId");

-- CreateIndex
CREATE INDEX "Stage_pipelineId_idx" ON "Stage"("pipelineId");

-- CreateIndex
CREATE INDEX "Activity_leadId_idx" ON "Activity"("leadId");

-- CreateIndex
CREATE INDEX "Activity_scheduledFor_idx" ON "Activity"("scheduledFor");

-- CreateIndex
CREATE INDEX "Activity_isCompleted_idx" ON "Activity"("isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "Call_zadarmaCallId_key" ON "Call"("zadarmaCallId");

-- CreateIndex
CREATE INDEX "Call_leadId_idx" ON "Call"("leadId");

-- CreateIndex
CREATE INDEX "Call_zadarmaCallId_idx" ON "Call"("zadarmaCallId");

-- CreateIndex
CREATE INDEX "Call_phoneNumber_idx" ON "Call"("phoneNumber");

-- CreateIndex
CREATE INDEX "Call_direction_idx" ON "Call"("direction");

-- CreateIndex
CREATE INDEX "Call_status_idx" ON "Call"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_externalId_key" ON "Campaign"("externalId");

-- CreateIndex
CREATE INDEX "Campaign_userId_idx" ON "Campaign"("userId");

-- CreateIndex
CREATE INDEX "AdSet_campaignId_idx" ON "AdSet"("campaignId");

-- CreateIndex
CREATE INDEX "Ad_adSetId_idx" ON "Ad"("adSetId");

-- CreateIndex
CREATE INDEX "Ad_creativeId_idx" ON "Ad"("creativeId");

-- CreateIndex
CREATE INDEX "Insight_date_idx" ON "Insight"("date");

-- CreateIndex
CREATE INDEX "Insight_campaignId_idx" ON "Insight"("campaignId");

-- CreateIndex
CREATE INDEX "Insight_adSetId_idx" ON "Insight"("adSetId");

-- CreateIndex
CREATE INDEX "Insight_adId_idx" ON "Insight"("adId");

-- CreateIndex
CREATE UNIQUE INDEX "InstagramAccount_instagramUserId_key" ON "InstagramAccount"("instagramUserId");

-- CreateIndex
CREATE INDEX "InstagramAccount_userId_idx" ON "InstagramAccount"("userId");

-- CreateIndex
CREATE INDEX "InstagramPost_accountId_idx" ON "InstagramPost"("accountId");

-- CreateIndex
CREATE INDEX "InstagramPost_status_idx" ON "InstagramPost"("status");

-- CreateIndex
CREATE INDEX "InstagramPost_scheduledFor_idx" ON "InstagramPost"("scheduledFor");

-- CreateIndex
CREATE INDEX "InstagramCampaign_accountId_idx" ON "InstagramCampaign"("accountId");

-- CreateIndex
CREATE INDEX "InstagramAd_accountId_idx" ON "InstagramAd"("accountId");

-- CreateIndex
CREATE INDEX "InstagramAd_campaignId_idx" ON "InstagramAd"("campaignId");

-- CreateIndex
CREATE INDEX "AdAsset_adId_idx" ON "AdAsset"("adId");

-- CreateIndex
CREATE INDEX "AdVariant_adId_idx" ON "AdVariant"("adId");

-- CreateIndex
CREATE INDEX "AdPerformance_adId_idx" ON "AdPerformance"("adId");

-- CreateIndex
CREATE INDEX "AdPerformance_date_idx" ON "AdPerformance"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_type_externalId_key" ON "Channel"("type", "externalId");

-- CreateIndex
CREATE INDEX "Conversation_channelId_idx" ON "Conversation"("channelId");

-- CreateIndex
CREATE INDEX "Conversation_contactId_idx" ON "Conversation"("contactId");

-- CreateIndex
CREATE INDEX "Conversation_contactHandle_idx" ON "Conversation"("contactHandle");

-- CreateIndex
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_externalId_idx" ON "Message"("externalId");

-- CreateIndex
CREATE INDEX "Message_direction_idx" ON "Message"("direction");

-- CreateIndex
CREATE INDEX "Message_source_idx" ON "Message"("source");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "InstagramMessage_messageId_key" ON "InstagramMessage"("messageId");

-- CreateIndex
CREATE INDEX "InstagramMessage_senderId_idx" ON "InstagramMessage"("senderId");

-- CreateIndex
CREATE INDEX "InstagramMessage_recipientId_idx" ON "InstagramMessage"("recipientId");

-- CreateIndex
CREATE INDEX "InstagramMessage_messageId_idx" ON "InstagramMessage"("messageId");

-- CreateIndex
CREATE INDEX "InstagramMessage_leadId_idx" ON "InstagramMessage"("leadId");

-- CreateIndex
CREATE INDEX "InstagramMessage_campaignId_idx" ON "InstagramMessage"("campaignId");

-- CreateIndex
CREATE INDEX "InstagramMessage_timestamp_idx" ON "InstagramMessage"("timestamp");

-- CreateIndex
CREATE INDEX "InstagramMessage_instagramAccountId_idx" ON "InstagramMessage"("instagramAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappAccount_phoneNumberId_key" ON "WhatsappAccount"("phoneNumberId");

-- CreateIndex
CREATE INDEX "WhatsappAccount_userId_idx" ON "WhatsappAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappMessage_messageId_key" ON "WhatsappMessage"("messageId");

-- CreateIndex
CREATE INDEX "WhatsappMessage_phoneNumber_idx" ON "WhatsappMessage"("phoneNumber");

-- CreateIndex
CREATE INDEX "WhatsappMessage_messageId_idx" ON "WhatsappMessage"("messageId");

-- CreateIndex
CREATE INDEX "WhatsappMessage_leadId_idx" ON "WhatsappMessage"("leadId");

-- CreateIndex
CREATE INDEX "WhatsappMessage_campaignId_idx" ON "WhatsappMessage"("campaignId");

-- CreateIndex
CREATE INDEX "WhatsappMessage_timestamp_idx" ON "WhatsappMessage"("timestamp");

-- CreateIndex
CREATE INDEX "WhatsappMessage_direction_idx" ON "WhatsappMessage"("direction");

-- CreateIndex
CREATE INDEX "WhatsappMessage_whatsappAccountId_idx" ON "WhatsappMessage"("whatsappAccountId");

-- CreateIndex
CREATE INDEX "AIAssistant_role_idx" ON "AIAssistant"("role");

-- CreateIndex
CREATE INDEX "AIAssistant_isActive_idx" ON "AIAssistant"("isActive");

-- CreateIndex
CREATE INDEX "AIAssistant_userId_idx" ON "AIAssistant"("userId");

-- CreateIndex
CREATE INDEX "ai_conversations_userId_idx" ON "ai_conversations"("userId");

-- CreateIndex
CREATE INDEX "ai_conversations_mode_idx" ON "ai_conversations"("mode");

-- CreateIndex
CREATE INDEX "ai_conversation_messages_conversationId_idx" ON "ai_conversation_messages"("conversationId");

-- CreateIndex
CREATE INDEX "ad_campaigns_userId_idx" ON "ad_campaigns"("userId");

-- CreateIndex
CREATE INDEX "ai_auto_reply_rules_userId_idx" ON "ai_auto_reply_rules"("userId");

-- CreateIndex
CREATE INDEX "ai_auto_reply_rules_platform_idx" ON "ai_auto_reply_rules"("platform");

-- CreateIndex
CREATE INDEX "ai_auto_reply_rules_enabled_idx" ON "ai_auto_reply_rules"("enabled");

-- CreateIndex
CREATE INDEX "ai_auto_reply_rules_isActive_idx" ON "ai_auto_reply_rules"("isActive");
