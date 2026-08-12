import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Fallback: si Supabase se queda colgado, forzamos la carga después de 5s
        const fallbackTimer = setTimeout(() => {
          if (mounted) setLoading(false);
        }, 5000);

        const { data, error } = await supabase.auth.getSession();
        
        clearTimeout(fallbackTimer);
        
        if (error) throw error;
        
        const session = data?.session;
        
        if (mounted) {
          setSession(session);
          if (session?.user?.email) {
            await fetchUserProfile(session.user.email);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Error inicializando sesión:', err);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setSession(session);
        if (session?.user?.email) {
          await fetchUserProfile(session.user.email);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (email) => {
    try {
      // Intentar buscar el perfil en ejecutivos por correo
      const { data: execs, error } = await supabase
        .from('ejecutivos')
        .select('*')
        .ilike('correo', email)
        .limit(1);

      if (error) {
        console.error('Error fetching user profile:', error);
      }

      let profile = execs && execs.length > 0 ? execs[0] : null;
      let teamIds = [];
      let teamNames = [];
      let isSuper = false;

      // Determinar rol
      let role = 'EJECUTIVO';
      const emailLower = email.toLowerCase();
      
      // Hardcode admin emails
      if (emailLower === 'belfor.aburto@t-sales.cl' || emailLower === 'belfor.aburto@t.sales.cl' || emailLower.includes('felipe.ruiz') || emailLower.includes('admin')) {
        role = 'ADMIN';
      } else if (profile) {
        const cargo = (profile.cargo || '').toUpperCase();
        if (cargo.includes('ADMIN')) {
          role = 'ADMIN';
        } else if (profile.es_supervisor || cargo.includes('SUPERVISOR')) {
          role = 'SUPERVISOR';
          isSuper = true;
        }
      }

      if (isSuper && profile) {
        const { data: teamData } = await supabase
          .from('ejecutivos')
          .select('id, nombre')
          .ilike('supervisor', profile.nombre);
        
        if (teamData) {
          teamIds = teamData.map(t => t.id);
          teamNames = teamData.map(t => t.nombre);
        }
        // Incluirse a si mismo en el equipo
        if (!teamIds.includes(profile.id)) {
          teamIds.push(profile.id);
          teamNames.push(profile.nombre);
        }
      }

      setUserProfile({
        ...profile,
        email: email,
        role: role,
        teamIds: teamIds,
        teamNames: teamNames,
        nombre: profile?.nombre || email.split('@')[0]
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
