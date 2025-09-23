import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRealtimeBookings } from '@/hooks/useRealtimeBookings';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO, getPageSEOConfig } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ChatContent } from '@/components/chat/ChatContent';
import { QuoteRequestsManager } from '@/components/admin/QuoteRequestsManager';
import { BannerManagement } from '@/components/admin/BannerManagement';
import { 
  Smartphone, 
  LogOut, 
  User, 
  CalendarDays, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Wrench, 
  CheckCircle,
  AlertCircle,
  Settings,
  BarChart3,
  Activity,
  Package,
  PhoneCall,
  Star,
  Target,
  MessageSquare,
  Bell,
  ShoppingBag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  device_type: string;
  device_model: string;
  issue_description: string;
  preferred_date: string;
  preferred_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  estimated_cost?: number;
  actual_cost?: number;
  quoted_price?: number;
  notes?: string;
  created_at: string;
  part_id?: string;
  selected_quality_type?: string;
  device_parts?: {
    name: string;
    category: string;
  } | null;
}

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  inProgressBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRepairValue: number;
  completionRate: number;
  popularDevices: { device: string; count: number }[];
  popularRepairs: { repair: string; count: number }[];
  recentActivity: { type: string; message: string; time: string; status?: string }[];
  monthlyTrend: { month: string; bookings: number; revenue: number }[];
}

