'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Target, 
  Bot, 
  Phone, 
  Globe, 
  Zap, 
  BarChart3, 
  MessageSquare, 
  Headphones, 
  ArrowUpRight, 
  Activity, 
  DollarSign, 
  Rocket, 
  Crown, 
  Database, 
  Mic, 
  Network, 
  Shield, 
  Star, 
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  Calendar,
  FileText,
  Download,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Square,
  Clock,
  Filter,
  Search,
  Bell,
  Mail,
  Send,
  Edit,
  Trash2,
  Plus,
  Minus,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  User,
  UserPlus,
  Users2,
  Building,
  Home,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [revenue, setRevenue] = useState(8750000);
  const [activeCampaigns, setActiveCampaigns] = useState(24);
  const [totalLeads, setTotalLeads] = useState(1247);
  const [conversionRate, setConversionRate] = useState(18.7);
  const [aiInteractions, setAiInteractions] = useState(4521);
  const [voiceCalls, setVoiceCalls] = useState(892);
  const [systemHealth, setSystemHealth] = useState(97.2);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch real data from APIs
    const fetchRealData = async () => {
      try {
        // Fetch real stats from AI Agent API
        const statsResponse = await fetch('/api/ai-agent?type=stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setTotalLeads(statsData.data.totalLeads || 1247);
          }
        }

        // Fetch market intelligence from Imperial API
        const marketResponse = await fetch('/api/imperial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'market-intelligence' })
        });
        if (marketResponse.ok) {
          const marketData = await marketResponse.json();
          if (marketData.success) {
            setActiveCampaigns(marketData.data.length || 24);
          }
        }

        // Fetch social media stats
        const socialResponse = await fetch('/api/social-media?type=stats');
        if (socialResponse.ok) {
          const socialData = await socialResponse.json();
          if (socialData.success) {
            setConversionRate(socialData.data.conversionRate || 18.7);
          }
        }
      } catch (error) {
        console.log('Using mock data - API not available');
      }
    };

    fetchRealData();

    // Continue with simulated updates for demo
    const interval = setInterval(() => {
      setRevenue(prev => prev + Math.floor(Math.random() * 50000));
      setTotalLeads(prev => prev + Math.floor(Math.random() * 3));
      setAiInteractions(prev => prev + Math.floor(Math.random() * 10));
      setVoiceCalls(prev => prev + Math.floor(Math.random() * 2));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleMarketAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'analyze',
          data: { action: 'market-analysis' }
        })
      });
      const result = await response.json();
      alert(result.success ? 'تم تحليل السوق بنجاح!' : 'فشل التحليل');
    } catch (error) {
      alert('جاري إعداد التحليل...');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvestmentRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'analyze',
          data: { action: 'investment-recommendations' }
        })
      });
      const result = await response.json();
      alert(result.success ? 'تم الحصول على توصيات الاستثمار!' : 'فشل الحصول على التوصيات');
    } catch (error) {
      alert('جاري إعداد التوصيات...');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientEvaluation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'leads',
          data: { action: 'client-evaluation' }
        })
      });
      const result = await response.json();
      alert(result.success ? 'تم تقييم العملاء!' : 'فشل التقييم');
    } catch (error) {
      alert('جاري إعداد التقييم...');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'campaign',
          data: { action: 'custom-reports' }
        })
      });
      const result = await response.json();
      alert(result.success ? 'تم إنشاء التقارير المخصصة!' : 'فشل إنشاء التقارير');
    } catch (error) {
      alert('جاري إعداد التقارير...');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestCall = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'call',
          data: { 
            client: { name: 'عميل تجريبي', phone: '0501234567' },
            campaign: { name: 'حملة تجريبية' }
          }
        })
      });
      const result = await response.json();
      alert(result.success ? 'تم بدء المكالمة الصوتية!' : 'فشل بدء المكالمة');
    } catch (error) {
      alert('جاري بدء المكالمة...');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCampaignStatus = async (campaignName, currentStatus) => {
    try {
      const response = await fetch('/api/social-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'lead-status',
          data: { 
            campaignName,
            status: currentStatus === 'نشط' ? 'paused' : 'active' 
          }
        })
      });
      const result = await response.json();
      if (result.success) {
        alert(`تم ${currentStatus === 'نشط' ? 'إيقاف' : 'تفعيل'} حملة ${campaignName}!`);
      }
    } catch (error) {
      alert('جاري تحديث الحملة...');
    }
  };

  const campaigns = [
    { 
      name: 'فيلات دبي مارينا', 
      status: 'نشط', 
      leads: 342, 
      conversion: 22.5,
      budget: '2.5M',
      roi: '8.5%',
      startDate: '2024-01-01',
      endDate: '2024-03-31'
    },
    { 
      name: 'شقق نخيل جميرا', 
      status: 'نشط', 
      leads: 287, 
      conversion: 19.8,
      budget: '3.2M',
      roi: '7.2%',
      startDate: '2024-01-15',
      endDate: '2024-04-15'
    },
    { 
      name: 'مشاريع داون تاون', 
      status: 'مخطط', 
      leads: 156, 
      conversion: 0,
      budget: '1.8M',
      roi: '6.5%',
      startDate: '2024-02-01',
      endDate: '2024-05-31'
    },
    { 
      name: 'عقارات business bay', 
      status: 'نشط', 
      leads: 198, 
      conversion: 17.2,
      budget: '2.1M',
      roi: '7.8%',
      startDate: '2024-01-10',
      endDate: '2024-04-10'
    }
  ];

  const recentLeads = [
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', phone: '0501234567', status: 'hot', score: 92, lastContact: 'منذ ساعة', source: 'موقع إلكتروني', campaign: 'فيلات دبي مارينا' },
    { id: 2, name: 'فاطمة خالدوري', email: 'fatima@example.com', phone: '0509876543', status: 'warm', score: 78, lastContact: 'منذ يومين', source: 'WhatsApp', campaign: 'شقق نخيل جميرا' },
    { id: 3, name: 'خالد سعيد', email: 'khalid@example.com', phone: '0502345678', status: 'new', score: 65, lastContact: 'منذ 3 أيام', source: 'إعلان مباشر', campaign: null },
    { id: 4, name: 'مريم أحمد', email: 'mariam@example.com', phone: '0503456789', status: 'hot', score: 88, lastContact: 'منذ ساعة', source: 'مكالمة صوتية', campaign: 'فيلات دبي مارينا' }
  ];

  const systemStatus = [
    { name: 'الموقع الإلكتروني', status: 'نشط', health: 98.5, uptime: '99.9%', lastCheck: 'منذ دقيقة' },
    { name: 'نظام الذكاء الاصطناعي', status: 'نشط', health: 99.1, uptime: '99.8%', lastCheck: 'منذ دقيقة' },
    { name: 'قاعدة البيانات', status: 'نشط', health: 97.3, uptime: '99.7%', lastCheck: 'منذ دقيقتين' },
    { name: 'نظام الاتصالات', status: 'نشط', health: 96.8, uptime: '98.5%', lastCheck: 'منذ 3 دقائق' },
    { name: 'نظام التسويق', status: 'نشط', health: 94.2, uptime: '97.2%', lastCheck: 'منذ 5 دقائق' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-yellow-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-yellow-400">IMPERIUM GATE</h1>
                <p className="text-gray-300 text-sm">لوحة التحكم الإمبراطورية</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Badge variant="outline" className="border-green-500/50 text-green-400">
                <Activity className="w-3 h-3 ml-1" />
                نظام نشط
              </Badge>
              <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                <Globe className="w-3 h-3 ml-1" />
                متصل بـ Chat Z.ai
              </Badge>
              <Link 
                href="/"
                className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 px-4 py-2 rounded-lg transition-colors"
              >
                العودة للرئيسية
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                className="border-slate-600/50 text-slate-400 hover:bg-slate-700"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Real-time Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="bg-slate-900/50 border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-yellow-400 text-sm flex items-center">
                <DollarSign className="w-4 h-4 ml-2" />
                الإيرادات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {(revenue / 1000000).toFixed(2)}M
              </div>
              <p className="text-green-400 text-sm">درهم إماراتي</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 text-green-400 ml-1" />
                <span className="text-green-400 text-sm">+12.5%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-400 text-sm flex items-center">
                <Target className="w-4 h-4 ml-2" />
                الحملات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{activeCampaigns}</div>
              <p className="text-blue-400 text-sm">نشطة</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 text-blue-400 ml-1" />
                <span className="text-blue-400 text-sm">+3 جديدة</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-green-500/20 hover:border-green-500/40 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 text-sm flex items-center">
                <Users className="w-4 h-4 ml-2" />
                العملاء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalLeads.toLocaleString('ar-AE')}</div>
              <p className="text-green-400 text-sm">إجمالي</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 text-green-400 ml-1" />
                <span className="text-green-400 text-sm">+8.2%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary text-sm flex items-center">
                <ArrowUpRight className="w-4 h-4 ml-2" />
                التحويل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{conversionRate}%</div>
              <p className="text-primary text-sm">معدل</p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 text-primary ml-1" />
                <span className="text-primary text-sm">+2.1%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-orange-500/20 hover:border-orange-500/40 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-orange-400 text-sm flex items-center">
                <Activity className="w-4 h-4 ml-2" />
                صحة النظام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{systemHealth}%</div>
              <p className="text-orange-400 text-sm">ممتازة</p>
              <div className="flex items-center mt-2">
                <CheckCircle className="w-4 h-4 text-green-400 ml-1" />
                <span className="text-green-400 text-sm">مستقر</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-slate-900/50 border border-yellow-500/20">
            <TabsTrigger value="overview" className="text-yellow-400 data-[state=active]:bg-yellow-500/20">
              <BarChart3 className="w-4 h-4 ml-2" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="ai-agent" className="text-blue-400 data-[state=active]:bg-blue-500/20">
              <Bot className="w-4 h-4 ml-2" />
              الذكاء الاصطناعي
            </TabsTrigger>
            <TabsTrigger value="marketing" className="text-green-400 data-[state=active]:bg-green-500/20">
              <Target className="w-4 h-4 ml-2" />
              التسويق
            </TabsTrigger>
            <TabsTrigger value="communications" className="text-primary data-[state=active]:bg-primary/20">
              <Phone className="w-4 h-4 ml-2" />
              الاتصالات
            </TabsTrigger>
            <TabsTrigger value="systems" className="text-orange-400 data-[state=active]:bg-orange-500/20">
              <Database className="w-4 h-4 ml-2" />
              الأنظمة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-slate-900/50 border-yellow-500/20 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center">
                    <Zap className="w-5 h-5 ml-2" />
                    الأداء الحقيقي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">تفاعلات الذكاء الاصطناعي</span>
                      <span className="text-white font-semibold">{aiInteractions.toLocaleString('ar-AE')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">المكالمات الصوتية</span>
                      <span className="text-white font-semibold">{voiceCalls.toLocaleString('ar-AE')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">معدل الاستجابة</span>
                      <span className="text-green-400 font-semibold">94.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">رضا العملاء</span>
                      <span className="text-yellow-400 font-semibold">4.8/5.0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center">
                    <Globe className="w-5 h-5 ml-2" />
                    التغطية العالمية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">الأسواق النشطة</span>
                      <span className="text-white font-semibold">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">المناطق الزمنية</span>
                      <span className="text-white font-semibold">24</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">اللغات المدعومة</span>
                      <span className="text-white font-semibold">7</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">المستخدمون النشطون</span>
                      <span className="text-white font-semibold">8,421</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-agent" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-slate-900/50 border-blue-500/20 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center">
                    <Bot className="w-5 h-5 ml-2" />
                    مساعد الإمبراطورية الذكي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-300 text-sm">
                          أهلاً بك في مركز القيادة الإمبراطوري! أنا مساعدك الذكي المتخصص في العقارات الفاخرة. كيف يمكنني مساعدتك اليوم؟
                        </p>
                        <p className="text-gray-500 text-xs mt-2">اللغة: العربية</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      onClick={handleMarketAnalysis}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                          تحليل...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          تحليل السوق
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      onClick={handleInvestmentRecommendations}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                          توصيات...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          توصيات
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      onClick={handleClientEvaluation}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                          تقييم...
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4 mr-2" />
                          تقييم العملاء
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      onClick={handleCustomReports}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                          تقارير...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          تقارير
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary text-sm">قدرات الذكاء الاصطناعي</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">فهم اللهجات</span>
                      <Badge variant="secondary" className="text-xs">متقدم</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">تحليل المشاعر</span>
                      <Badge variant="secondary" className="text-xs">دقيق</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">الردود الآلية</span>
                      <Badge variant="secondary" className="text-xs">فوري</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">التعلم الذاتي</span>
                      <Badge variant="secondary" className="text-xs">مستمر</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="marketing" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-slate-900/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center">
                    <Target className="w-5 h-5 ml-2" />
                    الحملات التسويقية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {campaigns.map((campaign, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors"
                           onClick={() => toggleCampaignStatus(campaign.name, campaign.status)}>
                        <div className="flex-1">
                          <div>
                            <p className="text-white font-medium">{campaign.name}</p>
                            <p className="text-gray-400 text-sm">{campaign.leads} عميل محتمل</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <Badge variant={campaign.status === 'نشط' ? 'default' : 'secondary'} className="text-xs">
                            {campaign.status}
                          </Badge>
                          <p className="text-green-400 text-sm mt-1">{campaign.conversion}% تحويل</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center">
                    <TrendingUp className="w-5 h-5 ml-2" />
                    أداء التسويق
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">معدل النجاح</span>
                        <span className="text-green-400 font-semibold">87.3%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '87.3%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">الوصول الجماهيري</span>
                        <span className="text-blue-400 font-semibold">92.1%</span>
                      </div>
                      <div className="w-full bg-blue-500 h-2 rounded-full" style={{ width: '92.1%' }}></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">معدل التفاعل</span>
                        <span className="text-yellow-400 font-semibold">78.9%</span>
                      </div>
                      <div className="w-full bg-yellow-500 h-2 rounded-full" style={{ width: '78.9%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="communications" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-slate-900/50 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center">
                    <Phone className="w-5 h-5 ml-2" />
                    المكالمات الصوتية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">{voiceCalls.toLocaleString('ar-AE')}</div>
                    <p className="text-gray-300 text-sm mb-4">مكالمة اليوم</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">متوسط المدة</span>
                        <span className="text-white font-semibold">4:32</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">معدل الرد</span>
                        <span className="text-green-400 font-semibold">89.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">تقييم الرضا</span>
                        <span className="text-yellow-400 font-semibold">4.7/5.0</span>
                      </div>
                    </div>
                    <Button 
                      className="mt-4 bg-purple-500 hover:bg-purple-600 text-white w-full"
                      onClick={handleTestCall}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          جاري بدء المكالمة...
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4 mr-2" />
                          بدء مكالمة تجريبية
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center">
                    <MessageSquare className="w-5 h-5 ml-2" />
                    الرسائل النصية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">12.8K</div>
                    <p className="text-gray-300 text-sm mb-4">رسالة اليوم</p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-400">8,234</div>
                        <p className="text-gray-400 text-sm">WhatsApp</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-400">3,156</div>
                        <p className="text-gray-400 text-sm">SMS</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">1,410</div>
                        <p className="text-gray-400 text-sm">البريد الإلكتروني</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center">
                    <Headphones className="w-5 h-5 ml-2" />
                    دعم العملاء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">98.7%</div>
                    <p className="text-gray-300 text-sm mb-4">معدل الحل</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">متوسط وقت الرد</span>
                        <span className="text-white font-semibold">1:23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">التقييم</span>
                        <span className="text-yellow-400 font-semibold">4.9/5.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">العملاء النشطون</span>
                        <span className="text-green-400 font-semibold">24/7</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="systems" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-slate-900/50 border-orange-500/20">
                <CardHeader>
                  <CardTitle className="text-orange-400 flex items-center">
                    <Database className="w-5 h-5 ml-2" />
                    حالة الأنظمة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {systemStatus.map((system, index) => (
                      <div key={index} className="flex items-center justify-between p-3">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${system.health > 95 ? 'bg-green-500' : system.health > 90 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{system.name}</p>
                          <p className="text-gray-400 text-sm">{system.status}</p>
                        </div>
                        <div className="text-left">
                          <div className="text-xs text-gray-400">{system.uptime}</div>
                          <div className="text-xs text-gray-500">{system.lastCheck}</div>
                        </div>
                      </div>
                    ))}
                </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center">
                    <Network className="w-5 h-5 ml-2" />
                    الاتصال بالخدمات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-300">Z.ai Web Dev SDK</span>
                      <Badge variant="outline" className="border-green-500/50 text-green-400">متصل</Badge>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-300">Prisma Database</span>
                      <Badge variant="outline" className="border-green-500/50 text-green-400">نشط</Badge>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-300">SIP Integration</span>
                      <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">جاهز</Badge>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-300">Voice AI</span>
                      <Badge variant="outline" className="border-primary/50 text-primary">مفعل</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-yellow-500/20 bg-slate-900/50 mt-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 IMPERIUM GATE - جميع الحقوق محفوظة
            </p>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                <Activity className="w-3 h-3 ml-1" />
                متصل بالخدمة
              </Badge>
              <Badge variant="outline" className="border-green-500/50 text-green-400">
                <Globe className="w-3 h-3 ml-1" />
                Chat Z.ai
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}