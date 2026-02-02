import { database } from '@/lib/firebase';
import { ref, push, set, get, update, remove, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { Member, Attendance, Due, Activity } from '@/types/library';

// Members
export const addMember = async (member: Omit<Member, 'id' | 'createdAt'>): Promise<string> => {
  const membersRef = ref(database, 'members');
  const newMemberRef = push(membersRef);
  const memberId = newMemberRef.key!;
  
  await set(newMemberRef, {
    ...member,
    createdAt: new Date().toISOString(),
  });

  // Create initial due
  await createDueForMember(memberId, member.name, member.monthlyFee, member.joinDate);

  // Log activity
  await logActivity({
    type: 'member_added',
    memberId,
    memberName: member.name,
    description: `New member ${member.name} joined the library`,
  });

  return memberId;
};

export const updateMember = async (memberId: string, updates: Partial<Member>) => {
  const memberRef = ref(database, `members/${memberId}`);
  await update(memberRef, updates);
};

export const deleteMember = async (memberId: string, memberName: string) => {
  const memberRef = ref(database, `members/${memberId}`);
  await remove(memberRef);

  await logActivity({
    type: 'member_removed',
    memberId,
    memberName,
    description: `Member ${memberName} was removed from the library`,
  });
};

export const getMember = async (memberId: string): Promise<Member | null> => {
  const memberRef = ref(database, `members/${memberId}`);
  const snapshot = await get(memberRef);
  if (snapshot.exists()) {
    return { ...snapshot.val(), id: memberId };
  }
  return null;
};

export const getAllMembers = async (): Promise<Member[]> => {
  const membersRef = ref(database, 'members');
  const snapshot = await get(membersRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.entries(data).map(([id, member]) => ({
      ...(member as Member),
      id,
    }));
  }
  return [];
};

export const subscribeToMembers = (callback: (members: Member[]) => void) => {
  const membersRef = ref(database, 'members');
  return onValue(membersRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const members = Object.entries(data).map(([id, member]) => ({
        ...(member as Member),
        id,
      }));
      callback(members);
    } else {
      callback([]);
    }
  });
};

// Attendance
export const markEntry = async (memberId: string, memberName: string) => {
  const today = new Date().toISOString().split('T')[0];
  const attendanceRef = ref(database, 'attendance');
  const newAttendanceRef = push(attendanceRef);
  
  const attendance: Omit<Attendance, 'id'> = {
    memberId,
    memberName,
    date: today,
    entryTime: new Date().toISOString(),
    exitTime: null,
    status: 'present',
  };

  await set(newAttendanceRef, attendance);

  await logActivity({
    type: 'entry',
    memberId,
    memberName,
    description: `${memberName} entered the library`,
  });

  return newAttendanceRef.key!;
};

export const markExit = async (attendanceId: string, memberId: string, memberName: string) => {
  const attendanceRef = ref(database, `attendance/${attendanceId}`);
  await update(attendanceRef, {
    exitTime: new Date().toISOString(),
    status: 'left',
  });

  await logActivity({
    type: 'exit',
    memberId,
    memberName,
    description: `${memberName} left the library`,
  });
};

export const getTodayAttendance = async (): Promise<Attendance[]> => {
  const today = new Date().toISOString().split('T')[0];
  const attendanceRef = ref(database, 'attendance');
  const snapshot = await get(attendanceRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.entries(data)
      .map(([id, att]) => ({ ...(att as Attendance), id }))
      .filter(att => att.date === today);
  }
  return [];
};

