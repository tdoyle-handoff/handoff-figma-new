export interface UserDisplayInfo {
  buyerName?: string;
  buyerEmail?: string;
  displayBadge?: string;
  [key: string]: any;
}

export const getUserDisplayInfo = (
  isGuestMode: boolean,
  isOfflineMode: boolean,
  setupData: any,
  userProfile?: any
): UserDisplayInfo => {
  try {
  // For guest mode, use the provided data with fallbacks
  if (isGuestMode) {
    return {
      ...setupData,
      buyerName: setupData?.buyerName || 'Guest User',
      buyerEmail: setupData?.buyerEmail || 'guest@handoff.demo',
      displayBadge: 'Guest Mode'
    };
  } 
  
  // For offline/demo mode, use setup data with fallbacks
  if (isOfflineMode && !isGuestMode) {
    return {
      ...setupData,
      buyerName: setupData?.buyerName || userProfile?.full_name || 'Demo User',
      buyerEmail: setupData?.buyerEmail || userProfile?.email || 'demo@handoff.demo',
      displayBadge: 'Demo Mode'
    };
  } 
  
  // For authenticated users, prioritize userProfile data over setupData
  if (userProfile) {
    return {
      buyerName: userProfile.full_name || setupData?.buyerName || 'User',
      buyerEmail: userProfile.email || setupData?.buyerEmail || 'user@handoff.demo',
      ...setupData, // Include any additional setup data
      // Override with profile data if available
      ...(userProfile.full_name && { buyerName: userProfile.full_name }),
      ...(userProfile.email && { buyerEmail: userProfile.email }),
      displayBadge: null // No badge for authenticated users
    };
  }
  
  // Fallback for any other case
  return {
    ...setupData,
    buyerName: setupData?.buyerName || 'User',
    buyerEmail: setupData?.buyerEmail || 'user@handoff.demo',
    displayBadge: null
  };
  } catch (error) {
    console.warn('Error in getUserDisplayInfo, using safe fallback:', error);
    return {
      buyerName: isGuestMode ? 'Guest User' : 'User',
      buyerEmail: isGuestMode ? 'guest@handoff.demo' : 'user@handoff.demo',
      displayBadge: isGuestMode ? 'Guest Mode' : null
    };
  }
};

export const getAuthStatusMessage = (isGuestMode: boolean, userProfile: any): string | null => {
  try {
    if (isGuestMode) {
      return "You're browsing as a guest. Your data will be lost when you close the browser.";
    } else if (userProfile?.full_name) {
      return `Welcome back, ${userProfile.full_name}! Your transaction dashboard is ready.`;
    } else if (userProfile?.email) {
      return `Welcome back! Your transaction dashboard is ready.`;
    }
    return null;
  } catch (error) {
    console.warn('Error in getAuthStatusMessage:', error);
    return isGuestMode ? "You're browsing as a guest." : null;
  }
};

// Helper function to extract user initials for avatar display
export const getUserInitials = (userDisplayInfo: UserDisplayInfo): string => {
  const name = userDisplayInfo?.buyerName || 'User';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to get a formatted display name
export const getDisplayName = (userDisplayInfo: UserDisplayInfo): string => {
  const name = userDisplayInfo?.buyerName;
  if (!name || name === 'User' || name === 'Guest User' || name === 'Demo User') {
    return name || 'User';
  }
  
  // Format the name properly (capitalize first letter of each word)
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper function to check if user data is complete
export const isUserDataComplete = (userDisplayInfo: UserDisplayInfo): boolean => {
  return !!(
    userDisplayInfo?.buyerName && 
    userDisplayInfo.buyerName !== 'User' && 
    userDisplayInfo.buyerName !== 'Guest User' &&
    userDisplayInfo?.buyerEmail && 
    userDisplayInfo.buyerEmail !== 'user@handoff.demo' &&
    userDisplayInfo.buyerEmail !== 'guest@handoff.demo'
  );
};

// Helper function to persist user display info to localStorage
export const persistUserDisplayInfo = (userDisplayInfo: UserDisplayInfo, mode: string = 'authenticated'): void => {
  try {
    const dataToStore = {
      ...userDisplayInfo,
      mode,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('handoff_user_display_info', JSON.stringify(dataToStore));
    console.log('User display info persisted:', dataToStore);
  } catch (error) {
    console.error('Failed to persist user display info:', error);
  }
};

// Helper function to retrieve persisted user display info from localStorage
export const retrievePersistedUserDisplayInfo = (): UserDisplayInfo | null => {
  try {
    const stored = localStorage.getItem('handoff_user_display_info');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('Retrieved persisted user display info:', parsed);
      return parsed;
    }
  } catch (error) {
    console.error('Failed to retrieve persisted user display info:', error);
  }
  return null;
};

// Helper function to clear persisted user display info
export const clearPersistedUserDisplayInfo = (): void => {
  try {
    localStorage.removeItem('handoff_user_display_info');
    console.log('Cleared persisted user display info');
  } catch (error) {
    console.error('Failed to clear persisted user display info:', error);
  }
};