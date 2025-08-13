import React from 'react';
import { Heart, Users, Target, Award, Linkedin, Twitter } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      name: 'Alex Chen',
      role: 'Co-Founder & CEO',
      bio: 'Former Shopify developer with 8 years of e-commerce experience. Passionate about helping merchants succeed.',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
      social: {
        linkedin: '#',
        twitter: '#'
      }
    },
    {
      name: 'Sarah Rodriguez',
      role: 'Co-Founder & CTO',
      bio: 'Full-stack engineer who previously built review systems for enterprise clients. Expert in scalable web architecture.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300',
      social: {
        linkedin: '#',
        twitter: '#'
      }
    },
    {
      name: 'Michael Kim',
      role: 'Head of Product',
      bio: 'Product designer with a background in UX research. Focused on creating intuitive experiences for merchants.',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
      social: {
        linkedin: '#',
        twitter: '#'
      }
    },
    {
      name: 'Emma Johnson',
      role: 'Customer Success',
      bio: 'E-commerce consultant who helps merchants optimize their stores. Passionate about customer education and support.',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
      social: {
        linkedin: '#',
        twitter: '#'
      }
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Merchant First',
      description: 'Every decision we make is guided by what\'s best for our merchants. Your success is our success.'
    },
    {
      icon: Users,
      title: 'Customer Obsessed',
      description: 'We listen to our users, iterate based on feedback, and build features that solve real problems.'
    },
    {
      icon: Target,
      title: 'Simple & Effective',
      description: 'We believe powerful tools should be easy to use. Complexity is the enemy of adoption.'
    },
    {
      icon: Award,
      title: 'Quality Over Quantity',
      description: 'We focus on building fewer features exceptionally well rather than many features poorly.'
    }
  ];

  const milestones = [
    {
      year: '2022',
      title: 'The Idea',
      description: 'After helping dozens of merchants improve their conversion rates, we realized social proof was consistently the highest-impact optimization.'
    },
    {
      year: '2023',
      title: 'First Version',
      description: 'We launched our MVP with basic review widgets. 100 merchants signed up in the first month, validating the need for better social proof tools.'
    },
    {
      year: '2024',
      title: 'Growing Fast',
      description: 'Today we serve over 1,000 merchants across 50+ countries, with widgets displaying on millions of product pages every month.'
    },
    {
      year: 'Future',
      title: 'What\'s Next',
      description: 'We\'re working on AI-powered review insights, advanced personalization, and expanding to new e-commerce platforms.'
    }
  ];

  return (
    <div className="py-20 bg-white page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Building the future of 
            <span className="text-blue-600"> social proof</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're a team of e-commerce veterans, engineers, and designers on a mission to help 
            every merchant showcase their customer love and increase conversions.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-blue-50 rounded-2xl p-12 mb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              To make beautiful, effective social proof accessible to every merchant, regardless of 
              technical skill or budget. We believe customer reviews and testimonials are the most 
              powerful form of marketing, and every business should be able to leverage them effectively.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-6">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600">
              From idea to serving thousands of merchants worldwide
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-blue-200"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div 
                  key={index} 
                  className={`flex items-center ${index % 2 === 0 ? '' : 'flex-row-reverse'} opacity-0 translate-y-8 animate-fade-in-up`}
                  style={{ animationDelay: `${index * 0.3}s`, animationFillMode: 'forwards' }}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full shadow-lg">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet the Team</h2>
            <p className="text-lg text-gray-600">
              The people building the future of social proof
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                <div className="flex justify-center space-x-3">
                  <a
                    href={member.social.linkedin}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href={member.social.twitter}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-900 rounded-2xl p-12 mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Autoproof by the Numbers
            </h2>
            <p className="text-gray-300 text-lg">
              Our impact on the e-commerce ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { stat: '1,000+', label: 'Active Merchants' },
              { stat: '50M+', label: 'Widget Impressions' },
              { stat: '2M+', label: 'Reviews Collected' },
              { stat: '15%', label: 'Avg Conversion Lift' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{item.stat}</div>
                <div className="text-gray-400">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Want to join us?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We're always looking for passionate people who want to help merchants succeed. 
            Check out our open positions or reach out to say hello.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get in Touch
            </a>
            <a
              href="/demo"
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
             Interactive Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};