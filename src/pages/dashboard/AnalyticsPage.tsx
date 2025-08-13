import React, { useState } from 'react';
import { TrendingUp, Users, Star, Mail, Calendar, Download, BarChart3, Target, Zap } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const metrics = [
    {
      name: 'Total Widget Views',
      value: '45,231',
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: TrendingUp
    },
    {
      name: 'Conversion Rate',
      value: '3.8%',
      change: '+0.4%',
      changeType: 'increase' as const,
      icon: Users
    },
    {
      name: 'Reviews Collected',
      value: '1,247',
      change: '+18.2%',
      changeType: 'increase' as const,
      icon: Star
    },
    {
      name: 'Email Open Rate',
      value: '68.4%',
      change: '-2.1%',
      changeType: 'decrease' as const,
      icon: Mail
    }
  ];

  const topProducts = [
    { name: 'Wireless Headphones', views: 8432, conversions: 127, rate: '1.5%' },
    { name: 'Smart Watch', views: 6821, conversions: 89, rate: '1.3%' },
    { name: 'Phone Case', views: 5234, conversions: 156, rate: '3.0%' },
    { name: 'Bluetooth Speaker', views: 4567, conversions: 67, rate: '1.5%' },
    { name: 'Laptop Stand', views: 3421, conversions: 45, rate: '1.3%' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Performance Command Center 📊</h1>
            </div>
            <p className="text-lg text-gray-700">Data-driven insights to supercharge your social proof strategy</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Performance Metrics 🎯</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${
                metric.changeType === 'increase' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <metric.icon className={`h-6 w-6 ${
                  metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${
                metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </span>
              <span className="text-sm text-gray-600 ml-1">vs previous period</span>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Widget Performance Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Widget Performance Over Time 📈</h3>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Interactive chart coming soon!</p>
              <p className="text-sm text-gray-400">Widget views trending upward 📊</p>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="h-5 w-5 text-yellow-600" />
            <h3 className="text-xl font-semibold text-gray-900">Conversion Funnel ⚡</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">👀 Widget Views</span>
              <span className="text-sm font-medium">45,231</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">🖱️ Widget Clicks</span>
              <span className="text-sm font-medium">3,847</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">💰 Conversions</span>
              <span className="text-sm font-medium">1,719</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Products */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <h3 className="text-xl font-semibold text-gray-900">Top Performing Products 🏆</h3>
          </div>
          <p className="text-gray-600 text-sm mt-1">Your conversion champions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.views.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.conversions}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.rate}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};