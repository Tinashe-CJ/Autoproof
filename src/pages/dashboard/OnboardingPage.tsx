import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Circle, ArrowRight, Store, Download, Palette, Rocket } from 'lucide-react';

// Memoized step components to prevent unnecessary re-renders
const ConnectStoreStep = React.memo(({ onComplete }: { onComplete: () => void }) => {
  const [storeUrl, setStoreUrl] = useState('mystore.myshopify.com');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const handleConnect = () => {
    if (!storeUrl.trim()) return;
    
    setIsConnecting(true);
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 1500);
  };

  const handleStoreUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStoreUrl(e.target.value);
    if (isConnected) {
      setIsConnected(false); // Reset connection if user changes URL
    }
  };

  return (
    <div className="text-center">
      <Store className="h-16 w-16 text-blue-600 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Shopify Store</h2>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        We'll securely connect to your Shopify store to access your products and orders. 
        This allows us to automatically collect and display authentic reviews.
      </p>
      
      <div className="max-w-md mx-auto mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
          Store URL
        </label>
        <div className="flex space-x-3">
          <input
            type="text"
            value={storeUrl}
            onChange={handleStoreUrlChange}
            placeholder="yourstore.myshopify.com"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {!isConnected && (
            <button
              onClick={handleConnect}
              disabled={isConnecting || !storeUrl.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>
      </div>
      
      {isConnected && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">{storeUrl}</p>
              <p className="text-sm text-gray-600">Connected successfully</p>
            </div>
          </div>
          <button
            onClick={() => setIsConnected(false)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Change Store
          </button>
        </div>
      )}
      
      {isConnecting && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-800 font-medium">Connecting to {storeUrl}...</p>
          </div>
        </div>
      )}
      
      <button
        onClick={onComplete}
        disabled={!isConnected}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold flex items-center mx-auto transition-colors disabled:cursor-not-allowed"
      >
        Continue
        <ArrowRight className="ml-2 h-5 w-5" />
      </button>
    </div>
  );
});

const ImportReviewsStep = React.memo(({ onComplete }: { onComplete: () => void }) => {
  return (
    <div className="text-center">
      <Download className="h-16 w-16 text-blue-600 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Import Your Existing Reviews</h2>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        We found existing reviews in your store. Let's import them so you can start 
        displaying social proof right away.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">247</p>
            <p className="text-sm text-gray-600">Reviews found</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">4.6</p>
            <p className="text-sm text-gray-600">Average rating</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">89%</p>
            <p className="text-sm text-gray-600">5-star reviews</p>
          </div>
        </div>
      </div>
      
      <button
        onClick={onComplete}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center mx-auto"
      >
        Import Reviews
        <ArrowRight className="ml-2 h-5 w-5" />
      </button>
    </div>
  );
});

const CustomizeWidgetStep = React.memo(({ onComplete }: { onComplete: () => void }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('Modern');
  const [selectedColor, setSelectedColor] = useState('#2563eb');

  const templates = [
    { id: 'Modern', name: 'Modern', bgColor: 'bg-white', shadow: 'shadow-sm', rounded: 'rounded-lg' },
    { id: 'Bold', name: 'Bold', bgColor: 'bg-gray-900', shadow: 'shadow-lg', rounded: 'rounded-xl' },
    { id: 'Classic', name: 'Classic', bgColor: 'bg-white', shadow: 'shadow-none', rounded: 'rounded' },
    { id: 'Minimalist', name: 'Minimalist', bgColor: 'bg-gray-50', shadow: 'shadow-none', rounded: 'rounded-none' }
  ];

  const colors = [
    { id: '#2563eb', name: 'Blue', color: '#2563eb' },
    { id: '#7c3aed', name: 'Purple', color: '#7c3aed' },
    { id: '#dc2626', name: 'Red', color: '#dc2626' },
    { id: '#059669', name: 'Green', color: '#059669' },
    { id: '#ea580c', name: 'Orange', color: '#ea580c' }
  ];

  const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];
  const textColor = selectedTemplate === 'Bold' ? 'text-white' : 'text-gray-900';
  const secondaryTextColor = selectedTemplate === 'Bold' ? 'text-gray-300' : 'text-gray-700';
  const tertiaryTextColor = selectedTemplate === 'Bold' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div>
      <div className="text-center mb-8">
        <Palette className="h-16 w-16 text-blue-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Customize Your First Widget</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose a template and customize it to match your brand. You can always change this later.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose a Template</h3>
          <div className="space-y-3">
            {templates.map((template) => (
              <label key={template.id} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                selectedTemplate === template.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input 
                  type="radio" 
                  name="template" 
                  value={template.id} 
                  className="mr-3" 
                  checked={selectedTemplate === template.id}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                />
                <span className="font-medium">{template.name}</span>
              </label>
            ))}
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Primary Color</h4>
            <div className="flex space-x-2">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    selectedColor === color.color 
                      ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400' 
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.color }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className={`${currentTemplate.bgColor} ${currentTemplate.rounded} ${currentTemplate.shadow} p-4 transition-all duration-300 ${
              selectedTemplate === 'Minimalist' ? 'border-l-4' : ''
            }`} style={selectedTemplate === 'Minimalist' ? { borderLeftColor: selectedColor } : {}}>
              <div className="flex items-center space-x-3 mb-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: selectedColor }}
                >
                  <span className="text-sm font-medium">S</span>
                </div>
                <div>
                  <p className={`font-medium ${textColor}`}>Sarah M.</p>
                  <div className="flex" style={{ color: selectedColor }}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-sm">★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className={`${secondaryTextColor} text-sm`}>
                "Amazing product! Exceeded my expectations. Fast shipping and great quality."
              </p>
              <p className={`text-xs ${tertiaryTextColor} mt-2`}>Verified purchase • 2 hours ago</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <button
          onClick={onComplete}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center mx-auto"
        >
          Create Widget
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
});

