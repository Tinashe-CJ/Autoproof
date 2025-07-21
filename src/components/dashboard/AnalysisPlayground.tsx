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
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
      // For PDF files, we can't read as text directly, so just show the filename
      if (file.type === 'application/pdf') {
        setContent(`PDF file uploaded: ${file.name}\n\nContent will be extracted during analysis.`);
      } else {
        // Read file content for preview (only for text-based files)
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (typeof text === 'string') {
            setContent(text.substring(0, 1000)); // Preview first 1000 chars
          } else {
            setContent(`File uploaded: ${file.name}\n\nContent will be processed during analysis.`);
          }
        };
        reader.onerror = () => {
          setContent(`File uploaded: ${file.name}\n\nContent will be processed during analysis.`);
        };
        reader.readAsText(file);
      }
    }
  };

  const analyzeContent = async () => {
    console.log('=== analyzeContent called ===');
    console.log('File state:', file);
    console.log('Content state:', content);
    console.log('Source state:', source);
    
    // Validation logic based on content source
    if (source === 'manual') {
      // For manual input, require either file OR content
      if (!file && !content.trim()) {
        console.log('Manual source: No file and no content, showing error');
        setError('Please provide content to analyze or upload a file');
        return;
      }
    } else {
      // For other sources (github, slack, api), require content only
      if (!content.trim()) {
        console.log(`${source} source: No content provided, showing error`);
        setError('Please provide content to analyze');
        return;
      }
    }

    console.log('Starting analysis...');
    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const headers = await getAuthHeaders(file ? true : false); // Skip Content-Type for file uploads
      console.log('Auth headers:', headers);
      
      let response;
      if (file) {
        // File upload analysis
        console.log('=== File upload path ===');
        console.log('File object:', file);
        console.log('File name:', file.name);
        console.log('File size:', file.size);
        console.log('File type:', file.type);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('source', source);
        formData.append('document_name', file.name);
        formData.append('document_type', file.type);
        formData.append('compliance_framework', 'custom');
        
        // Debug FormData contents
        console.log('FormData entries:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }
        
        console.log('Request URL:', `${buildApiUrl(API_CONFIG.ENDPOINTS.ANALYZE)}/upload-document`);
        console.log('Request headers:', headers);
        
        response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.ANALYZE)}/upload-document`, {
          method: 'POST',
          headers: {
            ...headers,
            // Don't set Content-Type for FormData - let browser set it with boundary
          },
          body: formData,
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      } else {
        console.log('=== Text analysis path ===');
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
        
        if (file) {
          // Handle upload-document response format
          if (data.success) {
            // Convert DocumentUploadResponse to AnalysisResponse format
            const analysisResponse = {
              violations: data.extracted_rules?.map((rule: any) => ({
                policy_rule_id: rule.id,
                policy_rule_name: rule.name,
                violation_type: 'policy_violation',
                severity: rule.severity || 'medium',
                title: rule.name,
                description: rule.description,
                matched_content: typeof rule.context === 'string' ? rule.context : 
                               typeof rule.description === 'string' ? rule.description : 
                               JSON.stringify(rule.context || rule.description || ''),
                confidence_score: rule.extraction_confidence || 0.8
              })) || [],
              total_violations: data.extracted_rules?.length || 0,
              analysis_summary: {
                processing_time_ms: data.processing_metadata?.processing_time_ms || 0,
                token_usage: data.processing_metadata?.token_usage || 0,
                source: 'document_upload',
                content_length: data.text_analysis?.text_length || 0,
                ai_analysis: true
              },
              processing_time_ms: data.processing_metadata?.processing_time_ms || 0
            };
            setResults(analysisResponse);
          } else {
            setError(data.error || 'Document processing failed');
          }
        } else {
          // Handle regular analyze response format
          // Ensure all violation fields are properly typed
          if (data.violations) {
            data.violations = data.violations.map((violation: any) => ({
              ...violation,
              matched_content: typeof violation.matched_content === 'string' 
                ? violation.matched_content 
                : JSON.stringify(violation.matched_content || ''),
              description: typeof violation.description === 'string' 
                ? violation.description 
                : JSON.stringify(violation.description || ''),
              title: typeof violation.title === 'string' 
                ? violation.title 
                : JSON.stringify(violation.title || '')
            }));
          }
          setResults(data);
        }
      } else {
        const errorData = await response.json();
        console.error('Analysis error response:', errorData);
        // Add this line for debugging
        console.log('Full backend error object:', errorData);
        
        // Handle different error response formats
        let errorMessage = 'Analysis failed';
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Network error occurred');
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-white hover:text-white hover:bg-white/10"
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
                  <Select value={source} onValueChange={(value: any) => {
                    setSource(value);
                    // Clear file when switching away from manual input
                    if (value !== 'manual') {
                      setFile(null);
                    }
                  }}>
                    <SelectTrigger className="bg-slate-700/40 border-slate-600/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 shadow-xl">
                      <SelectItem value="manual" className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">Manual Input</SelectItem>
                      <SelectItem value="slack" className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">Slack Message</SelectItem>
                      <SelectItem value="github" className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">GitHub Content</SelectItem>
                      <SelectItem value="api" className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer">API Response</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* File Upload - Only show for manual input */}
                {source === 'manual' && (
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      Upload File (Optional)
                    </label>
                    <div 
                      className="border-2 border-dashed border-slate-600/50 rounded-lg p-6 text-center hover:border-slate-500/50 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm mb-2">
                        {file ? file.name : 'Drop a file here or click to browse'}
                      </p>
                      <input
                        type="file"
                        accept=".txt,.pdf,.json,.md,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
                        Choose File
                      </Button>
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
                )}

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
                  disabled={isAnalyzing || (source === 'manual' ? (!content.trim() && !file) : !content.trim())}
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
                      <div>
                        <h3 className="text-white font-medium mb-4">Detected Violations</h3>
                        <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3" style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: 'rgba(71, 85, 105, 0.8) rgba(30, 41, 59, 0.5)'
                        }}>
                          {results.violations.map((violation, index) => (
                            <div
                              key={index}
                              className="p-4 bg-slate-700/40 rounded-lg border border-slate-600/30 hover:bg-slate-700/60 hover:border-slate-500/50 transition-all duration-200 cursor-pointer group"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-white font-medium group-hover:text-blue-300 transition-colors">
                                  {typeof violation.title === 'string' ? violation.title : JSON.stringify(violation.title || '')}
                                </h4>
                                <Badge className={getSeverityColor(typeof violation.severity === 'string' ? violation.severity : 'medium')}>
                                  {typeof violation.severity === 'string' ? violation.severity : 'medium'}
                                </Badge>
                              </div>
                              <p className="text-slate-300 text-sm mb-3 overflow-hidden" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical' as const,
                                textOverflow: 'ellipsis'
                              }}>
                                {typeof violation.description === 'string' ? violation.description : JSON.stringify(violation.description || '')}
                              </p>
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Confidence: {Math.round((violation.confidence_score || 0) * 100)}%</span>
                                <span>Type: {typeof violation.violation_type === 'string' ? violation.violation_type : JSON.stringify(violation.violation_type || '')}</span>
                              </div>
                              {violation.matched_content && (
                                <div className="mt-3 p-3 bg-slate-600/30 rounded border-l-4 border-yellow-500/50">
                                  <p className="text-slate-400 text-xs mb-1">Matched Content:</p>
                                  <p className="text-slate-300 text-sm font-mono" style={{
                                    wordBreak: 'break-all',
                                    overflowWrap: 'break-word'
                                  }}>
                                    "{typeof violation.matched_content === 'string' 
                                      ? violation.matched_content 
                                      : JSON.stringify(violation.matched_content)}"
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
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