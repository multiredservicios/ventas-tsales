import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import VentasFijo from './pages/VentasFijo';
import VentasMovil from './pages/VentasMovil';
import VentasSSPP from './pages/VentasSSPP';
import Ejecutivos from './pages/Ejecutivos';
import AnalisisEjecutivo from './pages/AnalisisEjecutivo';
import Penalizaciones from './pages/Penalizaciones';
import Estadisticas from './pages/Estadisticas';
import Perfiles from './pages/Perfiles';
import VentasHuerfanas from './pages/VentasHuerfanas';
import AdminPanel from './pages/AdminPanel';
import AlertasCalidad from './pages/AlertasCalidad';
import Inicio from './pages/Inicio';
import MaestroVentas from './pages/MaestroVentas';
import ErrorBoundary from './ErrorBoundary';
import { supabase } from './supabaseClient';

/* ─── Íconos SVG ─── */
const Icons = {
  Inicio: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Fijo: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>,
  Movil: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>,
  SSPP: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M4 18h16"/><path d="M12 4 4 8h16l-8-4Z"/><path d="M6 10v4"/><path d="M10 10v4"/><path d="M14 10v4"/><path d="M18 10v4"/></svg>,
  Ejecutivos: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Penalizaciones: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  Estadisticas: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>,
  Perfiles: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Huerfanas: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Alertas: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Admin: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Ayuda: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Maestro: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Brand: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Logout: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
};

