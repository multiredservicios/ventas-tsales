import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Papa from 'papaparse';

function MaestroVentas() {
  const { userProfile, teamNames } = useAuth();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [supervisores, setSupervisores] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');

  const isAdmin = userProfile?.role === 'ADMIN';
  const isSupervisor = userProfile?.role === 'SUPERVISOR';

  useEffect(() => {
    // Si es ADMIN, obtenemos la lista de supervisores únicos
    if (isAdmin) {
      const fetchSupervisores = async () => {
        const { data, error } = await supabase
          .from('ejecutivos')
          .select('supervisor');
        
        if (!error && data) {
          const uniqueSupervisors = [...new Set(data.map(d => d.supervisor).filter(Boolean))];
          setSupervisores(uniqueSupervisors.sort());
        }
      };
      fetchSupervisores();
    } else if (isSupervisor) {
      // Si es supervisor, el select queda fijo en su propio nombre
      setSelectedSupervisor(userProfile?.name || '');
    }
  }, [isAdmin, isSupervisor, userProfile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ text: 'Por favor selecciona un archivo CSV primero.', type: 'error' });
      return;
    }

    setIsUploading(true);
    setMessage({ text: 'Comprobando conexión y permisos del bucket...', type: 'info' });

    try {
      setMessage({ text: 'Subiendo archivo de 16MB, esto puede tardar entre 1 y 3 minutos...', type: 'info' });

      // Subir el archivo al bucket "maestros"
      const { data, error } = await supabase.storage
        .from('maestros')
        .upload('maestro_diario.csv', file, {
          upsert: true,
          contentType: 'text/csv'
        });

      if (error) {
        if (error.message.includes('row-level security')) {
          throw new Error('Permisos RLS denegados. Ve a Supabase > Storage > Policies y permite INSERT y UPDATE al bucket "maestros".');
        }
        if (error.message.includes('not found')) {
          throw new Error('El bucket "maestros" no existe en el proyecto conectado (eufisxq...). Asegúrate de estar en el proyecto correcto y de que el nombre no tenga espacios al final.');
        }
        throw error;
      }
      
      setMessage({ text: '✅ Maestro subido y actualizado exitosamente.', type: 'success' });
      setFile(null);
    } catch (err) {
      console.error('Error al subir maestro:', err);
      setMessage({ text: '❌ Error al subir: ' + err.message, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedSupervisor) {
      setMessage({ text: 'Debes seleccionar un supervisor.', type: 'error' });
      return;
    }

    setIsDownloading(true);
    setMessage({ text: 'Descargando y procesando el archivo, por favor espera...', type: 'info' });

    try {
      // 1. Obtener los ejecutivos de este supervisor
      const { data: ejecutivosData, error: errEj } = await supabase
        .from('ejecutivos')
        .select('nombre')
        .ilike('supervisor', selectedSupervisor);

      if (errEj) throw errEj;

      // Limpiar nombres (quitar "(F)" u otros sufijos que pongan en la BD)
      const nombresEjecutivos = ejecutivosData.map(e => {
        let nombre = (e.nombre || '').toUpperCase().trim();
        nombre = nombre.replace(/\(F\)/g, '').replace(/\(P\)/g, '').trim();
        return nombre;
      }).filter(Boolean);

      if (nombresEjecutivos.length === 0) {
        setMessage({ text: 'Este supervisor no tiene ejecutivos asignados.', type: 'error' });
        setIsDownloading(false);
        return;
      }

      // 2. Descargar el maestro desde Storage
      const { data: fileData, error: errFile } = await supabase.storage
        .from('maestros')
        .download('maestro_diario.csv');

      if (errFile) {
        if (errFile.message.includes('Object not found')) {
          throw new Error('No hay ningún archivo maestro subido actualmente en el sistema.');
        }
        throw errFile;
      }

      // Convertir el blob a texto
      const text = await fileData.text();

      // 3. Parsear el CSV completo en el navegador
      // Utilizamos un worker o lo hacemos síncrono ya que PapaParse maneja 16MB rápido.
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        delimiter: ";", // Ajustamos al delimitador común de estos archivos
        complete: function(results) {
          try {
            const allRows = results.data;
            
            // 4. Filtrar filas
            const filteredRows = allRows.filter(row => {
              const seller = (row['NOMBRE_EJECUTIVO_SELLER'] || row['NOMBRE_EJECUTIVO_INITIAL'] || '').toUpperCase().trim();
              if (!seller) return false;

              return nombresEjecutivos.some(nombreBD => {
                if (seller === nombreBD) return true;
                if (nombreBD.length > 5 && seller.includes(nombreBD)) return true;
                if (seller.length > 5 && nombreBD.includes(seller)) return true;
                return false;
              });
            });

            if (filteredRows.length === 0) {
              setMessage({ text: 'No se encontraron ventas para el equipo de este supervisor en el archivo maestro.', type: 'error' });
              setIsDownloading(false);
              return;
            }

            // 5. Volver a convertir a CSV
            const newCsv = Papa.unparse(filteredRows, {
              delimiter: ";"
            });

            // 6. Disparar descarga al usuario
            const blob = new Blob(["\uFEFF" + newCsv], { type: 'text/csv;charset=utf-8;' }); // BOM para Excel
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const safeName = selectedSupervisor.replace(/[^a-zA-Z0-9]/g, '_');
            link.setAttribute('download', `MAESTRO_VENTAS_${safeName}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setMessage({ text: `✅ Archivo descargado exitosamente con ${filteredRows.length} ventas.`, type: 'success' });
            setIsDownloading(false);
          } catch (internalErr) {
            console.error('Error interno parseando CSV:', internalErr);
            setMessage({ text: '❌ Error al procesar datos: ' + internalErr.message, type: 'error' });
            setIsDownloading(false);
          }
        },
        error: function(err) {
          setMessage({ text: '❌ Error al leer el archivo maestro CSV: ' + err.message, type: 'error' });
          setIsDownloading(false);
        }
      });

    } catch (err) {
      console.error('Error al descargar maestro:', err);
      setMessage({ text: '❌ ' + err.message, type: 'error' });
      setIsDownloading(false);
    }
  };

  if (!isAdmin && !isSupervisor) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
        No tienes permisos para acceder a esta sección.
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#0F172A', fontSize: '24px' }}>📥 Maestro de Ventas</h1>
        <p style={{ margin: 0, color: '#64748B', fontSize: '15px' }}>
          {isAdmin 
            ? 'Sube el maestro diario actualizado y descarga reportes por equipo.' 
            : 'Descarga el maestro de ventas filtrado automáticamente con los ejecutivos de tu equipo.'}
        </p>
      </div>

      {message.text && (
        <div style={{ padding: '16px', marginBottom: '24px', borderRadius: '8px', 
          backgroundColor: message.type === 'error' ? '#FEF2F2' : (message.type === 'info' ? '#EFF6FF' : '#F0FDF4'),
          color: message.type === 'error' ? '#991B1B' : (message.type === 'info' ? '#1D4ED8' : '#166534'),
          border: `1px solid ${message.type === 'error' ? '#F87171' : (message.type === 'info' ? '#93C5FD' : '#86EFAC')}`
        }}>
          {message.text}
        </div>
      )}

      {isAdmin && (
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', margin: '0 0 16px 0', color: '#334155' }}>Subir Maestro Diario (Solo Administrador)</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              style={{ flex: 1, padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
            />
            <button 
              onClick={handleUpload}
              disabled={isUploading || !file}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: isUploading || !file ? '#94A3B8' : '#10B981', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: isUploading || !file ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isUploading ? 'Subiendo...' : 'Subir y Actualizar'}
            </button>
          </div>
          <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
            El archivo debe ser un CSV separado por punto y coma (MAESTRO_VENTAS_FIJO_AMDOCS_ACT).
          </p>
        </div>
      )}

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '16px', margin: '0 0 16px 0', color: '#334155' }}>
          Descargar Maestro Filtrado
        </h2>
        
        {isAdmin && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '6px', fontWeight: 'bold' }}>
              Selecciona un Supervisor:
            </label>
            <select 
              value={selectedSupervisor} 
              onChange={e => setSelectedSupervisor(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', outline: 'none' }}
            >
              <option value="">-- Elige un supervisor --</option>
              {supervisores.map(sup => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>
          </div>
        )}

        {isSupervisor && (
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Equipo actual:</span>
            <div style={{ fontWeight: 'bold', color: '#0F172A', marginTop: '4px' }}>{selectedSupervisor}</div>
          </div>
        )}

        <button 
          onClick={handleDownload}
          disabled={isDownloading || !selectedSupervisor}
          style={{ 
            width: '100%',
            padding: '12px', 
            backgroundColor: isDownloading || !selectedSupervisor ? '#94A3B8' : '#3B82F6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: isDownloading || !selectedSupervisor ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '15px'
          }}
        >
          {isDownloading ? 'Procesando descarga...' : 'Descargar Maestro de Ventas'}
        </button>
      </div>

    </div>
  );
}

export default MaestroVentas;
