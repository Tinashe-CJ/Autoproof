import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff,
  RefreshCw,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  ExternalLink,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApiAuth } from '@/lib/auth';
import { buildApiUrl, API_CONFIG } from '@/config/api';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at?: string;
  is_active: boolean;
  permissions: string[];
  rate_limit: number;
  usage_count: number;
}

interface ApiKeyResponse {
  items: ApiKey[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const ApiKeyManagement = () => {
  const { user } = useUser();
  const { getAuthHeaders, isSignedIn } = useApiAuth();
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['read']);
  const [newKeyRateLimit, setNewKeyRateLimit] = useState(1000);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.USERS)}/api-keys`, {
        headers,
      });

      if (response.ok) {
        const data: ApiKeyResponse = await response.json();
        setApiKeys(data.items);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      loadApiKeys();
    }
  }, [isSignedIn]);

  const createApiKey = async () => {
    if (!newKeyName.trim()) return;

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.USERS)}/api-keys`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newKeyName,
          permissions: newKeyPermissions,
          rate_limit: newKeyRateLimit,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewlyCreatedKey(data.api_key);
        setShowCreateForm(false);
        setNewKeyName('');
        setNewKeyPermissions(['read']);
        setNewKeyRateLimit(1000);
        loadApiKeys();
      }
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.USERS)}/api-keys/${keyId}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        loadApiKeys();
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(text);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'read':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'write':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center mb-4">
            <RefreshCw className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-slate-300">Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
      <div className="absolute h-full w-full bg-gradient-to-b from-slate-900/50 to-slate-900/20" />

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
                Back
              </Button>
              <Link to="/dashboard">
                <div className="w-10 h-10 rounded-md bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
              </Link>
              <div>
                <Link to="/dashboard">
                  <h1 className="text-2xl font-bold text-white">API Key Management</h1>
                </Link>
                <p className="text-slate-400 text-sm">Manage API keys for external integrations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
              <Button 
                onClick={loadApiKeys}
                variant="ghost"
                className="text-white hover:bg-white/10 border border-white/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Total API Keys</p>
                  <p className="text-2xl font-bold text-white mt-1">{apiKeys.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
                  <Key className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Active Keys</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {apiKeys.filter(k => k.is_active).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Total Usage</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {apiKeys.reduce((sum, key) => sum + key.usage_count, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Recently Used</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {apiKeys.filter(k => k.last_used_at && new Date(k.last_used_at) > new Date(Date.now() - 24*60*60*1000)).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Newly Created Key Alert */}
        {newlyCreatedKey && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-green-500/20 border border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div>
                      <h3 className="text-green-400 font-medium">API Key Created Successfully!</h3>
                      <p className="text-green-300 text-sm">Copy your new API key below. You won't be able to see it again.</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewlyCreatedKey(null)}
                    className="text-green-400 hover:text-green-300"
                  >
                    ×
                  </Button>
                </div>
                <div className="mt-4 p-4 bg-slate-800/60 rounded-lg border border-slate-600/30">
                  <div className="flex items-center justify-between">
                    <code className="text-green-400 font-mono text-sm break-all">{newlyCreatedKey}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(newlyCreatedKey)}
                      className="text-green-400 hover:text-green-300 ml-2"
                    >
                      {copiedKey === newlyCreatedKey ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Create API Key Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-blue-400" />
                  Create New API Key
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Generate a new API key for external integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Key Name
                  </label>
                  <Input
                    placeholder="e.g., Production API, Development Testing"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="bg-slate-700/40 border-slate-600/50 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {['read', 'write', 'admin'].map((permission) => (
                      <label key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newKeyPermissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewKeyPermissions([...newKeyPermissions, permission]);
                            } else {
                              setNewKeyPermissions(newKeyPermissions.filter(p => p !== permission));
                            }
                          }}
                          className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-slate-300 capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Rate Limit (requests per hour)
                  </label>
                  <Input
                    type="number"
                    value={newKeyRateLimit}
                    onChange={(e) => setNewKeyRateLimit(parseInt(e.target.value) || 1000)}
                    className="bg-slate-700/40 border-slate-600/50 text-white"
                    min="1"
                    max="10000"
                  />
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <Button
                    onClick={createApiKey}
                    disabled={!newKeyName.trim()}
                    className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-0"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Create API Key
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowCreateForm(false)}
                    className="text-white hover:bg-white/10 border border-white/20"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* API Keys List */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Key className="h-5 w-5 mr-2 text-blue-400" />
                API Keys
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage your API keys for external integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <div className="text-center py-12">
                  <Key className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No API keys found</p>
                  <p className="text-slate-500 text-sm">Create your first API key to get started</p>
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-0"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create API Key
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className="p-6 bg-slate-700/40 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-white font-medium text-lg">{apiKey.name}</h3>
                            <Badge className={apiKey.is_active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}>
                              {apiKey.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <div className="flex items-center space-x-1 text-slate-400">
                              <Key className="h-4 w-4" />
                              <span className="text-sm font-mono">{apiKey.key_prefix}...</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 mb-3">
                            {apiKey.permissions.map((permission) => (
                              <Badge key={permission} className={getPermissionColor(permission)}>
                                {permission}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400">Rate Limit</p>
                              <p className="text-white font-medium">{apiKey.rate_limit}/hour</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Usage Count</p>
                              <p className="text-white font-medium">{apiKey.usage_count}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Created</p>
                              <p className="text-white font-medium">{formatDate(apiKey.created_at)}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Last Used</p>
                              <p className="text-white font-medium">
                                {apiKey.last_used_at ? formatDate(apiKey.last_used_at) : 'Never'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => revokeApiKey(apiKey.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default ApiKeyManagement; 