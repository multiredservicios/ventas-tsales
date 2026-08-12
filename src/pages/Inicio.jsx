import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

function Inicio() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    cargando: true,
    totalFreelance: 0,
    totalFreelanceEmpresa: 0,
    totalPenalizaciones: 0,
    totalVentas: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtenemos todos los ejecutivos para saber cuáles son FREELANCE y FREELANCE EMPRESA
        const { data: ejecutivos, error: errEj } = await supabase
          .from('ejecutivos')
          .select('id, tipo_contrato');
          
        if (errEj) throw errEj;

        const idsFreelance = ejecutivos.filter(e => e.tipo_contrato === 'FREELANCE').map(e => e.id);
        const idsFreelanceEmpresa = ejecutivos.filter(e => e.tipo_contrato === 'FREELANCE EMPRESA').map(e => e.id);

        // Ventas Freelance
        let countFreelance = 0;
        if (idsFreelance.length > 0) {
          const { count: cF } = await supabase
            .from('ventas')
            .select('id', { count: 'exact', head: true })
            .in('ejecutivo_id', idsFreelance);
          countFreelance = cF || 0;
        }

        // Ventas Freelance Empresa
        let countFreelanceEmpresa = 0;
        if (idsFreelanceEmpresa.length > 0) {
          const { count: cFE } = await supabase
            .from('ventas')
            .select('id', { count: 'exact', head: true })
            .in('ejecutivo_id', idsFreelanceEmpresa);
          countFreelanceEmpresa = cFE || 0;
        }
        
        // Total Ventas Generales
        const { count: countTotales } = await supabase
          .from('ventas')
          .select('id', { count: 'exact', head: true });

        // Total Penalizaciones Reales (excluyendo Alertas)
        const { count: countPen } = await supabase
          .from('penalizaciones')
          .select('id', { count: 'exact', head: true })
          .neq('tipo_penalizacion', 'Alerta');

        setStats({
          cargando: false,
          totalFreelance: countFreelance,
          totalFreelanceEmpresa: countFreelanceEmpresa,
          totalPenalizaciones: countPen || 0,
          totalVentas: countTotales || 0
        });

      } catch (error) {
        console.error("Error al cargar estadísticas de inicio:", error);
        setStats(prev => ({ ...prev, cargando: false }));
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#0F172A', fontSize: '28px', fontWeight: 'bold' }}>
          Hola, {userProfile?.name?.split(' ')[0] || 'Ejecutivo'} 👋
        </h1>
        <p style={{ margin: 0, color: '#64748B', fontSize: '15px' }}>
          Aquí tienes un resumen rápido del rendimiento global.
        </p>
      </div>

      {stats.cargando ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>Cargando métricas...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          
          {/* Card Total Ventas */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#64748B', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Total Ventas Registradas</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A' }}>{stats.totalVentas.toLocaleString()}</div>
            <div style={{ marginTop: '12px', height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', backgroundColor: '#3B82F6' }}></div>
            </div>
          </div>

          {/* Card Freelance */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#64748B', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Ventas Freelance</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#10B981' }}>{stats.totalFreelance.toLocaleString()}</div>
            <div style={{ marginTop: '12px', height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', backgroundColor: '#10B981' }}></div>
            </div>
          </div>

          {/* Card Freelance Empresa */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#64748B', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Ventas Freelance Empresa</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#8B5CF6' }}>{stats.totalFreelanceEmpresa.toLocaleString()}</div>
            <div style={{ marginTop: '12px', height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', backgroundColor: '#8B5CF6' }}></div>
            </div>
          </div>

          {/* Card Penalizaciones */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#64748B', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Penalizaciones Reales</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#EF4444' }}>{stats.totalPenalizaciones.toLocaleString()}</div>
            <div style={{ marginTop: '12px', height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', backgroundColor: '#EF4444' }}></div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Inicio;
