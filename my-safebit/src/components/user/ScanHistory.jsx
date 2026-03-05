import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Search, Eye, CheckCircle, AlertTriangle, Calendar, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

const mockHistory = [
  {
    id: 'SCAN001',
    restaurant: 'Italian Bistro',
    location: 'Downtown',
    scannedAt: '2024-11-17 14:30',
    dishes: [
      {
        name: 'Caesar Salad',
        isSafe: true,
        allergens: ['Fish', 'Milk', 'Wheat'],
        ingredients: ['Romaine Lettuce', 'Parmesan', 'Croutons', 'Caesar Dressing', 'Anchovies']
      },
      {
        name: 'Fettuccine Alfredo',
        isSafe: true,
        allergens: ['Wheat', 'Milk'],
        ingredients: ['Pasta', 'Cream', 'Parmesan', 'Butter', 'Garlic']
      }
    ]
  },
  {
    id: 'SCAN002',
    restaurant: 'Thai Kitchen',
    location: 'Midtown',
    scannedAt: '2024-11-16 12:15',
    dishes: [
      {
        name: 'Pad Thai',
        isSafe: false,
        allergens: ['Shellfish', 'Peanuts', 'Eggs'],
        ingredients: ['Rice Noodles', 'Shrimp', 'Peanuts', 'Egg', 'Bean Sprouts', 'Lime']
      },
      {
        name: 'Green Curry',
        isSafe: true,
        allergens: ['Shellfish'],
        ingredients: ['Coconut Milk', 'Chicken', 'Basil', 'Green Curry Paste', 'Vegetables']
      }
    ]
  },
  {
    id: 'SCAN003',
    restaurant: 'Sushi Bar',
    location: 'Waterfront',
    scannedAt: '2024-11-15 19:45',
    dishes: [
      {
        name: 'California Roll',
        isSafe: false,
        allergens: ['Shellfish', 'Fish', 'Soy'],
        ingredients: ['Crab', 'Avocado', 'Cucumber', 'Rice', 'Nori', 'Sesame']
      },
      {
        name: 'Miso Soup',
        isSafe: true,
        allergens: ['Soy', 'Fish'],
        ingredients: ['Miso Paste', 'Tofu', 'Seaweed', 'Green Onions']
      }
    ]
  },
  {
    id: 'SCAN004',
    restaurant: 'Pizza Palace',
    location: 'Uptown',
    scannedAt: '2024-11-14 18:20',
    dishes: [
      {
        name: 'Margherita Pizza',
        isSafe: true,
        allergens: ['Wheat', 'Milk'],
        ingredients: ['Pizza Dough', 'Tomato Sauce', 'Mozzarella', 'Basil', 'Olive Oil']
      }
    ]
  },
];

export function ScanHistory() {
  const [history] = useState(mockHistory);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const filteredHistory = history.filter(record =>
    record.restaurant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.dishes.some(dish => dish.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewScan = (scan) => {
    setSelectedScan(scan);
    setShowDetailsDialog(true);
  };

  const userAllergies = ['Peanuts', 'Shellfish'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2>Scan History</h2>
          <p className="text-sm text-gray-600">Review your past menu scans and results</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Scans</p>
          <p className="text-gray-900 mt-1">{history.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <p className="text-sm text-gray-600">Safe Dishes Found</p>
          <p className="text-green-600 mt-1">
            {history.reduce((acc, scan) => acc + scan.dishes.filter(d => d.isSafe).length, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <p className="text-sm text-gray-600">Warnings Issued</p>
          <p className="text-red-600 mt-1">
            {history.reduce((acc, scan) => acc + scan.dishes.filter(d => !d.isSafe).length, 0)}
          </p>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.map(record => {
          const safeDishes = record.dishes.filter(d => d.isSafe).length;
          const totalDishes = record.dishes.length;
          const hasWarnings = record.dishes.some(d => !d.isSafe);

          return (
            <Card key={record.id} className="border-0">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {record.restaurant}
                      {hasWarnings ? (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </CardTitle>
                    <CardDescription className="flex flex-col gap-1 mt-2">
                      <span className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {record.location}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(record.scannedAt).toLocaleString()}
                      </span>
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleViewScan(record)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      {totalDishes} {totalDishes === 1 ? 'dish' : 'dishes'} scanned
                    </span>
                    <span className="text-green-600">
                      {safeDishes} safe
                    </span>
                    {hasWarnings && (
                      <span className="text-red-600">
                        {totalDishes - safeDishes} with warnings
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {record.dishes.map((dish, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          dish.isSafe
                            ? 'bg-green-50'
                            : 'bg-red-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {dish.isSafe ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm">{dish.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 justify-end">
                            {dish.allergens.slice(0, 2).map((allergen, aIndex) => {
                              const matchesUserAllergy = userAllergies.includes(allergen);
                              return (
                                <Badge
                                  key={aIndex}
                                  variant={matchesUserAllergy ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {allergen}
                                </Badge>
                              );
                            })}
                            {dish.allergens.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{dish.allergens.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Scan Details</DialogTitle>
            <DialogDescription>
              Complete information about this menu scan
            </DialogDescription>
          </DialogHeader>
          {selectedScan && (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Restaurant</p>
                  <p className="text-sm mt-1">{selectedScan.restaurant}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-sm mt-1">{selectedScan.location}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Scanned At</p>
                  <p className="text-sm mt-1">{new Date(selectedScan.scannedAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Dishes */}
              <div>
                <p className="text-sm text-gray-600 mb-3">Scanned Dishes</p>
                <div className="space-y-4">
                  {selectedScan.dishes.map((dish, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        dish.isSafe
                          ? 'bg-green-50'
                          : 'bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {dish.isSafe ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        )}
                        <h3 className={dish.isSafe ? 'text-green-900' : 'text-red-900'}>
                          {dish.name}
                        </h3>
                      </div>

                      {!dish.isSafe && (
                        <Alert className="bg-red-100 border-red-300 mb-3">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800 text-sm">
                            This dish contains allergens that match your profile
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="mb-3">
                        <p className="text-sm text-gray-700 mb-2">Ingredients:</p>
                        <div className="flex flex-wrap gap-2">
                          {dish.ingredients.map((ingredient, iIndex) => (
                            <Badge key={iIndex} variant="secondary" className="text-xs">
                              {ingredient}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {dish.allergens.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-700 mb-2">Allergens:</p>
                          <div className="flex flex-wrap gap-2">
                            {dish.allergens.map((allergen, aIndex) => {
                              const matchesUserAllergy = userAllergies.includes(allergen);
                              return (
                                <Badge
                                  key={aIndex}
                                  variant={matchesUserAllergy ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {allergen}
                                  {matchesUserAllergy && ' ⚠️'}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
