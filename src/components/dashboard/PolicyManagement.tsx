import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  RefreshCw,
  Upload,
  FileText,
  Settings,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApiAuth } from '@/lib/auth';
import { buildApiUrl, API_CONFIG } from '@/config/api';

interface PolicyRule {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  conditions: any[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  rule_type: 'custom' | 'template' | 'regulatory';
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface PolicyResponse {
  items: PolicyRule[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const PolicyManagement = () => {
  const { user } = useUser();
  const { getAuthHeaders, isSignedIn } = useApiAuth();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<PolicyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPolicies, setTotalPolicies] = useState(0);
  const [filters, setFilters] = useState({
    severity: 'all',
    rule_type: 'all',
    is_active: 'all',
    search: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PolicyRule | null>(null);

  // Debug logging
  console.log("🔍 PolicyManagement component rendered");
  console.log("🔍 Loading state:", loading);
  console.log("🔍 Error state:", error);
  console.log("🔍 Policies count:", policies.length);
  console.log("🔍 Is signed in:", isSignedIn);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const fetchPolicies = async () => {
    // Allow loading even when not signed in (for dev testing)
    if (!isSignedIn) {
      console.log("User not signed in, using dev authentication");
    }

    try {
      setLoading(true);
      console.log("🔍 Fetching policies...");
      
      const token = await getAuthHeaders();
      console.log("🔑 Got token:", token ? "Yes" : "No");
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add Clerk token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Fallback to dev authentication for testing
        headers['Authorization'] = 'Bearer dev-test@autoproof.com';
        console.log("🔧 Using dev authentication for testing");
      }
      
      console.log("📡 Making API request with headers:", headers);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: '20',
        ...(filters.severity && filters.severity !== 'all' && { severity: filters.severity }),
        ...(filters.rule_type && filters.rule_type !== 'all' && { rule_type: filters.rule_type }),
        ...(filters.is_active && filters.is_active !== 'all' && { is_active: filters.is_active }),
        ...(filters.search && { search: filters.search })
      });
      
      const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.POLICIES)}/?${params}`, {
        method: 'GET',
        headers,
      });
      
      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("📦 Response data:", data);
      
      setPolicies(data.items || []);
      setTotalPolicies(data.total || 0);
      setTotalPages(data.pages || 0);
    } catch (error) {
      console.error("❌ Error fetching policies:", error);
      setError("Failed to fetch policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load policies even when not signed in (for dev testing)
    fetchPolicies();
  }, [currentPage, filters, isSignedIn]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getRuleTypeColor = (ruleType: string) => {
    switch (ruleType) {
      case 'regulatory':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'template':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'custom':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center mb-4">
            <RefreshCw className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-slate-300">Loading policies...</p>
          <p className="text-slate-400 text-sm mt-2">Debug: Loading state active</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <p className="text-red-300">Error loading policies</p>
          <p className="text-red-400 text-sm mt-2">{error}</p>
          <button 
            onClick={fetchPolicies}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
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
                  <h1 className="text-2xl font-bold text-white">Policy Management</h1>
                </Link>
                <p className="text-slate-400 text-sm">Configure and manage compliance rules</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Policy
              </Button>
              <Button 
                onClick={fetchPolicies}
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
                  <p className="text-slate-400 text-sm font-medium">Total Policies</p>
                  <p className="text-2xl font-bold text-white mt-1">{totalPolicies}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Active Policies</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {policies.filter(p => p.is_active).length}
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
                  <p className="text-slate-400 text-sm font-medium">Critical Rules</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {policies.filter(p => p.severity === 'critical').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Custom Rules</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {policies.filter(p => p.rule_type === 'custom').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search policies..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10 bg-slate-700/40 border-slate-600/50 text-white placeholder:text-slate-400"
                  />
                </div>
                
                <Select value={filters.severity} onValueChange={(value) => setFilters({ ...filters, severity: value })}>
                  <SelectTrigger className="bg-slate-700/40 border-slate-600/50 text-white">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.rule_type} onValueChange={(value) => setFilters({ ...filters, rule_type: value })}>
                  <SelectTrigger className="bg-slate-700/40 border-slate-600/50 text-white">
                    <SelectValue placeholder="Rule Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="regulatory">Regulatory</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.is_active} onValueChange={(value) => setFilters({ ...filters, is_active: value })}>
                  <SelectTrigger className="bg-slate-700/40 border-slate-600/50 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  onClick={() => setFilters({ severity: 'all', rule_type: 'all', is_active: 'all', search: '' })}
                  variant="ghost"
                  className="text-white hover:bg-white/10 border border-white/20"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Policies List */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-400" />
                Policy Rules
              </CardTitle>
              <CardDescription className="text-slate-400">
                Showing {policies.length} of {totalPolicies} policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {policies.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No policies found</p>
                  <p className="text-slate-500 text-sm">Create your first policy rule to get started</p>
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-0"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Policy
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {policies.map((policy) => (
                    <div
                      key={policy.id}
                      className="p-6 bg-slate-700/40 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-white font-medium text-lg">{policy.name}</h3>
                            <Badge className={getSeverityColor(policy.severity)}>
                              {policy.severity}
                            </Badge>
                            <Badge className={getRuleTypeColor(policy.rule_type)}>
                              {policy.rule_type}
                            </Badge>
                            <div className="flex items-center space-x-2">
                              {policy.is_active ? (
                                <div className="flex items-center space-x-1 text-green-400">
                                  <Eye className="h-4 w-4" />
                                  <span className="text-sm">Active</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1 text-slate-400">
                                  <EyeOff className="h-4 w-4" />
                                  <span className="text-sm">Inactive</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-slate-300 text-sm mb-4">{policy.description}</p>
                          
                          {policy.keywords && policy.keywords.length > 0 && (
                            <div className="mb-4">
                              <p className="text-slate-400 text-sm mb-2">Keywords:</p>
                              <div className="flex flex-wrap gap-2">
                                {policy.keywords.map((keyword, index) => (
                                  <Badge key={index} variant="outline" className="text-slate-300 border-slate-600">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>Created {formatDate(policy.created_at)}</span>
                            </div>
                            {policy.updated_at && (
                              <div className="flex items-center space-x-1">
                                <Zap className="h-3 w-3" />
                                <span>Updated {formatDate(policy.updated_at)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setEditingPolicy(policy)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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

export default PolicyManagement; 