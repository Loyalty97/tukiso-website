
// TUKISO Supabase connection

const SUPABASE_URL = "https://pendtlxpnfpgexferdps.supabase.co";

const SUPABASE_KEY = "sb_publishable_mxo1sEWkp6DO7EyW-Gh2Wg_9OkG8-Cj";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
