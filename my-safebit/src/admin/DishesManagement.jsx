import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { styles } from '../styles/admin/DishesManagement.styles.js';
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
    <div className={styles.cls001}>
      <div className={styles.cls002}>
        <div>
          <h2 className={styles.cls003}>Dishes & Ingredients Management</h2>
          <p className={styles.cls004}>
            Comprehensive overview of all uploaded dishes and ingredient analysis
          </p>
        </div>
        <div className={styles.cls005}>
          <Search className={styles.cls006} />
          <Input
            placeholder="Search dishes, restaurants, or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.cls007}
          />
        </div>
      </div>

      <div className={styles.cls008}>
        <div className={styles.cls009}>
          <div>
            <p className={styles.cls010}>Total Dishes Analyzed</p>
            <p className={styles.cls011}>{dishes.length}</p>
            <p className={styles.cls012}>All uploaded dishes in the system</p>
          </div>
          <div className={styles.cls013}>
            <ChefHat className={styles.cls014} />
          </div>
        </div>
      </div>

      {listError && (
        <Alert className={styles.cls015}>
          <AlertTriangle className={styles.cls016} />
          <AlertDescription className={styles.cls017}>{listError}</AlertDescription>
        </Alert>
      )}

      <div className={styles.cls018}>
        <div className={styles.cls019}>
          <Table>
            <TableHeader className={styles.cls020}>
              <TableRow>
                <TableHead className={styles.cls021}>Dish ID</TableHead>
                <TableHead className={styles.cls021}>Dish Name</TableHead>
                <TableHead className={styles.cls021}>Restaurant</TableHead>
                <TableHead className={styles.cls021}>Upload Date</TableHead>
                <TableHead className={styles.cls022}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className={styles.cls023}>Loading dishes...</div>
                  </TableCell>
                </TableRow>
              ) : paginatedDishes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className={styles.cls023}>No dishes found.</div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDishes.map((dish) => (
                  <TableRow key={dish.id} className={styles.cls024}>
                    <TableCell className={styles.cls025}>{dish.id}</TableCell>
                    <TableCell className={styles.cls025}>{dish.name}</TableCell>
                    <TableCell className={styles.cls026}>{dish.restaurant || "-"}</TableCell>
                    <TableCell className={styles.cls027}>
                      {formatDateTime(dish.uploadedAt)}
                    </TableCell>
                    <TableCell className={styles.cls028}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDish(dish)}
                        className={styles.cls029}
                      >
                        <Eye className={styles.cls030} />
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
          <div className={styles.cls031}>
            <p className={styles.cls027}>
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredDishes.length)} of {filteredDishes.length}
            </p>
            <div className={styles.cls032}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className={styles.cls033}>
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
        <DialogContent className={styles.cls034}>
          <DialogHeader>
            <DialogTitle className={styles.cls035}>
              <div className={styles.cls036}>
                <UtensilsCrossed className={styles.cls037} />
              </div>
              <div>
                <div className={styles.cls038}>{selectedDish?.name || "Dish Details"}</div>
                <div className={styles.cls039}>{selectedDish?.restaurant || "-"}</div>
              </div>
            </DialogTitle>
            <DialogDescription className={styles.cls040}>
              Complete ingredient analysis and detailed information
            </DialogDescription>
          </DialogHeader>

          {actionError && (
            <Alert className={styles.cls015}>
              <AlertTriangle className={styles.cls016} />
              <AlertDescription className={styles.cls017}>{actionError}</AlertDescription>
            </Alert>
          )}

          {selectedDish && (
            <div className={styles.cls041}>
              <div>
                <p className={styles.cls042}>Dish Information</p>
                <div className={styles.cls043}>
                  <div className={styles.cls044}>
                    <span className={styles.cls040}>Dish ID:</span>
                    <span className={styles.cls025}>{selectedDish.id}</span>
                  </div>
                  <div className={styles.cls044}>
                    <span className={styles.cls040}>Upload Date:</span>
                    <span className={styles.cls025}>{formatDateTime(selectedDish.uploadedAt)}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className={styles.cls042}>Detected Ingredients</p>
                {ingredientsLoading ? (
                  <div className={styles.cls045}>Loading ingredients...</div>
                ) : selectedDish.ingredients?.length ? (
                  <div className={styles.cls046}>
                    {selectedDish.ingredients.map((ingredient, idx) => (
                      <div
                        key={`${ingredient}-${idx}`}
                        className={styles.cls047}
                      >
                        {ingredient}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.cls045}>No ingredients found for this dish.</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