/* ─── Estilos del layout ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #F8FAFC; }

  /* ── Sidebar ── */
  .tv-sidebar {
    width: 240px;
    min-height: 100vh;
    background: #00695C;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    position: fixed;
    top: 0; left: 0;
    height: 100vh;
    z-index: 100;
  }

  /* Brand */
  .tv-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 22px 20px 18px;
    border-bottom: 1px solid rgba(255,255,255,.12);
  }
  .tv-brand-icon {
    width: 40px; height: 40px;
    background: rgba(255,255,255,.18);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    flex-shrink: 0;
  }
  .tv-brand-name {
    font-size: 22px; font-weight: 800;
    color: #fff; letter-spacing: -.5px;
  }

  /* Nav */
  .tv-nav {
    flex: 1;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
  }
  .tv-nav::-webkit-scrollbar { width: 0; }

  .tv-nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 10px;
    color: rgba(255,255,255,.75);
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: background .15s, color .15s;
  }
  .tv-nav-link:hover {
    background: rgba(255,255,255,.11);
    color: #fff;
  }
  .tv-nav-link.active {
    background: rgba(255,255,255,.2);
    color: #fff;
    font-weight: 600;
  }
  .tv-nav-icon {
    display: flex; align-items: center; justify-content: center;
    width: 20px; flex-shrink: 0;
  }

  .nav-section-title {
    font-size: 11px;
    font-weight: 700;
    color: rgba(255,255,255,.5);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 16px 0 8px 14px;
  }

  /* Help box */
  .tv-help {
    margin: 10px 12px 16px;
    padding: 16px;
    background: rgba(255,255,255,.09);
    border: 1px solid rgba(255,255,255,.13);
    border-radius: 12px;
  }
  .tv-help-title {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 700; color: #fff;
    margin-bottom: 6px;
  }
  .tv-help p {
    font-size: 12px; color: rgba(255,255,255,.7);
    line-height: 1.5; margin-bottom: 12px;
  }
  .tv-help-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    width: 100%; padding: 8px 0;
    background: rgba(255,255,255,.13);
    border: 1px solid rgba(255,255,255,.22);
    color: #fff; border-radius: 8px;
    font-size: 13px; font-weight: 600;
    cursor: pointer;
    transition: background .15s;
  }
  .tv-help-btn:hover { background: rgba(255,255,255,.22); }

  /* ── Topbar ── */
  .tv-topbar {
    position: fixed;
    top: 0; left: 240px; right: 0;
    height: 64px;
    background: #fff;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 32px;
    gap: 16px;
    z-index: 90;
  }

  .tv-bell {
    position: relative;
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 10px; cursor: pointer;
    color: #64748B;
    transition: background .15s, color .15s;
  }
  .tv-bell:hover { background: #F1F5F9; color: #0F172A; }
  .tv-bell-badge {
    position: absolute; top: 8px; right: 8px;
    width: 8px; height: 8px;
    background: #EF4444;
    border-radius: 50%;
  }

  .tv-user {
    display: flex; align-items: center; gap: 12px;
    padding: 6px 12px 6px 6px; border-radius: 12px;
    cursor: pointer;
    transition: background .15s;
  }
  .tv-user:hover { background: #F1F5F9; }
  .tv-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #00897B; color: #fff;
    font-size: 13px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .tv-username { font-size: 14px; font-weight: 600; color: #0F172A; line-height: 1.2; }
  .tv-role    { font-size: 12px; color: #64748B; }
  .tv-chevron { color: #94A3B8; display: flex; align-items: center; margin-left: 4px; }

  /* ── Main ── */
  .tv-main {
    margin-left: 240px;
    margin-top: 64px;
    min-height: calc(100vh - 64px);
    background: #F8FAFC;
    overflow-y: auto;
  }
`;

function StyleInjector() {
  if (typeof document !== 'undefined' && !document.getElementById('tv-layout-styles')) {
    const el = document.createElement('style');
    el.id = 'tv-layout-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
  }
  return null;
}

const NAV_ITEMS = [
  { to: '/inicio', label: 'Inicio', icon: <Icons.Inicio /> },
  { to: '/ventas-fijo',     label: 'Ventas Fijo',     icon: <Icons.Fijo /> },
  { to: '/ventas-movil',    label: 'Ventas Móvil',    icon: <Icons.Movil /> },
  { to: '/ventas-sspp',     label: 'SSPP',            icon: <Icons.SSPP /> },
  { to: '/maestro-ventas',  label: 'Maestro de Ventas', icon: <Icons.Maestro /> },
  { to: '/ejecutivos',      label: 'Ejecutivos',      icon: <Icons.Ejecutivos /> },
  { to: '/penalizaciones',  label: 'Penalizaciones',  icon: <Icons.Penalizaciones /> },
  { to: '/estadisticas',    label: 'Estadísticas',    icon: <Icons.Estadisticas /> },
];

function Sidebar() {
  const { pathname } = useLocation();
  const { userProfile } = useAuth();
  
  const isAdmin = userProfile?.role === 'ADMIN';

  return (
    <aside className="tv-sidebar">
      {/* Brand */}
      <div className="tv-brand">
        <div className="tv-brand-icon"><Icons.Brand /></div>
        <span className="tv-brand-name">Ventas</span>
      </div>

      {/* Navigation */}
      <nav className="tv-nav">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`tv-nav-link${pathname === to || (to !== '/' && pathname.startsWith(to)) ? ' active' : ''}`}
          >
            <span className="tv-nav-icon">{icon}</span>
            {label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="nav-section-title">ADMINISTRACIÓN</div>
            <Link to="/admin" className={`tv-nav-link ${pathname==='/admin'?'active':''}`}>
              <span className="tv-nav-icon"><Icons.Admin /></span> Panel de Administrador
            </Link>
            <Link to="/penalizaciones" className={`tv-nav-link ${pathname === '/penalizaciones' ? 'active' : ''}`}>
              <span className="tv-nav-icon"><Icons.Penalizaciones /></span> Penalizaciones
            </Link>
            <Link to="/perfiles" className={`tv-nav-link ${pathname === '/perfiles' ? 'active' : ''}`}>
              <span className="tv-nav-icon"><Icons.Perfiles /></span> Perfiles
            </Link>
            {/* <Link to="/alertas" className={`tv-nav-link ${pathname === '/alertas' ? 'active' : ''}`}>
              <span className="tv-nav-icon" style={{ color: 'var(--amber-dark)' }}><Icons.Alertas /></span> Alertas de Calidad
            </Link> */}
            <div className="nav-section-title">Análisis</div>
            <Link to="/ventas-huerfanas" className={`tv-nav-link ${pathname==='/ventas-huerfanas'?'active':''}`}>
              <span className="tv-nav-icon"><Icons.Huerfanas /></span> Ventas Huérfanas
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}

function Topbar() {
  const { userProfile } = useAuth();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const username = userProfile?.nombre || 'Usuario';
  const roleName = userProfile?.role === 'ADMIN' ? 'Administrador' : (userProfile?.role === 'SUPERVISOR' ? 'Supervisor' : 'Ejecutivo');

  return (
    <header className="tv-topbar">
      <div className="tv-bell">
        <Icons.Bell />
        <span className="tv-bell-badge"></span>
      </div>

      <div className="tv-user" onClick={handleLogout} title="Cerrar sesión">
        <div className="tv-avatar">{username.substring(0, 2).toUpperCase()}</div>
        <div>
          <div className="tv-username">{username}</div>
          <div className="tv-role">{roleName}</div>
        </div>
        <span className="tv-chevron"><Icons.Logout /></span>
      </div>
    </header>
  );
}

function MainApp() {
  const { session, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>Cargando sistema...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <Router>
      <StyleInjector />
      <Sidebar />
      <Topbar />

      <main className="tv-main">
        <ErrorBoundary>
          <Routes>
            <Route path="/"               element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio"         element={<Inicio />} />
            <Route path="/ventas-fijo"    element={<VentasFijo />} />
            <Route path="/ventas-movil"   element={<VentasMovil />} />
            <Route path="/ventas-sspp"    element={<VentasSSPP />} />
            <Route path="/ejecutivos"     element={<Ejecutivos />} />
            <Route path="/ejecutivos/:id" element={<AnalisisEjecutivo />} />
            <Route path="/penalizaciones" element={<Penalizaciones />} />
            <Route path="/alertas"        element={<AlertasCalidad />} />
            <Route path="/estadisticas"   element={<Estadisticas />} />
            <Route path="/perfiles"       element={<Perfiles />} />
            <Route path="/ventas-huerfanas" element={<VentasHuerfanas />} />
            <Route path="/maestro-ventas" element={<MaestroVentas />} />
            <Route path="/admin"          element={<AdminPanel />} />
            <Route path="*"               element={<Navigate to="/ejecutivos" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;