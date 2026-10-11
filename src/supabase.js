import { createClient } from '@supabase/supabase-js';
export const ADMIN_USER_ID=(import.meta.env.VITE_ADMIN_USER_ID||'').trim();
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const configured=Boolean(url&&key&&ADMIN_USER_ID);
export const supabase=configured?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}}):null;
