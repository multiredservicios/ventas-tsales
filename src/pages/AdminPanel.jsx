import React from 'react';
import { Link } from 'react-router-dom';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .admin-wrapper { padding: 32px; background: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; }
  .admin-header { margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-start; }
  .admin-header h1 { font-size: 28px; font-weight: 800; color: #0F172A; margin: 0 0 6px 0; letter-spacing: -0.5px; }
  .admin-header p { font-size: 15px; color: #64748B; margin: 0; }
  .admin-date { padding: 10px 16px; background: #fff; border: 1px solid #E2E8F0; border-radius: 10px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: #334155; }

  /* ── Stats ── */
  .admin-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; display: flex; align-items: center; gap: 16px; }
  .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .stat-info { flex: 1; }
  .stat-label { font-size: 12px; font-weight: 600; color: #64748B; margin-bottom: 4px; }
  .stat-value { font-size: 22px; font-weight: 800; color: #0F172A; line-height: 1; margin-bottom: 4px; }
  .stat-sub { font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
  .sub-up { color: #10B981; }
  .sub-neutral { color: #94A3B8; }

  /* ── Modules Grid ── */
  .admin-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
  .module-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; transition: box-shadow 0.2s; }
  .module-card:hover { box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01); }
  .module-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .module-icon-circle { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .module-title { font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 8px 0; }
  .module-desc { font-size: 13px; color: #64748B; line-height: 1.5; margin: 0 0 20px 0; flex: 1; }
  .module-link { font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 6px; text-decoration: none; transition: filter 0.2s; }
  .module-link:hover { filter: brightness(0.8); }

  /* ── Bottom Section ── */
  .bottom-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
  .panel-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; }
  .panel-title { font-size: 15px; font-weight: 700; color: #0F172A; margin: 0 0 16px 0; }
  
  /* Table */
  .admin-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .admin-table th { text-align: left; padding: 10px 4px; border-bottom: 1px solid #E2E8F0; color: #64748B; font-weight: 700; font-size: 10px; letter-spacing: 0.05em; }
  .admin-table td { padding: 12px 4px; border-bottom: 1px solid #F1F5F9; color: #334155; font-weight: 500; }
  .badge-status { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
  .badge-active { background: #ECFDF5; color: #059669; }
  .badge-inactive { background: #FEF2F2; color: #DC2626; }

  /* Activity List */
  .activity-list { display: flex; flex-direction: column; gap: 16px; }
  .activity-item { display: flex; gap: 12px; align-items: flex-start; }
  .activity-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .activity-text { font-size: 13px; color: #334155; margin-bottom: 4px; line-height: 1.4; }
  .activity-time { font-size: 11px; color: #94A3B8; }

  /* Chart Mockup */
  .chart-container { display: flex; align-items: center; justify-content: center; position: relative; margin: 20px 0; }
  .chart-donut { width: 140px; height: 140px; border-radius: 50%; background: conic-gradient(#10B981 0% 25%, #3B82F6 25% 47%, #F59E0B 47% 61%, #6366F1 61% 72%, #EC4899 72% 83%, #8B5CF6 83% 100%); display: flex; align-items: center; justify-content: center; }
  .chart-inner { width: 90px; height: 90px; border-radius: 50%; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .chart-inner-val { font-size: 20px; font-weight: 800; color: #0F172A; }
  .chart-inner-lbl { font-size: 10px; color: #64748B; text-align: center; line-height: 1.2; }
  .chart-legend { display: flex; flex-direction: column; gap: 8px; margin-left: 20px; }
  .legend-item { display: flex; align-items: center; font-size: 11px; color: #475569; }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; }
  .legend-val { margin-left: auto; font-weight: 600; color: #0F172A; }
  .legend-pct { color: #94A3B8; margin-left: 4px; }
  .btn-outline { width: 100%; padding: 10px; background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 13px; font-weight: 600; color: #0F172A; cursor: pointer; transition: background 0.15s; }
  .btn-outline:hover { background: #F8FAFC; }
`;

function AdminPanel() {
  const currentDate = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="admin-wrapper">
      <style>{STYLES}</style>
      
      <div className="admin-header">
        <div>
          <h1>Panel de Administrador</h1>
          <p>Gestiona usuarios, permisos, configuraciones y actividad del sistema.</p>
        </div>
        <div className="admin-date">
          <svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          <div>
            <div>{currentDate}</div>
            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>{currentTime} AM</div>
          </div>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Usuarios Totales</div>
            <div className="stat-value">28</div>
            <div className="stat-sub sub-up">▲ 3 este mes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Ejecutivos Activos</div>
            <div className="stat-value">45</div>
            <div className="stat-sub sub-up">▲ 5 este mes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Roles Configurados</div>
            <div className="stat-value">6</div>
            <div className="stat-sub sub-neutral">Sin cambios</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F8FAFC', color: '#64748B' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Accesos Activos</div>
            <div className="stat-value">72</div>
            <div className="stat-sub sub-up">▲ 8 este mes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F8FAFC', color: '#64748B' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>
          </div>
          <div className="stat-info">
            <div className="stat-label">Logs del Sistema</div>
            <div className="stat-value">1,256</div>
            <div className="stat-sub sub-neutral">Hoy</div>
          </div>
        </div>
      </div>

      <div className="admin-grid">
        <div className="module-card">
          <div className="module-header">
            <div>
              <h3 className="module-title">Gestión de Usuarios</h3>
              <p className="module-desc">Administra los usuarios del sistema, crea, edita y asigna roles.</p>
            </div>
            <div className="module-icon-circle" style={{ background: '#ECFDF5', color: '#10B981' }}>
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>
            </div>
          </div>
          <Link to="/perfiles" className="module-link" style={{ color: '#10B981' }}>Ver usuarios <span style={{ fontSize: 16 }}>→</span></Link>
        </div>

        <div className="module-card">
          <div className="module-header">
            <div>
              <h3 className="module-title">Roles y Permisos</h3>
              <p className="module-desc">Define roles y permisos de acceso a módulos y funcionalidades.</p>
            </div>
            <div className="module-icon-circle" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
          </div>
          <Link to="/perfiles" className="module-link" style={{ color: '#3B82F6' }}>Ver roles <span style={{ fontSize: 16 }}>→</span></Link>
        </div>

        <div className="module-card">
          <div className="module-header">
            <div>
              <h3 className="module-title">Ejecutivos y Accesos</h3>
              <p className="module-desc">Controla qué ejecutivos pueden ver qué información y módulos.</p>
            </div>
            <div className="module-icon-circle" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
          <Link to="/ejecutivos" className="module-link" style={{ color: '#8B5CF6' }}>Administrar <span style={{ fontSize: 16 }}>→</span></Link>
        </div>

        <div className="module-card">
          <div className="module-header">
            <div>
              <h3 className="module-title">Configuraciones Generales</h3>
              <p className="module-desc">Ajusta la configuración global del CRM y parámetros del sistema.</p>
            </div>
            <div className="module-icon-circle" style={{ background: '#FFFBEB', color: '#F59E0B' }}>
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
          </div>
          <Link to="/perfiles" className="module-link" style={{ color: '#F59E0B' }}>Configurar <span style={{ fontSize: 16 }}>→</span></Link>
        </div>

        <div className="module-card">
          <div className="module-header">
            <div>
              <h3 className="module-title">Logs de Actividad</h3>
              <p className="module-desc">Revisa la actividad del sistema y acciones realizadas por usuarios.</p>
            </div>
            <div className="module-icon-circle" style={{ background: '#F0FDFA', color: '#0D9488' }}>
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m16 13-3.5 3.5-2-2L8 17"/></svg>
            </div>
          </div>
          <a href="#" className="module-link" style={{ color: '#0D9488' }}>Ver logs <span style={{ fontSize: 16 }}>→</span></a>
        </div>

        <div className="module-card">
          <div className="module-header">
            <div>
              <h3 className="module-title">Respaldo y Seguridad</h3>
              <p className="module-desc">Gestiona respaldos, seguridad y recuperación de datos.</p>
            </div>
            <div className="module-icon-circle" style={{ background: '#FEF2F2', color: '#EF4444' }}>
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/><rect width="8" height="6" x="8" y="10" rx="1" ry="1"/><path d="M12 10V8a2 2 0 0 0-4 0v2"/></svg>
            </div>
          </div>
          <a href="#" className="module-link" style={{ color: '#EF4444' }}>Administrar <span style={{ fontSize: 16 }}>→</span></a>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="panel-card">
          <h3 className="panel-title">Usuarios Recientes</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>USUARIO</th>
                <th>ROL</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 700 }}>belfor.aburto</td>
                <td>Administrador</td>
                <td><span className="badge-status badge-active">Activo</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700 }}>danilo.alvarez</td>
                <td>Supervisor</td>
                <td><span className="badge-status badge-active">Activo</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700 }}>maria.gomez</td>
                <td>Ejecutivo</td>
                <td><span className="badge-status badge-active">Activo</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700 }}>carlos.perez</td>
                <td>Ejecutivo</td>
                <td><span className="badge-status badge-inactive">Inactivo</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="panel-card">
          <h3 className="panel-title">Actividad Reciente</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
              <div>
                <div className="activity-text"><strong>belfor.aburto</strong> creó un nuevo usuario</div>
                <div className="activity-time">Hace 15 min</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <div className="activity-text"><strong>danilo.alvarez</strong> actualizó permisos del rol Supervisor</div>
                <div className="activity-time">Hace 1 hora</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon" style={{ background: '#F0FDFA', color: '#0D9488' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/></svg>
              </div>
              <div>
                <div className="activity-text"><strong>maria.gomez</strong> accedió al módulo de Penalizaciones</div>
                <div className="activity-time">Hace 2 horas</div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="panel-title">Accesos por Módulo</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <div className="chart-container">
              <div className="chart-donut">
                <div className="chart-inner">
                  <div className="chart-inner-val">72</div>
                  <div className="chart-inner-lbl">Accesos<br/>Totales</div>
                </div>
              </div>
              <div className="chart-legend">
                <div className="legend-item"><div className="legend-dot" style={{ background: '#10B981' }}></div>Ventas Fijo <span className="legend-val">18</span><span className="legend-pct">(25%)</span></div>
                <div className="legend-item"><div className="legend-dot" style={{ background: '#3B82F6' }}></div>Ventas Móvil <span className="legend-val">16</span><span className="legend-pct">(22%)</span></div>
                <div className="legend-item"><div className="legend-dot" style={{ background: '#F59E0B' }}></div>Penalizaciones <span className="legend-val">14</span><span className="legend-pct">(19%)</span></div>
                <div className="legend-item"><div className="legend-dot" style={{ background: '#6366F1' }}></div>SSPP <span className="legend-val">10</span><span className="legend-pct">(14%)</span></div>
                <div className="legend-item"><div className="legend-dot" style={{ background: '#EC4899' }}></div>Estadísticas <span className="legend-val">8</span><span className="legend-pct">(11%)</span></div>
                <div className="legend-item"><div className="legend-dot" style={{ background: '#8B5CF6' }}></div>Perfiles <span className="legend-val">6</span><span className="legend-pct">(8%)</span></div>
              </div>
            </div>
          </div>
          <button className="btn-outline">Ver detalle de accesos</button>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
