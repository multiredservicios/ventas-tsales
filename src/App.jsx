import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import VentasFijo from './pages/VentasFijo';
import VentasMovil from './pages/VentasMovil';
import VentasSSPP from './pages/VentasSSPP';
import Ejecutivos from './pages/Ejecutivos';
import AnalisisEjecutivo from './pages/AnalisisEjecutivo';
import Estadisticas from './pages/Estadisticas';

/* ─── Estilos del layout ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #F8FAFC; }

  /* ── Sidebar ── */
  .tv-sidebar {
    width: 230px;
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
    gap: 10px;
    padding: 22px 18px 18px;
    border-bottom: 1px solid rgba(255,255,255,.12);
  }
  .tv-brand-icon {
    width: 38px; height: 38px;
    background: rgba(255,255,255,.18);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }
  .tv-brand-name {
    font-size: 21px; font-weight: 800;
    color: #fff; letter-spacing: -.4px;
  }

  /* Nav */
  .tv-nav {
    flex: 1;
    padding: 14px 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    overflow-y: auto;
  }
  .tv-nav::-webkit-scrollbar { width: 0; }

  .tv-nav-link {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 13px;
    border-radius: 10px;
    color: rgba(255,255,255,.68);
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
    font-weight: 700;
  }
  .tv-nav-icon {
    width: 22px; text-align: center;
    font-size: 16px; flex-shrink: 0;
  }

  /* Help box */
  .tv-help {
    margin: 10px 10px 14px;
    padding: 14px 15px;
    background: rgba(255,255,255,.09);
    border: 1px solid rgba(255,255,255,.13);
    border-radius: 12px;
  }
  .tv-help-title {
    display: flex; align-items: center; gap: 7px;
    font-size: 13px; font-weight: 700; color: #fff;
    margin-bottom: 5px;
  }
  .tv-help p {
    font-size: 11.5px; color: rgba(255,255,255,.62);
    line-height: 1.5; margin-bottom: 11px;
  }
  .tv-help-btn {
    display: flex; align-items: center; justify-content: center; gap: 5px;
    width: 100%; padding: 7px 0;
    background: rgba(255,255,255,.13);
    border: 1px solid rgba(255,255,255,.22);
    color: #fff; border-radius: 8px;
    font-size: 12px; font-weight: 600;
    cursor: pointer;
    transition: background .15s;
  }
  .tv-help-btn:hover { background: rgba(255,255,255,.22); }

  /* ── Topbar ── */
  .tv-topbar {
    position: fixed;
    top: 0; left: 230px; right: 0;
    height: 62px;
    background: #fff;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 28px;
    gap: 12px;
    z-index: 90;
  }

  .tv-bell {
    position: relative;
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px; cursor: pointer;
    color: #64748B; font-size: 19px;
    transition: background .12s;
  }
  .tv-bell:hover { background: #F1F5F9; }
  .tv-bell-badge {
    position: absolute; top: 5px; right: 4px;
    width: 16px; height: 16px;
    background: #EF4444; color: #fff;
    font-size: 9px; font-weight: 700;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 1.5px solid #fff;
  }

  .tv-user {
    display: flex; align-items: center; gap: 10px;
    padding: 5px 10px; border-radius: 10px;
    cursor: pointer;
    transition: background .12s;
  }
  .tv-user:hover { background: #F1F5F9; }
  .tv-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #00897B; color: #fff;
    font-size: 13px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .tv-username { font-size: 13px; font-weight: 700; color: #0F172A; line-height: 1.2; }
  .tv-role    { font-size: 11px; color: #94A3B8; }
  .tv-chevron { font-size: 12px; color: #94A3B8; }

  /* ── Main ── */
  .tv-main {
    margin-left: 230px;
    margin-top: 62px;
    min-height: calc(100vh - 62px);
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
  { to: '/ventas-fijo',  label: 'Ventas Fijo',   icon: '📁' },
  { to: '/ventas-movil', label: 'Ventas Móvil',   icon: '📱' },
  { to: '/ventas-sspp',  label: 'SSPP',           icon: '🏛️' },
  { to: '/ejecutivos',   label: 'Ejecutivos',     icon: '👥' },
  { to: '/estadisticas', label: 'Estadísticas',   icon: '📊' },
];

function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="tv-sidebar">
      {/* Brand */}
      <div className="tv-brand">
        <div className="tv-brand-icon">📡</div>
        <span className="tv-brand-name">TeleVentas</span>
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
      </nav>

      {/* Help box */}
      <div className="tv-help">
        <div className="tv-help-title">
          <span>🎧</span> ¿Necesitas ayuda?
        </div>
        <p>Consulta la guía de uso o contacta a soporte.</p>
        <button className="tv-help-btn">📖 Ver guía</button>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="tv-topbar">
      <div className="tv-bell">
        🔔
        <span className="tv-bell-badge">3</span>
      </div>

      <div className="tv-user">
        <div className="tv-avatar">EV</div>
        <div>
          <div className="tv-username">Equipo Ventas</div>
          <div className="tv-role">Administrador</div>
        </div>
        <span className="tv-chevron">▾</span>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <StyleInjector />
      <Sidebar />
      <Topbar />

      <main className="tv-main">
        <Routes>
          <Route path="/"              element={<VentasFijo />} />
          <Route path="/ventas-fijo"   element={<VentasFijo />} />
          <Route path="/ventas-movil"  element={<VentasMovil />} />
          <Route path="/ventas-sspp"  element={<VentasSSPP />} />
          <Route path="/ejecutivos"    element={<Ejecutivos />} />
          <Route path="/ejecutivos/:id" element={<AnalisisEjecutivo />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;