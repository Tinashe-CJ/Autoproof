import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const CustomSignIn = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      <div className="absolute h-full w-full bg-gradient-to-b from-slate-900/30 to-slate-900/0" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 rounded-md bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-2xl font-bold text-white">AutoProof</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-300">
            Sign in to your AutoProof account
          </p>
        </div>

        {/* Clerk Sign In Component with custom styling */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-8 shadow-2xl">
          <SignIn 
            routing="path" 
            path="/sign-in"
            afterSignInUrl="/dashboard"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-none",
                headerTitle: "text-white text-xl font-semibold",
                headerSubtitle: "text-slate-300",
                socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors",
                socialButtonsBlockButtonText: "text-white font-medium",
                dividerLine: "bg-white/20",
                dividerText: "text-slate-300",
                formFieldLabel: "text-white font-medium",
                formFieldInput: "bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20",
                formButtonPrimary: "bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-medium transition-all duration-200",
                footerActionLink: "text-blue-400 hover:text-blue-300",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-blue-400 hover:text-blue-300",
                formFieldSuccessText: "text-green-400",
                formFieldErrorText: "text-red-400",
                alertText: "text-red-400",
                formFieldHintText: "text-slate-400",
                otpCodeFieldInput: "bg-white/10 border-white/20 text-white",
                formResendCodeLink: "text-blue-400 hover:text-blue-300",
                footer: "hidden"
              },
              layout: {
                socialButtonsPlacement: "top",
                showOptionalFields: false
              }
            }}
          />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Don't have an account?{' '}
            <a 
              href="/sign-up" 
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomSignIn;