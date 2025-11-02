import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nzrmvrdbgdetdwfovmls.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cm12cmRiZ2RldGR3Zm92bWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMzUwOTQsImV4cCI6MjA3NzYxMTA5NH0.lrhY-Xna26De_XNaxUXhJQFISU7owYqjhvXESjIiM_M';

export const supabase = createClient(supabaseUrl, supabaseKey);