import React, { useState } from 'react';
import { Mail, Send, Clock, CheckCircle, XCircle, Plus, Edit, Zap, Target, Heart } from 'lucide-react';

export const EmailsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'settings'>('campaigns');

  const campaigns = [
    {
      id: 1,
      name: 'Post-Purchase Review Request',
      status: 'Active',
      sent: 1247,
      opened: 853,
      clicked: 234,
      openRate: '68.4%',
      clickRate: '18.8%',
      lastSent: '2 hours ago'
    },
    {
      id: 2,
      name: 'Follow-up Reminder',
      status: 'Active',
      sent: 456,
      opened: 298,
      clicked: 67,
      openRate: '65.4%',
      clickRate: '14.7%',
      lastSent: '1 day ago'
    },
    {
      id: 3,
      name: 'Incentivized Review Request',
      status: 'Paused',
      sent: 234,
      opened: 156,
      clicked: 45,
      openRate: '66.7%',
      clickRate: '19.2%',
      lastSent: '1 week ago'
    }
  ];

  const templates = [
    {
      id: 1,
      name: 'Default Review Request',
      subject: 'How was your recent purchase?',
      type: 'Post-Purchase',
      lastModified: '3 days ago'
    },
    {
      id: 2,
      name: 'Friendly Follow-up',
      subject: 'We\'d love your feedback!',
      type: 'Reminder',
      lastModified: '1 week ago'
    },
    {
      id: 3,
      name: 'Discount Incentive',
      subject: 'Get 10% off your next order',
      type: 'Incentivized',
      lastModified: '2 weeks ago'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Email Automation Hub ⚡</h1>
        </div>
        <p className="text-lg text-gray-700 mb-4">Turn every purchase into a potential review with smart, automated email campaigns</p>
        <div className="inline-flex items-center bg-white rounded-lg px-4 py-2 shadow-sm">
          <Target className="h-4 w-4 text-green-600 mr-2" />
          <span className="text-sm font-medium text-gray-900">68.4% average open rate - <span className="text-green-600">Above industry standard! 🎉</span></span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'campaigns', name: 'Campaigns', icon: Send },
            { id: 'templates', name: 'Templates', icon: Mail },
            { id: 'settings', name: 'Settings', icon: Edit }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Active Campaigns 🚀</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </button>
          </div>

          <div className="grid gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {campaign.status}
                      </span>
                      <span className="text-sm text-gray-600">Last sent: {campaign.lastSent}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Edit className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Sent</p>
                    <p className="text-2xl font-bold text-blue-600">{campaign.sent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Opened</p>
                    <p className="text-2xl font-bold text-indigo-600">{campaign.opened.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clicked</p>
                    <p className="text-2xl font-bold text-purple-600">{campaign.clicked}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Open Rate</p>
                    <p className="text-2xl font-bold text-green-600">{campaign.openRate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Click Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{campaign.clickRate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Email Templates 📧</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{template.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Modified:</span>
                    <span className="text-gray-700">{template.lastModified}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Email Settings ⚙️</h2>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Heart className="h-5 w-5 text-red-500" />
              <h3 className="text-xl font-semibold text-gray-900">General Settings</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  defaultValue="Your Store Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  defaultValue="noreply@yourstore.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Delay (days after purchase)
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="1">1 day</option>
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto-send"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="auto-send" className="ml-2 block text-sm text-gray-700">
                  Automatically send review requests
                </label>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};