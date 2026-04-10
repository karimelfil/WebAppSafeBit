import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Search, Eye, CheckCircle, AlertTriangle, Calendar, Loader2, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { styles } from '../../styles/user/ScanHistory.styles.js';
import { getScanDetails, getScanHistory } from '../../services/scanHistoryService';

const pickFirstAvailable = (obj, keys, fallback = null) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return fallback;
};

const formatScanDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleString('en-US');
};

const toTag = (value) => {
  const text = String(value || '').trim();
  if (!text) return null;
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const extractIngredientTags = (dish) => {
  if (!Array.isArray(dish?.Ingredients)) return [];
  const deduped = [];
  for (const ingredient of dish.Ingredients) {
    const normalized = toTag(ingredient);
    if (!normalized) continue;
    if (!deduped.includes(normalized)) {
      deduped.push(normalized);
    }
  }
  return deduped;
};

export function ScanHistory() {
  const [history, setHistory] = useState([]);
  const [detailsByScanId, setDetailsByScanId] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  useEffect(() => {
    const prefetchDetails = async (records) => {
      const results = await Promise.allSettled(
        records.map(async (record) => {
          const details = await getScanDetails(record.ScanID);
          return [record.ScanID, details];
        })
      );

      const next = {};
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const [scanId, details] = result.value;
          next[scanId] = details;
        }
      }

      if (Object.keys(next).length > 0) {
        setDetailsByScanId(next);
      }
    };

    const fetchScanHistory = async () => {
      try {
        setLoading(true);
        const data = await getScanHistory();
        const records = Array.isArray(data) ? data : [];
        setHistory(records);
        setError(null);

        if (records.length > 0) {
          prefetchDetails(records);
        }
      } catch (err) {
        setError(err?.message || 'Failed to load scan history. Please try again.');
        console.error('Error fetching scan history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScanHistory();
  }, []);

  const filteredHistory = history.filter((record) =>
    String(record?.RestaurantName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewScan = async (scan) => {
    setShowDetailsDialog(true);
    setSelectedScan(scan);
    setDetailsError(null);
    setDetailsLoading(true);

    try {
      const details = await getScanDetails(scan.ScanID);
      setSelectedScan({
        ...scan,
        ...details,
        SafeCount: scan.SafeCount,
        UnsafeCount: scan.UnsafeCount,
        RiskyCount: scan.RiskyCount,
      });
    } catch (err) {
      setDetailsError(err?.message || 'Failed to load scan details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className={styles.cls001}>
      <div className={styles.cls002}>
        <div>
          <h2 className={styles.cls059}>Scan History</h2>
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

      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading scan history...</span>
        </div>
      )}

      {error && (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && (
        <>
          <div className={styles.cls007}>
            <div className={styles.cls008}>
              <p className={styles.cls003}>Total Scans</p>
              <p className={styles.cls009}>{history.length}</p>
            </div>
            <div className={styles.cls008}>
              <p className={styles.cls003}>Safe Dishes Found</p>
              <p className={styles.cls010}>{history.reduce((acc, scan) => acc + scan.SafeCount, 0)}</p>
            </div>
            <div className={styles.cls008}>
              <p className={styles.cls003}>Warnings Issued</p>
              <p className={styles.cls011}>{history.reduce((acc, scan) => acc + scan.UnsafeCount, 0)}</p>
            </div>
          </div>

          <div className={styles.cls012}>
            {filteredHistory.map((record) => {
              const totalDishes = record.SafeCount + record.UnsafeCount + record.RiskyCount;
              const hasWarnings = record.UnsafeCount > 0 || record.RiskyCount > 0;
              const details = detailsByScanId[record.ScanID];
              const locationText = pickFirstAvailable(
                { ...details, ...record },
                ['Location', 'location', 'Area', 'area', 'District', 'district'],
                'Location unavailable'
              );

              const safeDishes = Array.isArray(details?.Dishes)
                ? details.Dishes.filter((dish) => String(dish.SafetyStatus).toUpperCase() === 'SAFE')
                : [];

              return (
                <Card key={record.ScanID} className={styles.cls013}>
                  <CardHeader className={styles.cls055}>
                    <div className={styles.cls014}>
                      <div className={styles.cls015}>
                        <CardTitle className={styles.cls047}>
                          {record.RestaurantName}
                          {hasWarnings ? (
                            <AlertTriangle className={styles.cls017} />
                          ) : (
                            <CheckCircle className={styles.cls018} />
                          )}
                        </CardTitle>
                        <CardDescription className={styles.cls019}>
                          <span className={styles.cls048}>
                            <MapPin className={styles.cls049} />
                            {locationText}
                          </span>
                          <span className={styles.cls048}>
                            <Calendar className={styles.cls049} />
                            {formatScanDate(record.ScanDate)}
                          </span>
                        </CardDescription>
                      </div>
                      <Button variant="ghost" onClick={() => handleViewScan(record)} className={styles.cls060}>
                        <Eye className={styles.cls021} />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className={styles.cls057}>
                    <div className={styles.cls022}>
                      <div className={styles.cls023}>
                        <span className={styles.cls024}>{totalDishes} dishes scanned</span>
                        <span className={styles.cls025}>{record.SafeCount} safe</span>
                        {hasWarnings && (
                          <span className={styles.cls026}>{record.UnsafeCount + record.RiskyCount} with warnings</span>
                        )}
                      </div>

                      {safeDishes.length > 0 ? (
                        <div className={styles.cls027}>
                          {safeDishes.slice(0, 4).map((dish) => {
                            const tags = extractIngredientTags(dish);
                            const visibleTags = tags.slice(0, 2);
                            const hiddenCount = Math.max(tags.length - visibleTags.length, 0);

                            return (
                              <div key={dish.DishID} className={styles.cls032}>
                                <div className={styles.cls051}>
                                  <CheckCircle className={styles.cls050} />
                                  <span>{dish.DishName}</span>
                                </div>
                                <div className={styles.cls033}>
                                  {visibleTags.map((tag) => (
                                    <span key={`${dish.DishID}-${tag}`} className={styles.cls034}>
                                      {tag}
                                    </span>
                                  ))}
                                  {hiddenCount > 0 && <span className={styles.cls034}>+{hiddenCount}</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className={styles.cls056}>Dish-level details are available in the view dialog.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className={styles.cls035}>
          <DialogHeader>
            <DialogTitle>Scan Details</DialogTitle>
            <DialogDescription>Summary information about this menu scan</DialogDescription>
          </DialogHeader>
          {detailsLoading && (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading scan details...</span>
            </div>
          )}
          {detailsError && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{detailsError}</AlertDescription>
            </Alert>
          )}
          {selectedScan && (
            <div className={styles.cls036}>
              <div className={styles.cls037}>
                <div>
                  <p className={styles.cls003}>Restaurant</p>
                  <p className={styles.cls038}>{selectedScan.RestaurantName}</p>
                </div>
                <div className={styles.cls039}>
                  <p className={styles.cls003}>Scanned At</p>
                  <p className={styles.cls038}>{new Date(selectedScan.ScanDate).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className={styles.cls040}>Scan Summary</p>
                <div className={styles.cls012}>
                  <div className="p-4 rounded-lg bg-green-50">
                    <div className={styles.cls041}>
                      <CheckCircle className={styles.cls018} />
                      <span className={styles.cls031}>Safe Dishes: {selectedScan.SafeCount}</span>
                    </div>
                  </div>
                  {selectedScan.UnsafeCount > 0 && (
                    <div className="p-4 rounded-lg bg-red-50">
                      <div className={styles.cls041}>
                        <AlertTriangle className={styles.cls017} />
                        <span className={styles.cls031}>Unsafe Dishes: {selectedScan.UnsafeCount}</span>
                      </div>
                    </div>
                  )}
                  {selectedScan.RiskyCount > 0 && (
                    <div className="p-4 rounded-lg bg-yellow-50">
                      <div className={styles.cls041}>
                        <AlertTriangle className={styles.cls017} />
                        <span className={styles.cls031}>Risky Dishes: {selectedScan.RiskyCount}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {Array.isArray(selectedScan.Dishes) && selectedScan.Dishes.length > 0 && (
                <div>
                  <p className={styles.cls040}>Detected Dishes</p>
                  <div className={styles.cls012}>
                    {selectedScan.Dishes.map((dish) => (
                      <div key={dish.DishID} className="p-4 rounded-lg border bg-white">
                        <p className={styles.cls058}>{dish.DishName}</p>
                        <p className={styles.cls003}>{dish.SafetyStatus}</p>
                        {dish.Ingredients.length > 0 && <p className={styles.cls003}>{dish.Ingredients.join(', ')}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
