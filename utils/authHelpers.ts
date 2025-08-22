import { AUTH_CONFIG, AUTH_VALIDATION, AUTH_ERROR_MESSAGES } from './authConstants';
export { AUTH_ERROR_MESSAGES } from './authConstants';
import type { UserProfile } from './supabase/client';

export interface SetupData {
  buyerEmail: string;
  buyerName: string;
  password?: string;
}

// Validation helpers
export function validateEmail(email: string): boolean {
  return AUTH_VALIDATION.EMAIL_REGEX.test(email);
}

export function validatePassword(password: string): boolean {
  return !!password && password.length >= AUTH_VALIDATION.MIN_PASSWORD_LENGTH;
}

export function validateName(name: string): boolean {
  return name.trim().length >= AUTH_VALIDATION.MIN_NAME_LENGTH;
}

export function validateAuthData(data: SetupData): string | null {
  if (!data.buyerEmail || !data.buyerName) {
    return AUTH_ERROR_MESSAGES.MISSING_CREDENTIALS;
  }

  if (!data.password) {
    return AUTH_ERROR_MESSAGES.MISSING_PASSWORD;
  }

  if (!validateEmail(data.buyerEmail)) {
    return AUTH_ERROR_MESSAGES.INVALID_EMAIL;
  }

  if (!validateName(data.buyerName)) {
    return AUTH_ERROR_MESSAGES.INVALID_NAME;
  }

  if (!validatePassword(data.password)) {
    return AUTH_ERROR_MESSAGES.INVALID_PASSWORD;
  }

  return null;
}

// Profile creation helpers
export function createOfflineProfile(email: string, name: string, isGuest: boolean = false): UserProfile {
  const userId = isGuest 
    ? `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    : `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: userId,
    email: email || (isGuest ? 'guest@handoff.demo' : 'user@handoff.demo'),
    full_name: name || (isGuest ? 'Guest User' : 'Demo User'),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questionnaire_complete: false
  };
}

// Storage helpers
export function clearAllAuthStorage(): void {
  const keys = [
    AUTH_CONFIG.OFFLINE_PROFILE_KEY,
    AUTH_CONFIG.OFFLINE_SETUP_KEY,
    AUTH_CONFIG.DEMO_PROFILE_KEY,
    AUTH_CONFIG.DEMO_SETUP_KEY,
    AUTH_CONFIG.GUEST_PROFILE_KEY,
    AUTH_CONFIG.GUEST_SETUP_KEY,
    AUTH_CONFIG.SESSION_STORAGE_KEY,
    AUTH_CONFIG.AUTH_MODE_KEY,
    AUTH_CONFIG.QUESTIONNAIRE_COMPLETE_KEY,
    AUTH_CONFIG.QUESTIONNAIRE_RESPONSES_KEY,
    AUTH_CONFIG.INITIAL_SETUP_COMPLETE_KEY,
    AUTH_CONFIG.SCREENING_DATA_KEY,
    AUTH_CONFIG.INITIAL_SETUP_DATA_KEY,
  ];

  keys.forEach(key => localStorage.removeItem(key));
}

export function storeAuthSession(profile: UserProfile, session: any): void {
  localStorage.setItem(AUTH_CONFIG.SESSION_STORAGE_KEY, JSON.stringify({
    profile,
    session,
    timestamp: Date.now()
  }));
  localStorage.setItem(AUTH_CONFIG.AUTH_MODE_KEY, 'authenticated');
}

export function storeGuestData(profile: UserProfile, setupData: SetupData): void {
  localStorage.setItem(AUTH_CONFIG.GUEST_PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem(AUTH_CONFIG.GUEST_SETUP_KEY, JSON.stringify(setupData));
  localStorage.setItem(AUTH_CONFIG.AUTH_MODE_KEY, 'guest');
}

// Questionnaire helpers
export function checkQuestionnaireCompletion(userProfile: UserProfile | null): boolean {
  if (!userProfile) return false;
  
  if (userProfile.questionnaire_complete === true) {
    return true;
  }
  
  const isComplete = localStorage.getItem(AUTH_CONFIG.QUESTIONNAIRE_COMPLETE_KEY);
  if (isComplete === 'true') {
    return true;
  }
  
  const savedResponses = localStorage.getItem(AUTH_CONFIG.QUESTIONNAIRE_RESPONSES_KEY);
  if (savedResponses) {
    try {
      const responses = JSON.parse(savedResponses);
      if (responses && (responses.agentName || responses.mustHaves || responses.homeTypes)) {
        return true;
      }
    } catch (error) {
      console.warn('Error parsing questionnaire responses:', error);
    }
  }
  
  return false;
}

// Session restoration helpers
export function getStoredAuthSession(): { profile: UserProfile; session: any } | null {
  try {
    const authSession = localStorage.getItem(AUTH_CONFIG.SESSION_STORAGE_KEY);
    if (!authSession) return null;

    const sessionData = JSON.parse(authSession);
    const sessionAge = Date.now() - sessionData.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (sessionAge < maxAge && sessionData.profile) {
      return sessionData;
    } else {
      // Clear expired session
      localStorage.removeItem(AUTH_CONFIG.SESSION_STORAGE_KEY);
      localStorage.removeItem(AUTH_CONFIG.AUTH_MODE_KEY);
      return null;
    }
  } catch (error) {
    console.warn('Failed to parse auth session:', error);
    localStorage.removeItem(AUTH_CONFIG.SESSION_STORAGE_KEY);
    localStorage.removeItem(AUTH_CONFIG.AUTH_MODE_KEY);
    return null;
  }
}

export function getStoredGuestData(): { profile: UserProfile; setupData: SetupData } | null {
  try {
    const guestProfile = localStorage.getItem(AUTH_CONFIG.GUEST_PROFILE_KEY);
    const guestSetupData = localStorage.getItem(AUTH_CONFIG.GUEST_SETUP_KEY);
    
    if (guestProfile && guestSetupData) {
      return {
        profile: JSON.parse(guestProfile),
        setupData: JSON.parse(guestSetupData)
      };
    }
  } catch (error) {
    console.warn('Failed to parse guest data:', error);
  }
  
  return null;
}

export function getStoredDemoData(): { profile: UserProfile; setupData: SetupData } | null {
  try {
    const demoProfile = localStorage.getItem(AUTH_CONFIG.DEMO_PROFILE_KEY);
    const demoSetupData = localStorage.getItem(AUTH_CONFIG.DEMO_SETUP_KEY);
    
    if (demoProfile && demoSetupData) {
      return {
        profile: JSON.parse(demoProfile),
        setupData: JSON.parse(demoSetupData)
      };
    }
  } catch (error) {
    console.warn('Failed to parse demo data:', error);
  }
  
  return null;
}

export function getStoredOfflineData(): { profile: UserProfile; setupData: SetupData } | null {
  try {
    const offlineProfile = localStorage.getItem(AUTH_CONFIG.OFFLINE_PROFILE_KEY);
    const offlineSetupData = localStorage.getItem(AUTH_CONFIG.OFFLINE_SETUP_KEY);
    
    if (offlineProfile && offlineSetupData) {
      return {
        profile: JSON.parse(offlineProfile),
        setupData: JSON.parse(offlineSetupData)
      };
    }
  } catch (error) {
    console.warn('Failed to parse offline data:', error);
  }
  
  return null;
}