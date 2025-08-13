import React from 'react';
import { Star, TrendingUp, Users, Award } from 'lucide-react';

export const TestimonialsPage: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Founder',
      company: 'Eco Beauty Co.',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'Autoproof transformed our conversion rate overnight. We saw an 18% increase in sales within the first month. The widgets look gorgeous and setup was incredibly easy.',
      rating: 5,
      metrics: '+18% conversion rate',
      featured: true
    },
    {
      name: 'Michael Chen',
      role: 'Marketing Director',
      company: 'TechGear Pro',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'The email automation feature is a game-changer. We\'re now collecting 5x more reviews with zero extra effort. Our customers love how easy it is to leave feedback.',
      rating: 5,
      metrics: '5x more reviews collected'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Owner',
      company: 'Artisan Jewelry Studio',
      avatar: 'https://images.pexels.com/photos/1586996/pexels-photo-1586996.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'As a small business, I needed something that worked right out of the box. Autoproof delivered exactly that. The widgets match my brand perfectly and customer trust has improved dramatically.',
      rating: 5,
      metrics: '+25% customer trust'
    },
    {
      name: 'David Park',
      role: 'E-commerce Manager',
      company: 'Fitness First',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'The analytics dashboard gives us insights we never had before. We can see exactly which reviews drive the most conversions and optimize accordingly.',
      rating: 5,
      metrics: 'Deep conversion insights'
    },
    {
      name: 'Lisa Thompson',
      role: 'CEO',
      company: 'Home Decor Plus',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'We tried 3 other review apps before Autoproof. None came close to the design quality and ease of use. Our customers actually compliment us on how professional our reviews look.',
      rating: 5,
      metrics: 'Professional appearance'
    },
    {
      name: 'James Wilson',
      role: 'Founder',
      company: 'Outdoor Adventure Gear',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'The floating social proof notifications create incredible urgency. Our customers see others purchasing and it drives immediate action. Revenue is up 22% since implementation.',
      rating: 5,
      metrics: '+22% revenue increase'
    }
  ];

  const stats = [
    { icon: Users, value: '1,000+', label: 'Happy Merchants' },
    { icon: TrendingUp, value: '+15%', label: 'Average Conversion Lift' },
    { icon: Star, value: '4.9/5', label: 'Average Rating' },
    { icon: Award, value: '98%', label: 'Would Recommend' }
  ];

  const caseStudies = [
    {
      company: 'Beauty Bliss',
      industry: 'Cosmetics',
      results: ['+32% conversions', '500% more reviews', '15% higher AOV'],
      description: 'Beauty Bliss transformed their product pages with inline review widgets and automated email campaigns.',
      logo: 'BB'
    },
    {
      company: 'Tech Solutions',
      industry: 'Electronics',
      results: ['+28% conversions', '3x review collection', '95% satisfaction'],
      description: 'Tech Solutions used floating social proof to create urgency and drive immediate purchases.',
      logo: 'TS'
    },
    {
      company: 'Fashion Forward',
      industry: 'Apparel',
      results: ['+45% conversions', '800% review growth', '20% repeat customers'],
      description: 'Fashion Forward leveraged review carousels to showcase customer photos and build trust.',
      logo: 'FF'
    }
  ];

  return (
    <div className="py-20 bg-white page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Trusted by thousands of 
            <span className="text-blue-600"> merchants</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. See how Autoproof has helped merchants 
            around the world increase conversions and build customer trust.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Featured Testimonial */}
        {testimonials.filter(t => t.featured).map((testimonial, index) => (
          <div key={index} className="bg-blue-600 rounded-2xl p-12 mb-20 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center text-yellow-400 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-current" />
                ))}
              </div>
              <blockquote className="text-2xl font-medium mb-8 leading-relaxed">
                "{testimonial.content}"
              </blockquote>
              <div className="flex items-center justify-center space-x-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="text-left">
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-blue-200">{testimonial.role}, {testimonial.company}</div>
                </div>
                <div className="bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                  {testimonial.metrics}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Testimonial Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {testimonials.filter(t => !t.featured).map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-8 hover:bg-gray-100 transition-colors">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-700 mb-6 italic">
                "{testimonial.content}"
              </blockquote>
              <div className="flex items-center space-x-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}, {testimonial.company}</div>
                </div>
              </div>
              <div className="mt-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                {testimonial.metrics}
              </div>
            </div>
          ))}
        </div>

        {/* Case Studies */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600">
              Real results from real merchants across different industries
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                    {study.logo}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{study.company}</h3>
                    <p className="text-gray-600">{study.industry}</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">{study.description}</p>
                
                <div className="space-y-2">
                  {study.results.map((result, i) => (
                    <div key={i} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium text-gray-900">{result}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-900 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Join thousands of successful merchants
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            See why merchants choose Autoproof to showcase their reviews and increase conversions. 
            Start your free trial today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/onboarding"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Start Free Trial
            </a>
            <a
              href="/demo"
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              View Demo
            </a>
          </div>
          <p className="text-gray-400 text-sm mt-6">
            14-day free trial • No credit card required • Setup in 5 minutes
          </p>
        </div>
      </div>
    </div>
  );
};