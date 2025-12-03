import { AppState, Platform } from 'react-native'
import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const ExpoSecureStoreAdapter = {
  getItem: (key) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') return null
      return localStorage.getItem(key)
    }
    return SecureStore.getItemAsync(key)
  },
  setItem: (key, value) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem(key, value)
      return
    }
    SecureStore.setItemAsync(key, value)
  },
  removeItem: (key) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage === 'undefined') return
      localStorage.removeItem(key)
      return
    }
    SecureStore.deleteItemAsync(key)
  },
}

const supabaseUrl = 'https://arvveoqyvijoyhnseewz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFydnZlb3F5dmlqb3lobnNlZXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzIwOTgsImV4cCI6MjA4MDM0ODA5OH0.XERp1XpGox63e1TGeOtCtBcmzGe-0mFhTA390CmC6b4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})
