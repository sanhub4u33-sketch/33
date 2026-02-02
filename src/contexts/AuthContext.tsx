import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, database } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { Member } from '@/types/library';

interface AuthContextType {
  user: User | null;
  userRole: 'admin' | 'member' | null;
  memberData: Member | null;
  loading: boolean;
  loginAsAdmin: (email: string, password: string) => Promise<void>;
  loginAsMember: (memberId: string, password: string) => Promise<Member>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);
  const [memberData, setMemberData] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Check if admin
        if (user.email === 'owner@gmail.com') {
          setUserRole('admin');
        }
      } else {
        setUserRole(null);
        setMemberData(null);
      }
      setLoading(false);
    });

    // Check for member session
    const memberSession = localStorage.getItem('memberSession');
    if (memberSession) {
      const data = JSON.parse(memberSession);
      setMemberData(data);
      setUserRole('member');
      setLoading(false);
    }

    return unsubscribe;
  }, []);

  const loginAsAdmin = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (result.user.email === 'owner@gmail.com') {
      setUserRole('admin');
    } else {
      throw new Error('Unauthorized access');
    }
  };

  const loginAsMember = async (memberId: string, password: string): Promise<Member> => {
    const memberRef = ref(database, `members/${memberId}`);
    const snapshot = await get(memberRef);
    
    if (!snapshot.exists()) {
      throw new Error('Member not found');
    }

    const member = snapshot.val() as Member;
    
    if (member.password !== password) {
      throw new Error('Invalid password');
    }

    if (member.status !== 'active') {
      throw new Error('Account is inactive');
    }

    setMemberData({ ...member, id: memberId });
    setUserRole('member');
    localStorage.setItem('memberSession', JSON.stringify({ ...member, id: memberId }));
    
    return { ...member, id: memberId };
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('memberSession');
    setUser(null);
    setUserRole(null);
    setMemberData(null);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, memberData, loading, loginAsAdmin, loginAsMember, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
