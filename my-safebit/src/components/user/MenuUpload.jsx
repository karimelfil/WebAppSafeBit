import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Upload, Camera, FileImage, CheckCircle, AlertTriangle, Loader2, X, UtensilsCrossed, Shield, AlertCircle, Ban } from 'lucide-react';

export function MenuUpload() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedDishes, setDetectedDishes] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedDish, setSelectedDish] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const isTouchDevice =
    typeof window !== 'undefined' &&
    (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );

  const handleFileSelect = (file) => {
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setDetectedDishes(null);
    setShowResults(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleScanMenu = () => {
    if (!restaurantName.trim()) {
      alert('Please enter restaurant name');
      return;
    }

    setIsProcessing(true);

    // Simulate menu scanning and ingredient detection
    setTimeout(() => {
      const mockDetectedDishes = [
        {
          name: 'Grilled Salmon',
          description: 'Fresh Atlantic salmon with herbs and lemon',
          category: 'Main Course',
          allergens: ['Fish'],
          isSafe: true,
          hasWarning: false
        },
        {
          name: 'Caesar Salad',
          description: 'Romaine lettuce with Caesar dressing and croutons',
          category: 'Appetizer',
          allergens: ['Dairy', 'Wheat', 'Fish'],
          isSafe: false,
          hasWarning: true
        },
        {
          name: 'Margherita Pizza',
          description: 'Classic pizza with tomato sauce and mozzarella',
          category: 'Main Course',
          allergens: ['Wheat', 'Milk'],
          isSafe: true,
          hasWarning: false
        },
        {
          name: 'Pad Thai',
          description: 'Traditional Thai stir-fried rice noodles',
          category: 'Main Course',
          allergens: ['Peanuts', 'Shellfish', 'Eggs'],
          isSafe: false,
          hasWarning: true
        },
        {
          name: 'Chocolate Cake',
          description: 'Rich chocolate cake with ganache',
          category: 'Dessert',
          allergens: ['Wheat', 'Milk', 'Eggs'],
          isSafe: true,
          hasWarning: false
        },
        {
          name: 'Garlic Bread',
          description: 'Toasted bread with garlic butter',
          category: 'Appetizer',
          allergens: ['Wheat', 'Milk'],
          isSafe: true,
          hasWarning: false
        },
      ];

      setDetectedDishes(mockDetectedDishes);
      setIsProcessing(false);
      setShowResults(true);
    }, 2000);
  };

  const handleReset = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setDetectedDishes(null);
    setRestaurantName('');
    setShowResults(false);
    setIsProcessing(false);
    setShowReportForm(false);
    setReportMessage('');
    setSelectedDish('');
  };

  const handleReportIssue = (dishName) => {
    setSelectedDish(dishName);
    setShowReportForm(true);
  };

  const handleSubmitReport = () => {
    if (!reportMessage.trim()) {
      alert('Please describe the issue');
      return;
    }

    // Here you would typically send the report to your backend
    console.log('Report submitted:', {
      dish: selectedDish,
      message: reportMessage,
      restaurant: restaurantName
    });

    alert('Thank you for your feedback! We will review the issue.');
    setShowReportForm(false);
    setReportMessage('');
    setSelectedDish('');
  };

  // Calculate statistics
  const safeDishes = detectedDishes?.filter(dish => dish.isSafe).length || 0;
  const warningDishes = detectedDishes?.filter(dish => dish.hasWarning).length || 0;
  const unsafeDishes = detectedDishes?.filter(dish => !dish.isSafe).length || 0;
  const totalDishes = detectedDishes?.length || 0;
  const safePercentage = totalDishes > 0 ? Math.round((safeDishes / totalDishes) * 100) : 0;

  if (showReportForm) {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Report Issue</h2>
          <p className="text-sm text-gray-600 mt-1">Tell us what is wrong with {selectedDish}</p>
        </div>

        {/* Report Form */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Your Message
                </label>
                <Textarea
                  placeholder="Describe the incorrect detection, missing ingredients, or any issue..."
                  value={reportMessage}
                  onChange={(e) => setReportMessage(e.target.value)}
                  className="min-h-32 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowReportForm(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleSubmitReport}
              >
                Submit Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults && detectedDishes) {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Menu Analysis Results</h2>
          <p className="text-sm text-gray-600 mt-1">Safety analysis for {restaurantName}</p>
        </div>

        {/* Safety Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex justify-center mb-2">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{safeDishes}</div>
            <div className="text-sm text-green-700">Safe</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex justify-center mb-2">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{warningDishes}</div>
            <div className="text-sm text-yellow-700">Warning</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex justify-center mb-2">
              <Ban className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">{unsafeDishes}</div>
            <div className="text-sm text-red-700">Unsafe</div>
          </div>
        </div>

        {/* Safety Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <X className="h-5 w-5 text-red-500" />
              <span className="font-semibold text-gray-900">Safety Summary</span>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              {safePercentage}% of menu items are safe for you
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${safePercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Menu Items Analysis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Menu Items Analysis ({totalDishes} items)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detectedDishes.map((dish, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 ${
                    dish.isSafe ? 'border-green-500 bg-green-100' : 'border-red-500 bg-red-100'
                  }`}>
                    {dish.isSafe && (
                      <div className="w-2 h-2 bg-green-500 rounded-full m-0.5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{dish.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{dish.description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {dish.category}
                      </Badge>
                    </div>

                    {dish.allergens.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-1">Allergens:</p>
                        <div className="flex flex-wrap gap-1">
                          {dish.allergens.map((allergen, aIndex) => (
                            <Badge 
                              key={aIndex} 
                              variant={dish.hasWarning ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                      onClick={() => handleReportIssue(dish.name)}
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Report incorrect detection
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            Scan Another Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Upload Menu</h2>
        <p className="text-sm text-gray-600 mt-1">Take a photo or upload a PDF to analyze</p>
      </div>

      {/* Upload Card */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Restaurant Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Restaurant Name</label>
            <Input
              placeholder="Enter restaurant name"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Upload Options */}
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors"
              onClick={() => {
                if (isTouchDevice) {
                  cameraInputRef.current?.click();
                  return;
                }
                fileInputRef.current?.click();
              }}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">Upload Menu</p>
              <p className="text-xs text-gray-500">
                {isTouchDevice ? 'Tap to open camera' : 'Click to browse or drag & drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG or PDF (max 10MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            {isTouchDevice && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-14 flex-col gap-2"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-sm">Take Photo</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File / PDF
                </Button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  className="hidden"
                />
              </>
            )}
          </div>

          {/* Uploaded File Preview */}
          {uploadedFile && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <FileImage className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">{uploadedFile.name}</p>
                  <p className="text-xs text-green-600">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <Button
            onClick={handleScanMenu}
            disabled={!uploadedFile || isProcessing || !restaurantName.trim()}
            className="w-full bg-green-600 hover:bg-green-700 h-12 text-base"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Menu...
              </>
            ) : (
              <>
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                Analyze Menu
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