const Dashboard = () => {
  const { user, signOut, userRole, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { 
    bookings, 
    allBookings, 
    loading: loadingBookings, 
    updateBookingStatus 
  } = useRealtimeBookings();
  const { unreadCounts, markAsRead } = useUnreadMessages();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chatBookingId, setChatBookingId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  // Get the tab from URL parameters, default to 'overview'
  const defaultTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && userRole === 'admin') {
      calculateStats();
    }
  }, [user, userRole, allBookings]);

  const calculateStats = async () => {
    try {
      const { data: allBookingsData, error } = await supabase
        .from('bookings')
        .select(`
          *,
          device_parts (
            name,
            category
          )
        `);

      if (error) throw error;

      const bookingsData = allBookingsData || [];
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Basic stats
      const totalBookings = bookingsData.length;
      const pendingBookings = bookingsData.filter(b => b.status === 'pending').length;
      const completedBookings = bookingsData.filter(b => b.status === 'completed').length;
      const inProgressBookings = bookingsData.filter(b => b.status === 'in-progress').length;
      
      const totalRevenue = bookingsData.reduce((sum, booking) => {
        return sum + (booking.actual_cost || booking.estimated_cost || booking.quoted_price || 0);
      }, 0);

      const monthlyRevenue = bookingsData.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      }).reduce((sum, booking) => {
        return sum + (booking.actual_cost || booking.estimated_cost || booking.quoted_price || 0);
      }, 0);

      const averageRepairValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
      const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

      // Popular devices
      const deviceCounts: { [key: string]: number } = {};
      bookingsData.forEach(booking => {
        const device = `${booking.device_type} ${booking.device_model}`;
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });

      const popularDevices = Object.entries(deviceCounts)
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Popular repairs
      const repairCounts: { [key: string]: number } = {};
      bookingsData.forEach(booking => {
        const repair = booking.device_parts?.name || booking.issue_description.toLowerCase();
        repairCounts[repair] = (repairCounts[repair] || 0) + 1;
      });

      const popularRepairs = Object.entries(repairCounts)
        .map(([repair, count]) => ({ repair, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Recent activity
      const recentActivity = bookingsData
        .slice(0, 10)
        .map(booking => ({
          type: 'booking',
          message: `${booking.customer_name} booked ${booking.device_parts?.name || booking.device_type + ' ' + booking.device_model} repair`,
          time: new Date(booking.created_at).toLocaleDateString(),
          status: booking.status
        }));

      // Monthly trend (last 6 months)
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - i, 1);
        const monthBookings = bookingsData.filter(booking => {
          const bookingDate = new Date(booking.created_at);
          return bookingDate.getMonth() === date.getMonth() && 
                 bookingDate.getFullYear() === date.getFullYear();
        });
        
        const monthRevenue = monthBookings.reduce((sum, booking) => {
          return sum + (booking.actual_cost || booking.estimated_cost || booking.quoted_price || 0);
        }, 0);

        monthlyTrend.push({
          month: date.toLocaleDateString('en', { month: 'short' }),
          bookings: monthBookings.length,
          revenue: monthRevenue
        });
      }

      setStats({
        totalBookings,
        pendingBookings,
        completedBookings,
        inProgressBookings,
        totalRevenue,
        monthlyRevenue,
        averageRepairValue,
        completionRate,
        popularDevices,
        popularRepairs,
        recentActivity,
        monthlyTrend
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Wrench className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const renderBookingsTable = (bookingsData: Booking[], isAdmin = false) => (
    <div className="w-full">
      {/* Mobile Card Layout */}
      <div className="block md:hidden space-y-4">
        {bookingsData.map((booking) => (
          <Card key={booking.id} className="p-4">
            <div className="space-y-3">
              {/* Device & Status */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{booking.device_type} {booking.device_model}</p>
                  {booking.device_parts && (
                    <p className="text-xs text-muted-foreground">{booking.device_parts.name}</p>
                  )}
                </div>
                <Badge className={getStatusColor(booking.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(booking.status)}
                    <span className="text-xs">{booking.status}</span>
                  </div>
                </Badge>
              </div>

              {/* Issue Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">{booking.issue_description}</p>

              {/* Date, Time, Cost */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  <span>{booking.preferred_date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{booking.preferred_time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>${booking.actual_cost || booking.estimated_cost || booking.quoted_price || 0}</span>
                </div>
                {booking.device_parts && booking.selected_quality_type && (
                  <Badge variant="secondary" className="text-xs w-fit">
                    {booking.selected_quality_type}
                  </Badge>
                )}
              </div>

              {/* Customer Info (Admin only) */}
              {isAdmin && (
                <div className="pt-2 border-t text-xs space-y-1">
                  <p className="font-medium">{booking.customer_name}</p>
                  <p className="text-muted-foreground">{booking.customer_email}</p>
                  <p className="text-muted-foreground">{booking.customer_phone}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {/* Status Update Buttons (Admin only) */}
                {isAdmin && (
                  <>
                    {booking.status === 'pending' && (
                      <Button
                        size="sm"
                        className="text-xs"
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      >
                        Confirm
                      </Button>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => updateBookingStatus(booking.id, 'in-progress')}
                      >
                        Start
                      </Button>
                    )}
                    {booking.status === 'in-progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                  </>
                )}
                
                {/* Chat Button */}
                {user && booking.status !== 'cancelled' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="relative text-xs"
                    onClick={() => {
                      setChatBookingId(booking.id);
                      setShowChat(true);
                      markAsRead(booking.id);
                    }}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Chat
                    {unreadCounts[booking.id] > 0 && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCounts[booking.id] > 9 ? '9+' : unreadCounts[booking.id]}
                      </div>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Device & Part</TableHead>
              <TableHead className="min-w-[150px]">Issue</TableHead>
              <TableHead className="min-w-[120px]">Date & Time</TableHead>
              {isAdmin && <TableHead className="min-w-[150px]">Customer</TableHead>}
              <TableHead>Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookingsData.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{booking.device_type} {booking.device_model}</p>
                    {booking.device_parts ? (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{booking.device_parts.name}</p>
                        <div className="flex gap-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {booking.device_parts.category}
                          </Badge>
                          {booking.selected_quality_type && (
                            <Badge variant="secondary" className="text-xs">
                              {booking.selected_quality_type} quality
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">General repair</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="truncate text-sm">{booking.issue_description}</p>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{booking.preferred_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{booking.preferred_time}</span>
                    </div>
                  </div>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{booking.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{booking.customer_email}</p>
                      <p className="text-xs text-muted-foreground">{booking.customer_phone}</p>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-sm">
                      ${booking.actual_cost || booking.estimated_cost || booking.quoted_price || 0}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(booking.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(booking.status)}
                      <span className="text-xs">{booking.status}</span>
                    </div>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 flex-wrap">
                    {/* Status Update Buttons (Admin only) */}
                    {isAdmin && (
                      <>
                        {booking.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          >
                            Confirm
                          </Button>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, 'in-progress')}
                          >
                            Start
                          </Button>
                        )}
                        {booking.status === 'in-progress' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                      </>
                    )}
                    
                    {/* Chat Button (For registered users only) */}
                    {user && booking.status !== 'cancelled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="relative"
                        onClick={() => {
                          setChatBookingId(booking.id);
                          setShowChat(true);
                          // Mark messages as read when opening chat
                          markAsRead(booking.id);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Chat
                        {/* Notification Badge */}
                        {unreadCounts[booking.id] > 0 && (
                          <div className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {unreadCounts[booking.id] > 9 ? '9+' : unreadCounts[booking.id]}
                          </div>
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const seoConfig = getPageSEOConfig('dashboard', t);

  return (
    <div className="min-h-screen bg-background">
      <SEO {...seoConfig} />
      {/* Header */}
      

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {userRole === 'admin' ? (
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto p-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2">{t('dashboard.overview')}</TabsTrigger>
              <TabsTrigger value="all-bookings" className="text-xs sm:text-sm px-2 py-2">{t('dashboard.allBookings')}</TabsTrigger>
              <TabsTrigger value="quotes" className="text-xs sm:text-sm px-2 py-2">{t('dashboard.quotes')}</TabsTrigger>
              <TabsTrigger value="banners" className="text-xs sm:text-sm px-2 py-2">Banners</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 py-2">{t('dashboard.analytics')}</TabsTrigger>
              <TabsTrigger value="my-bookings" className="text-xs sm:text-sm px-2 py-2">{t('dashboard.myBookings')}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.totalBookings')}</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats?.totalBookings || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.totalRevenue')}</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
                    <p className="text-xs text-muted-foreground">
                      ${stats?.monthlyRevenue?.toFixed(2) || '0.00'} this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.completionRate')}</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{stats?.completionRate?.toFixed(1) || '0'}%</div>
                    <Progress value={stats?.completionRate || 0} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Repair Value</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">${stats?.averageRepairValue?.toFixed(2) || '0.00'}</div>
                    <p className="text-xs text-muted-foreground">
                      Per repair booking
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Status Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                      Pending
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats?.pendingBookings || 0}</div>
                    <p className="text-sm text-muted-foreground">Awaiting confirmation</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                      In Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats?.inProgressBookings || 0}</div>
                    <p className="text-sm text-muted-foreground">Currently being repaired</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats?.completedBookings || 0}</div>
                    <p className="text-sm text-muted-foreground">Successfully completed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.recentActivity?.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-sm">{activity.message}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {activity.status && (
                            <Badge className={getStatusColor(activity.status)}>
                              {activity.status}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Popular Devices</CardTitle>
                    <CardDescription className="text-sm">Most frequently repaired devices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {stats?.popularDevices?.map((device, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate pr-2">{device.device}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-16 sm:w-20 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${(device.count / (stats?.popularDevices?.[0]?.count || 1)) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground min-w-[20px]">{device.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Popular Repairs</CardTitle>
                    <CardDescription className="text-sm">Most common repair types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {stats?.popularRepairs?.map((repair, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize truncate pr-2">{repair.repair}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-16 sm:w-20 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${(repair.count / (stats?.popularRepairs?.[0]?.count || 1)) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground min-w-[20px]">{repair.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Monthly Trend</CardTitle>
                    <CardDescription className="text-sm">Bookings and revenue over the last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {stats?.monthlyTrend?.map((month, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center py-2 border-b last:border-b-0">
                          <span className="font-medium text-sm sm:text-base">{month.month}</span>
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            <span className="text-sm">{month.bookings} bookings</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">${month.revenue.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="quotes" className="space-y-6">
              <QuoteRequestsManager />
            </TabsContent>

            <TabsContent value="banners" className="space-y-6">
              <BannerManagement />
            </TabsContent>
            
            <TabsContent value="all-bookings">
              <Card>
                <CardHeader>
                  <CardTitle>All Customer Bookings</CardTitle>
                  <CardDescription>
                    Manage all repair bookings from customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingBookings ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : allBookings.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No bookings yet</p>
                  ) : (
                    renderBookingsTable(allBookings, true)
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="my-bookings">
              <Card>
                <CardHeader>
                  <CardTitle>My Bookings</CardTitle>
                  <CardDescription>
                    Your personal repair bookings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingBookings ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : bookings.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No bookings yet</p>
                  ) : (
                    renderBookingsTable(bookings)
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* User Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.myBookings')}</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{bookings.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Total repair requests
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {bookings.filter(b => b.status === 'completed').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Successfully repaired
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    ${bookings.reduce((sum, booking) => sum + (booking.actual_cost || booking.estimated_cost || booking.quoted_price || 0), 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    On repairs
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* User Tabs */}
            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                <TabsTrigger value="bookings" className="text-sm px-3 py-2">My Bookings</TabsTrigger>
                <TabsTrigger value="quotes" className="text-sm px-3 py-2">My Quotes</TabsTrigger>
                <TabsTrigger value="orders" className="text-sm px-3 py-2">My Orders</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Repair Bookings</CardTitle>
                    <CardDescription>
                      Track the status of your device repairs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingBookings ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No bookings yet</p>
                        <Button onClick={() => navigate('/repairs')}>
                          Book a Repair
                        </Button>
                      </div>
                    ) : (
                      renderBookingsTable(bookings)
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quotes" className="space-y-6">
                <QuoteRequestsManager />
              </TabsContent>

              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      My Orders
                    </CardTitle>
                    <CardDescription>
                      View and track your accessory orders
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">View Your Orders</h3>
                      <p className="text-gray-600 mb-4">
                        Track your accessory orders and view order history
                      </p>
                      <Button onClick={() => navigate('/orders')}>
                        View All Orders
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {showChat && chatBookingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-lg w-full max-w-2xl max-h-[90vh] h-[500px] sm:h-[600px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0">
              <h3 className="text-base sm:text-lg font-semibold">Chat - Booking #{chatBookingId.slice(-8)}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowChat(false);
                  setChatBookingId(null);
                }}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>
            <div className="flex-1 min-h-0">
              <ChatContent bookingId={chatBookingId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;