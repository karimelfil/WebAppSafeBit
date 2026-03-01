import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Search, Eye, UtensilsCrossed, ChefHat, AlertTriangle } from "lucide-react";

import { getAllDishesAdmin, getDishIngredients } from "../services/adminDishesService";

const PAGE_SIZE = 10;

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

export function DishesManagement() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedDish, setSelectedDish] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [ingredientsLoading, setIngredientsLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDishes() {
      setLoading(true);
      setListError("");

      try {
        const data = await getAllDishesAdmin();
        if (!cancelled) setDishes(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          const msg =
            (axios.isAxiosError(err) &&
              (err.response?.data?.message || err.response?.data || err.message)) ||
            "Failed to load dishes.";
          setListError(typeof msg === "string" ? msg : "Failed to load dishes.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDishes();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDishes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return dishes;

    return dishes.filter((dish) => {
      return (
        (dish.name || "").toLowerCase().includes(q) ||
        (dish.restaurant || "").toLowerCase().includes(q) ||
        (dish.id || "").toLowerCase().includes(q) ||
        (dish.uploadedBy || "").toLowerCase().includes(q)
      );
    });
  }, [dishes, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredDishes.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedDishes = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredDishes.slice(start, start + PAGE_SIZE);
  }, [filteredDishes, page]);

  const handleViewDish = async (dish) => {
    setActionError("");

    setSelectedDish({
      ...dish,
      ingredients: [],
    });

    setShowDetailsDialog(true);

    if (!dish.detailsId) {
      setActionError(
        `Cannot load details for ${dish.id}: API expects numeric dishId and no valid id was found.`
      );
      return;
    }

    setIngredientsLoading(true);

    try {
      const details = await getDishIngredients(dish.detailsId);
      setSelectedDish((prev) => {
        if (!prev || prev.id !== dish.id) return prev;
        return {
          ...prev,
          ingredients: details.ingredients,
        };
      });
    } catch (err) {
      console.error(err);
      const msg =
        (axios.isAxiosError(err) &&
          (err.response?.data?.message || err.response?.data || err.message)) ||
        "Failed to load ingredients.";
      setActionError(typeof msg === "string" ? msg : "Failed to load ingredients.");
    } finally {
      setIngredientsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dishes & Ingredients Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive overview of all uploaded dishes and ingredient analysis
          </p>
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

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700 mb-1">Total Dishes Analyzed</p>
            <p className="text-3xl font-bold text-blue-900">{dishes.length}</p>
            <p className="text-xs text-blue-600 mt-2">All uploaded dishes in the system</p>
          </div>
          <div className="p-3 bg-blue-600 rounded-xl">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {listError && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{listError}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold text-gray-900">Dish ID</TableHead>
                <TableHead className="font-semibold text-gray-900">Dish Name</TableHead>
                <TableHead className="font-semibold text-gray-900">Restaurant</TableHead>
                <TableHead className="font-semibold text-gray-900">Upload Date</TableHead>
                <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="py-6 text-sm text-gray-500">Loading dishes...</div>
                  </TableCell>
                </TableRow>
              ) : paginatedDishes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="py-6 text-sm text-gray-500">No dishes found.</div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDishes.map((dish) => (
                  <TableRow key={dish.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-900">{dish.id}</TableCell>
                    <TableCell className="font-medium text-gray-900">{dish.name}</TableCell>
                    <TableCell className="text-gray-700">{dish.restaurant || "-"}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDateTime(dish.uploadedAt)}
                    </TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && filteredDishes.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredDishes.length)} of {filteredDishes.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-xl bg-white text-gray-900 border border-gray-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-green-100 rounded-lg">
                <UtensilsCrossed className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900">{selectedDish?.name || "Dish Details"}</div>
                <div className="text-sm font-normal text-gray-600">{selectedDish?.restaurant || "-"}</div>
              </div>
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Complete ingredient analysis and detailed information
            </DialogDescription>
          </DialogHeader>

          {actionError && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{actionError}</AlertDescription>
            </Alert>
          )}

          {selectedDish && (
            <div className="space-y-5 py-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Dish Information</p>
                <div className="space-y-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <span className="text-gray-600">Dish ID:</span>
                    <span className="font-medium text-gray-900">{selectedDish.id}</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <span className="text-gray-600">Upload Date:</span>
                    <span className="font-medium text-gray-900">{formatDateTime(selectedDish.uploadedAt)}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Detected Ingredients</p>
                {ingredientsLoading ? (
                  <div className="text-sm text-gray-500">Loading ingredients...</div>
                ) : selectedDish.ingredients?.length ? (
                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1">
                    {selectedDish.ingredients.map((ingredient, idx) => (
                      <div
                        key={`${ingredient}-${idx}`}
                        className="inline-flex items-center px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-800"
                      >
                        {ingredient}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No ingredients found for this dish.</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

