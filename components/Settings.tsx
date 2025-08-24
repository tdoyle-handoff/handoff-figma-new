import { Fragment } from 'react';
import React, { useState } from 'react';
import { User, Bell, Shield, CreditCard, Home, Users, Globe, HelpCircle, LogOut, Eye, EyeOff, Camera, Mail, Phone, MapPin, Calendar, Save, X, Plus, Trash2, Edit3, Clock, Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useIsMobile } from './ui/use-mobile';
import { Alert, AlertDescription } from './ui/alert';

interface SettingsProps {
  onSignOut?: () => void;
  setupData?: {
    buyerEmail: string;
    buyerName: string;
  } | null;
  userProfile?: any;
  onNavigate?: (page: string) => void;
}

export default function Settings({ onSignOut, setupData, onNavigate }: SettingsProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  // Profile state
  const [profile, setProfile] = useState({
    name: setupData?.buyerName || '',
    email: setupData?.buyerEmail || '',
    phone: '',
    address: '',
    dateOfBirth: '',
    occupation: '',
    bio: ''
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    taskReminders: true,
    deadlineAlerts: true,
    teamUpdates: true,
    marketingEmails: false
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'team',
    shareData: false,
    allowAnalytics: true,
    twoFactorAuth: false
  });

  // Team members state
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Sarah Johnson', role: 'Real Estate Agent', email: 'sarah@realty.com', phone: '(555) 123-4567', status: 'active' },
    { id: 2, name: 'Mike Chen', role: 'Lender', email: 'mike@mortgage.com', phone: '(555) 234-5678', status: 'pending' }
  ]);

  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    email: '',
    phone: ''
  });

  // Get current setup data for display
  const getCurrentSetupData = () => {
    try {
      const screeningData = localStorage.getItem('handoff-screening-data');
      const propertyData = localStorage.getItem('handoff-property-data');
      
      let currentData = {
        buyingStage: 'Unknown',
        experienceLevel: 'Unknown',
        hasSpecificProperty: false,
        propertyAddress: 'Not specified',
        primaryGoal: 'Unknown',
        timeframe: 'Unknown',
        hasPreApproval: false
      };

      if (screeningData) {
        const parsed = JSON.parse(screeningData);
        currentData = { ...currentData, ...parsed };
      }

      return currentData;
    } catch (error) {
      console.warn('Error getting setup data:', error);
      return {
        buyingStage: 'Unknown',
        experienceLevel: 'Unknown',
        hasSpecificProperty: false,
        propertyAddress: 'Not specified',
        primaryGoal: 'Unknown',
        timeframe: 'Unknown',
        hasPreApproval: false
      };
    }
  };

  const handleSave = () => {
    // Save logic would go here
    setSavedMessage('Settings saved successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
    setIsEditing(false);
  };

  const handleEditSetup = () => {
    // Store a flag to indicate we're editing (not setting up for the first time)
    localStorage.setItem('handoff-setup-edit-mode', 'true');
    
    // Navigate to property page which will show the setup flow
    if (onNavigate) {
      onNavigate('property');
    }
  };

  const handleResetSetup = () => {
    if (confirm('Are you sure you want to completely reset your property setup? This will clear all your responses and you\'ll need to start over.')) {
      // Clear all setup data
      localStorage.removeItem('handoff-initial-setup-complete');
      localStorage.removeItem('handoff-questionnaire-complete');
      localStorage.removeItem('handoff-questionnaire-responses');
      localStorage.removeItem('handoff-screening-data');
      localStorage.removeItem('handoff-property-data');
      localStorage.removeItem('handoff-initial-setup-data');
      localStorage.removeItem('handoff-setup-edit-mode');
      
      setSavedMessage('Setup data has been reset. You can now start fresh.');
      setTimeout(() => setSavedMessage(''), 3000);
      
      // Navigate to property page to start over
      if (onNavigate) {
        onNavigate('property');
      }
    }
  };

  const handleAddTeamMember = () => {
    if (newMember.name && newMember.email && newMember.role) {
      setTeamMembers([...teamMembers, {
        id: Date.now(),
        ...newMember,
        status: 'pending'
      }]);
      setNewMember({ name: '', role: '', email: '', phone: '' });
    }
  };

  const handleRemoveTeamMember = (id: number) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };

  const formatBuyingStage = (stage: string) => {
    const stages = {
      'just-starting': 'Just Starting',
      'searching': 'Actively Searching',
      'under-contract': 'Under Contract',
      'pre-approved': 'Pre-approved'
    };
    return stages[stage as keyof typeof stages] || stage;
  };

  const formatExperienceLevel = (level: string) => {
    const levels = {
      'first-time': 'First-time Buyer',
      'experienced': 'Experienced Buyer',
      'investor': 'Real Estate Investor'
    };
    return levels[level as keyof typeof levels] || level;
  };

  const formatPrimaryGoal = (goal: string) => {
    const goals = {
      'primary-residence': 'Primary Residence',
      'investment': 'Investment Property',
      'vacation-home': 'Vacation Home',
      'relocation': 'Relocation'
    };
    return goals[goal as keyof typeof goals] || goal;
  };

  const formatTimeframe = (timeframe: string) => {
    const timeframes = {
      'immediate': 'Immediate (30 days)',
      '3-months': 'Within 3 months',
      '6-months': 'Within 6 months',
      'exploring': 'Just exploring'
    };
    return timeframes[timeframe as keyof typeof timeframes] || timeframe;
  };

  const currentSetupData = getCurrentSetupData();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600 mt-1">
            Account preferences, notifications, and application settings
          </p>
        </div>
      </div>

      {/* Success message */}
      {savedMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{savedMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-transparent h-auto p-0 border-b border-gray-200 rounded-none flex justify-start overflow-x-auto mb-6">
          <TabsTrigger
            value="profile"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            <span className={isMobile ? 'hidden' : 'inline'}>Profile</span>
          </TabsTrigger>
          <TabsTrigger
            value="setup"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span className={isMobile ? 'hidden' : 'inline'}>Setup</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            <span className={isMobile ? 'hidden' : 'inline'}>Notifications</span>
          </TabsTrigger>
          {!isMobile && (
            <Fragment>
              <TabsTrigger
                value="privacy"
                className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Privacy</span>
              </TabsTrigger>
              <TabsTrigger
                value="team"
                className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Team</span>
              </TabsTrigger>
              <TabsTrigger
                value="support"
                className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Support</span>
              </TabsTrigger>
            </Fragment>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>Upload a profile photo to personalize your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full p-0"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          // In a real app, this would upload to a server
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const img = document.querySelector('.profile-photo') as HTMLImageElement;
                            if (img && e.target?.result) {
                              img.src = e.target.result as string;
                              img.style.display = 'block';
                            }
                            setSavedMessage('Profile photo updated successfully!');
                            setTimeout(() => setSavedMessage(''), 3000);
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  <img
                    className="profile-photo w-20 h-20 rounded-full object-cover absolute inset-0"
                    style={{ display: 'none' }}
                    alt="Profile"
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Upload Profile Photo</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Choose a photo that represents you. JPG, PNG or GIF format, max 5MB.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert('File size must be less than 5MB');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              const img = document.querySelector('.profile-photo') as HTMLImageElement;
                              if (img && e.target?.result) {
                                img.src = e.target.result as string;
                                img.style.display = 'block';
                              }
                              setSavedMessage('Profile photo updated successfully!');
                              setTimeout(() => setSavedMessage(''), 3000);
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                    >
                      Choose Photo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const img = document.querySelector('.profile-photo') as HTMLImageElement;
                        if (img) {
                          img.style.display = 'none';
                          setSavedMessage('Profile photo removed');
                          setTimeout(() => setSavedMessage(''), 3000);
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and profile information</CardDescription>
              </div>
              <Button 
                variant={isEditing ? "default" : "outline"} 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <Fragment>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Fragment>
                ) : (
                  <Fragment>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Fragment>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    disabled={!isEditing}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={profile.occupation}
                    onChange={(e) => setProfile({...profile, occupation: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Software Engineer"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Current Address</Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                  disabled={!isEditing}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                />
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                />
              </div>

              <Button
                onClick={() => {
                  // Validate password fields
                  const currentPassword = (document.querySelector('input[placeholder="Current password"]') as HTMLInputElement)?.value;
                  const newPassword = (document.querySelector('input[placeholder="New password"]') as HTMLInputElement)?.value;
                  const confirmPassword = (document.querySelector('input[placeholder="Confirm new password"]') as HTMLInputElement)?.value;

                  if (!currentPassword || !newPassword || !confirmPassword) {
                    alert('Please fill in all password fields.');
                    return;
                  }

                  if (newPassword !== confirmPassword) {
                    alert('New passwords do not match.');
                    return;
                  }

                  if (newPassword.length < 8) {
                    alert('Password must be at least 8 characters long.');
                    return;
                  }

                  // In a real app, this would call an API to update the password
                  alert('Password updated successfully!');

                  // Clear form
                  (document.querySelector('input[placeholder="Current password"]') as HTMLInputElement).value = '';
                  (document.querySelector('input[placeholder="New password"]') as HTMLInputElement).value = '';
                  (document.querySelector('input[placeholder="Confirm new password"]') as HTMLInputElement).value = '';
                }}
              >
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Property Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Setup</CardTitle>
              <CardDescription>Review and edit your property setup information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Current Setup Information</h3>
                <div className="grid gap-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Buying Stage</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatBuyingStage(currentSetupData.buyingStage)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Experience Level</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatExperienceLevel(currentSetupData.experienceLevel)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Property Address</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentSetupData.propertyAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Primary Goal</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatPrimaryGoal(currentSetupData.primaryGoal)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Timeframe</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatTimeframe(currentSetupData.timeframe)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Pre-approval Status</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentSetupData.hasPreApproval ? 'Yes, I have pre-approval' : 'No, not yet'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Setup Actions</h3>
                <div className="space-y-3">
                  <Button onClick={handleEditSetup} className="w-full justify-start">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Property Setup
                    <span className="ml-auto text-xs text-muted-foreground">
                      Update your responses
                    </span>
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={handleResetSetup} 
                    className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Start Over Completely
                    <span className="ml-auto text-xs text-muted-foreground">
                      Clear all responses
                    </span>
                  </Button>
                </div>

                <Alert>
                  <SettingsIcon className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Edit Setup:</strong> Update your existing responses while keeping your progress.
                    <br />
                    <strong>Start Over:</strong> Clear everything and begin the setup process from scratch.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified about updates and reminders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Delivery Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive important updates via text</p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Content Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Task Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminded about upcoming tasks</p>
                    </div>
                    <Switch
                      checked={notifications.taskReminders}
                      onCheckedChange={(checked) => setNotifications({...notifications, taskReminders: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Deadline Alerts</Label>
                      <p className="text-sm text-muted-foreground">Urgent notifications for approaching deadlines</p>
                    </div>
                    <Switch
                      checked={notifications.deadlineAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, deadlineAlerts: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Team Updates</Label>
                      <p className="text-sm text-muted-foreground">Updates from your real estate team</p>
                    </div>
                    <Switch
                      checked={notifications.teamUpdates}
                      onCheckedChange={(checked) => setNotifications({...notifications, teamUpdates: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Tips, guides, and promotional content</p>
                    </div>
                    <Switch
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => setNotifications({...notifications, marketingEmails: checked})}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSave}>Save Notification Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab - only show on desktop */}
        {!isMobile && (
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Control your privacy settings and data sharing preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <Select value={privacy.profileVisibility} onValueChange={(value) => setPrivacy({...privacy, profileVisibility: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Visible to everyone</SelectItem>
                        <SelectItem value="team">Team Only - Visible to your real estate team</SelectItem>
                        <SelectItem value="private">Private - Only visible to you</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Share Data for Insights</Label>
                      <p className="text-sm text-muted-foreground">Help improve our services with anonymized data</p>
                    </div>
                    <Switch
                      checked={privacy.shareData}
                      onCheckedChange={(checked) => setPrivacy({...privacy, shareData: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Analytics Tracking</Label>
                      <p className="text-sm text-muted-foreground">Allow us to track usage to improve your experience</p>
                    </div>
                    <Switch
                      checked={privacy.allowAnalytics}
                      onCheckedChange={(checked) => setPrivacy({...privacy, allowAnalytics: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={privacy.twoFactorAuth}
                      onCheckedChange={(checked) => setPrivacy({...privacy, twoFactorAuth: checked})}
                    />
                  </div>
                </div>

                <Button onClick={handleSave}>Save Privacy Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Team Tab - only show on desktop */}
        {!isMobile && (
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Manage your real estate team members and their access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Current Team Members</h3>
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">{member.role}</div>
                            </div>
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {member.phone}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                            {member.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveTeamMember(member.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Add Team Member</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={newMember.name}
                        onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={newMember.role} onValueChange={(value) => setNewMember({...newMember, role: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Real Estate Agent">Real Estate Agent</SelectItem>
                          <SelectItem value="Lender">Lender</SelectItem>
                          <SelectItem value="Inspector">Inspector</SelectItem>
                          <SelectItem value="Attorney">Attorney</SelectItem>
                          <SelectItem value="Insurance Agent">Insurance Agent</SelectItem>
                          <SelectItem value="Title Company">Title Company</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        value={newMember.phone}
                        onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddTeamMember}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Team Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Support Tab - only show on desktop */}
        {!isMobile && (
          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Help & Support</CardTitle>
                <CardDescription>Get help, report issues, and access resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Quick Actions</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        // Open help documentation
                        window.open('https://www.builder.io/c/docs/projects', '_blank');
                      }}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      View Help Documentation
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        // Open support contact
                        window.open('mailto:support@handoff.com?subject=Support Request&body=Please describe your issue...', '_blank');
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        // Open community forum
                        window.open('https://github.com/BuilderIO/builder/discussions', '_blank');
                      }}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Visit Community Forum
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Account Actions</h3>
                  <div className="space-y-3">
                    <Button variant="outline" onClick={onSignOut} className="w-full justify-start">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
