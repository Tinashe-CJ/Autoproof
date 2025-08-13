import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Star, ChevronDown } from 'lucide-react';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Star className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Autoproof</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative"
                 onMouseEnter={() => setIsProductMenuOpen(true)}
                 onMouseLeave={() => setIsProductMenuOpen(false)}>
              <button className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
                Product
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {isProductMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-slide-down">
                  <Link to="/features" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Features
                  </Link>
                  <Link to="/demo" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Live Demo
                  </Link>
                 <Link to="/demo" className="block text-gray-700 hover:text-blue-600">
                   Demo
                 </Link>
                  <Link to="/testimonials" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Testimonials
                  </Link>
                </div>
              )}
            </div>
            <Link 
              to="/pricing" 
              className={`transition-colors font-medium px-3 py-2 rounded-lg ${
                location.pathname === '/pricing'
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Pricing
            </Link>
            <Link 
              to="/demo" 
              className={`transition-colors font-medium px-3 py-2 rounded-lg ${
                location.pathname === '/demo'
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
             Demo
            </Link>
            <Link 
              to="/faq" 
              className={`transition-colors font-medium px-3 py-2 rounded-lg ${
                location.pathname === '/faq'
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              FAQ
            </Link>
            <Link 
              to="/about" 
              className={`transition-colors font-medium px-3 py-2 rounded-lg ${
                location.pathname === '/about'
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              About
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link to="/onboarding" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Start Free Trial
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-3">
              <Link 
                to="/features" 
                className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === '/features'
                    ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Features
              </Link>
              <Link 
                to="/demo" 
                className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === '/demo'
                    ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Live Demo
              </Link>
              <Link 
                to="/pricing" 
                className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === '/pricing'
                    ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Pricing
              </Link>
              <Link 
                to="/testimonials" 
                className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === '/testimonials'
                    ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Testimonials
              </Link>
              <Link 
                to="/faq" 
                className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === '/faq'
                    ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                FAQ
              </Link>
              <Link 
                to="/about" 
                className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === '/about'
                    ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                About
              </Link>
              <div className="pt-4 border-t border-gray-200">
                <Link to="/dashboard" className="block text-gray-700 hover:text-blue-600 mb-3">
                  Sign In
                </Link>
                <Link to="/onboarding" className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-center transition-colors">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};