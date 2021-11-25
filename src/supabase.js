import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
// export const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
export const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async() => {const x = await supabase.from("sites").select("id"); console.log(x)})()
