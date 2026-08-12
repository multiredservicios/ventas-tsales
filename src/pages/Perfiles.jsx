import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .perf-wrapper { padding: 32px; background: #F8FAFC; min-height: 100vh; font-family: 'Inter', sans-serif; color: #0F172A; }
  .perf-header { margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
  .perf-title { font-size: 26px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.5px; }
  .perf-desc { font-size: 15px; color: #64748B; margin: 0; }
  
  .btn-primary { background: #00695C; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background .15s; }
  .btn-primary:hover { background: #004D40; }
  
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; position: relative; overflow: hidden; }
  .stat-title { font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px; }
  .stat-val { font-size: 28px; font-weight: 800; color: #0F172A; margin-bottom: 4px; line-height: 1; }
  .stat-sub { font-size: 12px; color: #94A3B8; }
  .stat-icon { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0.15; }
  
  .main-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
  .perf-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; }
  .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .card-title { font-size: 16px; font-weight: 700; margin: 0; }
  
  /* Roles List */
  .role-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #F1F5F9; }
  .role-item:last-child { border-bottom: none; }
  .role-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .role-name { font-size: 14px; font-weight: 700; color: #1E293B; margin-bottom: 2px; }
  .role-desc { font-size: 11px; color: #64748B; line-height: 1.3; }
  .role-count { margin-left: auto; background: #F1F5F9; color: #475569; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 12px; }
  
  /* Users Table */
  .search-box { position: relative; flex: 1; max-width: 300px; }
  .search-box input { width: 100%; padding: 8px 12px 8px 36px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 13px; outline: none; }
  .search-icon { position: absolute; left: 12px; top: 9px; color: #94A3B8; }
  
  .users-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .users-table th { text-align: left; padding: 12px 8px; border-bottom: 1px solid #E2E8F0; color: #64748B; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  .users-table td { padding: 14px 8px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
  
  .user-cell { display: flex; align-items: center; gap: 10px; }
  .user-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  .user-name { font-weight: 700; color: #0F172A; }
  .user-email { font-size: 11px; color: #94A3B8; margin-top: 2px; }
  
  .badge-role { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
  .badge-role.superadmin { background: #FEE2E2; color: #DC2626; }
  .badge-role.supervisor { background: #EFF6FF; color: #2563EB; }
  .badge-role.ejecutivo { background: #ECFDF5; color: #059669; }
  
  .badge-status { font-size: 11px; font-weight: 600; }
  .badge-status.active { color: #10B981; }
  .badge-status.inactive { color: #EF4444; }
  
  .action-btn { background: none; border: none; color: #94A3B8; cursor: pointer; padding: 4px; border-radius: 4px; }
  .action-btn:hover { background: #F1F5F9; color: #0F172A; }

  /* Tree */
  .tree-node { border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 8px; overflow: hidden; }
  .tree-header { padding: 12px 16px; background: #F8FAFC; display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; }
  .tree-header:hover { background: #F1F5F9; }
  .tree-icon { color: #3B82F6; }
  .tree-title { font-size: 13px; font-weight: 700; color: #0F172A; }
  .tree-count { font-size: 12px; color: #64748B; font-weight: 500; }
  .tree-arrow { margin-left: auto; color: #94A3B8; transition: transform 0.2s; }
  .tree-body { padding: 8px 16px 12px 40px; background: #fff; border-top: 1px solid #E2E8F0; display: flex; flexDirection: column; gap: 8px; }
  .tree-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569; }
  
  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.5); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .modal-box { background: #fff; border-radius: 12px; width: 440px; max-width: 90vw; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,.1); }
  .modal-header { padding: 20px 24px; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; }
  .modal-title { font-size: 18px; font-weight: 700; margin: 0; }
  .modal-close { background: none; border: none; font-size: 20px; color: #94A3B8; cursor: pointer; }
  .modal-body { padding: 24px; }
  .modal-footer { padding: 16px 24px; background: #F8FAFC; border-top: 1px solid #E2E8F0; display: flex; justify-content: flex-end; gap: 12px; }
  
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; }
  .form-input { width: 100%; padding: 10px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 14px; outline: none; }
  .form-input:focus { border-color: #00695C; }
  .form-select { width: 100%; padding: 10px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 14px; outline: none; background: #fff; }
  
  .btn-ghost { background: none; border: 1px solid #CBD5E1; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; }
  .btn-ghost:hover { background: #F1F5F9; }
  
  .checkbox-list { max-height: 300px; overflow-y: auto; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px; }
  .checkbox-item { display: flex; align-items: center; gap: 12px; padding: 8px; border-bottom: 1px solid #F1F5F9; cursor: pointer; }
  .checkbox-item:last-child { border-bottom: none; }
  .checkbox-item:hover { background: #F8FAFC; }

  /* Pagination */
  .pagination { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-top: 1px solid #E2E8F0; }
  .pagination-info { font-size: 13px; color: #64748B; }
  .pagination-controls { display: flex; gap: 8px; }
  .btn-page { background: #fff; border: 1px solid #CBD5E1; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; }
  .btn-page:hover:not(:disabled) { background: #F1F5F9; }
  .btn-page:disabled { opacity: 0.5; cursor: not-allowed; }
`;

function getInitials(name) {
  if (!name) return 'US';
  return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
}

function getColor(name) {
  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#14B8A6', '#0EA5E9'];
  let sum = 0;
  for(let i=0; i<name.length; i++) sum += name.charCodeAt(i);
  return colors[sum % colors.length];
}

function Perfiles() {
  const { userProfile } = useAuth();
  const isAuthorized = userProfile?.role === 'ADMIN';

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [search, setSearch] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const [modalRolesAbierto, setModalRolesAbierto] = useState(false);
  const [modalCuentasAbierto, setModalCuentasAbierto] = useState(false);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', rol: 'Ejecutivo', supervisor: '' });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const [modalAsignar, setModalAsignar] = useState(null); // id del ejecutivo a asignar
  const [nuevoSupervisor, setNuevoSupervisor] = useState('');

  const [modalEquipo, setModalEquipo] = useState(null); // supervisor al que se le asigaran ejecutivos
  const [equipoSeleccionado, setEquipoSeleccionado] = useState([]);

  useEffect(() => {
    if (isAuthorized) cargarUsuarios();
  }, [isAuthorized]);

  const cargarUsuarios = async () => {
    setCargando(true);
    // Usuarios son los ejecutivos que tienen correo o son importantes
    // Para simplificar y simular los usuarios reales, traemos todos los ejecutivos con correo + los supervisores
    const { data } = await supabase
      .from('ejecutivos')
      .select('*')
      .or('correo.not.is.null,es_supervisor.eq.true')
      .order('nombre');
    
    setUsuarios(data || []);
    setCargando(false);
  };

  const supervisores = usuarios.filter(u => u.es_supervisor || u.cargo?.toUpperCase().includes('SUPERVISOR'));
  const ejecutivos = usuarios.filter(u => !u.es_supervisor && !u.cargo?.toUpperCase().includes('SUPERVISOR'));

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ type: 'info', text: 'Creando cuenta...' });

    try {
      // 1. Crear en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.correo,
        password: form.password,
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log('El usuario ya existe en Auth, procediendo a insertarlo en ejecutivos...');
        } else {
          throw new Error(authError.message);
        }
      }

      // 2. Insertar o actualizar en ejecutivos
      // Buscar si ya existe por correo o nombre
      const { data: existing } = await supabase.from('ejecutivos').select('id').eq('correo', form.correo).maybeSingle();
      
      const payload = {
        nombre: form.nombre,
        correo: form.correo,
        cargo: form.rol,
        es_supervisor: form.rol === 'Supervisor',
        supervisor: form.rol === 'Ejecutivo' ? form.supervisor : 'Sin Supervisor',
        activo: true,
      };

      if (existing) {
        await supabase.from('ejecutivos').update(payload).eq('id', existing.id);
      } else {
        await supabase.from('ejecutivos').insert([payload]);
      }

      setMensaje({ type: 'success', text: `Usuario ${form.nombre} creado exitosamente.` });
      setForm({ nombre: '', correo: '', password: '', rol: 'Ejecutivo', supervisor: '' });
      cargarUsuarios();
      setTimeout(() => setModalAbierto(false), 2000);
    } catch (err) {
      setMensaje({ type: 'error', text: err.message });
    } finally {
      setGuardando(false);
    }
  };

  const handleAsignarSupervisor = async (e) => {
    e.preventDefault();
    if (!modalAsignar) return;
    setGuardando(true);
    try {
      await supabase.from('ejecutivos').update({ supervisor: nuevoSupervisor }).eq('id', modalAsignar.id);
      await cargarUsuarios();
      setModalAsignar(null);
    } catch (err) {
      alert("Error al asignar supervisor");
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarEquipo = async () => {
    if (!modalEquipo) return;
    setGuardando(true);
    try {
      // Primero, quitar este supervisor a todos sus ejecutivos actuales
      const actuales = ejecutivos.filter(e => e.supervisor === modalEquipo.nombre);
      const aQuitar = actuales.filter(e => !equipoSeleccionado.includes(e.id));
      const aAgregar = equipoSeleccionado.filter(id => !actuales.map(a => a.id).includes(id));

      if (aQuitar.length > 0) {
        await supabase.from('ejecutivos').update({ supervisor: 'Sin Supervisor' }).in('id', aQuitar.map(e => e.id));
      }
      if (aAgregar.length > 0) {
        await supabase.from('ejecutivos').update({ supervisor: modalEquipo.nombre }).in('id', aAgregar);
      }
      
      await cargarUsuarios();
      setModalEquipo(null);
    } catch (err) {
      alert("Error al guardar equipo");
    } finally {
      setGuardando(false);
    }
  };

  const handleActualizarRol = async (user, nuevoRol) => {
    try {
      const payload = {
        cargo: nuevoRol,
        es_supervisor: nuevoRol === 'Supervisor'
      };
      await supabase.from('ejecutivos').update(payload).eq('id', user.id);
      cargarUsuarios();
    } catch (err) {
      alert("Error al actualizar rol");
    }
  };

  const usuariosReales = usuarios.filter(u => u.correo && u.correo.includes('@') && !u.correo.includes('pendiente'));

  const filtered = usuarios.filter(u => 
    u.nombre?.toLowerCase().includes(search.toLowerCase()) || 
    u.correo?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!isAuthorized) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
        <h2>Acceso Denegado</h2>
        <p>No tienes los permisos necesarios para ver esta página.</p>
      </div>
    );
  }

  // Agrupar ejecutivos por supervisor para el arbol
  const treeData = supervisores.map(sup => {
    return {
      sup,
      miembros: ejecutivos.filter(e => e.supervisor === sup.nombre)
    };
  });

  return (
    <div className="perf-wrapper">
      <style>{STYLES}</style>
      
      <div className="perf-header">
        <div>
          <h1 className="perf-title">Perfiles y Usuarios</h1>
          <p className="perf-desc">Administra usuarios, roles, permisos y la estructura de supervisores y ejecutivos.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setModalRolesAbierto(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Roles y Permisos
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setModalCuentasAbierto(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            Cuentas Creadas
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#10B981', color: '#10B981' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
          <div className="stat-title">Total Usuarios</div>
          <div className="stat-val">{usuarios.length}</div>
          <div className="stat-sub">Usuarios registrados</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3B82F6', color: '#3B82F6' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div className="stat-title">Supervisores</div>
          <div className="stat-val">{supervisores.length}</div>
          <div className="stat-sub">Con permisos de supervisión</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F59E0B', color: '#F59E0B' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
          <div className="stat-title">Ejecutivos</div>
          <div className="stat-val">{ejecutivos.length}</div>
          <div className="stat-sub">Cuentas ejecutivas activas</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EC4899', color: '#EC4899' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
          <div className="stat-title">Perfiles/Roles</div>
          <div className="stat-val">3</div>
          <div className="stat-sub">Roles del sistema</div>
        </div>
      </div>

      <div className="main-grid">
        {/* Usuarios Table */}
        <div className="perf-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '20px 20px 0' }}>
            <h3 className="card-title">Usuarios</h3>
            <div className="search-box">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" placeholder="Buscar usuario..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
          </div>
          
          <div style={{ overflowX: 'auto', padding: '0 20px 20px', marginTop: 16 }}>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Supervisor</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>{cargando ? 'Cargando usuarios...' : 'No hay usuarios que coincidan'}</td></tr>
                )}
                {currentItems.map(u => {
                  const isSup = u.es_supervisor || u.cargo?.toUpperCase().includes('SUPERVISOR');
                  const isAdmin = u.correo === 'belfor.aburto@t-sales.cl' || u.correo?.includes('admin');
                  const roleLabel = isAdmin ? 'Super Admin' : (isSup ? 'Supervisor' : 'Ejecutivo');
                  const roleClass = isAdmin ? 'superadmin' : (isSup ? 'supervisor' : 'ejecutivo');

                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar" style={{ background: getColor(u.nombre || 'A') }}>
                            {getInitials(u.nombre)}
                          </div>
                          <div>
                            <div className="user-name">{u.nombre || 'Sin nombre'}</div>
                            <div className="user-email">{u.correo || 'Sin correo'}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge-role ${roleClass}`}>{roleLabel}</span></td>
                      <td style={{ color: '#475569', fontSize: 12 }}>
                        {isSup ? '-' : (u.supervisor || 'Sin asignar')}
                      </td>
                      <td>
                        <span className={`badge-status ${u.activo !== false ? 'active' : 'inactive'}`}>
                          {u.activo !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {!isSup && !isAdmin && (
                            <button className="action-btn" title="Asignar Supervisor" onClick={() => setModalAsignar(u)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                            </button>
                          )}
                          {isSup && !isAdmin && (
                            <button className="action-btn" title="Administrar Equipo" onClick={() => {
                              setModalEquipo(u);
                              setEquipoSeleccionado(ejecutivos.filter(e => e.supervisor === u.nombre).map(e => e.id));
                            }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length} usuarios
              </div>
              <div className="pagination-controls">
                <button 
                  className="btn-page" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
                <button 
                  className="btn-page" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Estructura de Supervisores */}
        <div className="perf-card">
          <div className="card-header">
            <h3 className="card-title">Estructura de Supervisores</h3>
          </div>
          <div>
            {treeData.map((node, i) => (
              <details className="tree-node" key={i}>
                <summary className="tree-header">
                  <div className="user-avatar" style={{ background: getColor(node.sup.nombre), width: 24, height: 24, fontSize: 10 }}>
                    {getInitials(node.sup.nombre)}
                  </div>
                  <div>
                    <div className="tree-title">{node.sup.nombre}</div>
                    <div className="tree-count">{node.miembros.length} ejecutivos</div>
                  </div>
                  <svg className="tree-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                </summary>
                <div className="tree-body">
                  {node.miembros.length === 0 && <span style={{ fontSize: 11, color: '#94A3B8' }}>Sin ejecutivos asignados</span>}
                  {node.miembros.map(m => (
                    <div className="tree-item" key={m.id}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {m.nombre}
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 12, background: '#ECFDF5', borderRadius: 8, fontSize: 11, color: '#065F46', display: 'flex', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Los ejecutivos solo pueden ver los datos asignados por su supervisor mediante RBAC.
          </div>
        </div>
      </div>

      {/* Modal Roles y Permisos */}
      {modalRolesAbierto && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: 440 }}>
            <div className="modal-header">
              <h3 className="modal-title">Roles y Permisos</h3>
              <button className="modal-close" onClick={() => setModalRolesAbierto(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '0 24px 24px' }}>
              <div className="role-list">
                <div className="role-item">
                  <div className="role-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>👑</div>
                  <div>
                    <div className="role-name">Super Admin</div>
                    <div className="role-desc">Acceso total al sistema</div>
                  </div>
                  <div className="role-count">1</div>
                </div>
                <div className="role-item">
                  <div className="role-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>🛡️</div>
                  <div>
                    <div className="role-name">Supervisor</div>
                    <div className="role-desc">Puede ver y gestionar sus ejecutivos</div>
                  </div>
                  <div className="role-count">{supervisores.length}</div>
                </div>
                <div className="role-item">
                  <div className="role-icon" style={{ background: '#ECFDF5', color: '#059669' }}>👤</div>
                  <div>
                    <div className="role-name">Ejecutivo</div>
                    <div className="role-desc">Acceso limitado a sus datos</div>
                  </div>
                  <div className="role-count">{ejecutivos.length}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={() => setModalRolesAbierto(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cuentas Creadas */}
      {modalCuentasAbierto && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: 600 }}>
            <div className="modal-header">
              <h3 className="modal-title">Cuentas Creadas</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-primary" style={{ padding: '6px 12px' }} onClick={() => { setMensaje(null); setModalAbierto(true); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Nuevo Usuario
                </button>
                <button className="modal-close" onClick={() => setModalCuentasAbierto(false)}>&times;</button>
              </div>
            </div>
            <div className="modal-body" style={{ padding: '16px 24px' }}>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
                Estas son las {usuariosReales.length} cuentas con acceso real al sistema. Puedes modificar sus roles aquí.
              </p>
              <div className="checkbox-list" style={{ maxHeight: '400px' }}>
                {usuariosReales.map(u => {
                  const isSup = u.es_supervisor || u.cargo?.toUpperCase().includes('SUPERVISOR');
                  const isAdmin = u.cargo?.toUpperCase().includes('ADMIN') || u.correo === 'belfor.aburto@t-sales.cl' || u.correo?.includes('admin');
                  const currentRole = isAdmin ? 'Admin' : (isSup ? 'Supervisor' : 'Ejecutivo');

                  return (
                    <div key={u.id} className="checkbox-item" style={{ cursor: 'default', display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div className="user-avatar" style={{ background: getColor(u.nombre || 'A') }}>
                          {getInitials(u.nombre)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{u.nombre}</span>
                          <span style={{ fontSize: 11, color: '#64748B' }}>{u.correo}</span>
                        </div>
                      </div>
                      <select 
                        className="form-select" 
                        style={{ width: '130px', padding: '6px', fontSize: '12px' }}
                        value={currentRole}
                        onChange={(e) => handleActualizarRol(u, e.target.value)}
                        disabled={u.correo === 'belfor.aburto@t-sales.cl' || u.correo === 'belfor.aburto@t.sales.cl'}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Ejecutivo">Ejecutivo</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={() => setModalCuentasAbierto(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Usuario */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Nuevo Usuario</h3>
              <button className="modal-close" onClick={() => setModalAbierto(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {mensaje && (
                <div style={{ padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13, background: mensaje.type === 'error' ? '#FEE2E2' : '#DCFCE7', color: mensaje.type === 'error' ? '#991B1B' : '#166534' }}>
                  {mensaje.text}
                </div>
              )}
              <form id="form-user" onSubmit={handleCrearUsuario}>
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input type="text" className="form-input" required value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} placeholder="Ej. Ana Contreras" />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input type="email" className="form-input" required value={form.correo} onChange={e=>setForm({...form, correo: e.target.value})} placeholder="ana@empresa.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input type="password" className="form-input" required minLength={6} value={form.password} onChange={e=>setForm({...form, password: e.target.value})} placeholder="Mínimo 6 caracteres" />
                </div>
                <div className="form-group">
                  <label className="form-label">Rol del Sistema</label>
                  <select className="form-select" value={form.rol} onChange={e=>setForm({...form, rol: e.target.value})}>
                    <option value="Ejecutivo">Ejecutivo</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Admin">Administrador</option>
                  </select>
                </div>
                {form.rol === 'Ejecutivo' && (
                  <div className="form-group">
                    <label className="form-label">Asignar Supervisor</label>
                    <select className="form-select" value={form.supervisor} onChange={e=>setForm({...form, supervisor: e.target.value})}>
                      <option value="">Sin supervisor</option>
                      {supervisores.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                    </select>
                  </div>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button type="submit" form="form-user" className="btn-primary" disabled={guardando}>{guardando ? 'Creando...' : 'Crear Usuario'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Supervisor (Individual) */}
      {modalAsignar && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Asignar Supervisor</h3>
              <button className="modal-close" onClick={() => setModalAsignar(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
                Selecciona el supervisor para <strong>{modalAsignar.nombre}</strong>.
              </p>
              <div className="form-group">
                <select className="form-select" value={nuevoSupervisor} onChange={e=>setNuevoSupervisor(e.target.value)}>
                  <option value="">Quitar supervisor (Ninguno)</option>
                  {supervisores.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={() => setModalAsignar(null)}>Cancelar</button>
              <button type="button" className="btn-primary" disabled={guardando} onClick={handleAsignarSupervisor}>{guardando ? 'Guardando...' : 'Guardar Cambios'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Administrar Equipo (Masivo para un Supervisor) */}
      {modalEquipo && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: 480 }}>
            <div className="modal-header">
              <h3 className="modal-title">Administrar Equipo</h3>
              <button className="modal-close" onClick={() => setModalEquipo(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
                Selecciona los ejecutivos que pertenecen al equipo de <strong>{modalEquipo.nombre}</strong>. 
                <br/>El supervisor solo podrá ver las ventas de los ejecutivos seleccionados aquí.
              </p>
              <div className="checkbox-list">
                {ejecutivos.length === 0 && <div style={{ padding: 12, color: '#94A3B8', fontSize: 12 }}>No hay ejecutivos disponibles.</div>}
                {ejecutivos.map(e => {
                  const checked = equipoSeleccionado.includes(e.id);
                  return (
                    <label key={e.id} className="checkbox-item">
                      <input 
                        type="checkbox" 
                        checked={checked}
                        onChange={(ev) => {
                          if (ev.target.checked) {
                            setEquipoSeleccionado([...equipoSeleccionado, e.id]);
                          } else {
                            setEquipoSeleccionado(equipoSeleccionado.filter(id => id !== e.id));
                          }
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{e.nombre}</span>
                        {e.supervisor && e.supervisor !== modalEquipo.nombre && (
                          <span style={{ fontSize: 11, color: '#F59E0B' }}>Actualmente con: {e.supervisor}</span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={() => setModalEquipo(null)}>Cancelar</button>
              <button type="button" className="btn-primary" disabled={guardando} onClick={handleGuardarEquipo}>{guardando ? 'Guardando...' : 'Guardar Equipo'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Perfiles;
