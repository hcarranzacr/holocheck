import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../services/supabase/supabaseClient.js';
import { getUserProfile, logAuditEvent, USER_ROLES } from '../../services/supabase/authService.js';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const profile = await getUserProfile(userId);
      setUserProfile(profile);
      
      // Update last login timestamp
      if (profile) {
        await supabase
          .from('user_profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('user_id', userId);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            pillar_type: userData.pillarType || USER_ROLES.INDIVIDUAL,
            company_name: userData.companyName,
            organization_id: userData.organizationId
          }
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            pillar_type: userData.pillarType || USER_ROLES.INDIVIDUAL,
            company_id: userData.companyId || null,
            insurance_company_id: userData.insuranceCompanyId || null,
            hipaa_consent: userData.hipaaConsent || false,
            hipaa_consent_date: userData.hipaaConsent ? new Date().toISOString() : null,
            data_retention_consent: userData.dataRetentionConsent || false,
            data_retention_date: userData.dataRetentionConsent ? new Date().toISOString() : null,
            encrypted_personal_data: userData.encryptedPersonalData || {}
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Log signup event
        await logAuditEvent({
          user_id: data.user.id,
          action: 'USER_SIGNUP',
          resource_type: 'authentication',
          details: {
            pillar_type: userData.pillarType,
            email: email
          },
          success: true
        });
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Log failed login attempt
      await logAuditEvent({
        action: 'LOGIN_FAILED',
        resource_type: 'authentication',
        details: { 
          email: email,
          error: error.message 
        },
        success: false
      });
      
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Log logout event
      if (user) {
        await logAuditEvent({
          user_id: user.id,
          action: 'USER_LOGOUT',
          resource_type: 'authentication',
          success: true
        });
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setUserProfile(null);
      setSession(null);
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh profile
      await fetchUserProfile(user.id);
      
      // Log profile update
      await logAuditEvent({
        user_id: user.id,
        action: 'PROFILE_UPDATE',
        resource_type: 'user_profiles',
        details: { updated_fields: Object.keys(updates) },
        success: true
      });

      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      // Log password reset request
      await logAuditEvent({
        action: 'PASSWORD_RESET_REQUEST',
        resource_type: 'authentication',
        details: { email },
        success: true
      });

      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error };
    }
  };

  // Helper function to check if user has specific role
  const hasRole = (role) => {
    return userProfile?.pillar_type === role;
  };

  // Helper function to check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!session;
  };

  // Helper function to get user's pillar type
  const getPillarType = () => {
    return userProfile?.pillar_type || USER_ROLES.INDIVIDUAL;
  };

  const value = {
    // State
    user,
    userProfile,
    session,
    loading,
    
    // Actions
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    fetchUserProfile,
    
    // Helpers
    hasRole,
    isAuthenticated,
    getPillarType,
    
    // Constants
    USER_ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;