import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import {
  Search,
  Eye,
  UtensilsCrossed,
  ChefHat,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { getAllDishesAdmin, getDishIngredients } from "../services/adminDishesService";
import {
  styles,
  getStatusTagClass,
  getSkeletonBarClass,
  getRowClass,
  getPagerNumberClass,
  skeletonBarWidths,
} from "../styles/admin/DishesManagement.styles";

const PAGE_SIZE = 10;

//transfrom date and time to a visible format 
const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

//onloads skeleton while data is being fetched
function SkeletonRow() {
  return (
    <tr className={styles.tableSkeletonRow}>
      {skeletonBarWidths.map((width, index) => (
        <td key={index} className={styles.tableCell}>
          <div className={getSkeletonBarClass(width)} />
        </td>
      ))}
    </tr>
  );
}

// Status tag component with dynamic color based on status
function StatusTag({ children, color = "blue" }) {
  return <span className={getStatusTagClass(color)}>{children}</span>;
}

// Error banner component to display error messages with an optional dismiss button
function ErrorBanner({ text, onDismiss }) {
  if (!text) return null;

  return (
    <div className={styles.errorBanner}>
      <AlertTriangle className={styles.errorIcon} />
      <p className={styles.errorText}>{text}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className={styles.dismissButton}>
          <X className={styles.dismissIcon} />
        </button>
      )}
    </div>
  );
}

