import React from 'react';
import { Plus, Eye, Settings, Trash2, Copy, Sparkles, Rocket, Palette } from 'lucide-react';

export const WidgetsPage: React.FC = () => {
  const widgets = [
    {
      id: 1,
      name: 'Product Page Reviews',
      type: 'Inline Reviews',
      status: 'Active',
      views: '8,432',
      conversions: '127',
      lastUpdated: '2 days ago'
    },
    {
      id: 2,
      name: 'Social Proof Popup',
      type: 'Floating Popup',
      status: 'Active',
      views: '12,847',
      conversions: '89',
      lastUpdated: '1 week ago'
    },
    {
      id: 3,
      name: 'Homepage Testimonials',
      type: 'Review Carousel',
      status: 'Draft',
      views: '0',
      conversions: '0',
      lastUpdated: '3 days ago'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Widget Studio 🎨</h1>
            </div>
            <p className="text-lg text-gray-700">Design beautiful social proof that converts visitors into customers</p>
          </div>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center mt-6 shadow-lg hover:shadow-xl transition-all">
          <Plus className="h-5 w-5 mr-2" />
          Create Widget
        </button>
      </div>

      {/* Widgets Grid */}
      <div className="grid gap-6">
        {widgets.map((widget) => (
          <div key={widget.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{widget.name}</h3>
                  <p className="text-sm text-gray-600">{widget.type}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    widget.status === 'Active' 
                      ? 'bg-green-100 text-green-800 flex items-center' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {widget.status}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Settings className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Views</p>
                  <p className="text-2xl font-bold text-blue-600">{widget.views}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversions</p>
                  <p className="text-2xl font-bold text-green-600">{widget.conversions}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-sm text-gray-700">{widget.lastUpdated}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (if no widgets) */}
      {widgets.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to create magic? ✨</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Your first widget is just a click away. Let's turn those amazing reviews into conversion-boosting social proof!</p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center mx-auto">
            <Rocket className="h-5 w-5 mr-2" />
            Create Your First Widget
          </button>
          <div className="mt-8 text-sm text-gray-500">
            <p>💡 <strong>Pro tip:</strong> Start with an inline review widget - it's the most popular choice!</p>
          </div>
        </div>
      )}
    </div>
  );
};