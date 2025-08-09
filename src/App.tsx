import { useState } from 'react'
import { 
  Users, 
  Briefcase, 
  Building2, 
  BarChart3, 
  Search,
  Plus,
  Bell,
  Settings,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react'

// Mock data
const mockStats = {
  activeCandidates: 127,
  openJobs: 18,
  clientsMeeting: 3,
  monthlyPlacements: 12,
  revenue: 48500,
  avgTimeToFill: 21
}

const recentActivity = [
  { id: 1, type: 'candidate', message: 'Sarah Johnson applied for Senior Developer', time: '2 hours ago' },
  { id: 2, type: 'job', message: 'New job posted: Marketing Manager at TechCorp', time: '4 hours ago' },
  { id: 3, type: 'placement', message: 'Placement confirmed: John Doe → Frontend Lead', time: '1 day ago' },
  { id: 4, type: 'meeting', message: 'Client meeting scheduled with StartupXYZ', time: '2 days ago' },
]

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RF</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">RecruitFlow</h1>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Search candidates, jobs..."
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Good morning! 👋</h2>
          <p className="text-gray-600 mt-1">Here's what's happening with your recruitment pipeline today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Candidates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{mockStats.activeCandidates}</p>
                <p className="text-sm text-green-600 mt-1">+12% from last month</p>
              </div>
              <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{mockStats.openJobs}</p>
                <p className="text-sm text-blue-600 mt-1">3 urgent</p>
              </div>
              <div className="h-12 w-12 bg-accent-50 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-accent-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{mockStats.monthlyPlacements}</p>
                <p className="text-sm text-green-600 mt-1">placements</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">${mockStats.revenue.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">+8% from last month</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <Plus className="h-6 w-6 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Add Candidate</span>
                </button>
                <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <Briefcase className="h-6 w-6 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Post Job</span>
                </button>
                <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <Building2 className="h-6 w-6 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Add Client</span>
                </button>
                <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <BarChart3 className="h-6 w-6 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">View Reports</span>
                </button>
              </div>
            </div>

            {/* Pipeline Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Senior Developer - TechCorp</h4>
                    <p className="text-sm text-gray-600">5 candidates • Posted 3 days ago</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    In Review
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Marketing Manager - StartupXYZ</h4>
                    <p className="text-sm text-gray-600">12 candidates • Posted 1 week ago</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Interviewing
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">UX Designer - CreativeAgency</h4>
                    <p className="text-sm text-gray-600">3 candidates • Posted 2 weeks ago</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Final Round
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary-500 mt-0.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Client Meeting</p>
                    <p className="text-xs text-gray-500">StartupXYZ • 10:00 AM</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary-500 mt-0.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Interview</p>
                    <p className="text-xs text-gray-500">John Doe • 2:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary-500 mt-0.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Follow-up Call</p>
                    <p className="text-xs text-gray-500">Sarah Johnson • 4:30 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App