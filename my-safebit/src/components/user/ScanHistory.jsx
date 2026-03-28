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
import { styles } from '../../styles/user/ScanHistory.styles.js';
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
    <div className={styles.cls001}>
      {/* Header */}
      <div className={styles.cls002}>
        <div>
          <h2>Scan History</h2>
          <p className={styles.cls003}>Review your past menu scans and results</p>
        </div>
        <div className={styles.cls004}>
          <Search className={styles.cls005} />
          <Input
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.cls006}
          />
        </div>
      </div>

      {/* Stats */}
      <div className={styles.cls007}>
        <div className={styles.cls008}>
          <p className={styles.cls003}>Total Scans</p>
          <p className={styles.cls009}>{history.length}</p>
        </div>
        <div className={styles.cls008}>
          <p className={styles.cls003}>Safe Dishes Found</p>
          <p className={styles.cls010}>
            {history.reduce((acc, scan) => acc + scan.dishes.filter(d => d.isSafe).length, 0)}
          </p>
        </div>
        <div className={styles.cls008}>
          <p className={styles.cls003}>Warnings Issued</p>
          <p className={styles.cls011}>
            {history.reduce((acc, scan) => acc + scan.dishes.filter(d => !d.isSafe).length, 0)}
          </p>
        </div>
      </div>

      {/* History List */}
      <div className={styles.cls012}>
        {filteredHistory.map(record => {
          const safeDishes = record.dishes.filter(d => d.isSafe).length;
          const totalDishes = record.dishes.length;
          const hasWarnings = record.dishes.some(d => !d.isSafe);

          return (
            <Card key={record.id} className={styles.cls013}>
              <CardHeader>
                <div className={styles.cls014}>
                  <div className={styles.cls015}>
                    <CardTitle className={styles.cls016}>
                      {record.restaurant}
                      {hasWarnings ? (
                        <AlertTriangle className={styles.cls017} />
                      ) : (
                        <CheckCircle className={styles.cls018} />
                      )}
                    </CardTitle>
                    <CardDescription className={styles.cls019}>
                      <span className={styles.cls016}>
                        <MapPin className={styles.cls020} />
                        {record.location}
                      </span>
                      <span className={styles.cls016}>
                        <Calendar className={styles.cls020} />
                        {new Date(record.scannedAt).toLocaleString()}
                      </span>
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleViewScan(record)}
                  >
                    <Eye className={styles.cls021} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className={styles.cls022}>
                  <div className={styles.cls023}>
                    <span className={styles.cls024}>
                      {totalDishes} {totalDishes === 1 ? 'dish' : 'dishes'} scanned
                    </span>
                    <span className={styles.cls025}>
                      {safeDishes} safe
                    </span>
                    {hasWarnings && (
                      <span className={styles.cls026}>
                        {totalDishes - safeDishes} with warnings
                      </span>
                    )}
                  </div>

                  <div className={styles.cls027}>
                    {record.dishes.map((dish, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          dish.isSafe
                            ? 'bg-green-50'
                            : 'bg-red-50'
                        }`}
                      >
                        <div className={styles.cls028}>
                          <div className={styles.cls016}>
                            {dish.isSafe ? (
                              <CheckCircle className={styles.cls029} />
                            ) : (
                              <AlertTriangle className={styles.cls030} />
                            )}
                            <span className={styles.cls031}>{dish.name}</span>
                          </div>
                          <div className={styles.cls032}>
                            {dish.allergens.slice(0, 2).map((allergen, aIndex) => {
                              const matchesUserAllergy = userAllergies.includes(allergen);
                              return (
                                <Badge
                                  key={aIndex}
                                  variant={matchesUserAllergy ? 'destructive' : 'secondary'}
                                  className={styles.cls033}
                                >
                                  {allergen}
                                </Badge>
                              );
                            })}
                            {dish.allergens.length > 2 && (
                              <Badge variant="secondary" className={styles.cls033}>
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
        <DialogContent className={styles.cls034}>
          <DialogHeader>
            <DialogTitle>Scan Details</DialogTitle>
            <DialogDescription>
              Complete information about this menu scan
            </DialogDescription>
          </DialogHeader>
          {selectedScan && (
            <div className={styles.cls035}>
              {/* Basic Info */}
              <div className={styles.cls036}>
                <div>
                  <p className={styles.cls003}>Restaurant</p>
                  <p className={styles.cls037}>{selectedScan.restaurant}</p>
                </div>
                <div>
                  <p className={styles.cls003}>Location</p>
                  <p className={styles.cls037}>{selectedScan.location}</p>
                </div>
                <div className={styles.cls038}>
                  <p className={styles.cls003}>Scanned At</p>
                  <p className={styles.cls037}>{new Date(selectedScan.scannedAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Dishes */}
              <div>
                <p className={styles.cls039}>Scanned Dishes</p>
                <div className={styles.cls012}>
                  {selectedScan.dishes.map((dish, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        dish.isSafe
                          ? 'bg-green-50'
                          : 'bg-red-50'
                      }`}
                    >
                      <div className={styles.cls040}>
                        {dish.isSafe ? (
                          <CheckCircle className={styles.cls018} />
                        ) : (
                          <AlertTriangle className={styles.cls017} />
                        )}
                        <h3 className={dish.isSafe ? 'text-green-900' : 'text-red-900'}>
                          {dish.name}
                        </h3>
                      </div>

                      {!dish.isSafe && (
                        <Alert className={styles.cls041}>
                          <AlertTriangle className={styles.cls030} />
                          <AlertDescription className={styles.cls042}>
                            This dish contains allergens that match your profile
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className={styles.cls043}>
                        <p className={styles.cls044}>Ingredients:</p>
                        <div className={styles.cls045}>
                          {dish.ingredients.map((ingredient, iIndex) => (
                            <Badge key={iIndex} variant="secondary" className={styles.cls033}>
                              {ingredient}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {dish.allergens.length > 0 && (
                        <div>
                          <p className={styles.cls044}>Allergens:</p>
                          <div className={styles.cls045}>
                            {dish.allergens.map((allergen, aIndex) => {
                              const matchesUserAllergy = userAllergies.includes(allergen);
                              return (
                                <Badge
                                  key={aIndex}
                                  variant={matchesUserAllergy ? 'destructive' : 'secondary'}
                                  className={styles.cls033}
                                >
                                  {allergen}
                                  {matchesUserAllergy && ' âš ï¸'}
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


