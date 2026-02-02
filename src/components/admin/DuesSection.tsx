import { useState } from 'react';
import { Due } from '@/types/library';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, Search, IndianRupee, Download } from 'lucide-react';
import { generateDuesReport } from '@/lib/reports';

interface DuesSectionProps {
  dues: Due[];
  onPayDue: (due: Due) => void;
  onPrintReceipt: (due: Due) => void;
}

export const DuesSection = ({ dues, onPayDue, onPrintReceipt }: DuesSectionProps) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const filteredDues = dues.filter(due => {
    const matchesSearch = due.memberName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || due.status === filter;
    return matchesSearch && matchesFilter;
  });

  const pendingTotal = dues.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0);
  const paidTotal = dues.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0);

  const handleExport = (format: 'pdf' | 'excel') => {
    const title = filter === 'pending' ? 'Pending Dues Report' : 
                  filter === 'paid' ? 'Payment History' : 'All Dues Report';
    generateDuesReport(filteredDues, title, format);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="stat-card bg-warning/5 border-warning/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <IndianRupee className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{pendingTotal}</p>
              <p className="text-muted-foreground">Total Pending</p>
            </div>
          </div>
        </div>
        <div className="stat-card bg-success/5 border-success/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <IndianRupee className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{paidTotal}</p>
              <p className="text-muted-foreground">Total Collected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by member name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-styled pl-10"
            />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="table-header">
                <TableHead>Member</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Paid Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No dues found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDues.map((due) => (
                  <TableRow key={due.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-foreground">{due.memberName}</TableCell>
                    <TableCell className="text-muted-foreground">₹{due.amount}</TableCell>
                    <TableCell className="text-muted-foreground">{due.period}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(due.dueDate).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {due.paidDate ? new Date(due.paidDate).toLocaleDateString('en-IN') : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={due.status === 'paid' ? 'badge-success' : 'badge-danger'}>
                        {due.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {due.status === 'paid' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onPrintReceipt(due)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        )}
                        {due.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => onPayDue(due)}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