//info row for dish details popup
function InfoRow({ label, children, last = false }) {
  return (
    <div className={`${styles.infoRow} ${last ? "" : styles.infoRowBorder}`.trim()}>
      <div className={styles.infoLabel}>{label}</div>
      <div className={styles.infoValue}>{children}</div>
    </div>
  );
}

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

  // Fetches the list of dishes from the backend API when the component mounts
  useEffect(() => {
    let cancelled = false;

    const loadDishes = async () => {
      setLoading(true);
      setListError("");

      try {
        const data = await getAllDishesAdmin();
        if (!cancelled) setDishes(data);
      } catch (err) {
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
    };

    loadDishes();

    return () => {
      cancelled = true;
    };
  }, []);

  //search dishes by name, restaurant, id 
  const filteredDishes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return dishes;

    return dishes.filter(
      (dish) =>
        (dish.name || "").toLowerCase().includes(query) ||
        (dish.restaurant || "").toLowerCase().includes(query) ||
        (dish.id || "").toLowerCase().includes(query) ||
        (dish.uploadedBy || "").toLowerCase().includes(query)
    );
  }, [dishes, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  //Pagination Logic 
  const totalPages = Math.max(1, Math.ceil(filteredDishes.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedDishes = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredDishes.slice(start, start + PAGE_SIZE);
  }, [filteredDishes, page]);

  //open dish details dialog and fetch ingredients for the selected dish
  const handleViewDish = async (dish) => {
    setActionError("");
    setSelectedDish({ ...dish, ingredients: [] });
    setShowDetailsDialog(true);

    if (!dish.detailsId) {
      setActionError(`Cannot load details for ${dish.id}: no valid numeric id found.`);
      return;
    }

    setIngredientsLoading(true);

    try {
      const details = await getDishIngredients(dish.detailsId);
      setSelectedDish((prev) => {
        if (!prev || prev.id !== dish.id) return prev;

        return {
          ...prev,
          ingredients: details.ingredients || [],
        };
      });
    } catch (err) {
      const msg =
        (axios.isAxiosError(err) &&
          (err.response?.data?.message || err.response?.data || err.message)) ||
        "Failed to load ingredients.";

      setActionError(typeof msg === "string" ? msg : "Failed to load ingredients.");
    } finally {
      setIngredientsLoading(false);
    }
  };

  // Calculate the index range of the currently displayed dishes for the footer text
  const startIdx = (page - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(page * PAGE_SIZE, filteredDishes.length);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Dishes &amp; Ingredients</h2>
          <p className={styles.subtitle}>
            Comprehensive overview of all uploaded dishes and ingredient analysis
          </p>
        </div>

        <div className={styles.searchWrap}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search dishes, restaurants..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className={styles.clearButton}
            >
              <X className={styles.viewButtonIcon} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIconWrap} ${styles.summaryBlue}`}>
            <ChefHat className={styles.summaryBlueIcon} />
          </div>
          <div>
            <p className={styles.summaryLabel}>Total Dishes</p>
            <p className={styles.summaryValue}>
              {loading ? <span className={styles.summaryValueSkeleton} /> : dishes.length}
            </p>
            <p className={styles.summaryBody}>All dishes in the system</p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIconWrap} ${styles.summaryEmerald}`}>
            <Search className={styles.summaryEmeraldIcon} />
          </div>
          <div>
            <p className={styles.summaryLabel}>Filtered Results</p>
            <p className={styles.summaryValue}>
              {loading ? (
                <span className={styles.summaryValueSkeleton} />
              ) : (
                filteredDishes.length
              )}
            </p>
            <p className={styles.summaryBody}>Matching current search</p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIconWrap} ${styles.summaryAmber}`}>
            <UtensilsCrossed className={styles.summaryAmberIcon} />
          </div>
          <div>
            <p className={styles.summaryLabel}>Current Page</p>
            <p className={styles.summaryValue}>
              {page} / {totalPages}
            </p>
            <p className={styles.summaryBody}>{PAGE_SIZE} dishes per page</p>
          </div>
        </div>
      </div>

      <ErrorBanner text={listError} onDismiss={() => setListError("")} />

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeadRow}>
                {["Dish ID", "Dish Name", "Restaurant", "Upload Date", "Actions"].map(
                  (heading, index) => (
                    <th
                      key={heading}
                      className={`${styles.tableHead} ${index === 4 ? styles.tableHeadRight : ""}`.trim()}
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => <SkeletonRow key={index} />)
              ) : paginatedDishes.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className={styles.emptyState}>
                      <ChefHat className={styles.emptyIcon} />
                      <p className={styles.emptyTitle}>No dishes found</p>
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm("")}
                          className={styles.clearSearch}
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedDishes.map((dish, index) => (
                  <tr key={dish.id} className={getRowClass(index)}>
                    <td className={styles.tableCell}>
                      <span className={styles.idPill}>{dish.id}</span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={styles.nameText}>{dish.name || "Unknown Dish"}</span>
                    </td>
                    <td className={styles.tableCell}>
                      {dish.restaurant ? (
                        <StatusTag color="green">{dish.restaurant}</StatusTag>
                      ) : (
                        <span className={styles.mutedText}>-</span>
                      )}
                    </td>
                    <td className={`${styles.tableCell} ${styles.dateText}`}>
                      {formatDateTime(dish.uploadedAt)}
                    </td>
                    <td className={`${styles.tableCell} ${styles.tableHeadRight}`}>
                      <button
                        type="button"
                        onClick={() => handleViewDish(dish)}
                        className={styles.viewButton}
                      >
                        <Eye className={styles.viewButtonIcon} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredDishes.length > 0 && (
          <div className={styles.tableFooter}>
            <p className={styles.footerText}>
              Showing <span className={styles.footerEmphasis}>{startIdx}-{endIdx}</span> of{" "}
              <span className={styles.footerEmphasis}>{filteredDishes.length}</span> dishes
            </p>

            <div className={styles.pager}>
              <button
                type="button"
                onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                disabled={page === 1}
                className={styles.pagerButton}
              >
                <ChevronLeft className={styles.dismissIcon} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(
                  (item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1
                )
                .reduce((acc, item, index, arr) => {
                  if (index > 0 && item - arr[index - 1] > 1) acc.push("...");
                  acc.push(item);
                  return acc;
                }, [])
                .map((item, index) =>
                  item === "..." ? (
                    <span key={`ellipsis-${index}`} className={styles.pagerEllipsis}>
                      ...
                    </span>
                  ) : (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={getPagerNumberClass(item === page)}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                type="button"
                onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                disabled={page === totalPages}
                className={styles.pagerButton}
              >
                <ChevronRight className={styles.dismissIcon} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className={styles.dialog}>
          <div className={styles.dialogHeader}>
            <button
              type="button"
              onClick={() => setShowDetailsDialog(false)}
              className={styles.dialogClose}
            >
              <X className={styles.dialogCloseIcon} />
            </button>

            <div className={styles.dialogTitleRow}>
              <div className={styles.dialogIconWrap}>
                <UtensilsCrossed className={styles.dialogIcon} />
              </div>

              <DialogHeader className={styles.dialogHeaderText}>
                <DialogTitle className={styles.dialogTitle}>
                  {selectedDish?.name || "Dish Details"}
                </DialogTitle>

                <DialogDescription className={styles.dialogDescription}>
                  Dish information and ingredient analysis
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className={styles.dialogBody}>
            <ErrorBanner text={actionError} onDismiss={() => setActionError("")} />

            {selectedDish && (
              <>
                <section>
                  <h3 className={styles.sectionTitle}>Dish Information</h3>

                  <div className={styles.sectionCard}>
                    <InfoRow label="Dish ID">
                      <span className={styles.idBadge}>{selectedDish.id}</span>
                    </InfoRow>

                    <InfoRow label="Dish Name">
                      <span className={styles.infoValueTruncate}>
                        {selectedDish.name || "Unknown Dish"}
                      </span>
                    </InfoRow>

                    <InfoRow label="Upload Date">
                      <span>{formatDateTime(selectedDish.uploadedAt)}</span>
                    </InfoRow>

                    <InfoRow label="Restaurant" last>
                      {selectedDish.restaurant ? (
                        <StatusTag color="green">{selectedDish.restaurant}</StatusTag>
                      ) : (
                        <span className={styles.helperText}>Not assigned</span>
                      )}
                    </InfoRow>
                  </div>
                </section>

                <section>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Detected Ingredients</h3>

                    {!ingredientsLoading && selectedDish.ingredients?.length > 0 && (
                      <span className={styles.countText}>
                        {selectedDish.ingredients.length} items
                      </span>
                    )}
                  </div>

                  {ingredientsLoading ? (
                    <div className={styles.loadingBox}>
                      <Loader2 className={styles.loadingIcon} />
                      <span className={styles.loadingText}>Loading ingredients...</span>
                    </div>
                  ) : selectedDish.ingredients?.length ? (
                    <div className={styles.ingredientCard}>
                      <div className={styles.ingredientList}>
                        {selectedDish.ingredients.map((ingredient, index) => (
                          <span
                            key={`${ingredient}-${index}`}
                            className={styles.ingredientChip}
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.noIngredients}>
                      <UtensilsCrossed className={styles.noIngredientsIcon} />
                      <p className={styles.noIngredientsTitle}>No ingredients found</p>
                      <p className={styles.noIngredientsBody}>
                        No ingredient data is available for this dish.
                      </p>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