export const getMemberAttendance = async (memberId: string, startDate?: string, endDate?: string): Promise<Attendance[]> => {
  const attendanceRef = ref(database, 'attendance');
  const snapshot = await get(attendanceRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    let attendance = Object.entries(data)
      .map(([id, att]) => ({ ...(att as Attendance), id }))
      .filter(att => att.memberId === memberId);
    
    if (startDate) {
      attendance = attendance.filter(att => att.date >= startDate);
    }
    if (endDate) {
      attendance = attendance.filter(att => att.date <= endDate);
    }
    
    return attendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  return [];
};

export const getAllAttendance = async (startDate?: string, endDate?: string): Promise<Attendance[]> => {
  const attendanceRef = ref(database, 'attendance');
  const snapshot = await get(attendanceRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    let attendance = Object.entries(data)
      .map(([id, att]) => ({ ...(att as Attendance), id }));
    
    if (startDate) {
      attendance = attendance.filter(att => att.date >= startDate);
    }
    if (endDate) {
      attendance = attendance.filter(att => att.date <= endDate);
    }
    
    return attendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  return [];
};

export const subscribeToTodayAttendance = (callback: (attendance: Attendance[]) => void) => {
  const today = new Date().toISOString().split('T')[0];
  const attendanceRef = ref(database, 'attendance');
  
  return onValue(attendanceRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const attendance = Object.entries(data)
        .map(([id, att]) => ({ ...(att as Attendance), id }))
        .filter(att => att.date === today);
      callback(attendance);
    } else {
      callback([]);
    }
  });
};

export const getMemberTodayAttendance = async (memberId: string): Promise<Attendance | null> => {
  const today = new Date().toISOString().split('T')[0];
  const attendanceRef = ref(database, 'attendance');
  const snapshot = await get(attendanceRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    const todayRecord = Object.entries(data)
      .map(([id, att]) => ({ ...(att as Attendance), id }))
      .find(att => att.memberId === memberId && att.date === today && !att.exitTime);
    
    return todayRecord || null;
  }
  return null;
};

// Dues
export const createDueForMember = async (memberId: string, memberName: string, amount: number, startDate: string) => {
  const duesRef = ref(database, 'dues');
  const newDueRef = push(duesRef);
  
  const dueDate = new Date(startDate);
  dueDate.setDate(dueDate.getDate() + 30);
  
  const due: Omit<Due, 'id'> = {
    memberId,
    memberName,
    amount,
    dueDate: dueDate.toISOString().split('T')[0],
    paidDate: null,
    status: 'pending',
    period: `${new Date(startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`,
    createdAt: new Date().toISOString(),
  };

  await set(newDueRef, due);
  return newDueRef.key!;
};

export const markDueAsPaid = async (dueId: string, memberId: string, memberName: string, amount: number) => {
  const dueRef = ref(database, `dues/${dueId}`);
  const paidDate = new Date().toISOString();
  
  await update(dueRef, {
    status: 'paid',
    paidDate,
  });

  // Create next due
  await createDueForMember(memberId, memberName, amount, paidDate);

  await logActivity({
    type: 'payment',
    memberId,
    memberName,
    description: `${memberName} paid ₹${amount}`,
  });
};

export const getAllDues = async (): Promise<Due[]> => {
  const duesRef = ref(database, 'dues');
  const snapshot = await get(duesRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.entries(data)
      .map(([id, due]) => ({ ...(due as Due), id }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return [];
};

export const getPendingDues = async (): Promise<Due[]> => {
  const dues = await getAllDues();
  return dues.filter(due => due.status === 'pending');
};

export const getMemberDues = async (memberId: string): Promise<Due[]> => {
  const dues = await getAllDues();
  return dues.filter(due => due.memberId === memberId);
};

export const subscribeToDues = (callback: (dues: Due[]) => void) => {
  const duesRef = ref(database, 'dues');
  return onValue(duesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const dues = Object.entries(data)
        .map(([id, due]) => ({ ...(due as Due), id }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(dues);
    } else {
      callback([]);
    }
  });
};

// Activities
export const logActivity = async (activity: Omit<Activity, 'id' | 'timestamp'>) => {
  const activitiesRef = ref(database, 'activities');
  const newActivityRef = push(activitiesRef);
  
  await set(newActivityRef, {
    ...activity,
    timestamp: new Date().toISOString(),
  });
};

export const getRecentActivities = async (limit: number = 10): Promise<Activity[]> => {
  const activitiesRef = ref(database, 'activities');
  const snapshot = await get(activitiesRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.entries(data)
      .map(([id, activity]) => ({ ...(activity as Activity), id }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  return [];
};

export const subscribeToActivities = (callback: (activities: Activity[]) => void, limit: number = 10) => {
  const activitiesRef = ref(database, 'activities');
  return onValue(activitiesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const activities = Object.entries(data)
        .map(([id, activity]) => ({ ...(activity as Activity), id }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
      callback(activities);
    } else {
      callback([]);
    }
  });
};
