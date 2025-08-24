import React, { useState } from 'react';
import { User, Phone, Mail, Calendar, Star, MapPin, Plus, Search, Filter, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import { useIsMobile } from './ui/use-mobile';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  company: string;
  phone: string;
  email: string;
  photo?: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  specialties: string[];
  license?: string;
  status: 'active' | 'pending' | 'completed';
  lastContact: string;
  nextAction?: string;
  location: string;
  isFromSetup?: boolean;
}

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  file: File;
}

interface SetupData {
  buyerEmail: string;
  buyerName: string;
}

interface MyTeamProps {
  setupData?: SetupData | null;
}

export default function MyTeam({ setupData }: MyTeamProps) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');
  const [newMemberData, setNewMemberData] = useState({
    firstName: '',
    lastName: '',
    role: 'Real Estate Agent',
    company: '',
    phone: '',
    email: ''
  });
  const isMobile = useIsMobile();

  // Base team members (mock data)
  const baseTeamMembers: TeamMember[] = [
    {
      id: '2',
      name: 'Mike Johnson',
      role: 'Loan Officer',
      company: 'Wells Fargo',
      phone: '(555) 234-5678',
      email: 'mike.johnson@wellsfargo.com',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      reviewCount: 324,
      yearsExperience: 12,
      specialties: ['Conventional loans', 'FHA', 'VA loans', 'Jumbo loans'],
      license: 'NMLS #987654321',
      status: 'active',
      lastContact: '2025-02-13',
      nextAction: 'Submit additional documents',
      location: 'San Francisco, CA'
    },
    {
      id: '3',
      name: 'David Chen',
      role: 'Home Inspector',
      company: 'Bay Area Inspections',
      phone: '(555) 345-6789',
      email: 'david@bayareainspections.com',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 4.7,
      reviewCount: 189,
      yearsExperience: 15,
      specialties: ['General inspection', 'Structural', 'Environmental'],
      license: 'CREIA #INS12345',
      status: 'pending',
      lastContact: '2025-02-10',
      nextAction: 'Schedule inspection appointment',
      location: 'San Francisco, CA'
    },
    {
      id: '4',
      name: 'Jennifer Kim',
      role: 'Insurance Agent',
      company: 'State Farm',
      phone: '(555) 456-7890',
      email: 'jennifer.kim@statefarm.com',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 4.6,
      reviewCount: 156,
      yearsExperience: 7,
      specialties: ['Homeowners', 'Flood', 'Umbrella policies'],
      license: 'CA INS LIC #0A12345',
      status: 'pending',
      lastContact: '2025-02-08',
      nextAction: 'Review insurance quotes',
      location: 'San Francisco, CA'
    },
    {
      id: '5',
      name: 'Robert Taylor',
      role: 'Title Officer',
      company: 'First American Title',
      phone: '(555) 567-8901',
      email: 'robert.taylor@firstam.com',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      reviewCount: 98,
      yearsExperience: 20,
      specialties: ['Title insurance', 'Escrow services', 'Commercial'],
      status: 'active',
      lastContact: '2025-02-12',
      nextAction: 'Review preliminary title report',
      location: 'San Francisco, CA'
    }
  ];

  // Create team members array with default agent (no setup data needed)
  const teamMembers: TeamMember[] = React.useMemo(() => {
    const members = [...baseTeamMembers];
    
    // Add default agent
    const defaultAgent: TeamMember = {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Real Estate Agent',
      company: 'Keller Williams Realty',
      phone: '(555) 123-4567',
      email: 'sarah.johnson@kw.com',
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b890?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 247,
      yearsExperience: 8,
      specialties: ['First-time buyers', 'Investment properties', 'Luxury homes'],
      license: 'CA DRE #01234567',
      status: 'active',
      lastContact: '2025-02-14',
      nextAction: 'Schedule showing appointment',
      location: 'San Francisco, CA'
    };
    
    members.unshift(defaultAgent);
    
    return members;
  }, []);

  const roles = [
    { value: 'all', label: 'All Team Members', count: teamMembers.length },
    { value: 'Real Estate Agent', label: 'Real Estate Agent', count: teamMembers.filter(m => m.role === 'Real Estate Agent').length },
    { value: 'Loan Officer', label: 'Loan Officer', count: teamMembers.filter(m => m.role === 'Loan Officer').length },
    { value: 'Home Inspector', label: 'Home Inspector', count: teamMembers.filter(m => m.role === 'Home Inspector').length },
    { value: 'Insurance Agent', label: 'Insurance Agent', count: teamMembers.filter(m => m.role === 'Insurance Agent').length },
    { value: 'Title Officer', label: 'Title Officer', count: teamMembers.filter(m => m.role === 'Title Officer').length }
  ];

  const filteredMembers = teamMembers.filter(member => 
    selectedRole === 'all' || member.role === selectedRole
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    // Using User icon for all roles as a placeholder
    return <User className="w-5 h-5" />;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Real Estate Agent': return 'bg-blue-100 text-blue-600';
      case 'Loan Officer': return 'bg-green-100 text-green-600';
      case 'Home Inspector': return 'bg-orange-100 text-orange-600';
      case 'Insurance Agent': return 'bg-purple-100 text-purple-600';
      case 'Title Officer': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleCallMember = (member: TeamMember) => {
    window.location.href = `tel:${member.phone}`;
  };

  const handleEmailMember = (member: TeamMember) => {
    window.location.href = `mailto:${member.email}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end mb-6">
        <div className="flex gap-2">
          <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
            <DialogTrigger asChild>
              <Button className="mobile-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="add-member-dialog-description" className="bg-white shadow-xl border border-gray-200">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription id="add-member-dialog-description">
                  Add a new professional to your transaction team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">First Name</label>
                    <Input
                      placeholder="John"
                      value={newMemberData.firstName}
                      onChange={(e) => setNewMemberData({...newMemberData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Last Name</label>
                    <Input
                      placeholder="Smith"
                      value={newMemberData.lastName}
                      onChange={(e) => setNewMemberData({...newMemberData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Role</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newMemberData.role}
                    onChange={(e) => setNewMemberData({...newMemberData, role: e.target.value})}
                  >
                    <option>Real Estate Agent</option>
                    <option>Loan Officer</option>
                    <option>Home Inspector</option>
                    <option>Insurance Agent</option>
                    <option>Title Officer</option>
                    <option>Attorney</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Company</label>
                  <Input
                    placeholder="Company name"
                    value={newMemberData.company}
                    onChange={(e) => setNewMemberData({...newMemberData, company: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone</label>
                    <Input
                      placeholder="(555) 123-4567"
                      value={newMemberData.phone}
                      onChange={(e) => setNewMemberData({...newMemberData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      placeholder="john@company.com"
                      value={newMemberData.email}
                      onChange={(e) => setNewMemberData({...newMemberData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mobile-device:mobile-stack-buttons">
                  <Button
                    className="flex-1 mobile-button"
                    onClick={() => {
                      // Validate required fields
                      if (!newMemberData.firstName || !newMemberData.lastName || !newMemberData.email) {
                        alert('Please fill in all required fields (First Name, Last Name, Email)');
                        return;
                      }

                      // In a real app, this would call an API to save the team member
                      console.log('Adding team member:', newMemberData);

                      // Show success message
                      alert(`Successfully added ${newMemberData.firstName} ${newMemberData.lastName} to your team!`);

                      // Reset form and close dialog
                      setNewMemberData({
                        firstName: '',
                        lastName: '',
                        role: 'Real Estate Agent',
                        company: '',
                        phone: '',
                        email: ''
                      });
                      setShowAddMember(false);
                    }}
                    disabled={!newMemberData.firstName || !newMemberData.lastName || !newMemberData.email}
                  >
                    Add Team Member
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewMemberData({
                        firstName: '',
                        lastName: '',
                        role: 'Real Estate Agent',
                        company: '',
                        phone: '',
                        email: ''
                      });
                      setShowAddMember(false);
                    }}
                    className="mobile-button"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>


      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full bg-transparent h-auto p-0 border-b border-gray-200 rounded-none flex justify-start">
          <TabsTrigger
            value="overview"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap"
          >
            Team Overview
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap"
          >
            Calendar
          </TabsTrigger>
          <TabsTrigger
            value="directory"
            className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap"
          >
            Directory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Active Team Members */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Active Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamMembers.filter(member => member.status === 'active').map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.photo} alt={member.name} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{member.name}</h3>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                            <p className="text-sm text-muted-foreground">{member.company}</p>
                          </div>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{member.rating}</span>
                          <span className="text-sm text-muted-foreground">({member.reviewCount} reviews)</span>
                        </div>

                        {member.nextAction && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-3">
                            <p className="text-sm font-medium text-blue-800">Next Action:</p>
                            <p className="text-sm text-blue-600">{member.nextAction}</p>
                          </div>
                        )}

                        <div className="flex gap-2 mobile-device:mobile-stack-buttons">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCallMember(member)}
                            className="mobile-button-sm"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Call
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEmailMember(member)}
                            className="mobile-button-sm"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Pending Team Members */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Pending Actions</h2>
            <div className="space-y-4">
              {teamMembers.filter(member => member.status === 'pending').map((member) => (
                <Card key={member.id} className="border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.photo} alt={member.name} />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">{member.role} • {member.company}</p>
                          {member.nextAction && (
                            <p className="text-sm text-orange-600 font-medium">{member.nextAction}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mobile-device:mobile-stack-buttons">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCallMember(member)}
                          className="mobile-button-sm"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            // Open action dialog or navigate to task specific to this member
                            const actions = {
                              'David Chen': 'Schedule inspection appointment',
                              'Jennifer Kim': 'Review insurance quotes',
                              'Mike Johnson': 'Submit additional documents'
                            };
                            const action = actions[member.name as keyof typeof actions] || 'Follow up with team member';

                            if (confirm(`Ready to: ${action}?`)) {
                              // In a real app, this would navigate or open a task-specific interface
                              window.open(`mailto:${member.email}?subject=Action Required: ${action}&body=Hi ${member.name},%0A%0AI wanted to follow up regarding: ${action}%0A%0APlease let me know if you need any additional information.%0A%0AThank you!`, '_blank');
                            }
                          }}
                          className="mobile-button-sm"
                        >
                          Take Action
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Appointments */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="text-center">
                        <p className="text-sm font-medium">Feb</p>
                        <p className="text-2xl font-semibold">16</p>
                        <p className="text-xs text-muted-foreground">Sat</p>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Property Showing</h3>
                        <p className="text-sm text-muted-foreground">with {teamMembers[0].name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">2:00 PM - 3:00 PM</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => alert('Opening calendar to reschedule appointment')}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Reschedule
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="text-center">
                        <p className="text-sm font-medium">Feb</p>
                        <p className="text-2xl font-semibold">18</p>
                        <p className="text-xs text-muted-foreground">Mon</p>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Home Inspection</h3>
                        <p className="text-sm text-muted-foreground">with David Chen</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">9:00 AM - 12:00 PM</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => alert('Opening calendar to reschedule appointment')}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Reschedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calendar Quick View */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>February 2025</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    <div className="font-medium text-muted-foreground p-2">S</div>
                    <div className="font-medium text-muted-foreground p-2">M</div>
                    <div className="font-medium text-muted-foreground p-2">T</div>
                    <div className="font-medium text-muted-foreground p-2">W</div>
                    <div className="font-medium text-muted-foreground p-2">T</div>
                    <div className="font-medium text-muted-foreground p-2">F</div>
                    <div className="font-medium text-muted-foreground p-2">S</div>
                    {/* Calendar days would be dynamically generated */}
                    <div className="p-2 text-muted-foreground">26</div>
                    <div className="p-2 text-muted-foreground">27</div>
                    <div className="p-2 text-muted-foreground">28</div>
                    <div className="p-2 text-muted-foreground">29</div>
                    <div className="p-2 text-muted-foreground">30</div>
                    <div className="p-2 text-muted-foreground">31</div>
                    <div className="p-2">1</div>
                    <div className="p-2">2</div>
                    <div className="p-2">3</div>
                    <div className="p-2">4</div>
                    <div className="p-2">5</div>
                    <div className="p-2">6</div>
                    <div className="p-2">7</div>
                    <div className="p-2">8</div>
                    <div className="p-2">9</div>
                    <div className="p-2">10</div>
                    <div className="p-2">11</div>
                    <div className="p-2">12</div>
                    <div className="p-2">13</div>
                    <div className="p-2 bg-primary text-primary-foreground rounded">14</div>
                    <div className="p-2">15</div>
                    <div className="p-2 bg-blue-100 text-blue-600 rounded">16</div>
                    <div className="p-2">17</div>
                    <div className="p-2 bg-orange-100 text-orange-600 rounded">18</div>
                    <div className="p-2">19</div>
                    <div className="p-2 bg-green-100 text-green-600 rounded">20</div>
                    <div className="p-2">21</div>
                    <div className="p-2">22</div>
                    <div className="p-2">23</div>
                    <div className="p-2">24</div>
                    <div className="p-2">25</div>
                    <div className="p-2">26</div>
                    <div className="p-2">27</div>
                    <div className="p-2">28</div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-100 rounded"></div>
                      <span className="text-xs">Showing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-100 rounded"></div>
                      <span className="text-xs">Inspection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-100 rounded"></div>
                      <span className="text-xs">Closing</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="directory" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Search team members..." 
                className="max-w-sm"
              />
            </div>
            <select 
              value={selectedRole} 
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label} ({role.count})
                </option>
              ))}
            </select>
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center space-y-3">
                    <Avatar className="w-16 h-16 mx-auto">
                      <AvatarImage src={member.photo} alt={member.name} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <Badge className={`${getRoleColor(member.role)} mb-2`}>
                        {member.role}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{member.company}</p>
                      <p className="text-xs text-muted-foreground">{member.location}</p>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{member.rating}</span>
                      <span className="text-xs text-muted-foreground">({member.reviewCount})</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCallMember(member)}
                          className="flex-1 mobile-button-sm"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEmailMember(member)}
                          className="flex-1 mobile-button-sm"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>{member.phone}</p>
                        <p>{member.email}</p>
                        {member.license && <p>License: {member.license}</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
