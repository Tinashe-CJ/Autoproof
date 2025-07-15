import React from 'react';
import { UserProfile } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomUserProfile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">A</span>
                </div>
                <span className="font-bold text-xl">AutoProof</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Settings</h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>
          
          <UserProfile 
            routing="path" 
            path="/user-profile"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-none bg-transparent",
                navbar: "bg-gray-50 border border-gray-200 rounded-lg",
                navbarButton: "text-gray-700 hover:bg-gray-100",
                navbarButtonActive: "bg-primary text-primary-foreground",
                pageScrollBox: "bg-transparent",
                page: "bg-transparent",
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                formFieldInput: "border-gray-300 focus:border-primary focus:ring-primary/20",
                headerTitle: "text-gray-900",
                headerSubtitle: "text-gray-600",
                profileSectionTitle: "text-gray-900",
                profileSectionContent: "text-gray-700",
                badge: "bg-primary/10 text-primary",
                accordionTriggerButton: "text-gray-900 hover:bg-gray-50",
                tableHead: "text-gray-900",
                menuButton: "text-gray-700 hover:bg-gray-100",
                menuItem: "text-gray-700 hover:bg-gray-100"
              }
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default CustomUserProfile;