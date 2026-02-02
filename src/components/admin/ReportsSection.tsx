import { useState } from 'react';
import { Member } from '@/types/library';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { generateMemberReport, generateDuesReport, generateAttendanceReport } from '@/lib/reports';
import { getAllDues, getAllAttendance } from '@/lib/database';
import { FileText, Download, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportsSectionProps {
  members: Member[];
}

type ReportType = 'members' | 'dues-weekly' | 'dues-monthly' | 'dues-yearly' | 'attendance-monthly' | 'attendance-yearly';

export const ReportsSection = ({ members }: ReportsSectionProps) => {
  const [reportType, setReportType] = useState<ReportType>('members');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getDateRange = (type: string) => {
    const now = new Date();
    let startDate: Date;

    if (type.includes('weekly')) {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (type.includes('monthly')) {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    return {
      start: startDate.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0],
    };
  };

  const handleGenerate = async (format: 'pdf' | 'excel') => {
    setLoading(true);
    
    try {
      if (reportType === 'members') {
        generateMemberReport(members, 'Members List', format);
      } else if (reportType.startsWith('dues')) {
        const { start, end } = getDateRange(reportType);
        const dues = await getAllDues();
        const filteredDues = dues.filter(d => {
          const createdDate = d.createdAt.split('T')[0];
          return createdDate >= start && createdDate <= end;
        });
        
        const period = reportType.split('-')[1];
        const title = `${period.charAt(0).toUpperCase() + period.slice(1)} Dues Report (${start} to ${end})`;
        generateDuesReport(filteredDues, title, format);
      } else if (reportType.startsWith('attendance')) {
        const { start, end } = getDateRange(reportType);
        const attendance = await getAllAttendance(start, end);
        
        const period = reportType.split('-')[1];
        const title = `${period.charAt(0).toUpperCase() + period.slice(1)} Attendance Report (${start} to ${end})`;
        generateAttendanceReport(attendance, title, format);
      }
      
      toast({
        title: 'Report Generated',
        description: `Your ${format.toUpperCase()} report has been downloaded`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const reportOptions = [
    { value: 'members', label: 'All Members List', icon: '👥' },
    { value: 'dues-weekly', label: 'Weekly Fee Report', icon: '📅' },
    { value: 'dues-monthly', label: 'Monthly Fee Report', icon: '📆' },
    { value: 'dues-yearly', label: 'Yearly Fee Report', icon: '📊' },
    { value: 'attendance-monthly', label: 'Monthly Attendance Report', icon: '📋' },
    { value: 'attendance-yearly', label: 'Yearly Attendance Report', icon: '📈' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Report Generator */}
        <div className="card-elevated">
          <h3 className="font-serif text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generate Reports
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label>Select Report Type</Label>
              <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => handleGenerate('excel')}
                disabled={loading}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Excel
              </Button>
              <Button
                onClick={() => handleGenerate('pdf')}
                disabled={loading}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card-elevated">
          <h3 className="font-serif text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Quick Overview
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold text-foreground">{members.length}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Active Members</p>
              <p className="text-2xl font-bold text-foreground">
                {members.filter(m => m.status === 'active').length}
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Monthly Revenue (Est.)</p>
              <p className="text-2xl font-bold text-foreground">
                ₹{members.filter(m => m.status === 'active').reduce((sum, m) => sum + m.monthlyFee, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Types Info */}
      <div className="card-elevated">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
          Available Report Types
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportOptions.map((option) => (
            <div 
              key={option.value} 
              className="p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
              onClick={() => setReportType(option.value as ReportType)}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <p className="font-medium text-foreground">{option.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
