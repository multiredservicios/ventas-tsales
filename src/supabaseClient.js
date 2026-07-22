import { createClient } from '@supabase/supabase-js';

// Tu URL armada con el Project ID de la foto
const supabaseUrl = 'https://eufisxqpplyvdlwpsjuu.supabase.co';

// Tu llave pública/anónima
const supabaseKey = 'sb_publishable_wD0xbqDXg_ipOBXF1_4ohg_9iQ5_odN';

export const supabase = createClient(supabaseUrl, supabaseKey);