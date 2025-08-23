import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Plus,
  ExternalLink,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Home,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Building,
  Camera,
  Shield,
  MessageSquare,
  Cloud
} from 'lucide-react';

const Dashboard = () => {
  // Integration services data
  const integrations = [
    {
      name: 'MLS Search',
      icon: Home,
      connected: true,
      color: 'bg-blue-500'
    },
    {
      name: 'DocuSign',
      icon: FileText,
      connected: true,
      color: 'bg-yellow-500'
    },
    {
      name: 'Calendar',
      icon: Calendar,
      connected: false,
      color: 'bg-red-500'
    },
    {
      name: 'Slack',
      icon: MessageSquare,
      connected: true,
      color: 'bg-purple-500'
    },
    {
      name: 'Drive',
      icon: Cloud,
      connected: false,
      color: 'bg-green-500'
    }
  ];

  // Sample transaction data
  const transactions = [
    {
      id: 'TXN-001',
      property: '123 Main St',
      client: 'John Smith',
      status: 'Under Contract',
      progress: 75,
      dueDate: 'Dec 15',
      statusColor: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'TXN-002', 
      property: '456 Oak Ave',
      client: 'Sarah Johnson',
      status: 'Inspection',
      progress: 45,
      dueDate: 'Dec 20',
      statusColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'TXN-003',
      property: '789 Pine Rd',
      client: 'Mike Wilson',
      status: 'Approved',
      progress: 90,
      dueDate: 'Dec 10',
      statusColor: 'bg-green-100 text-green-800'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Integration Cards */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Integrations</h2>
            <p className="text-sm text-slate-600">Connect your essential real estate tools</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Integration
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <Card key={integration.name} className="modern-card group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${integration.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium text-sm text-slate-900 mb-2">{integration.name}</h3>
                  <div className="flex items-center justify-center">
                    {integration.connected ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Connect
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Transaction Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Transactions */}
        <div className="lg:col-span-2">
          <Card className="modern-card-elevated">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">Active Transactions</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">Track your current real estate deals</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">3 Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-slate-900">{transaction.property}</h4>
                        <p className="text-sm text-slate-600">{transaction.client}</p>
                      </div>
                      <Badge className={transaction.statusColor}>
                        {transaction.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                          <span>Progress</span>
                          <span>{transaction.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${transaction.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Due</p>
                        <p className="text-sm font-medium text-slate-900">{transaction.dueDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="space-y-6">
          {/* Completion Rate */}
          <Card className="modern-card text-center">
            <CardContent className="p-6">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.75)}`}
                    className="text-blue-600"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">75%</span>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Completion Rate</h3>
              <p className="text-sm text-slate-600">Average transaction progress</p>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="modern-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">38%</p>
                  <p className="text-sm text-slate-600">Avg. Commission</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">15%</p>
                  <p className="text-sm text-slate-600">New Clients</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
          <p className="text-sm text-slate-600">Common tasks to get things done faster</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Home className="w-5 h-5" />
              <span className="text-xs">New Listing</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="w-5 h-5" />
              <span className="text-xs">Add Client</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Schedule Tour</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="w-5 h-5" />
              <span className="text-xs">Generate Contract</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
