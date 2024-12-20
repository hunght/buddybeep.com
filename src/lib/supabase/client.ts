import { createClient } from '@supabase/supabase-js'
import { Database } from './schema'

const supabaseUrl = import.meta.env.VITE_REACT_APP_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_REACT_APP_ANON_KEY as string

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export default supabase
