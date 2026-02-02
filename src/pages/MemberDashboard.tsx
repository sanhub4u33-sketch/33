import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, Clock, Calendar, IndianRupee, LogIn, LogOutIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Attendance, Due } from '@/types/library';
import { 
  getMemberAttendance, getMemberDues, markEntry, markExit, 
  getMemberTodayAttendance 
} from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

const MemberDashboard = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [dues, setDues] = useState<Due[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const { memberData, logout, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (userRole !== 'member' || !memberData) {
      navigate('/login');
      return;
    }

    loadData();
  }, [userRole, memberData, navigate]);

  const loadData = async () => {
    if (!memberData) return;
    
    try {
      const [attendanceData, duesData, todayData] = await Promise.all([
        getMemberAttendance(memberData.id),
        getMemberDues(memberData.id),
        getMemberTodayAttendance(memberData.id),
      ]);
      
      setAttendance(attendanceData);
      setDues(duesData);
      setTodayAttendance(todayData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkEntry = async () => {
    if (!memberData) return;
    setMarking(true);
    
    try {
      await markEntry(memberData.id, memberData.name);
      toast({
        title: 'Entry Marked',
        description: 'Your entry has been recorded successfully',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark entry',
        variant: 'destructive',
      });
    } finally {
      setMarking(false);
    }
  };

  const handleMarkExit = async () => {
    if (!memberData || !todayAttendance) return;
    setMarking(true);
    
    try {
      await markExit(todayAttendance.id, memberData.id, memberData.name);
      toast({
        title: 'Exit Marked',
        description: 'Your exit has been recorded successfully',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark exit',
        variant: 'destructive',
      });
    } finally {
      setMarking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const pendingDues = dues.filter(d => d.status === 'pending');
  const totalPending = pendingDues.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="font-serif text-xl font-bold">Shri Hanumant Library</span>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-secondary-foreground hover:bg-secondary-foreground/10">
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="card-elevated mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
                Welcome, {memberData?.name}!
              </h1>
              <p className="text-muted-foreground">
                Member ID: {memberData?.id} • Seat: {memberData?.seatNumber}
              </p>
            </div>
            <div className="flex gap-3">
              {todayAttendance ? (
                <Button
                  onClick={handleMarkExit}
                  disabled={marking}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  <LogOutIcon className="h-5 w-5 mr-2" />
                  {marking ? 'Marking...' : 'Mark Exit'}
                </Button>
              ) : (
                <Button
                  onClick={handleMarkEntry}
                  disabled={marking}
                  className="btn-hero"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  {marking ? 'Marking...' : 'Mark Entry'}
                </Button>
              )}
            </div>
          </div>
          
          {todayAttendance && (
            <div className="mt-4 p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                <span className="text-success font-medium">You are currently present</span>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                Entry time: {new Date(todayAttendance.entryTime).toLocaleTimeString('en-IN')}
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{attendance.length}</p>
                <p className="text-muted-foreground">Total Attendance</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-warning/10 flex items-center justify-center">
                <IndianRupee className="h-7 w-7 text-warning" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">₹{totalPending}</p>
                <p className="text-muted-foreground">Pending Dues</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-info/10 flex items-center justify-center">
                <Clock className="h-7 w-7 text-info" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {new Date(memberData?.joinDate || '').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </p>
                <p className="text-muted-foreground">Member Since</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dues & Attendance */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Dues */}
          <div className="card-elevated">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              Fee History
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dues.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No fee records</p>
              ) : (
                dues.map((due) => (
                  <div key={due.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{due.period}</p>
                      <p className="text-sm text-muted-foreground">₹{due.amount}</p>
                    </div>
                    <span className={due.status === 'paid' ? 'badge-success' : 'badge-danger'}>
                      {due.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="card-elevated">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Attendance
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {attendance.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No attendance records</p>
              ) : (
                attendance.slice(0, 15).map((att) => (
                  <div key={att.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">
                        {new Date(att.date).toLocaleDateString('en-IN', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(att.entryTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        {att.exitTime && ` - ${new Date(att.exitTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
                      </p>
                    </div>
                    <span className={att.exitTime ? 'badge-warning' : 'badge-success'}>
                      {att.exitTime ? 'Completed' : 'Ongoing'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MemberDashboard;
