import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://arvveoqyvijoyhnseewz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFydnZlb3F5dmlqb3lobnNlZXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzIwOTgsImV4cCI6MjA4MDM0ODA5OH0.XERp1XpGox63e1TGeOtCtBcmzGe-0mFhTA390CmC6b4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