const GoLiveStep = React.memo(({ onComplete }: { onComplete: () => void }) => {
  return (
    <div className="text-center">
      <Rocket className="h-16 w-16 text-blue-600 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Go Live!</h2>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        Your widget is ready to be published to your store. Once live, it will start 
        displaying your customer reviews and collecting new ones automatically.
      </p>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
          <span className="font-medium text-green-800">Everything looks great!</span>
        </div>
        <ul className="text-sm text-green-700 space-y-1">
          <li>✓ Store connected successfully</li>
          <li>✓ 247 reviews imported</li>
          <li>✓ Widget customized and ready</li>
          <li>✓ Email automation configured</li>
        </ul>
      </div>
      
      <button
        onClick={onComplete}
        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center mx-auto"
      >
        Publish Widget
        <Rocket className="ml-2 h-5 w-5" />
      </button>
      
      <p className="text-sm text-gray-600 mt-4">
        You can always modify your widget settings later in the dashboard.
      </p>
    </div>
  );
});

export const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      id: 0,
      title: 'Connect Your Store',
      description: 'Link your Shopify store to get started',
      icon: Store,
    },
    {
      id: 1,
      title: 'Import Reviews',
      description: 'Import your existing reviews',
      icon: Download,
    },
    {
      id: 2,
      title: 'Customize Widget',
      description: 'Design your first review widget',
      icon: Palette,
    },
    {
      id: 3,
      title: 'Go Live',
      description: 'Publish your widget to your store',
      icon: Rocket,
    }
  ];

  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    if (stepId < steps.length - 1) {
      setCurrentStep(stepId + 1);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <ConnectStoreStep onComplete={() => handleStepComplete(currentStep)} />;
      case 1:
        return <ImportReviewsStep onComplete={() => handleStepComplete(currentStep)} />;
      case 2:
        return <CustomizeWidgetStep onComplete={() => handleStepComplete(currentStep)} />;
      case 3:
        return <GoLiveStep onComplete={() => handleStepComplete(currentStep)} />;
      default:
        return <ConnectStoreStep onComplete={() => handleStepComplete(currentStep)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 page-transition">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Autoproof!
          </h1>
          <p className="text-lg text-gray-600">
            Let's get your social proof widgets up and running in just a few minutes.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => {
                      if (completedSteps.includes(step.id) || currentStep === step.id) {
                        setCurrentStep(step.id);
                      }
                    }}
                    disabled={!completedSteps.includes(step.id) && currentStep !== step.id}
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                    completedSteps.includes(step.id)
                      ? 'bg-green-500 border-green-500 text-white hover:bg-green-600 cursor-pointer'
                      : currentStep === step.id
                      ? 'bg-blue-500 border-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                      : 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                  } ${(completedSteps.includes(step.id) || currentStep === step.id) ? 'hover:scale-105' : ''}`}>
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </button>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium transition-colors ${
                      currentStep === step.id 
                        ? 'text-blue-600' 
                        : completedSteps.includes(step.id)
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};