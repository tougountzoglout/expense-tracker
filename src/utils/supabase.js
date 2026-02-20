import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mnhkoqbacfzgoymhcwry.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uaGtvcWJhY2Z6Z295bWhjd3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1OTA0MTUsImV4cCI6MjA4NzE2NjQxNX0.v-jgUyGpbQ5rweBfoYKS0BHnNypdycP2HOx95sA4kxE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
