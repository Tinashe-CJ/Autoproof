import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  MessageSquare,
  GitBranch,
  ExternalLink,
  Eye,
  Download,
  RefreshCw,
  Settings,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApiAuth } from '@/lib/auth';
import { buildApiUrl, API_CONFIG } from '@/config/api';

interface AnalysisResult {
  violations: Array<{
    policy_rule_id?: string;
    policy_rule_name: string;
    violation_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    matched_content: string;
    confidence_score: number;
  }>;
  total_violations: number;
  analysis_summary: {
    processing_time_ms: number;
    token_usage?: number;
  };
}

const AnalysisPlayground = () => {
  const { user } = useUser();
  const { getAuthHeaders, isSignedIn } = useApiAuth();
  const [content, setContent] = useState('');
  const [source, setSource] = useState<'slack' | 'github' | 'api' | 'manual'>('manual');
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      // Read file content for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContent(text.substring(0, 1000)); // Preview first 1000 chars
      };
      reader.readAsText(file);
    }
  };

  const analyzeContent = async () => {
    if (!content.trim() && !file) {
      setError('Please provide content to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const headers = await getAuthHeaders();
      
      let response;
      if (file) {
        // File upload analysis
        const formData = new FormData();
        formData.append('file', file);
        formData.append('source', source);
        
        response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.ANALYZE)}/upload-document`, {
          method: 'POST',
          headers: {
            ...headers,
            // Don't set Content-Type for FormData
          },
          body: formData,
        });
      } else {
        // Text analysis
        response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.ANALYZE)}`, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: content,
            source: source,
            source_reference: null,
            metadata: {
              playground: true,
              timestamp: new Date().toISOString()
            }
          }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Analysis failed');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  const clearAll = () => {
    setContent('');
    setFile(null);
    setResults(null);
    setError(null);
  };

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
              <Link to="/dashboard">
                <div className="w-10 h-10 rounded-md bg-gradient-to-r from-blue-500 to-violet-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
              </Link>
              <div>
                <Link to="/dashboard">
                  <h1 className="text-2xl font-bold text-white">Analysis Playground</h1>
                </Link>
                <p className="text-slate-400 text-sm">Test compliance analysis with your content</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={clearAll}
                variant="ghost"
                className="text-white hover:bg-white/10 border border-white/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm h-fit">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-blue-400" />
                  Input Content
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Enter text or upload a file to analyze for compliance violations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Source Selection */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Content Source
                  </label>
                  <Select value={source} onValueChange={(value: any) => setSource(value)}>
                    <SelectTrigger className="bg-slate-700/40 border-slate-600/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="manual">Manual Input</SelectItem>
                      <SelectItem value="slack">Slack Message</SelectItem>
                      <SelectItem value="github">GitHub Content</SelectItem>
                      <SelectItem value="api">API Response</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* File Upload */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Upload File (Optional)
                  </label>
                  <div className="border-2 border-dashed border-slate-600/50 rounded-lg p-6 text-center hover:border-slate-500/50 transition-colors">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm mb-2">
                      {file ? file.name : 'Drop a file here or click to browse'}
                    </p>
                    <input
                      type="file"
                      accept=".txt,.pdf,.json,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
                        Choose File
                      </Button>
                    </label>
                    {file && (
                      <div className="mt-2 flex items-center justify-center space-x-2">
                        <FileText className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 text-sm">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFile(null)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Text Input */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Content Text
                  </label>
                  <Textarea
                    placeholder="Enter content to analyze for compliance violations..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px] bg-slate-700/40 border-slate-600/50 text-white placeholder:text-slate-400 resize-none"
                    disabled={isAnalyzing}
                  />
                  <p className="text-slate-500 text-xs mt-1">
                    {content.length} characters
                  </p>
                </div>

                {/* Analyze Button */}
                <Button
                  onClick={analyzeContent}
                  disabled={isAnalyzing || (!content.trim() && !file)}
                  className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-0 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Analyze Content
                    </>
                  )}
                </Button>

                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-red-400 text-sm">{error}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800/40 border border-slate-600/50 backdrop-blur-sm h-fit">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                  Analysis Results
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {results ? `Found ${results.total_violations} violations` : 'Run analysis to see results'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!results ? (
                  <div className="text-center py-12">
                    <Zap className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No analysis results yet</p>
                    <p className="text-slate-500 text-sm">Enter content and click analyze to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-slate-700/40 rounded-lg border border-slate-600/30">
                        <p className="text-slate-400 text-sm">Total Violations</p>
                        <p className="text-2xl font-bold text-white">{results.total_violations}</p>
                      </div>
                      <div className="p-4 bg-slate-700/40 rounded-lg border border-slate-600/30">
                        <p className="text-slate-400 text-sm">Processing Time</p>
                        <p className="text-2xl font-bold text-white">{results.analysis_summary.processing_time_ms}ms</p>
                      </div>
                    </div>

                    {/* Violations List */}
                    {results.violations.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <p className="text-green-400 font-medium">No violations detected!</p>
                        <p className="text-slate-500 text-sm">Your content appears to be compliant</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-white font-medium">Detected Violations</h3>
                        {results.violations.map((violation, index) => (
                          <div
                            key={index}
                            className="p-4 bg-slate-700/40 rounded-lg border border-slate-600/30"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-white font-medium">{violation.title}</h4>
                              <Badge className={getSeverityColor(violation.severity)}>
                                {violation.severity}
                              </Badge>
                            </div>
                            <p className="text-slate-300 text-sm mb-3">{violation.description}</p>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>Confidence: {Math.round(violation.confidence_score * 100)}%</span>
                              <span>Type: {violation.violation_type}</span>
                            </div>
                            {violation.matched_content && (
                              <div className="mt-3 p-3 bg-slate-600/30 rounded border-l-4 border-yellow-500/50">
                                <p className="text-slate-400 text-xs mb-1">Matched Content:</p>
                                <p className="text-slate-300 text-sm font-mono">
                                  "{violation.matched_content}"
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Export Results */}
                    {results && (
                      <div className="mt-6 pt-6 border-t border-slate-600/30">
                        <Button
                          variant="ghost"
                          className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Results
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AnalysisPlayground; 