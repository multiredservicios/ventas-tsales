import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function Perfiles({ session }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const currentUserEmail = session?.user?.email;
  const isAuthorized = currentUserEmail === 'belfor.aburto@t-sales.cl';

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    if (!isAuthorized) return;
    
    setLoading(true);
    setMensaje(null);
    setError(null);

    // Utilizamos signUp para registrar al nuevo usuario.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMensaje(`Usuario ${email} creado exitosamente.`);
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  if (!isAuthorized) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Acceso Denegado</h2>
        <p>No tienes los permisos necesarios para ver esta página.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', background: 'var(--gray-50)', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', color: '#0F172A', marginBottom: '8px' }}>Gestión de Perfiles</h1>
        <p style={{ color: '#64748B', fontSize: '14px' }}>Crea nuevos usuarios para acceder a la plataforma.</p>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', maxWidth: '500px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '16px', color: '#334155' }}>Crear Nuevo Usuario</h2>
        
        {mensaje && (
          <div style={{ padding: '12px', background: '#DCFCE7', color: '#166534', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {mensaje}
          </div>
        )}
        {error && (
          <div style={{ padding: '12px', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            Error: {error}
          </div>
        )}

        <form onSubmit={handleCrearUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Correo Electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@empresa.com"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '8px',
              padding: '10px', 
              background: '#00695C', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Creando...' : 'Crear Usuario'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Perfiles;
