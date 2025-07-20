import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Filter, 
  Download, 
  Search,
  Eye,
  EyeOff,
  RefreshCw,
  Calendar,
  MessageSquare,
  GitBranch,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApiAuth } from '@/lib/auth';
import { buildApiUrl, API_CONFIG } from '@/config/api';

interface Violation {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  source_platform: 'slack' | 'github' | 'api' | 'manual';
  source_reference?: string;
  created_at: string;
  violation_type: string;
  confidence_score?: number;
}

interface ViolationsResponse {
  items: Violation[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const ViolationsFeed = () => {
  const { user } = useUser();
  const { getAuthHeaders, isSignedIn } = useApiAuth();
  const navigate = useNavigate();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalViolations, setTotalViolations] = useState(0);
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    source: 'all',
    search: ''
  });

  // Debug logging
  console.log("🔍 ViolationsFeed component rendered");
  console.log("🔍 Loading state:", loading);
  console.log("🔍 Error state:", error);
  console.log("🔍 Violations count:", violations.length);
  console.log("🔍 Is signed in:", isSignedIn);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const loadViolations = async () => {
    // Allow loading even when not signed in (for dev testing)
    if (!isSignedIn) {
      console.log("User not signed in, using dev authentication");
    }

    try {
      setLoading(true);
      console.log("🔍 Fetching violations...");
      
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
        ...(filters.status && filters.status !== 'all' && { status: filters.status }),
        ...(filters.source && filters.source !== 'all' && { source_platform: filters.source }),
        ...(filters.search && { search: filters.search })
      });
      
      const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.COMPLIANCE)}/violations?${params}`, {
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
      
      setViolations(data.items || []);
      setTotalViolations(data.total || 0);
      setTotalPages(data.pages || 0);
    } catch (error) {
      console.error("❌ Error fetching violations:", error);
      setError("Failed to fetch violations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load violations even when not signed in (for dev testing)
    loadViolations();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'needs_review':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'pending':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'slack':
        return <MessageSquare className="h-4 w-4" />;
      case 'github':
        return <GitBranch className="h-4 w-4" />;
      case 'api':
        return <ExternalLink className="h-4 w-4" />;
      case 'manual':
        return <Eye className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
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

  const exportToCSV = () => {
    const headers = ['ID', 'Title', 'Severity', 'Status', 'Source', 'Created At', 'Description'];
    const csvContent = [
      headers.join(','),
      ...violations.map(v => [
        v.id,
        `"${v.title}"`,
        v.severity,
        v.status,
        v.source_platform,
        formatDate(v.created_at),
        `"${v.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `violations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center mb-4">
            <RefreshCw className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-slate-300">Loading violations...</p>
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
          <p className="text-red-300">Error loading violations</p>
          <p className="text-red-400 text-sm mt-2">{error}</p>
          <button 
            onClick={loadViolations}
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
                  <h1 className="text-2xl font-bold text-white">Violations Feed</h1>
                </Link>
                <p className="text-slate-400 text-sm">Monitor and manage compliance violations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={exportToCSV}
                className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-0"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                onClick={loadViolations}
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
        {/* Debug Info */}
        <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-300 text-sm">
            Debug: Violations loaded: {violations.length}, Total: {totalViolations}, Page: {currentPage}, Error: {error || 'None'}
          </p>
        </div>

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
                  <p className="text-slate-400 text-sm font-medium">Total Violations</p>
                  <p className="text-2xl font-bold text-white mt-1">{totalViolations}</p>
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
                  <p className="text-slate-400 text-sm font-medium">Pending Review</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {violations.filter(v => v.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Critical Issues</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {violations.filter(v => v.severity === 'critical').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Resolved</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {violations.filter(v => v.status === 'approved').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
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
                    placeholder="Search violations..."
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

                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="bg-slate-700/40 border-slate-600/50 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.source} onValueChange={(value) => setFilters({ ...filters, source: value })}>
                  <SelectTrigger className="bg-slate-700/40 border-slate-600/50 text-white">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  onClick={() => setFilters({ severity: 'all', status: 'all', source: 'all', search: '' })}
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

        {/* Violations Table */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
                Recent Violations
              </CardTitle>
              <CardDescription className="text-slate-400">
                Showing {violations.length} of {totalViolations} violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {violations.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No violations found</p>
                  <p className="text-slate-500 text-sm">Try adjusting your filters or check back later</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {violations.map((violation) => (
                    <div
                      key={violation.id}
                      className="p-4 bg-slate-700/40 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-medium">{violation.title}</h3>
                            <Badge className={getSeverityColor(violation.severity)}>
                              {violation.severity}
                            </Badge>
                            <Badge className={getStatusColor(violation.status)}>
                              {violation.status.replace('_', ' ')}
                            </Badge>
                            <div className="flex items-center space-x-1 text-slate-400">
                                              {getSourceIcon(violation.source_platform)}
                <span className="text-sm capitalize">{violation.source_platform}</span>
                            </div>
                          </div>
                          <p className="text-slate-300 text-sm mb-3">{violation.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(violation.created_at)}</span>
                            </div>
                            {violation.confidence_score && (
                              <span>Confidence: {Math.round(violation.confidence_score * 100)}%</span>
                            )}
                            {violation.source_reference && (
                              <a 
                                href={violation.source_reference} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-blue-400 hover:text-blue-300"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>View Source</span>
                              </a>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-600/30">
                  <p className="text-slate-400 text-sm">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="text-white hover:bg-white/10 border border-white/20"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="text-white hover:bg-white/10 border border-white/20"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default ViolationsFeed; 