import React from 'react';
import { TrendingUp, Users, Star, Mail, ArrowUpRight, ArrowDownRight, Sparkles, Target, Zap } from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const stats = [
    {
      name: 'Widget Views',
      value: '12,847',
      change: '+12%',
      changeType: 'increase',
      icon: TrendingUp,
      description: 'People seeing your social proof'
    },
    {
      name: 'Reviews Collected',
      value: '284',
      change: '+8%',
      changeType: 'increase',
      icon: Star,
      description: 'Happy customers sharing their love'
    },
    {
      name: 'Conversion Rate',
      value: '3.2%',
      change: '+0.4%',
      changeType: 'increase',
      icon: Users,
      description: 'Visitors becoming customers'
    },
    {
      name: 'Email Sent',
      value: '156',
      change: '-2%',
      changeType: 'decrease',
      icon: Mail,
      description: 'Review requests delivered'
    }
  ];

  const recentReviews = [
    {
      id: 1,
      customer: 'Sarah M.',
      rating: 5,
      product: 'Wireless Headphones',
      text: 'Amazing quality and fast shipping!',
      time: '2 hours ago'
    },
    {
      id: 2,
      customer: 'John D.',
      rating: 4,
      product: 'Smart Watch',
      text: 'Great product, works as expected.',
      time: '4 hours ago'
    },
    {
      id: 3,
      customer: 'Emma L.',
      rating: 5,
      product: 'Phone Case',
      text: 'Perfect fit and great protection.',
      time: '6 hours ago'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back! 🚀</h1>
        </div>
        <p className="text-lg text-gray-700 mb-6">Your social proof is working hard while you sleep. Here's the impact you're making:</p>
        
        {/* Quick wins */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">Today's Goal</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Get 5 new reviews</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-gray-900">Quick Win</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Enable email automation</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">Pro Tip</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Feature your best reviews</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Impact This Month 📈</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.changeType === 'increase' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'increase' ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-600 ml-1">from last month</span>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-gray-900">Latest Customer Love ❤️</h2>
            </div>
            <p className="text-gray-600 text-sm mt-1">Fresh testimonials from happy customers</p>
          </div>
          <div className="p-6 space-y-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {review.customer.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">{review.customer}</p>
                    <div className="flex text-yellow-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.product}</p>
                  <p className="text-sm text-gray-700 mt-1">"{review.text}"</p>
                  <p className="text-xs text-gray-500 mt-1">{review.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-gray-900">Power Moves ⚡</h2>
            </div>
            <p className="text-gray-600 text-sm mt-1">Boost your conversions with these actions</p>
          </div>
          <div className="p-6 space-y-4">
            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-medium text-gray-900">🎨 Create New Widget</h3>
              <p className="text-sm text-gray-600 mt-1">Design a stunning review display that converts</p>
            </button>
            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-medium text-gray-900">📥 Import Reviews</h3>
              <p className="text-sm text-gray-600 mt-1">Bring in your existing customer testimonials</p>
            </button>
            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-medium text-gray-900">✉️ Customize Email</h3>
              <p className="text-sm text-gray-600 mt-1">Perfect your review request messages</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};