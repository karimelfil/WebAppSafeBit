import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Upload, History, Shield, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

export function UserHome({ onNavigate }) {
  const recentScans = [
    { dish: 'Caesar Salad', restaurant: 'Italian Bistro', status: 'safe', date: '2 hours ago' },
    { dish: 'Pad Thai', restaurant: 'Thai Kitchen', status: 'unsafe', date: 'Yesterday' },
    { dish: 'Margherita Pizza', restaurant: 'Pizza Palace', status: 'safe', date: '2 days ago' },
  ];

  const userAllergies = ['Peanuts', 'Shellfish'];
  const userDiseases = ['Diabetes', 'Celiac Disease'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Image */}
      <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl p-6 md:p-8 text-white overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">Welcome to SafeBite</h2>
          </div>
          <p className="text-emerald-50 mb-6 text-sm md:text-base max-w-2xl">
            Your personal food safety assistant. Scan menus to get instant allergen warnings and safe meal recommendations.
          </p>
          <Button 
            onClick={() => onNavigate('upload')}
            className="p-0 h-auto bg-transparent hover:bg-transparent border-0 shadow-none text-white hover:text-emerald-100 font-semibold transition-colors duration-200 [&_svg]:text-white"
            size="lg"
          >
            <Upload className="h-5 w-5 mr-2" />
            Scan a Menu Now
          </Button>
        </div>
      </div>

      {/* Active Allergies & Diseases Alert */}
      {(userAllergies.length > 0 || userDiseases.length > 0) && (
        <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-sm">
          <Shield className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <div className="space-y-1">
              {userAllergies.length > 0 && (
                <p>
                  <strong className="font-semibold">Active Allergies:</strong>{' '}
                  <span className="text-amber-800">{userAllergies.join(', ')}</span>
                </p>
              )}
              {userDiseases.length > 0 && (
                <p>
                  <strong className="font-semibold">Active Conditions:</strong>{' '}
                  <span className="text-amber-800">{userDiseases.join(', ')}</span>
                </p>
              )}
              <p className="text-sm text-amber-700 mt-2">
                We'll warn you about dishes containing these allergens or that may not be suitable for your conditions.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card className="border-2 border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>Access your most-used features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="w-full justify-start items-start h-auto py-5 px-4 border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-white hover:border-emerald-400 hover:from-emerald-100 hover:to-emerald-50 hover:shadow-md transition-all group"
              onClick={() => onNavigate('upload')}
            >
              <div className="bg-emerald-100 p-3 rounded-lg mr-4 group-hover:bg-emerald-200 transition-colors shrink-0">
                <Upload className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-emerald-900">Scan New Menu</p>
                <p className="text-xs text-emerald-700/80 mt-1 leading-relaxed">Upload or capture a menu</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto py-6 border-2 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              onClick={() => onNavigate('history')}
            >
              <div className="bg-blue-100 p-3 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
                <History className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">View Scan History</p>
                <p className="text-xs text-gray-500 mt-1">Review past menu scans</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto py-6 border-2 hover:border-purple-300 hover:bg-purple-50 transition-all group"
              onClick={() => onNavigate('profile')}
            >
              <div className="bg-purple-100 p-3 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Manage Profile</p>
                <p className="text-xs text-gray-500 mt-1">Update health information</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Scans */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>Your latest menu scans and results</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('history')}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentScans.map((scan, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition-all"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{scan.dish}</p>
                  <p className="text-xs text-gray-600 mt-1">{scan.restaurant}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 font-medium">{scan.date}</span>
                  {scan.status === 'safe' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">Safe</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full border border-red-200">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs font-medium">Warning</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety Tips */}
      <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            Safety Tips
          </CardTitle>
          <CardDescription>Important reminders for safe dining</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg shadow-sm">
              <p className="text-sm text-blue-900 font-medium">
                Always inform restaurant staff about your allergies, even if the app says a dish is safe.
              </p>
            </div>
            <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg shadow-sm">
              <p className="text-sm text-emerald-900 font-medium">
                Keep your health profile updated for accurate recommendations.
              </p>
            </div>
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg shadow-sm">
              <p className="text-sm text-amber-900 font-medium">
                When in doubt, choose dishes with simpler ingredient lists to reduce risk.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
