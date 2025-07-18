import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const AuthDebugger: React.FC = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testToken = async () => {
    try {
      setLoading(true);
      setTokenError(null);
      
      const jwtToken = await getToken();
      setToken(jwtToken);
      
      // Test the token with your API
      const response = await fetch('http://localhost:8000/api/v1/billing/', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log('✅ Token works with API');
      } else {
        console.log('❌ Token failed with API:', response.status);
      }
      
    } catch (error) {
      setTokenError(error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Token error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      testToken();
    }
  }, [isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Authentication Debugger</h2>
        <p className="text-muted-foreground">Debug your Clerk authentication setup</p>
      </div>

      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>Current Clerk authentication state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant={isSignedIn ? 'default' : 'destructive'}>
              {isSignedIn ? 'Signed In' : 'Not Signed In'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {isLoaded ? 'Loaded' : 'Loading...'}
            </span>
          </div>

          {user && (
            <div>
              <p className="text-sm font-medium">User ID: {user.id}</p>
              <p className="text-sm text-muted-foreground">
                Email: {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* JWT Token */}
      <Card>
        <CardHeader>
          <CardTitle>JWT Token</CardTitle>
          <CardDescription>Current JWT token from Clerk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tokenError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{tokenError}</AlertDescription>
            </Alert>
          )}

          {token ? (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Token Retrieved Successfully</span>
              </div>
              <div className="bg-gray-100 p-3 rounded text-xs font-mono break-all">
                {token.substring(0, 100)}...
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No token available</p>
            </div>
          )}

          <Button 
            onClick={testToken} 
            disabled={loading || !isSignedIn}
            variant="outline"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Token
          </Button>
        </CardContent>
      </Card>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>Frontend environment configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">VITE_CLERK_PUBLISHABLE_KEY:</span>
            <Badge variant={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? 'default' : 'destructive'}>
              {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Missing'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">VITE_API_URL:</span>
            <Badge variant={import.meta.env.VITE_API_URL ? 'default' : 'destructive'}>
              {import.meta.env.VITE_API_URL || 'Missing'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDebugger; 