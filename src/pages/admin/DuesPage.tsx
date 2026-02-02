import { useState, useMemo } from 'react';
import { 
  IndianRupee,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  User
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMembers, useDues } from '@/hooks/useFirebaseData';
import { toast } from 'sonner';
import { format } from 'date-fns';

const DuesPage = () => {
  const { members } = useMembers();
  const { dues, loading, addDue, markAsPaid, getMemberDues } = useDues();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    memberId: '',
    month: format(new Date(), 'yyyy-MM'),
    amount: 500,
    dueDate: format(new Date(new Date().setDate(10)), 'yyyy-MM-dd'),
  });

  const filteredDues = useMemo(() => {
    let filtered = dues;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(due => due.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(due =>
        due.memberName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (a.status !== 'overdue' && b.status === 'overdue') return 1;
      if (a.status === 'pending' && b.status === 'paid') return -1;
      if (a.status === 'paid' && b.status === 'pending') return 1;
      return new Date(b.month).getTime() - new Date(a.month).getTime();
    });
  }, [dues, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const pending = dues.filter(d => d.status === 'pending');
    const overdue = dues.filter(d => d.status === 'overdue');
    const paid = dues.filter(d => d.status === 'paid');
    const totalPending = pending.reduce((sum, d) => sum + d.amount, 0);
    const totalOverdue = overdue.reduce((sum, d) => sum + d.amount, 0);

    return { pending, overdue, paid, totalPending, totalOverdue };
  }, [dues]);

  const handleAddDue = async () => {
    const member = members.find(m => m.id === formData.memberId);
    if (!member) {
      toast.error('Please select a member');
      return;
    }

    try {
      await addDue({
        memberId: formData.memberId,
        memberName: member.name,
        month: formData.month,
        amount: formData.amount,
        dueDate: formData.dueDate,
        status: 'pending',
      });

      toast.success('Due added successfully');
      setShowAddDialog(false);
      setFormData({
        memberId: '',
        month: format(new Date(), 'yyyy-MM'),
        amount: 500,
        dueDate: format(new Date(new Date().setDate(10)), 'yyyy-MM-dd'),
      });
    } catch (error) {
      toast.error('Failed to add due');
    }
  };

  const handleMarkPaid = async (dueId: string, memberId: string, memberName: string, amount: number) => {
    try {
      const receiptNumber = await markAsPaid(dueId, memberId, memberName, amount);
      toast.success(`Payment recorded. Receipt: ${receiptNumber}`);
    } catch (error) {
      toast.error('Failed to mark as paid');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending': return <Clock className="w-4 h-4 text-warning" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  return (
    <AdminLayout 
      title="Dues & Fees" 
      searchPlaceholder="Search member..."
      onSearch={setSearchQuery}
    >
      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-warning" />
            <span className="text-muted-foreground">Pending</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.pending.length}</p>
          <p className="text-sm text-warning">₹{stats.totalPending.toLocaleString()}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span className="text-muted-foreground">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.overdue.length}</p>
          <p className="text-sm text-destructive">₹{stats.totalOverdue.toLocaleString()}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-muted-foreground">Paid This Month</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.paid.length}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setShowAddDialog(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          Add Due
        </Button>
      </div>

      {/* Dues List */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Member</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Month</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Due Date</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : filteredDues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No dues found
                  </td>
                </tr>
              ) : (
                filteredDues.map((due) => (
                  <tr key={due.id} className="border-b border-border hover:bg-secondary/30">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                          {due.memberName.charAt(0)}
                        </div>
                        {due.memberName}
                      </div>
                    </td>
                    <td className="p-4">{format(new Date(due.month + '-01'), 'MMMM yyyy')}</td>
                    <td className="p-4 font-semibold">₹{due.amount}</td>
                    <td className="p-4">{format(new Date(due.dueDate), 'dd MMM yyyy')}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(due.status)}
                        <span className={`capitalize ${
                          due.status === 'paid' ? 'text-success' :
                          due.status === 'overdue' ? 'text-destructive' :
                          'text-warning'
                        }`}>
                          {due.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {due.status !== 'paid' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleMarkPaid(due.id, due.memberId, due.memberName, due.amount)}
                          className="gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Paid
                        </Button>
                      )}
                      {due.status === 'paid' && due.receiptNumber && (
                        <span className="text-sm text-muted-foreground">
                          {due.receiptNumber}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Due Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Due</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Member</Label>
              <Select 
                value={formData.memberId} 
                onValueChange={(value) => {
                  const member = members.find(m => m.id === value);
                  setFormData({ 
                    ...formData, 
                    memberId: value,
                    amount: member?.monthlyFee || 500
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Month</Label>
              <Input
                type="month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDue} className="btn-primary">
              Add Due
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default DuesPage;
