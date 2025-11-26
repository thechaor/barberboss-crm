import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; role: 'admin' | 'barber' | 'user' }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isBarber: boolean;
  userRole: 'admin' | 'barber' | 'user' | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBarber, setIsBarber] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'barber' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUserRole = async (userId: string): Promise<'admin' | 'barber' | 'user'> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error checking user role:', error);
        return 'user';
      }

      if (!data || data.length === 0) {
        return 'user';
      }

      // Check for admin first, then barber, default to user
      const roles = data.map(r => r.role);
      if (roles.includes('admin')) return 'admin';
      if (roles.includes('barber')) return 'barber';
      return 'user';
    } catch (error) {
      console.error('Error in checkUserRole:', error);
      return 'user';
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const role = await checkUserRole(session.user.id);
          setUserRole(role);
          setIsAdmin(role === 'admin');
          setIsBarber(role === 'barber');
        } else {
          setUserRole(null);
          setIsAdmin(false);
          setIsBarber(false);
        }
        
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const role = await checkUserRole(session.user.id);
        setUserRole(role);
        setIsAdmin(role === 'admin');
        setIsBarber(role === 'barber');
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          phone
        }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const role = await checkUserRole(user.id);
        return { error: null, role };
      }
    }

    return { error, role: 'user' as const };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsBarber(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, isAdmin, isBarber, userRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
