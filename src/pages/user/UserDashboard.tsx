import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  LogOut, 
  Clock, 
  IndianRupee, 
  Calendar,
  CheckCircle,
  AlertCircle,
  LogIn,
  LogOut as LogOutIcon,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendance, useDues, useCurrentMemberAttendance } from '@/hooks/useFirebaseData';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Member } from '@/types/library';
import { toast } from 'sonner';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [memberData, setMemberData] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const { attendance, markEntry, markExit, getMemberAttendance } = useAttendance();
  const { dues, getMemberDues } = useDues();
  const currentSession = useCurrentMemberAttendance(memberData?.id || '');
  const [currentMonth] = useState(new Date());

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!user) return;
      
      try {
        // Find member by email in the members collection
        const membersRef = ref(database, 'members');
        const snapshot = await get(membersRef);
        
        if (snapshot.exists()) {
          const members = snapshot.val();
          const memberEntry = Object.entries(members).find(
            ([_, member]: [string, any]) => member.email === user.email
          );
          
          if (memberEntry) {
            setMemberData({ id: memberEntry[0], ...memberEntry[1] as Omit<Member, 'id'> });
          }
        }
      } catch (error) {
        console.error('Error fetching member data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [user]);

  const memberAttendance = memberData ? getMemberAttendance(memberData.id) : [];
  const memberDues = memberData ? getMemberDues(memberData.id) : [];
  const pendingDues = memberDues.filter(d => d.status === 'pending' || d.status === 'overdue');
  const totalPending = pendingDues.reduce((sum, d) => sum + d.amount, 0);

  // Calendar data
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAttendanceForDay = (date: Date) => {
    return memberAttendance.find(record => 
      isSameDay(parseISO(record.date), date)
    );
  };

  const thisMonthAttendance = memberAttendance.filter(
    a => a.date.startsWith(format(currentMonth, 'yyyy-MM'))
  );

  const handleMarkEntry = async () => {
    if (!memberData) return;
    try {
      await markEntry(memberData.id, memberData.name);
      toast.success('Entry marked successfully!');
    } catch (error) {
      toast.error('Failed to mark entry');
    }
  };

  const handleMarkExit = async () => {
    if (!memberData || !currentSession) return;
    try {
      await markExit(currentSession.id, memberData.id, memberData.name, currentSession.entryTime);
      toast.success('Exit marked successfully!');
    } catch (error) {
      toast.error('Failed to mark exit');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card-elevated p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Account Not Found</h1>
          <p className="text-muted-foreground mb-6">
            Your member account could not be found. Please contact the library admin.
          </p>
          <Button onClick={handleLogout} variant="outline">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full hero-gradient flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-foreground">Shri Hanumant Library</h1>
              <p className="text-xs text-muted-foreground">Member Portal</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-foreground">{memberData.name}</p>
              <p className="text-xs text-muted-foreground">{memberData.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="card-elevated p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full hero-gradient flex items-center justify-center text-primary-foreground text-2xl font-bold">
                {memberData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Welcome, {memberData.name.split(' ')[0]}!
                </h2>
                <p className="text-muted-foreground">
                  Seat: {memberData.seatNumber || 'N/A'} • Shift: {memberData.shift || 'Full Day'}
                </p>
              </div>
            </div>

            {/* Attendance Button */}
            <div className="w-full sm:w-auto">
              {currentSession ? (
                <div className="text-center sm:text-right">
                  <p className="text-sm text-success mb-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-success mr-2 animate-pulse" />
                    In Library since {currentSession.entryTime}
                  </p>
                  <Button 
                    onClick={handleMarkExit}
                    variant="outline"
                    className="w-full sm:w-auto gap-2 border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    Mark Exit
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleMarkEntry}
                  className="w-full sm:w-auto btn-primary gap-2"
                  size="lg"
                >
                  <LogIn className="w-5 h-5" />
                  Mark Entry
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">This Month</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {new Set(thisMonthAttendance.map(a => a.date)).size} days
            </p>
            <p className="text-sm text-muted-foreground">Attendance</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              {pendingDues.length > 0 ? (
                <AlertCircle className="w-5 h-5 text-warning" />
              ) : (
                <CheckCircle className="w-5 h-5 text-success" />
              )}
              <span className="text-muted-foreground">Pending Dues</span>
            </div>
            <p className={`text-2xl font-bold ${pendingDues.length > 0 ? 'text-warning' : 'text-success'}`}>
              ₹{totalPending}
            </p>
            <p className="text-sm text-muted-foreground">
              {pendingDues.length} month{pendingDues.length !== 1 ? 's' : ''} pending
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <IndianRupee className="w-5 h-5 text-success" />
              <span className="text-muted-foreground">Monthly Fee</span>
            </div>
            <p className="text-2xl font-bold text-foreground">₹{memberData.monthlyFee}</p>
            <p className="text-sm text-muted-foreground">per month</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Attendance Calendar */}
          <div className="card-elevated p-6">
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">
              {format(currentMonth, 'MMMM yyyy')} Attendance
            </h3>

            <div className="grid grid-cols-7 gap-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2" />
              ))}

              {daysInMonth.map((day) => {
                const record = getAttendanceForDay(day);
                const isPresent = !!record;
                const isToday = isSameDay(day, new Date());
                const isFuture = day > new Date();

                return (
                  <div
                    key={day.toISOString()}
                    className={`p-2 rounded-lg text-center text-sm ${
                      isFuture 
                        ? 'bg-secondary/30 text-muted-foreground/50'
                        : isPresent 
                          ? 'bg-success/20 text-success' 
                          : 'bg-secondary/50 text-muted-foreground'
                    } ${isToday ? 'ring-2 ring-primary' : ''}`}
                  >
                    <span className="font-medium">{format(day, 'd')}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-success/20" />
                <span className="text-sm text-muted-foreground">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-secondary/50" />
                <span className="text-sm text-muted-foreground">Absent</span>
              </div>
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="card-elevated p-6">
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">
              Recent Activity
            </h3>

            {memberAttendance.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No attendance records yet
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {memberAttendance.slice(0, 10).map((record) => (
                  <div 
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${record.exitTime ? 'bg-muted-foreground' : 'bg-success'}`} />
                      <div>
                        <p className="font-medium text-foreground">
                          {format(parseISO(record.date), 'dd MMM yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {record.entryTime} - {record.exitTime || 'In Progress'}
                        </p>
                      </div>
                    </div>
                    {record.duration && (
                      <span className="text-sm font-medium text-primary">
                        {Math.floor(record.duration / 60)}h {record.duration % 60}m
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dues Section */}
          <div className="card-elevated p-6 lg:col-span-2">
            <h3 className="font-display text-xl font-semibold text-foreground mb-6">
              Fee History
            </h3>

            {memberDues.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No dues records yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-muted-foreground">Month</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Due Date</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberDues.map((due) => (
                      <tr key={due.id} className="border-b border-border">
                        <td className="p-3">{format(new Date(due.month + '-01'), 'MMMM yyyy')}</td>
                        <td className="p-3 font-semibold">₹{due.amount}</td>
                        <td className="p-3">{format(new Date(due.dueDate), 'dd MMM yyyy')}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            due.status === 'paid' 
                              ? 'bg-success/10 text-success'
                              : due.status === 'overdue'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-warning/10 text-warning'
                          }`}>
                            {due.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                            {due.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                            {due.status === 'pending' && <Clock className="w-3 h-3" />}
                            {due.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {due.receiptNumber || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Shri Hanumant Library. All rights reserved.</p>
          <p className="mt-1">Need help? Contact: +91 79913 04874</p>
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;
