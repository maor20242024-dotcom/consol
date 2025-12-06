/**
 * Unified Inbox Component
 * Manages Instagram and WhatsApp conversations in one interface
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  MessageCircle,
  Send,
  Search,
  Instagram,
  MessageSquare,
  User,
  Clock,
  UserPlus,
  RefreshCw,
  Phone,
  Mail,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  priority: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
}

interface Conversation {
  id: string;
  contactName: string;
  contactHandle: string;
  channelType: 'instagram' | 'whatsapp';
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED';
  lead?: Lead | null;
}

interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  text: string;
  source: string;
  createdAt: string;
  aiGenerated?: boolean;
  leadId?: string | null;
  campaignId?: string | null;
  lead?: Lead | null;
  campaign?: Campaign | null;
  originalMessageId?: string; // For converting specific message
  otherPartyId?: string; // ID of the contact this message is with
}

export default function UnifiedInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'instagram' | 'whatsapp'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load real data from API
  const loadMessages = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const response = await fetch('/api/inbox');
      const data = await response.json();

      if (data.success) {
        // Convert database messages to Message format
        const formattedMessages: Message[] = data.messages.map((msg: any) => {
          // Determine other party ID
          // If inbound, it's the sender. If outbound, it's the recipient.
          // API returns flat objects with senderId/recipientId or ig_sender/ig_recipient depending on DB schema history.
          // Based on route.ts, it returns senderId/recipientId for both.
          const otherPartyId = msg.direction === 'incoming'
            ? (msg.ig_sender || msg.senderId)
            : (msg.ig_recipient || msg.recipientId);

          return {
            id: msg.id,
            direction: msg.direction === 'incoming' ? 'inbound' : 'outbound',
            text: msg.text || '',
            source: msg.whatsappAccountId ? 'whatsapp' : 'instagram',
            createdAt: new Date(msg.created_at).toISOString(),
            aiGenerated: false,
            leadId: msg.leadId,
            campaignId: msg.campaignId,
            lead: msg.lead,
            campaign: msg.campaign,
            originalMessageId: msg.id, // Keep original DB ID
            otherPartyId: otherPartyId
          };
        });

        setMessages(formattedMessages);

        // Create conversations from messages
        // Group by sender ID or phone number
        const uniqueContacts = new Map<string, any>();

        data.messages.forEach((msg: any) => {
          const contactId = msg.direction === 'incoming'
            ? (msg.ig_sender || msg.senderId)
            : (msg.ig_recipient || msg.recipientId);

          if (!uniqueContacts.has(contactId)) {
            uniqueContacts.set(contactId, []);
          }
          uniqueContacts.get(contactId).push(msg);
        });

        const conversationList: Conversation[] = Array.from(uniqueContacts.entries()).map(([contactId, msgs], index) => {
          const lastMessage = msgs[0]; // Messages are already sorted desc
          const channelType = lastMessage.whatsappAccountId ? 'whatsapp' : 'instagram';
          // Find lead info from any message in the conversation
          const leadInfo = msgs.find((m: any) => m.lead)?.lead || null;

          return {
            id: `conv_${contactId}`,
            contactName: leadInfo?.name || `User ${contactId.slice(-4)}`,
            contactHandle: contactId,
            channelType,
            lastMessage: lastMessage?.text || 'No message',
            lastMessageAt: lastMessage?.created_at || new Date().toISOString(),
            unreadCount: msgs.filter((msg: any) => msg.direction === 'incoming').length, // Simplified unread logic
            status: 'ACTIVE',
            lead: leadInfo
          };
        });

        setConversations(conversationList);

        // Update selected conversation if it exists
        if (selectedConversation) {
          const updatedConv = conversationList.find(c => c.contactHandle === selectedConversation.contactHandle);
          if (updatedConv) {
            setSelectedConversation(updatedConv);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      if (!silent) {
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive',
        });
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();

    // Refresh messages every 15 seconds
    const interval = setInterval(() => loadMessages(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/inbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: selectedConversation.channelType,
          recipient: selectedConversation.contactHandle,
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        // Add message to local state
        const newMsg: Message = {
          id: `msg_${Date.now()}`,
          direction: 'outbound',
          text: newMessage.trim(),
          source: selectedConversation.channelType,
          createdAt: new Date().toISOString(),
          aiGenerated: false
        };

        setMessages(prev => [newMsg, ...prev]); // Prepend since we sort desc
        setNewMessage('');
        loadMessages(true); // Refresh to get real ID
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const convertToLead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/instagram/messages/${messageId}/convert-to-lead`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Converted to lead successfully',
        });
        loadMessages(true); // Refresh to update UI
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Convert lead error:', error);
      toast({
        title: 'Error',
        description: 'Failed to convert to lead',
        variant: 'destructive',
      });
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.contactHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filter === 'all' || conv.channelType === filter;

    return matchesSearch && matchesFilter;
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const currentMessages = selectedConversation
    ? messages.filter(m => {
      // Simple filtering based on source/channel. 
      // In real app, ensure strict recipient/sender matching
      return (m.source === selectedConversation.channelType);
      // Note: The API returns mixed messages, we might need better filtering here 
      // but 'messages' state is global. Ideally filter by contactHandle.
      // Re-implementing filter based on logic in loadMessages:
    }).filter(m => {
      // This is a simplified check. Assuming 'messages' state contains ALL messages
      // We should filter where sender OR recipient matches contactHandle
      // But the API response structure is flat. 
      // Let's trust the 'conversations' logic for now or refine:
      // Actually, let's just filter the messages that belong to this conversation
      // based on the same logic used to group them.
      /* 
         Since we don't store contactHandle in Message interface directly (only source),
         we'll rely on the API returning relevant messages. 
         However, the API call loads ALL recent messages.
         So we MUST filter by contactHandle here to show correct chat history.
      */
      // Adding a 'contactId' to Message would be better, but for now:
      // For inbound: sender must be contactHandle
      // For outbound: recipient was contactHandle (but we don't have recipient in Message interface easily)
      // Let's assume the API returns 'senderId'/'recipientId' in the raw object, 
      // but we stripped it. Let's fix that next time if needed. 
      // For now, let's just filter by what we can or rely on the Fact that 
      // we might need to fetch messages PER conversation or store more data.
      // Given the complexity of this edit, I'll rely on a simpler client-side filter
      // assuming we reload 'messages' correctly.
      // Update: I'll trust the user to select conversation and maybe we should 
      // fetch messages FOR that conversation specifically? No, API returns "inbox" (all).
      // I'll add logic to filter by conversation.
      return true; // Placeholder, see logic below in render
    }).filter(m => {
      // Real filter
      // We need access to raw sender/recipient to filter correctly.
      // But we mapped it away.
      // Let's assume for this specific turn we filter by nothing and rely
      // on the fact that for a specific contact we want their messages.
      // Wait, showing ALL messages for ANY selected conversation is wrong.
      // I need to filter.
      return true;
    })
    : [];

  // Refined Message Filtering Logic
  const getConversationMessages = (conv: Conversation) => {
    // We need to keep the raw data or meaningful IDs in Message
    // Since we didn't, let's filter by matching content (risky) or
    // better: update Message interface to include contactId?
    // I'll rely on the `messages` state which comes from `data.messages`.
    // I'll re-map in render or just filter if I had the data.
    // Re-reading `loadMessages`: I DO have access to all data there.
    // But `messages` state is what I render.
    // Let's assume for now we only show the messages that belong to the selected conversation.
    // I will filter `messages` by comparing `leadId` or inferred header?
    // Actually, let's filter by checking if the message belongs to the contact handle.
    // I need to add `contactHandle` to the Message interface.
    return messages.filter(msg => {
      // This requires the Message object to store the other party's ID.
      // Since I can't easily change the whole logic perfectly in one go without
      // seeing the raw data again...
      // I will assume for now that I can match by `leadId` if it exists, 
      // or fallback to showing all (which is bad but 'safe' for a compilation fix).
      // BETTER: Add `otherPartyId` to Message interface in `loadMessages`.
      // I will do that in the `loadMessages` map above.
      return (msg as any).otherPartyId === conv.contactHandle;
    });
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Conversations List */}
      <div className="w-80 md:w-96 border rounded-lg flex flex-col">
        <div className="p-4 border-b space-y-4">
          <h2 className="text-lg font-semibold">Inbox</h2>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-1">
              <Button variant={filter === 'all' ? 'default' : 'outline'} size="icon" onClick={() => setFilter('all')}>
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button variant={filter === 'instagram' ? 'default' : 'outline'} size="icon" onClick={() => setFilter('instagram')}>
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant={filter === 'whatsapp' ? 'default' : 'outline'} size="icon" onClick={() => setFilter('whatsapp')}>
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors border hover:bg-accent/50 ${selectedConversation?.id === conversation.id ? 'bg-accent border-primary/50' : 'border-transparent'
                  }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold truncate max-w-[140px]">{conversation.contactName}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTime(conversation.lastMessageAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  {conversation.channelType === 'instagram' ? <Instagram className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                  <span className="truncate">@{conversation.contactHandle}</span>
                </div>
                {conversation.lead && (
                  <Badge variant="outline" className="text-[10px] h-5 mb-1 bg-green-500/10 text-green-600 border-green-200">
                    LEAD
                  </Badge>
                )}
                <p className="text-sm text-foreground/80 line-clamp-2">{conversation.lastMessage}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className="flex-1 border rounded-lg flex flex-col overflow-hidden">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b flex justify-between items-center bg-card/50 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedConversation.channelType === 'instagram' ? 'bg-pink-100 text-pink-600' : 'bg-green-100 text-green-600'
                  }`}>
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedConversation.contactName}</h3>
                  <p className="text-xs text-muted-foreground">@{selectedConversation.contactHandle}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => loadMessages(false)}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                {selectedConversation.lead ? (
                  <div className="flex flex-col items-end mr-2">
                    <Badge className="bg-green-500 hover:bg-green-600">Lead: {selectedConversation.lead.status}</Badge>
                  </div>
                ) : (
                  // We need a specific message ID to convert, usually the last one from them
                  <Button
                    size="sm"
                    className="gap-2"
                    disabled={!messages.find(m => (m as any).otherPartyId === selectedConversation.contactHandle && m.direction === 'inbound')}
                    onClick={() => {
                      const lastInbound = messages.find(m => (m as any).otherPartyId === selectedConversation.contactHandle && m.direction === 'inbound');
                      if (lastInbound?.originalMessageId) convertToLead(lastInbound.originalMessageId);
                    }}
                  >
                    <UserPlus className="h-4 w-4" />
                    Convert to Lead
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.filter(m => m.otherPartyId === selectedConversation.contactHandle)
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // Sort ASC for chat
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${message.direction === 'outbound'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-muted rounded-tl-none'
                          }`}
                      >
                        {message.campaign && (
                          <div className="mb-2 pb-2 border-b border-primary-foreground/20 text-xs flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Campaign: {message.campaign.name}
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
                          {message.aiGenerated && <Badge variant="secondary" className="text-[10px] h-4 px-1">AI</Badge>}
                          <span className="text-[10px]">{formatTime(message.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-card/50 backdrop-blur">
              <div className="flex gap-2 max-w-3xl mx-auto">
                <Input
                  placeholder={`Message @${selectedConversation.contactHandle}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
            <div className="p-6 rounded-full bg-accent/50">
              <MessageCircle className="h-12 w-12 opacity-50" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-lg text-foreground">Select a conversation</h3>
              <p>Choose a contact to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
