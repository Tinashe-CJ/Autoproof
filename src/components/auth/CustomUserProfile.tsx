import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, User, LogOut, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer';
import { Link } from 'react-router-dom';

const getInitials = (name: string) => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0];
  return parts[0][0] + parts[1][0];
};

const CustomUserProfile = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || '';
  const avatarInitials = getInitials(fullName || email);
  const externalAccounts = user?.externalAccounts || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px] pointer-events-none" />
      <div className="absolute h-full w-full bg-gradient-to-b from-slate-900/50 to-slate-900/20 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="text-white hover:bg-white/10 border border-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <Link to="/">
                  <div className="w-10 h-10 rounded-md bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                </Link>
                <Link to="/">
                  <span className="font-bold text-2xl text-white">AutoProof</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/30 mb-4">
              <span className="text-blue-300 text-sm font-medium">Account Settings</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Manage your profile</h1>
            <p className="text-slate-300">Update your account information, security settings, and preferences</p>
          </div>

          {/* Profile Card */}
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Avatar and Name */}
            <div className="flex flex-col items-center md:items-start w-full md:w-1/3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-lg">
                {avatarInitials}
              </div>
              <div className="text-white text-xl font-semibold mb-1 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-300" />
                {fullName || email}
              </div>
              <div className="text-slate-300 flex items-center mb-2">
                <Mail className="h-4 w-4 mr-2 text-blue-300" />
                {email}
              </div>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-violet-500 text-white mt-2">Edit Profile</Button>
            </div>

            {/* Connected Accounts & Security */}
            <div className="flex-1 w-full">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-2">Connected Accounts</h2>
                {externalAccounts.length === 0 && (
                  <div className="text-slate-400">No connected accounts</div>
                )}
                <ul className="space-y-2">
                  {externalAccounts.map((acc) => (
                    <li key={acc.id} className="flex items-center gap-2 text-slate-300">
                      <LinkIcon className="h-4 w-4 text-blue-300" />
                      {acc.provider.charAt(0).toUpperCase() + acc.provider.slice(1)}
                      <span className="ml-2 text-slate-400">{acc.emailAddress}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Security</h2>
                <div className="text-slate-400 mb-2">Password management and 2FA coming soon.</div>
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-violet-500 text-white">Change Password</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomUserProfile;