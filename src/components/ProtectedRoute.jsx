// src/components/ProtectedRoute.jsx - Client Portal Version
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ProtectedRoute = ({ children, session, requiredRoles = ['standard'] }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    checkAuthorization();
  }, [session, requiredRoles]);

  const checkAuthorization = async () => {
    try {
      // First check if we have a session
      let currentSession = session;
      
      // If no session prop, get it from Supabase
      if (!currentSession) {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        currentSession = authSession;
      }
      
      if (!currentSession) {
        setLoading(false);
        setAuthorized(false);
        return;
      }

      // Get user profile with role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', currentSession.user.id)
        .single();

      if (error || !profile) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        setAuthorized(false);
        return;
      }

      setUserProfile(profile);
      setUserRole(profile.role);

      // Client portal only allows 'standard' role
      if (profile.role !== 'standard') {
        // Non-client users should go to admin portal
        setAuthorized(false);
        window.location.href = 'https://admin.rule27design.com';
        return;
      }

      // Check if onboarding is completed (unless on setup-profile page)
      if (!profile.onboarding_completed && !window.location.pathname.includes('setup-profile')) {
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    } catch (error) {
      console.error('Authorization error:', error);
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    // Determine where to redirect based on context
    if (!session) {
      // No session - go to login
      return <Navigate to="/login" replace />;
    } else if (!userProfile?.onboarding_completed) {
      // Onboarding not complete
      return <Navigate to="/setup-profile" replace />;
    } else {
      // Default to login
      return <Navigate to="/login" replace />;
    }
  }

  // Clone children and pass userProfile as prop
  return React.cloneElement(children, { userProfile, setUserProfile });
};

export default ProtectedRoute;