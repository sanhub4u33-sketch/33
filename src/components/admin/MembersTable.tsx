import { useState } from 'react';
import { Member } from '@/types/library';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { deleteMember, updateMember } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Trash2, Search, UserX, UserCheck } from 'lucide-react';

interface MembersTableProps {
  members: Member[];
  onAddMember: () => void;
}

export const MembersTable = ({ members, onAddMember }: MembersTableProps) => {
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Member | null>(null);
  const { toast } = useToast();

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.phone.includes(search) ||
    member.seatNumber.includes(search)
  );

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteMember(deleteConfirm.id, deleteConfirm.name);
      toast({
        title: 'Member Removed',
        description: `${deleteConfirm.name} has been removed`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
    }
    setDeleteConfirm(null);
  };

  const handleToggleStatus = async (member: Member) => {
    try {
      await updateMember(member.id, {
        status: member.status === 'active' ? 'inactive' : 'active',
      });
      toast({
        title: 'Status Updated',
        description: `${member.name} is now ${member.status === 'active' ? 'inactive' : 'active'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or seat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-styled pl-10"
          />
        </div>
        <Button onClick={onAddMember} className="btn-hero">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="table-header">
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Seat</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {search ? 'No members found' : 'No members yet. Add your first member!'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{member.phone}</TableCell>
                    <TableCell className="text-muted-foreground">{member.seatNumber}</TableCell>
                    <TableCell className="text-muted-foreground">₹{member.monthlyFee}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(member.joinDate).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <span className={member.status === 'active' ? 'badge-success' : 'badge-danger'}>
                        {member.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(member)}
                          title={member.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {member.status === 'active' ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteConfirm(member)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deleteConfirm?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
