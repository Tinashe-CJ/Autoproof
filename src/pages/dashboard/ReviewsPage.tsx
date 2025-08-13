import React, { useState } from 'react';
import { Star, Filter, Search, Eye, EyeOff, Flag, Heart, TrendingUp } from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const reviews = [
    {
      id: 1,
      customer: 'Sarah M.',
      email: 's***@email.com',
      product: 'Wireless Headphones',
      rating: 5,
      text: 'Amazing quality and fast shipping! These headphones exceeded my expectations. The sound quality is crystal clear and the battery life is fantastic.',
      date: '2024-01-15',
      verified: true,
      featured: false,
      hidden: false,
      helpful: 12
    },
    {
      id: 2,
      customer: 'John D.',
      email: 'j***@email.com',
      product: 'Smart Watch',
      rating: 4,
      text: 'Great product overall. Works as expected and the design is sleek. Only minor issue is the battery could last a bit longer.',
      date: '2024-01-14',
      verified: true,
      featured: true,
      hidden: false,
      helpful: 8
    },
    {
      id: 3,
      customer: 'Emma L.',
      email: 'e***@email.com',
      product: 'Phone Case',
      rating: 5,
      text: 'Perfect fit and great protection. Love the color and the quality feels premium.',
      date: '2024-01-13',
      verified: true,
      featured: false,
      hidden: false,
      helpful: 5
    },
    {
      id: 4,
      customer: 'Mike R.',
      email: 'm***@email.com',
      product: 'Bluetooth Speaker',
      rating: 3,
      text: 'Decent speaker but the bass could be better. Good for the price point though.',
      date: '2024-01-12',
      verified: false,
      featured: false,
      hidden: false,
      helpful: 2
    }
  ];

  const filteredReviews = reviews.filter(review => {
    const matchesRating = filterRating === null || review.rating === filterRating;
    const matchesSearch = searchTerm === '' || 
      review.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.text.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRating && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-yellow-500 p-2 rounded-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Love Hub 💝</h1>
        </div>
        <p className="text-lg text-gray-700 mb-4">Every review is a story of success. Manage, moderate, and celebrate your customer feedback.</p>
        <div className="inline-flex items-center bg-white rounded-lg px-4 py-2 shadow-sm">
          <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
          <span className="text-sm font-medium text-gray-900">Average rating: <span className="text-green-600">4.8/5</span> from {reviews.length} reviews</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Rating:</span>
              <select
                value={filterRating || ''}
                onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {review.customer.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{review.customer}</h3>
                      {review.verified && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          ✓ Verified
                        </span>
                      )}
                      {review.featured && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{review.email}</p>
                    <p className="text-sm text-gray-600">{review.product}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{review.date}</span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{review.text}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">👍 {review.helpful} found helpful</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      review.featured
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {review.featured ? 'Unfeature' : 'Feature'}
                  </button>
                  
                  <button
                    className={`p-2 rounded-lg transition-colors ${
                      review.hidden
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {review.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Flag className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="h-12 w-12 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {searchTerm || filterRating ? 'No matches found 🔍' : 'Your review collection awaits! ⭐'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterRating 
              ? 'Try adjusting your search or filters to find what you\'re looking for' 
              : 'Once customers start leaving reviews, they\'ll appear here like magic ✨'}
          </p>
        </div>
      )}
    </div>
  );
};