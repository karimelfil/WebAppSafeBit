import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Search, Eye, UtensilsCrossed, ChefHat } from 'lucide-react';

const mockDishes = [
  {
    id: 'DISH001',
    name: 'Caesar Salad',
    restaurant: 'Italian Bistro',
    uploadedBy: 'john.doe@email.com',
    uploadedAt: '2024-11-15 14:30',
    ingredients: ['Romaine Lettuce', 'Parmesan Cheese', 'Croutons', 'Caesar Dressing', 'Anchovies'],
    detectedAllergens: ['Fish', 'Milk', 'Wheat']
  },
  {
    id: 'DISH002',
    name: 'Pad Thai',
    restaurant: 'Thai Kitchen',
    uploadedBy: 'jane.smith@email.com',
    uploadedAt: '2024-11-16 12:15',
    ingredients: ['Rice Noodles', 'Shrimp', 'Peanuts', 'Bean Sprouts', 'Egg', 'Tamarind Sauce'],
    detectedAllergens: ['Shellfish', 'Peanuts', 'Eggs']
  },
  {
    id: 'DISH003',
    name: 'Margherita Pizza',
    restaurant: 'Pizza Palace',
    uploadedBy: 'mike.j@email.com',
    uploadedAt: '2024-11-16 18:45',
    ingredients: ['Pizza Dough', 'Tomato Sauce', 'Mozzarella', 'Fresh Basil', 'Olive Oil'],
    detectedAllergens: ['Wheat', 'Milk']
  },
  {
    id: 'DISH004',
    name: 'Sushi Platter',
    restaurant: 'Sushi Bar',
    uploadedBy: 'emily.brown@email.com',
    uploadedAt: '2024-11-17 13:20',
    ingredients: ['Sushi Rice', 'Salmon', 'Tuna', 'Nori', 'Wasabi', 'Soy Sauce'],
    detectedAllergens: ['Fish', 'Soy', 'Wheat']
  },
  {
    id: 'DISH005',
    name: 'Chicken Tikka Masala',
    restaurant: 'Indian Spice',
    uploadedBy: 'john.doe@email.com',
    uploadedAt: '2024-11-17 19:10',
    ingredients: ['Chicken', 'Cream', 'Tomatoes', 'Onions', 'Garlic', 'Ginger', 'Spices'],
    detectedAllergens: ['Milk']
  },
  {
    id: 'DISH006',
    name: 'Grilled Salmon',
    restaurant: 'Seafood Grill',
    uploadedBy: 'jane.smith@email.com',
    uploadedAt: '2024-11-17 20:30',
    ingredients: ['Salmon Fillet', 'Lemon', 'Butter', 'Dill', 'Garlic'],
    detectedAllergens: ['Fish', 'Milk']
  },
];

export function DishesManagement() {
  const [dishes] = useState(mockDishes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDish, setSelectedDish] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const totalDishes = dishes.length;

  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dish.restaurant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dish.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dish.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDish = (dish) => {
    setSelectedDish(dish);
    setShowDetailsDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dishes & Ingredients Management</h2>
          <p className="text-sm text-gray-600 mt-1">Comprehensive overview of all uploaded dishes and ingredient analysis</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search dishes, restaurants, or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Total Dishes Card */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700 mb-1">Total Dishes Analyzed</p>
            <p className="text-3xl font-bold text-blue-900">{totalDishes}</p>
            <p className="text-xs text-blue-600 mt-2">All uploaded dishes in the system</p>
          </div>
          <div className="p-3 bg-blue-600 rounded-xl">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Dishes Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold text-gray-900">Dish ID</TableHead>
                <TableHead className="font-semibold text-gray-900">Dish Name</TableHead>
                <TableHead className="font-semibold text-gray-900">Restaurant</TableHead>
                <TableHead className="font-semibold text-gray-900">Uploaded By</TableHead>
                <TableHead className="font-semibold text-gray-900">Upload Date</TableHead>
                <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDishes.map(dish => (
                <TableRow key={dish.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-gray-900">{dish.id}</TableCell>
                  <TableCell className="font-medium text-gray-900">{dish.name}</TableCell>
                  <TableCell className="text-gray-700">{dish.restaurant}</TableCell>
                  <TableCell className="text-sm text-gray-600">{dish.uploadedBy}</TableCell>
                  <TableCell className="text-sm text-gray-600">{dish.uploadedAt}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewDish(dish)}
                      className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dish Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-green-100 rounded-lg">
                <UtensilsCrossed className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900">{selectedDish?.name}</div>
                <div className="text-sm font-normal text-gray-600">{selectedDish?.restaurant}</div>
              </div>
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Complete ingredient analysis and detailed information
            </DialogDescription>
          </DialogHeader>
          {selectedDish && (
            <div className="space-y-6 py-4">
              {/* Basic Information Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Dish Information</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Dish ID:</span>
                        <span className="font-medium">{selectedDish.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Uploaded By:</span>
                        <span className="font-medium">{selectedDish.uploadedBy}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Upload Date:</span>
                        <span className="font-medium">{selectedDish.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Allergen Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Detected Allergens</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedDish.detectedAllergens.map(allergen => (
                      <Badge key={allergen} variant="destructive" className="text-xs">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ingredients Section */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Detected Ingredients</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedDish.ingredients.map((ingredient) => (
                    <div
                      key={ingredient}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {ingredient}
                      </div>
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
