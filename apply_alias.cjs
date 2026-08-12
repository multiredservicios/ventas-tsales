const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://eufisxqpplyvdlwpsjuu.supabase.co',
  'sb_publishable_wD0xbqDXg_ipOBXF1_4ohg_9iQ5_odN'
);

async function unificarHistorial() {
  try {
    console.log('Iniciando unificación retroactiva de alias...');

    // 1. Obtener todos los alias
    const { data: aliasData, error: errAlias } = await supabase.from('ejecutivo_alias').select('alias, ejecutivo_id');
    if (errAlias) throw errAlias;
    
    if (!aliasData || aliasData.length === 0) {
      console.log('No hay alias configurados para procesar.');
      return;
    }

    // 2. Obtener ejecutivos para buscar el ID de los "falsos" ejecutivos (ej. DANILO_ALVAREZ)
    const { data: ejecutivosData, error: errEj } = await supabase.from('ejecutivos').select('id, nombre');
    if (errEj) throw errEj;

    let ventasActualizadas = 0;
    let penalizacionesActualizadas = 0;

    for (const a of aliasData) {
      // a.alias = "DANILO_ALVAREZ", a.ejecutivo_id = [ID de DATA CALL]
      console.log(`Procesando alias: ${a.alias} -> ID Real: ${a.ejecutivo_id}`);

      // Buscar si el "falso ejecutivo" ya existía como ejecutivo real en la BD
      const falsoEjecutivo = ejecutivosData.find(e => e.nombre.trim().toUpperCase() === a.alias.trim().toUpperCase());
      
      if (falsoEjecutivo) {
        // Si existía, reasignamos todas sus ventas al ID del ejecutivo real (DATA CALL)
        console.log(`- Encontrado perfil antiguo para ${a.alias} con ID ${falsoEjecutivo.id}`);
        
        // Mover ventas
        const { data: vUpdate, error: vErr } = await supabase
          .from('ventas')
          .update({ ejecutivo_id: a.ejecutivo_id })
          .eq('ejecutivo_id', falsoEjecutivo.id)
          .select('id');
          
        if (vErr) console.error('Error actualizando ventas:', vErr.message);
        else if (vUpdate && vUpdate.length > 0) {
          console.log(`  > Movidas ${vUpdate.length} ventas.`);
          ventasActualizadas += vUpdate.length;
        }

        // Mover penalizaciones
        const { data: pUpdate, error: pErr } = await supabase
          .from('penalizaciones')
          .update({ ejecutivo_id: a.ejecutivo_id })
          .eq('ejecutivo_id', falsoEjecutivo.id)
          .select('id');
          
        if (pErr) console.error('Error actualizando penalizaciones:', pErr.message);
        else if (pUpdate && pUpdate.length > 0) {
          console.log(`  > Movidas ${pUpdate.length} penalizaciones.`);
          penalizacionesActualizadas += pUpdate.length;
        }

        // Finalmente, podríamos borrar el perfil falso (opcional, lo dejamos inactivo por seguridad o lo borramos si no tiene nada más)
        const { error: delErr } = await supabase.from('ejecutivos').delete().eq('id', falsoEjecutivo.id);
        if (delErr) console.log(`  > No se pudo borrar el perfil antiguo (puede que tenga relaciones pendientes): ${delErr.message}`);
        else console.log(`  > Perfil antiguo de ${a.alias} borrado correctamente.`);
        
      } else {
        console.log(`- No hay un perfil de ejecutivo para ${a.alias} que necesite ser migrado.`);
      }
    }

    console.log('\n✅ Proceso terminado.');
    console.log(`Total Ventas movidas: ${ventasActualizadas}`);
    console.log(`Total Penalizaciones movidas: ${penalizacionesActualizadas}`);

  } catch (err) {
    console.error('Error general:', err);
  }
}

unificarHistorial();
