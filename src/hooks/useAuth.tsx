import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  userRole: 'admin' | 'customer' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'customer' | null>(null);

  useEffect(() => {
    console.log('useAuth: Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: Auth state change event:', event, { userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('useAuth: User authenticated, fetching role');
          // Fetch user role with retry logic
          const fetchUserRole = async (retryCount = 0) => {
            try {
              const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .single();
              
              if (roleError) {
                console.error('useAuth: Error fetching user role:', roleError);
                if (retryCount < 3) {
                  console.log(`useAuth: Retrying role fetch (attempt ${retryCount + 1})`);
                  setTimeout(() => fetchUserRole(retryCount + 1), 1000 * (retryCount + 1));
                  return;
                }
                console.log('useAuth: Role fetch failed after retries, defaulting to customer');
                setUserRole('customer'); // Default to customer if role fetch fails
              } else {
                console.log('useAuth: User role fetched:', roleData?.role);
                setUserRole(roleData?.role || 'customer');
              }
            } catch (error) {
              console.error('useAuth: Unexpected error fetching user role:', error);
              if (retryCount < 3) {
                console.log(`useAuth: Retrying role fetch after error (attempt ${retryCount + 1})`);
                setTimeout(() => fetchUserRole(retryCount + 1), 1000 * (retryCount + 1));
                return;
              }
              setUserRole('customer');
            }
          };
          
          // Start fetching role with a small delay to ensure auth is complete
          setTimeout(() => fetchUserRole(), 500);
        } else {
          console.log('useAuth: No user session, clearing role');
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    console.log('useAuth: Getting initial session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('useAuth: Initial session:', { userId: session?.user?.id });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('useAuth: Attempting sign in with Supabase');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('useAuth: Supabase sign in error:', error);
      } else {
        console.log('useAuth: Supabase sign in successful:', { user: data.user?.id, session: !!data.session });
        
        // If sign in is successful, try to fetch user role immediately
        if (data.user) {
          try {
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', data.user.id)
              .single();
            
            if (!roleError && roleData) {
              console.log('useAuth: User role fetched during sign in:', roleData.role);
              setUserRole(roleData.role);
            } else {
              console.log('useAuth: Could not fetch role during sign in, will retry later');
            }
          } catch (roleError) {
            console.log('useAuth: Role fetch error during sign in, will retry later:', roleError);
          }
        }
      }
      
      return { error };
    } catch (catchError) {
      console.error('useAuth: Unexpected error during sign in:', catchError);
      return { error: catchError };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};