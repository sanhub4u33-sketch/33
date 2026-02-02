import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addMember } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check } from 'lucide-react';

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddMemberDialog = ({ open, onOpenChange }: AddMemberDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [createdMember, setCreatedMember] = useState<{ id: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    seatNumber: '',
    monthlyFee: 500,
  });

  const { toast } = useToast();

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const password = generatePassword();
      const memberId = await addMember({
        ...formData,
        joinDate: new Date().toISOString(),
        status: 'active',
        password,
      });

      setCreatedMember({ id: memberId, password });
      toast({
        title: 'Member Added',
        description: `${formData.name} has been added successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add member',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdMember) return;
    const text = `Member ID: ${createdMember.id}\nPassword: ${createdMember.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      seatNumber: '',
      monthlyFee: 500,
    });
    setCreatedMember(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {createdMember ? 'Member Created' : 'Add New Member'}
          </DialogTitle>
        </DialogHeader>

        {createdMember ? (
          <div className="space-y-4">
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-success font-medium mb-2">Member created successfully!</p>
              <p className="text-sm text-muted-foreground">
                Share these credentials with the member:
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Member ID:</span>
                <p className="font-mono font-medium text-foreground">{createdMember.id}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Password:</span>
                <p className="font-mono font-medium text-foreground">{createdMember.password}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCopy} className="flex-1">
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Credentials'}
              </Button>
              <Button onClick={handleClose} className="flex-1">Done</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-styled mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-styled mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-styled mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-styled mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seatNumber">Seat Number *</Label>
                <Input
                  id="seatNumber"
                  value={formData.seatNumber}
                  onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
                  className="input-styled mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="monthlyFee">Monthly Fee (₹) *</Label>
                <Input
                  id="monthlyFee"
                  type="number"
                  value={formData.monthlyFee}
                  onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                  className="input-styled mt-1"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Adding...' : 'Add Member'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
