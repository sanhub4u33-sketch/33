import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Member, Attendance, Due } from '@/types/library';
import { getMemberAttendance, getMemberDues } from '@/lib/database';
import { Search, User, Calendar, IndianRupee } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MemberSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
}

export const MemberSearch = ({ open, onOpenChange, members }: MemberSearchProps) => {
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberAttendance, setMemberAttendance] = useState<Attendance[]>([]);
  const [memberDues, setMemberDues] = useState<Due[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.phone.includes(search) ||
    member.seatNumber.includes(search)
  );

  useEffect(() => {
    if (selectedMember) {
      loadMemberData();
    }
  }, [selectedMember]);

  const loadMemberData = async () => {
    if (!selectedMember) return;
    setLoading(true);
    
    try {
      const [attendance, dues] = await Promise.all([
        getMemberAttendance(selectedMember.id),
        getMemberDues(selectedMember.id),
      ]);
      setMemberAttendance(attendance);
      setMemberDues(dues);
    } catch (error) {
      console.error('Error loading member data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearch('');
    setSelectedMember(null);
    setMemberAttendance([]);
    setMemberDues([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {selectedMember ? selectedMember.name : 'Search Member'}
          </DialogTitle>
        </DialogHeader>

        {!selectedMember ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or seat number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-styled pl-10"
                autoFocus
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredMembers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {search ? 'No members found' : 'Start typing to search...'}
                </p>
              ) : (
                filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className="w-full p-4 bg-muted/50 hover:bg-muted rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Seat: {member.seatNumber} • {member.phone}
                        </p>
                      </div>
                      <span className={member.status === 'active' ? 'badge-success' : 'badge-danger'}>
                        {member.status}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            <button
              onClick={() => setSelectedMember(null)}
              className="text-sm text-primary hover:underline mb-4 text-left"
            >
              ← Back to search
            </button>

            {/* Member Info */}
            <div className="p-4 bg-muted/50 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="ml-2 text-foreground">{selectedMember.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Seat:</span>
                  <span className="ml-2 text-foreground">{selectedMember.seatNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Monthly Fee:</span>
                  <span className="ml-2 text-foreground">₹{selectedMember.monthlyFee}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Join Date:</span>
                  <span className="ml-2 text-foreground">
                    {new Date(selectedMember.joinDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="attendance" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="attendance" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Attendance
                </TabsTrigger>
                <TabsTrigger value="dues" className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  Dues
                </TabsTrigger>
              </TabsList>

              <TabsContent value="attendance" className="flex-1 overflow-y-auto mt-4">
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Loading...</p>
                ) : memberAttendance.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No attendance records</p>
                ) : (
                  <div className="space-y-2">
                    {memberAttendance.slice(0, 20).map((att) => (
                      <div key={att.id} className="p-3 bg-muted/50 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">
                            {new Date(att.date).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(att.entryTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            {att.exitTime && ` - ${new Date(att.exitTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
                          </p>
                        </div>
                        <span className={att.exitTime ? 'badge-warning' : 'badge-success'}>
                          {att.exitTime ? 'Completed' : 'Present'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="dues" className="flex-1 overflow-y-auto mt-4">
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Loading...</p>
                ) : memberDues.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No dues records</p>
                ) : (
                  <div className="space-y-2">
                    {memberDues.map((due) => (
                      <div key={due.id} className="p-3 bg-muted/50 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">{due.period}</p>
                          <p className="text-sm text-muted-foreground">₹{due.amount}</p>
                        </div>
                        <span className={due.status === 'paid' ? 'badge-success' : 'badge-danger'}>
                          {due.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
