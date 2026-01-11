/**
 * Central initialization module for all app data
 * Ensures all default data (users, groups, goals, messages) exists in storage
 */

import { initializeDefaultUsers } from './users';
import { initializeDefaultGroups } from './groups';

/**
 * Initialize all default app data
 * Call this on app startup, login, or register screens
 */
export async function initializeAppData(): Promise<void> {
  try {
    console.log('🚀 Initializing app data...');
    
    // Initialize default users first (needed for groups)
    await initializeDefaultUsers();
    
    // Initialize default groups (will sync user.groups arrays)
    await initializeDefaultGroups();
    
    // Future: Initialize default messages, group goals, etc.
    // await initializeDefaultMessages();
    // await initializeDefaultGroupGoals();
    
    console.log('✅ App data initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing app data:', error);
    throw error;
  }
}
