import "dotenv"
import { createClient } from "@supabase/supabase-js"

const env = process.env

const supabaseURL = env.SUPABASE_URL
const supabaseKey = env.SUPABASE_KEY;

if(!supabaseURL) throw new Error("Missing SUPABASE_URL in .env")
if(!supabaseKey) throw new Error("Missing SUPABASE_KEY in .env")

export const supabase = createClient(supabaseURL, supabaseKey)