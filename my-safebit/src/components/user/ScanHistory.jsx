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
import { Search, Eye, CheckCircle, AlertTriangle, Calendar, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { styles } from '../../styles/user/ScanHistory.styles.js';
import { getScanHistory } from '../../services/scanHistoryService';
export function ScanHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    const fetchScanHistory = async () => {
      try {
        setLoading(true);
        const data = await getScanHistory();
        setHistory(Array.isArray(data) ? data : []);
        setError(null);
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

  const handleViewScan = (scan) => {
    setSelectedScan(scan);
    setShowDetailsDialog(true);
  };

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
          <p className={styles.cls010}>
            {history.reduce((acc, scan) => acc + scan.SafeCount, 0)}
          </p>
        </div>
        <div className={styles.cls008}>
          <p className={styles.cls003}>Warnings Issued</p>
          <p className={styles.cls011}>
            {history.reduce((acc, scan) => acc + scan.UnsafeCount, 0)}
          </p>
        </div>
      </div>

      {/* History List */}
      <div className={styles.cls012}>
        {filteredHistory.map(record => {
          const totalDishes = record.SafeCount + record.UnsafeCount + record.RiskyCount;
          const hasWarnings = record.UnsafeCount > 0 || record.RiskyCount > 0;

          return (
            <Card key={record.ScanID} className={styles.cls013}>
              <CardHeader>
                <div className={styles.cls014}>
                  <div className={styles.cls015}>
                    <CardTitle className={styles.cls016}>
                      {record.RestaurantName}
                      {hasWarnings ? (
                        <AlertTriangle className={styles.cls017} />
                      ) : (
                        <CheckCircle className={styles.cls018} />
                      )}
                    </CardTitle>
                    <CardDescription className={styles.cls019}>
                      <span className={styles.cls016}>
                        <Calendar className={styles.cls020} />
                        {new Date(record.ScanDate).toLocaleString()}
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
                      {record.SafeCount} safe
                    </span>
                    {hasWarnings && (
                      <span className={styles.cls026}>
                        {record.UnsafeCount + record.RiskyCount} with warnings
                      </span>
                    )}
                  </div>

                  <div className={styles.cls027}>
                    <div className="p-3 rounded-lg bg-blue-50">
                      <div className={styles.cls028}>
                        <div className={styles.cls016}>
                          <CheckCircle className={styles.cls029} />
                          <span className={styles.cls031}>Safe Dishes: {record.SafeCount}</span>
                        </div>
                      </div>
                    </div>
                    {record.UnsafeCount > 0 && (
                      <div className="p-3 rounded-lg bg-red-50">
                        <div className={styles.cls028}>
                          <div className={styles.cls016}>
                            <AlertTriangle className={styles.cls030} />
                            <span className={styles.cls031}>Unsafe Dishes: {record.UnsafeCount}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {record.RiskyCount > 0 && (
                      <div className="p-3 rounded-lg bg-yellow-50">
                        <div className={styles.cls028}>
                          <div className={styles.cls016}>
                            <AlertTriangle className={styles.cls030} />
                            <span className={styles.cls031}>Risky Dishes: {record.RiskyCount}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
        </>
      )}
      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className={styles.cls034}>
          <DialogHeader>
            <DialogTitle>Scan Details</DialogTitle>
            <DialogDescription>
              Summary information about this menu scan
            </DialogDescription>
          </DialogHeader>
          {selectedScan && (
            <div className={styles.cls035}>
              {/* Basic Info */}
              <div className={styles.cls036}>
                <div>
                  <p className={styles.cls003}>Restaurant</p>
                  <p className={styles.cls037}>{selectedScan.RestaurantName}</p>
                </div>
                <div className={styles.cls038}>
                  <p className={styles.cls003}>Scanned At</p>
                  <p className={styles.cls037}>{new Date(selectedScan.ScanDate).toLocaleString()}</p>
                </div>
              </div>

              {/* Summary */}
              <div>
                <p className={styles.cls039}>Scan Summary</p>
                <div className={styles.cls012}>
                  <div className="p-4 rounded-lg bg-green-50">
                    <div className={styles.cls040}>
                      <CheckCircle className={styles.cls018} />
                      <span className={styles.cls031}>Safe Dishes: {selectedScan.SafeCount}</span>
                    </div>
                  </div>
                  {selectedScan.UnsafeCount > 0 && (
                    <div className="p-4 rounded-lg bg-red-50">
                      <div className={styles.cls040}>
                        <AlertTriangle className={styles.cls017} />
                        <span className={styles.cls031}>Unsafe Dishes: {selectedScan.UnsafeCount}</span>
                      </div>
                    </div>
                  )}
                  {selectedScan.RiskyCount > 0 && (
                    <div className="p-4 rounded-lg bg-yellow-50">
                      <div className={styles.cls040}>
                        <AlertTriangle className={styles.cls017} />
                        <span className={styles.cls031}>Risky Dishes: {selectedScan.RiskyCount}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


