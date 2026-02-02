import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Clock, IndianRupee, FileText, Calendar, 
  LogOut, Plus, Search, Download, Printer, 
  UserPlus, UserMinus, Activity, BookOpen, Menu, X, Home, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { AdminStats, Member, Due, Attendance, Activity as ActivityType } from '@/types/library';
import { 
  subscribeToMembers, subscribeToDues, subscribeToActivities, 
  subscribeToTodayAttendance, markDueAsPaid, getMember
} from '@/lib/database';
import { generateReceipt } from '@/lib/reports';
import { AddMemberDialog } from '@/components/admin/AddMemberDialog';
import { MembersTable } from '@/components/admin/MembersTable';
import { DuesSection } from '@/components/admin/DuesSection';
import { AttendanceSection } from '@/components/admin/AttendanceSection';
import { ReportsSection } from '@/components/admin/ReportsSection';
import { MemberSearch } from '@/components/admin/MemberSearch';
import { useToast } from '@/hooks/use-toast';

type TabType = 'dashboard' | 'members' | 'attendance' | 'dues' | 'reports';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [dues, setDues] = useState<Due[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  
  const { logout, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/login');
      return;
    }

    const unsubMembers = subscribeToMembers(setMembers);
    const unsubDues = subscribeToDues(setDues);
    const unsubActivities = subscribeToActivities(setActivities, 20);
    const unsubAttendance = subscribeToTodayAttendance(setTodayAttendance);

    return () => {
      unsubMembers();
      unsubDues();
      unsubActivities();
      unsubAttendance();
    };
  }, [userRole, navigate]);

  const stats: AdminStats = {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    presentToday: todayAttendance.filter(a => !a.exitTime).length,
    pendingDues: dues.filter(d => d.status === 'pending').length,
    totalDuesAmount: dues.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0),
    collectedThisMonth: dues
      .filter(d => d.status === 'paid' && d.paidDate && new Date(d.paidDate).getMonth() === new Date().getMonth())
      .reduce((sum, d) => sum + d.amount, 0),
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handlePayDue = async (due: Due) => {
    try {
      await markDueAsPaid(due.id, due.memberId, due.memberName, due.amount);
      toast({
        title: 'Payment Recorded',
        description: `Payment of ₹${due.amount} recorded for ${due.memberName}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record payment',
        variant: 'destructive',
      });
    }
  };

  const handlePrintReceipt = async (due: Due) => {
    const member = await getMember(due.memberId);
    if (member) {
      generateReceipt(member, due);
      toast({
        title: 'Receipt Generated',
        description: 'Receipt PDF has been downloaded',
      });
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'dues', label: 'Dues & Fees', icon: IndianRupee },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 sidebar-nav transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-sidebar-primary" />
              <span className="font-serif text-lg font-bold text-sidebar-foreground">
                Shri Hanumant
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as TabType);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background border-b border-border px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="font-serif text-xl md:text-2xl font-bold text-foreground">
                {navItems.find(n => n.id === activeTab)?.label}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowMemberSearch(true)}
                className="hidden md:flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search Member
              </Button>
              <Button
                onClick={() => setShowAddMember(true)}
                className="btn-hero flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden md:inline">Add Member</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.totalMembers}</p>
                      <p className="text-sm text-muted-foreground">Total Members</p>
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.presentToday}</p>
                      <p className="text-sm text-muted-foreground">Present Today</p>
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                      <IndianRupee className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">₹{stats.totalDuesAmount}</p>
                      <p className="text-sm text-muted-foreground">Pending Dues</p>
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
                      <IndianRupee className="h-6 w-6 text-info" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">₹{stats.collectedThisMonth}</p>
                      <p className="text-sm text-muted-foreground">Collected This Month</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Today's Attendance */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="card-elevated">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {activities.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No recent activity</p>
                    ) : (
                      activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            activity.type === 'entry' ? 'bg-success' :
                            activity.type === 'exit' ? 'bg-warning' :
                            activity.type === 'payment' ? 'bg-info' :
                            'bg-primary'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm text-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Pending Dues */}
                <div className="card-elevated">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-primary" />
                    Pending Dues
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {dues.filter(d => d.status === 'pending').length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No pending dues</p>
                    ) : (
                      dues.filter(d => d.status === 'pending').slice(0, 5).map((due) => (
                        <div key={due.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{due.memberName}</p>
                            <p className="text-sm text-muted-foreground">₹{due.amount} • Due: {new Date(due.dueDate).toLocaleDateString('en-IN')}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePrintReceipt(due)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handlePayDue(due)}
                            >
                              Pay
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Today's Attendance */}
              <div className="card-elevated">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today's Attendance ({new Date().toLocaleDateString('en-IN')})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="table-header">
                        <th className="text-left p-3">Member</th>
                        <th className="text-left p-3">Entry Time</th>
                        <th className="text-left p-3">Exit Time</th>
                        <th className="text-left p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayAttendance.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-muted-foreground">
                            No attendance records for today
                          </td>
                        </tr>
                      ) : (
                        todayAttendance.map((att) => (
                          <tr key={att.id} className="border-b border-border hover:bg-muted/50">
                            <td className="p-3 font-medium text-foreground">{att.memberName}</td>
                            <td className="p-3 text-muted-foreground">
                              {new Date(att.entryTime).toLocaleTimeString('en-IN')}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {att.exitTime ? new Date(att.exitTime).toLocaleTimeString('en-IN') : '-'}
                            </td>
                            <td className="p-3">
                              <span className={att.exitTime ? 'badge-warning' : 'badge-success'}>
                                {att.exitTime ? 'Left' : 'Present'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <MembersTable members={members} onAddMember={() => setShowAddMember(true)} />
          )}

          {activeTab === 'attendance' && (
            <AttendanceSection members={members} />
          )}

          {activeTab === 'dues' && (
            <DuesSection 
              dues={dues} 
              onPayDue={handlePayDue} 
              onPrintReceipt={handlePrintReceipt}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsSection members={members} />
          )}
        </div>
      </main>

      {/* Dialogs */}
      <AddMemberDialog open={showAddMember} onOpenChange={setShowAddMember} />
      <MemberSearch 
        open={showMemberSearch} 
        onOpenChange={setShowMemberSearch}
        members={members}
      />
    </div>
  );
};

export default AdminDashboard;
