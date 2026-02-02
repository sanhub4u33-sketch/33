import { useState, useEffect } from 'react';
import { Member, Attendance } from '@/types/library';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { getAllAttendance, getMemberAttendance } from '@/lib/database';
import { generateAttendanceReport } from '@/lib/reports';
import { Calendar, Download, Search, Filter, Users } from 'lucide-react';

interface AttendanceSectionProps {
  members: Member[];
}

export const AttendanceSection = ({ members }: AttendanceSectionProps) => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');

  useEffect(() => {
    loadAttendance();
  }, [selectedMember, startDate, endDate]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      let data: Attendance[];
      if (selectedMember === 'all') {
        data = await getAllAttendance(startDate, endDate);
      } else {
        data = await getMemberAttendance(selectedMember, startDate, endDate);
      }
      setAttendance(data);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    const memberName = selectedMember === 'all' ? 'All Members' : 
      members.find(m => m.id === selectedMember)?.name || 'Unknown';
    const title = `Attendance Report - ${memberName} (${startDate} to ${endDate})`;
    generateAttendanceReport(attendance, title, format);
  };

  // Group by date for monthly view
  const groupedAttendance = attendance.reduce((acc, att) => {
    const date = att.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(att);
    return acc;
  }, {} as Record<string, Attendance[]>);

  // Calculate stats
  const uniqueDays = new Set(attendance.map(a => a.date)).size;
  const totalHours = attendance.reduce((sum, att) => {
    if (att.entryTime && att.exitTime) {
      const entry = new Date(att.entryTime);
      const exit = new Date(att.exitTime);
      return sum + (exit.getTime() - entry.getTime()) / (1000 * 60 * 60);
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{attendance.length}</p>
              <p className="text-muted-foreground">Total Records</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{uniqueDays}</p>
              <p className="text-muted-foreground">Days Active</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalHours.toFixed(1)}h</p>
              <p className="text-muted-foreground">Total Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-elevated">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <Label>Member</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-styled mt-1"
            />
          </div>
          <div>
            <Label>End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-styled mt-1"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button variant="outline" onClick={() => handleExport('excel')} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="table-header">
                <TableHead>Date</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Entry Time</TableHead>
                <TableHead>Exit Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : attendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                attendance.map((att) => {
                  const duration = att.exitTime
                    ? ((new Date(att.exitTime).getTime() - new Date(att.entryTime).getTime()) / (1000 * 60 * 60)).toFixed(1)
                    : '-';
                  
                  return (
                    <TableRow key={att.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">
                        {new Date(att.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{att.memberName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(att.entryTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {att.exitTime 
                          ? new Date(att.exitTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {duration !== '-' ? `${duration}h` : '-'}
                      </TableCell>
                      <TableCell>
                        <span className={att.exitTime ? 'badge-warning' : 'badge-success'}>
                          {att.exitTime ? 'Completed' : 'Present'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
