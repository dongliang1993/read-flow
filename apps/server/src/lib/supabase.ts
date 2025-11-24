import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

export const supabaseAdmin = createClient(
  env.supabase.url,
  env.supabase.serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
