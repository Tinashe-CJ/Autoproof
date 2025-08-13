import React, { useState } from 'react';
import { Star, Smartphone, Monitor, Tablet } from 'lucide-react';

export const DemoPage: React.FC = () => {
  const [widgetType, setWidgetType] = useState<'inline' | 'popup' | 'carousel'>('inline');
  const [template, setTemplate] = useState<'modern' | 'bold' | 'classic' | 'minimal'>('modern');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const reviews = [
    {
      id: 1,
      name: 'Sarah M.',
      rating: 5,
      text: 'Amazing product! Exceeded my expectations. Fast shipping and great quality.',
      verified: true,
      timeAgo: '2 hours ago'
    },
    {
      id: 2,
      name: 'James K.',
      rating: 5,
      text: 'Perfect fit and great materials. Will definitely order again!',
      verified: true,
      timeAgo: '5 hours ago'
    },
    {
      id: 3,
      name: 'Emma L.',
      rating: 4,
      text: 'Really good product. Arrived quickly and as described.',
      verified: true,
      timeAgo: '1 day ago'
    }
  ];

  // Auto-advance carousel every 4 seconds
  React.useEffect(() => {
    if (widgetType === 'carousel') {
      const interval = setInterval(() => {
        setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [widgetType, reviews.length]);

  const getDeviceClass = () => {
    switch (device) {
      case 'mobile':
        return 'w-80 h-96';
      case 'tablet':
        return 'w-96 h-72';
      default:
        return 'w-full h-96';
    }
  };

  const getTemplateStyles = () => {
    const baseStyles = {
      modern: 'bg-white rounded-lg shadow-sm border border-gray-200',
      bold: 'bg-gray-900 rounded-xl shadow-lg text-white',
      classic: 'bg-white rounded border-2 border-gray-300 shadow-none',
      minimal: 'bg-gray-50 rounded-none shadow-none border-l-4'
    };
    return baseStyles[template];
  };

  const getColorStyles = () => {
    return {
      '--primary-color': primaryColor,
      '--primary-rgb': hexToRgb(primaryColor),
    } as React.CSSProperties;
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '37, 99, 235';
  };

  const renderWidget = () => {
    const containerClass = `${getTemplateStyles()} p-6`;
    const dynamicStyles = template === 'minimal' 
      ? { ...getColorStyles(), borderLeftColor: primaryColor }
      : getColorStyles();
    
    switch (widgetType) {
      case 'inline':
        return (
          <div className={containerClass} style={dynamicStyles}>
            <h3 className={`text-lg font-semibold mb-4 ${template === 'bold' ? 'text-white' : 'text-gray-900'}`}>
              Customer Reviews
            </h3>
            <div className="space-y-4">
              {reviews.slice(0, 2).map((review) => (
                <div key={review.id} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-center mb-2">
                    <div className="flex mr-2" style={{ color: primaryColor }}>
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className={`font-medium ${template === 'bold' ? 'text-white' : 'text-gray-900'}`}>
                      {review.name}
                    </span>
                    {review.verified && (
                      <span 
                        className="ml-2 text-xs px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Verified
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${template === 'bold' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {review.text}
                  </p>
                  <p className={`text-xs mt-1 ${template === 'bold' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {review.timeAgo}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'popup':
        return (
          <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <p className="text-gray-600">Your store preview...</p>
            </div>
            <div 
              className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs transform animate-pulse"
              style={dynamicStyles}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {reviews[0].name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {reviews[0].name} from New York
                  </p>
                  <p className="text-xs text-gray-600">just purchased this item</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'carousel':
        return (
          <div className={containerClass} style={dynamicStyles}>
            <div className="text-center">
              <h3 className={`text-lg font-semibold mb-6 ${template === 'bold' ? 'text-white' : 'text-gray-900'}`}>
                What Our Customers Say
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 relative overflow-hidden">
                <div className="transition-all duration-500 ease-in-out">
                  <div className="flex justify-center mb-4" style={{ color: primaryColor }}>
                    {[...Array(reviews[currentReviewIndex].rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-4">"{reviews[currentReviewIndex].text}"</p>
                  <p className="font-medium text-gray-900">{reviews[currentReviewIndex].name}</p>
                  <p className="text-sm text-gray-600">Verified Customer</p>
                </div>
              </div>
              <div className="flex justify-center space-x-2 mt-4">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentReviewIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentReviewIndex ? '' : 'bg-gray-300'
                    }`}
                    style={{ 
                      backgroundColor: index === currentReviewIndex ? primaryColor : undefined 
                    }}
                  />
                  ))}
              </div>
              
              {/* Navigation arrows */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length)}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  style={{ color: primaryColor }}
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentReviewIndex((prev) => (prev + 1) % reviews.length)}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  style={{ color: primaryColor }}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="py-20 bg-gray-50 min-h-screen page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Interactive Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Customize and preview your review widgets in real-time. 
            See exactly how they'll look on your store before you install.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-lg sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Customize Your Widget</h3>
              
              {/* Widget Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Widget Type
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'inline', label: 'Inline Reviews', desc: 'Display on product pages' },
                    { id: 'popup', label: 'Social Proof Popup', desc: 'Floating notifications' },
                    { id: 'carousel', label: 'Review Carousel', desc: 'Rotating testimonials' }
                  ].map((type) => (
                    <label key={type.id} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="widgetType"
                        value={type.id}
                        checked={widgetType === type.id}
                        onChange={(e) => setWidgetType(e.target.value as any)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-sm text-gray-600">{type.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Template */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Template
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'modern', label: 'Modern' },
                    { id: 'bold', label: 'Bold' },
                    { id: 'classic', label: 'Classic' },
                    { id: 'minimal', label: 'Minimal' }
                  ].map((temp) => (
                    <button
                      key={temp.id}
                      onClick={() => setTemplate(temp.id as any)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        template === temp.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {temp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Color */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Primary Color
                </label>
                <div className="flex space-x-2">
                  {['#2563eb', '#7c3aed', '#dc2626', '#059669', '#ea580c'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setPrimaryColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        primaryColor === color ? 'border-gray-900 ring-2 ring-offset-2' : 'border-gray-300'
                      } transition-all hover:scale-110`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Device Preview */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Device Preview
                </label>
                <div className="flex space-x-2">
                  {[
                    { id: 'desktop', icon: Monitor, label: 'Desktop' },
                    { id: 'tablet', icon: Tablet, label: 'Tablet' },
                    { id: 'mobile', icon: Smartphone, label: 'Mobile' }
                  ].map((dev) => (
                    <button
                      key={dev.id}
                      onClick={() => setDevice(dev.id as any)}
                      className={`flex items-center justify-center w-full py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        device === dev.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <dev.icon className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">{dev.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="pt-6 border-t border-gray-200">
                <a
                  href="/onboarding"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold text-center block transition-colors"
                >
                  Install This Widget
                </a>
                <p className="text-center text-sm text-gray-600 mt-2">
                  Free 14-day trial • No credit card required
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Real-time updates
                </div>
              </div>
              
              <div className={`mx-auto transition-all duration-300 ${getDeviceClass()}`}>
                <div className="w-full h-full border border-gray-300 rounded-lg overflow-hidden bg-white">
                  {device === 'desktop' ? (
                    <div className="p-6">
                      {renderWidget()}
                    </div>
                  ) : (
                    <div className="p-4 scale-90 origin-top">
                      {renderWidget()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Real-time Preview',
                  description: 'See changes instantly as you customize'
                },
                {
                  title: 'Mobile Responsive',
                  description: 'Perfect on all devices and screen sizes'
                },
                {
                  title: 'Easy Integration',
                  description: 'One-click installation to your Shopify store'
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};