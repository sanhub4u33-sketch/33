export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  joinDate: string;
  seatNumber?: string;
  shift?: string;
  monthlyFee: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  entryTime: string;
  exitTime?: string;
  duration?: number; // in minutes
}

export interface DuesRecord {
  id: string;
  memberId: string;
  memberName: string;
  month: string; // YYYY-MM format
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  receiptNumber?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  memberId: string;
  memberName: string;
  amount: number;
  month: string;
  paidDate: string;
  paymentMethod: 'cash' | 'upi' | 'other';
}

export interface Activity {
  id: string;
  type: 'entry' | 'exit' | 'payment' | 'member_added' | 'member_removed';
  memberId: string;
  memberName: string;
  timestamp: string;
  details?: string;
}
