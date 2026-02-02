import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, User, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type LoginMode = 'select' | 'admin' | 'user';

const Login = () => {
  const [mode, setMode] = useState<LoginMode>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [memberId, setMemberId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { loginAsAdmin, loginAsMember } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await loginAsAdmin(email, password);
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in as Admin',
      });
      navigate('/admin');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await loginAsMember(memberId, password);
      toast({
        title: 'Welcome!',
        description: 'Successfully logged in',
      });
      navigate('/member');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
            <span className="font-serif text-2xl font-bold text-foreground">
              Shri Hanumant Library
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="card-elevated">
          {mode === 'select' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                  Welcome Back
                </h2>
                <p className="text-muted-foreground">
                  Choose how you'd like to login
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => setMode('admin')}
                  className="w-full p-6 rounded-lg border border-border bg-card hover:border-primary hover:shadow-soft transition-all duration-300 flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Shield className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground text-lg">Admin Login</h3>
                    <p className="text-sm text-muted-foreground">For library owner/manager</p>
                  </div>
                </button>

                <button
                  onClick={() => setMode('user')}
                  className="w-full p-6 rounded-lg border border-border bg-card hover:border-primary hover:shadow-soft transition-all duration-300 flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <User className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground text-lg">Member Login</h3>
                    <p className="text-sm text-muted-foreground">For library members</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {mode === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                  Admin Login
                </h2>
                <p className="text-muted-foreground">
                  Enter your admin credentials
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="input-styled mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-styled pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button type="submit" className="btn-hero w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          )}

          {mode === 'user' && (
            <form onSubmit={handleMemberLogin} className="space-y-6">
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                  Member Login
                </h2>
                <p className="text-muted-foreground">
                  Enter your member credentials
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="memberId">Member ID</Label>
                  <Input
                    id="memberId"
                    type="text"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    placeholder="Your Member ID"
                    className="input-styled mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="memberPassword">Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="memberPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-styled pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button type="submit" className="btn-hero w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account? Contact the library admin.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
