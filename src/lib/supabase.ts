import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with correct credentials
const supabaseUrl = 'https://abhhiplxeaawdnxnjovf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaGhpcGx4ZWFhd2RueG5qb3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTg4MDEsImV4cCI6MjA2OTAzNDgwMX0.QcAMwj1cLYXOppRR71Vbzq2J4ao6YtngNUpXkbWNGtE';

export const supabase = createClient(supabaseUrl, supabaseKey);