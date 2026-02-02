export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  seatNumber: string;
  monthlyFee: number;
  status: 'active' | 'inactive';
  createdAt: string;
  password?: string;
}

export interface Attendance {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  entryTime: string;
  exitTime: string | null;
  status: 'present' | 'left';
}

export interface Due {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: 'pending' | 'paid';
  period: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'entry' | 'exit' | 'payment' | 'member_added' | 'member_removed';
  memberId: string;
  memberName: string;
  timestamp: string;
  description: string;
}

export interface AdminStats {
  totalMembers: number;
  activeMembers: number;
  presentToday: number;
  pendingDues: number;
  totalDuesAmount: number;
  collectedThisMonth: number;
}
