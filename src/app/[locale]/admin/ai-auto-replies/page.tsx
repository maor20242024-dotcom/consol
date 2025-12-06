"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Save, 
  Trash2, 
  Edit, 
  Bot,
  Clock,
  MessageSquare,
  Zap
} from 'lucide-react';

interface AutoReplyRule {
  id: string;
  name: string;
  keyword: string;
  response: string;
  useAI: boolean;
  isActive: boolean;
  timeRestriction: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  platform: 'all' | 'instagram' | 'whatsapp';
  createdAt: string;
  updatedAt: string;
}

export default function AIAutoRepliesPage() {
  const [rules, setRules] = useState<AutoReplyRule[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoReplyRule | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    keyword: string;
    response: string;
    useAI: boolean;
    platform: 'all' | 'instagram' | 'whatsapp';
    timeRestriction: {
      enabled: boolean;
      startTime: string;
      endTime: string;
      timezone: string;
    };
  }>({
    name: '',
    keyword: '',
    response: '',
    useAI: false,
    platform: 'all',
    timeRestriction: {
      enabled: false,
      startTime: '09:00',
      endTime: '18:00',
      timezone: 'UTC'
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load rules from API
  const loadRules = async () => {
    try {
      const response = await fetch('/api/ai-auto-replies');
      const data = await response.json();
      
      if (data.success) {
        setRules(data.rules || []);
      }
    } catch (error) {
      console.error('Failed to load rules:', error);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingRule 
        ? `/api/ai-auto-replies/${editingRule.id}`
        : '/api/ai-auto-replies';
      
      const method = editingRule ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadRules();
        resetForm();
      } else {
        console.error('Failed to save rule');
      }
    } catch (error) {
      console.error('Error saving rule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const response = await fetch(`/api/ai-auto-replies/${ruleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadRules();
      } else {
        console.error('Failed to delete rule');
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/ai-auto-replies/${ruleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        await loadRules();
      } else {
        console.error('Failed to toggle rule');
      }
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      keyword: '',
      response: '',
      useAI: false,
      platform: 'all',
      timeRestriction: {
        enabled: false,
        startTime: '09:00',
        endTime: '18:00',
        timezone: 'UTC'
      }
    });
    setEditingRule(null);
    setIsCreating(false);
  };

  const startEdit = (rule: AutoReplyRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      keyword: rule.keyword,
      response: rule.response,
      useAI: rule.useAI,
      platform: rule.platform,
      timeRestriction: rule.timeRestriction
    });
    setIsCreating(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8" />
            AI Auto-Reply Rules
          </h1>
          <p className="text-muted-foreground">
            Configure automatic responses powered by AI
          </p>
        </div>
        
        <Button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Rule
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingRule ? 'Edit Rule' : 'Create New Rule'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Rule Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Greeting Rule"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select 
                    value={formData.platform} 
                    onValueChange={(value: 'all' | 'instagram' | 'whatsapp') => 
                      setFormData(prev => ({ ...prev, platform: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="instagram">Instagram Only</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="keyword">Keyword Trigger</Label>
                <Input
                  id="keyword"
                  value={formData.keyword}
                  onChange={(e) => setFormData(prev => ({ ...prev, keyword: e.target.value }))}
                  placeholder="e.g., hello, price, booking"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Comma-separated keywords that will trigger this rule
                </p>
              </div>

              <div>
                <Label htmlFor="response">Response</Label>
                <Textarea
                  id="response"
                  value={formData.response}
                  onChange={(e) => setFormData(prev => ({ ...prev, response: e.target.value }))}
                  placeholder="Enter your automatic response..."
                  rows={4}
                  disabled={formData.useAI}
                />
                {formData.useAI && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Response will be generated by AI based on the keyword
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="useAI"
                  checked={formData.useAI}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useAI: checked }))}
                />
                <Label htmlFor="useAI" className="flex items-center gap-2">
                  Use AI to generate response
                  <Zap className="h-4 w-4" />
                </Label>
              </div>

              {/* Time Restriction */}
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="timeRestriction"
                    checked={formData.timeRestriction.enabled}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        timeRestriction: { ...prev.timeRestriction, enabled: checked }
                      }))
                    }
                  />
                  <Label htmlFor="timeRestriction" className="flex items-center gap-2">
                    Enable time restriction
                    <Clock className="h-4 w-4" />
                  </Label>
                </div>

                {formData.timeRestriction.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.timeRestriction.startTime}
                        onChange={(e) => 
                          setFormData(prev => ({
                            ...prev,
                            timeRestriction: { ...prev.timeRestriction, startTime: e.target.value }
                          }))
                        }
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.timeRestriction.endTime}
                        onChange={(e) => 
                          setFormData(prev => ({
                            ...prev,
                            timeRestriction: { ...prev.timeRestriction, endTime: e.target.value }
                          }))
                        }
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select 
                        value={formData.timeRestriction.timezone} 
                        onValueChange={(value) => 
                          setFormData(prev => ({
                            ...prev,
                            timeRestriction: { ...prev.timeRestriction, timezone: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">New York</SelectItem>
                          <SelectItem value="Europe/London">London</SelectItem>
                          <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : (editingRule ? 'Update' : 'Create')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Rules List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {rule.platform}
                        </Badge>
                        {rule.useAI && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            AI
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Keywords: </span>
                          <span className="text-sm text-muted-foreground">{rule.keyword}</span>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium">Response: </span>
                          <span className="text-sm text-muted-foreground">
                            {rule.useAI ? 'AI Generated' : rule.response}
                          </span>
                        </div>
                        
                        {rule.timeRestriction.enabled && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {rule.timeRestriction.startTime} - {rule.timeRestriction.endTime} ({rule.timeRestriction.timezone})
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleRule(rule.id, !rule.isActive)}
                      >
                        {rule.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(rule)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {rules.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No rules yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first auto-reply rule to get started
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
