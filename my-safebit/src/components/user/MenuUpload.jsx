import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Upload,
  Camera,
  FileImage,
  AlertTriangle,
  Loader2,
  X,
  UtensilsCrossed,
  Shield,
  AlertCircle,
  Ban,
  Sparkles,
} from 'lucide-react';
import { http } from '../../services/http';
import { styles } from '../../styles/user/MenuUpload.styles.js';
const IDB_DB = 'safebite_menu_upload';
const IDB_STORE = 'files';
const IDB_KEY = 'last_menu_file';

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbDel(key) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}


function formatToken(token) {
  if (!token) return '';
  return String(token).replaceAll('_', ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

function cleanDishName(name) {
  return String(name ?? '').replace(/^Dish Name:\s*/i, '').trim().toLowerCase();
}

function toValidDishId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeStoredDish(dish) {
  const id = toValidDishId(dish?.dishID ?? dish?.dishId ?? dish?.DishID ?? dish?.DishId ?? dish?.id);
  const name = cleanDishName(dish?.dishName ?? dish?.DishName ?? dish?.name);
  return { id, name };
}

function extractStoredDishes(payload) {
  const candidates = [
    payload?.dishes,
    payload?.menu?.dishes,
    payload?.menuDishes,
    payload?.savedDishes,
    payload?.createdDishes,
    payload?.result?.dishes,
    payload?.data?.dishes,
    payload?.aiResult?.savedDishes,
  ];

  const merged = [];
  for (const list of candidates) {
    if (Array.isArray(list)) merged.push(...list);
  }

  return merged.map(normalizeStoredDish).filter((x) => x.id && x.name);
}

function normalizeAiDish(dish, index) {
  const safetyLevel = (dish?.safety_level || dish?.safetyLevel || dish?.SafetyLevel || '').toUpperCase();
  const needsUserConfirmation = Boolean(dish?.needs_user_confirmation ?? dish?.needsUserConfirmation);
  const isSafe = safetyLevel === 'SAFE';
  const isUnsafe = safetyLevel === 'RISKY' || safetyLevel === 'UNSAFE';
  const hasWarning = safetyLevel === 'CAUTION' || needsUserConfirmation;
  const displayLevel = safetyLevel === 'CAUTION' ? 'WARNING' : safetyLevel || 'UNKNOWN';

  const ingredientsRaw = dish?.ingredients_found || dish?.ingredientsFound || dish?.IngredientsFound;
  const ingredients = Array.isArray(ingredientsRaw) ? ingredientsRaw.filter(Boolean) : [];
  const conflicts = Array.isArray(dish?.conflicts) ? dish.conflicts : [];
  const notes = Array.isArray(dish?.notes) ? dish.notes : [];

  const firstConflict = conflicts[0]?.explanation;
  const firstNote = notes[0];

  const rawDishName = dish?.dish_name || dish?.dishName || dish?.DishName || `Dish ${index + 1}`;

  const description = isSafe
    ? ingredients.length
      ? `Detected ingredients: ${ingredients.map(formatToken).join(', ')}`
      : 'No ingredients detected'
    : firstConflict ||
      firstNote ||
      (ingredients.length
        ? `Detected ingredients: ${ingredients.map(formatToken).join(', ')}`
        : 'No ingredients detected');

  return {
    id: toValidDishId(dish?.dish_id ?? dish?.dishId ?? dish?.DishId),
    name: String(rawDishName).replace(/^Dish Name:\s*/i, '').trim(),
    description,
    category: safetyLevel || 'UNKNOWN',
    displayLevel,
    allergens: ingredients.map(formatToken),
    isSafe,
    isUnsafe,
    hasWarning,
  };
}


async function compressIfImage(file) {
  if (!file) return file;
  const isPdf = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');
  if (isPdf) return file;

  const isImage = file.type.startsWith('image/');
  if (!isImage) return file;


  const bitmap = await createImageBitmap(file);

  const maxSize = 1600;
  const ratio = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * ratio);
  const h = Math.round(bitmap.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, w, h);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
  if (!blob) return file;

  const newName = file.name?.replace(/\.\w+$/, '') + '.jpg';
  return new File([blob], newName, { type: 'image/jpeg' });
}

async function fileToStorable(file) {

  const buffer = await file.arrayBuffer();
  return {
    name: file.name,
    type: file.type,
    lastModified: file.lastModified,
    buffer,
  };
}

function storableToFile(stored) {
  if (!stored?.buffer) return null;
  const blob = new Blob([stored.buffer], { type: stored.type || 'application/octet-stream' });
  return new File([blob], stored.name || 'menu', {
    type: stored.type || 'application/octet-stream',
    lastModified: stored.lastModified || Date.now(),
  });
}

export function MenuUpload() {
  const RESULTS_PER_PAGE = 6;
  const [restaurantName, setRestaurantName] = useState(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem('restaurantName') || '';
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedDishes, setDetectedDishes] = useState(null);
  const [analysisSummary, setAnalysisSummary] = useState('');
  const [currentResultsPage, setCurrentResultsPage] = useState(1);
  const [showResults, setShowResults] = useState(false);

  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [reportMessage, setReportMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState('');

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches);


  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('restaurantName', restaurantName);
  }, [restaurantName]);


  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const saved = await idbGet(IDB_KEY);
        if (cancelled) return;

        const restoredFile = storableToFile(saved);
        if (restoredFile) {
          setUploadedFile(restoredFile);
          setPreviewUrl(URL.createObjectURL(restoredFile));
        }
      } catch {

      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);


  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = async (file) => {
    if (!file) return;

    setErrorMessage('');
    setDetectedDishes(null);
    setAnalysisSummary('');
    setCurrentResultsPage(1);
    setShowResults(false);


    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMessage('File is too large. Max size is 10MB.');
      return;
    }

    const maybeCompressed = await compressIfImage(file);

    setUploadedFile(maybeCompressed);
    setPreviewUrl(URL.createObjectURL(maybeCompressed));


    try {
      const storable = await fileToStorable(maybeCompressed);
      await idbSet(IDB_KEY, storable);
    } catch {

    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) await handleFileSelect(file);
    e.target.value = '';
  };

  const handleCameraCapture = async (e) => {
    const file = e.target.files?.[0];
    if (file) await handleFileSelect(file);
    e.target.value = '';
  };

  const handleScanMenu = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (!restaurantName.trim()) {
      alert('Please enter restaurant name');
      return;
    }

    if (!uploadedFile) {
      alert('Please upload a menu file first');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('File', uploadedFile);
      formData.append('RestaurantName', restaurantName.trim());

      const res = await http.post('/menu/upload', formData, {

        timeout: 90000,
      });

      const payload = res?.data || {};
      const aiResult = payload?.aiResult || {};
      const apiDishesRaw = aiResult?.dishes || aiResult?.Dishes;
      const apiDishes = Array.isArray(apiDishesRaw) ? apiDishesRaw : [];
      const summaryText =
        aiResult?.summary?.short_summary ||
        aiResult?.summary?.shortSummary ||
        payload?.summary?.short_summary ||
        payload?.summary?.shortSummary ||
        '';

      const storedDishes = extractStoredDishes(payload);
      const storedDishIdByName = new Map(storedDishes.map((dish) => [dish.name, dish.id]));

      const normalizedDishes = apiDishes.map((dish, index) => {
        const normalized = normalizeAiDish(dish, index);
        if (normalized.id) return normalized;

        const matchedId = storedDishIdByName.get(cleanDishName(normalized.name));
        return { ...normalized, id: matchedId ?? null };
      });

      setDetectedDishes(normalizedDishes);
      setAnalysisSummary(String(summaryText).trim());
      setCurrentResultsPage(1);
      setShowResults(true);
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === 'string' ? error.response.data : '') ||
        error?.message ||
        'Failed to analyze menu. Please try again.';

      setErrorMessage(apiMessage);
      setDetectedDishes(null);
      setAnalysisSummary('');
      setCurrentResultsPage(1);
      setShowResults(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setDetectedDishes(null);
    setAnalysisSummary('');
    setCurrentResultsPage(1);
    setShowResults(false);
    setIsProcessing(false);
    setShowReportForm(false);
    setReportMessage('');
    setSelectedDish(null);
    setErrorMessage('');
    setReportError('');
    setReportSubmitting(false);
    setReportSuccess('');


    try {
      await idbDel(IDB_KEY);
    } catch {

    }
  };

  const handleReportIssue = (dish) => {
    setSelectedDish(dish);
    setShowReportForm(true);
    setReportError('');
    setReportSuccess('');
  };

  const handleSubmitReport = async () => {
    if (!reportMessage.trim()) {
      alert('Please describe the issue');
      return;
    }

    setReportSubmitting(true);
    setReportError('');
    setReportSuccess('');

    try {
      const dishID = toValidDishId(selectedDish?.id);
      if (!dishID) {
        setReportError('This dish is missing a valid database ID. Please re-scan and try again.');
        return;
      }

      await http.post('/feedback', {
        dishID,
        message: reportMessage.trim(),
      });

      setReportSuccess('Report submitted successfully. Thank you for your feedback.');
      setReportMessage('');
      setShowReportForm(false);
      setSelectedDish(null);
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === 'string' ? error.response.data : '') ||
        'Failed to submit report. Please try again.';
      setReportError(apiMessage);
    } finally {
      setReportSubmitting(false);
    }
  };


  const safeDishes = detectedDishes?.filter((dish) => dish.isSafe).length || 0;
  const warningDishes = detectedDishes?.filter((dish) => dish.hasWarning || dish.category === 'CAUTION').length || 0;
  const unsafeDishes = detectedDishes?.filter((dish) => dish.isUnsafe).length || 0;
  const totalDishes = detectedDishes?.length || 0;
  const totalResultPages = Math.max(1, Math.ceil(totalDishes / RESULTS_PER_PAGE));
  const paginatedDishes = detectedDishes?.slice((currentResultsPage - 1) * RESULTS_PER_PAGE, currentResultsPage * RESULTS_PER_PAGE) || [];
  const currentStart = totalDishes === 0 ? 0 : (currentResultsPage - 1) * RESULTS_PER_PAGE + 1;
  const currentEnd = Math.min(currentResultsPage * RESULTS_PER_PAGE, totalDishes);

  const safePercentage = totalDishes > 0 ? Math.round((safeDishes / totalDishes) * 100) : 0;
  const safetyTone =
    safePercentage >= 70 ? 'text-green-700' : safePercentage >= 40 ? 'text-amber-700' : 'text-red-700';
  const safetyBarColor =
    safePercentage >= 70 ? 'bg-green-600' : safePercentage >= 40 ? 'bg-amber-500' : 'bg-red-600';

  if (showReportForm) {
    return (
      <div className={styles.cls001}>
        <div className={styles.cls002}>
          <h2 className={styles.cls003}>Report Detection Issue</h2>
          <p className={styles.cls004}>
            Tell us what is wrong with <span className={styles.cls005}>{selectedDish?.name || 'this dish'}</span>
          </p>
        </div>

        <Card className={styles.cls006}>
          <CardContent className={styles.cls007}>
            <div className={styles.cls008}>
              <p className={styles.cls009}>Dish</p>
              <p className={styles.cls010}>{selectedDish?.name || '-'}</p>
              <p className={styles.cls011}>Dish ID: {selectedDish?.id ?? 'Not available'}</p>
            </div>

            <div>
              <label className={styles.cls012}>Your Message</label>
              <Textarea
                placeholder="Describe the incorrect detection, missing ingredients, or any issue..."
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                className={styles.cls013}
              />
              <p className={styles.cls014}>Be specific so we can improve detection quality.</p>
            </div>

            {reportError && (
              <Alert variant="destructive">
                <AlertDescription>{reportError}</AlertDescription>
              </Alert>
            )}

            {reportSuccess && (
              <Alert>
                <AlertDescription>{reportSuccess}</AlertDescription>
              </Alert>
            )}

            <div className={styles.cls015}>
              <Button type="button" variant="outline" className={styles.cls016} onClick={() => setShowReportForm(false)} disabled={reportSubmitting}>
                Cancel
              </Button>
              <Button
                type="button"
                className={styles.cls017}
                onClick={handleSubmitReport}
                disabled={reportSubmitting || !reportMessage.trim()}
              >
                {reportSubmitting ? (
                  <>
                    <Loader2 className={styles.cls018} />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults && detectedDishes) {
    return (
      <div className={styles.cls019}>
        <div className={styles.cls020}>
          <div className={styles.cls021}>
            <div>
              <h2 className={styles.cls003}>Menu Analysis Results</h2>
              <p className={styles.cls022}>
                Personalized safety analysis for <span className={styles.cls023}>{restaurantName}</span>
              </p>
            </div>
            <Badge className={styles.cls024}>
              {totalDishes} items analyzed
            </Badge>
          </div>
        </div>

        <div className={styles.cls025}>
          <div className={styles.cls026}>
            <div className={styles.cls027}>
              <span className={styles.cls028}>Safe</span>
              <Shield className={styles.cls029} />
            </div>
            <div className={styles.cls030}>{safeDishes}</div>
          </div>
          <div className={styles.cls031}>
            <div className={styles.cls027}>
              <span className={styles.cls032}>Warning</span>
              <AlertCircle className={styles.cls033} />
            </div>
            <div className={styles.cls034}>{warningDishes}</div>
          </div>
          <div className={styles.cls035}>
            <div className={styles.cls027}>
              <span className={styles.cls036}>Unsafe</span>
              <Ban className={styles.cls037} />
            </div>
            <div className={styles.cls038}>{unsafeDishes}</div>
          </div>
          <div className={styles.cls039}>
            <div className={styles.cls027}>
              <span className={styles.cls040}>Total</span>
              <UtensilsCrossed className={styles.cls041} />
            </div>
            <div className={styles.cls042}>{totalDishes}</div>
          </div>
        </div>

        <Card className={styles.cls043}>
          <CardContent className={styles.cls044}>
            <div className={styles.cls045}>
              <Shield className={`h-5 w-5 ${safePercentage >= 40 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={styles.cls046}>Safety Summary</span>
            </div>
            <p className={`text-sm md:text-base mb-4 ${safetyTone}`}>{safePercentage}% of menu items are safe for you</p>
            <div className={styles.cls047}>
              <div className={`${safetyBarColor} h-2.5 rounded-full transition-all duration-300`} style={{ width: `${safePercentage}%` }} />
            </div>
          </CardContent>
        </Card>

        {analysisSummary && (
          <Card className={styles.cls089}>
            <CardContent className={styles.cls090}>
              <div className={styles.cls091}>
                <div className={styles.cls092}>
                  <Sparkles className={styles.cls093} />
                </div>
                <div>
                  <p className={styles.cls094}>AI Recommendation Summary</p>
                  <p className={styles.cls095}>{analysisSummary}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className={styles.cls043}>
          <CardHeader className={styles.cls048}>
            <div className={styles.cls096}>
              <CardTitle className={styles.cls049}>Menu Items Analysis</CardTitle>
              {totalDishes > RESULTS_PER_PAGE && (
                <p className={styles.cls097}>
                  Showing {currentStart}-{currentEnd} of {totalDishes}
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className={styles.cls050}>
            {paginatedDishes.map((dish, index) => (
              <div
                key={dish.id ?? `${currentResultsPage}-${index}`}
                className={`p-5 rounded-xl border transition-all ${
                  dish.isSafe ? 'border-green-200 bg-green-50/40' : dish.hasWarning ? 'border-yellow-200 bg-yellow-50/40' : 'border-red-200 bg-red-50/40'
                }`}
              >
                <div className={styles.cls051}>
                  <h3 className={styles.cls052}>{dish.name}</h3>
                  <Badge
                    className={
                      dish.isSafe
                        ? 'bg-green-600 text-white hover:bg-green-600'
                        : dish.hasWarning || dish.category === 'CAUTION'
                        ? 'bg-yellow-500 text-white hover:bg-yellow-500'
                        : 'bg-red-600 text-white hover:bg-red-600'
                    }
                  >
                    {dish.displayLevel}
                  </Badge>
                </div>

                {!dish.isSafe && (
                  <div
                    className={`mt-3 rounded-lg border px-3 py-2.5 text-sm leading-6 ${
                      dish.hasWarning ? 'border-yellow-200 bg-white text-yellow-900' : 'border-red-200 bg-white text-red-900'
                    }`}
                  >
                    {dish.description}
                  </div>
                )}

                {dish.allergens.length > 0 && (
                  <div className={styles.cls053}>
                    <p className={styles.cls054}>Detected Ingredients</p>
                    <div className={styles.cls055}>
                      {dish.allergens.map((allergen, aIndex) => (
                        <span
                          key={aIndex}
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                            dish.isUnsafe
                              ? 'border-red-200 bg-red-50 text-red-700'
                              : dish.hasWarning
                              ? 'border-yellow-200 bg-yellow-50 text-yellow-800'
                              : 'border-gray-200 bg-white text-gray-700'
                          }`}
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button type="button" variant="ghost" size="sm" className={styles.cls056} onClick={() => handleReportIssue(dish)}>
                  <AlertTriangle className={styles.cls057} />
                  Report incorrect detection
                </Button>
              </div>
            ))}
          </CardContent>
          {totalDishes > RESULTS_PER_PAGE && (
            <div className={styles.cls098}>
              <p className={styles.cls099}>
                Page {currentResultsPage} of {totalResultPages}
              </p>
              <div className={styles.cls100}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={styles.cls101}
                  onClick={() => setCurrentResultsPage((page) => Math.max(1, page - 1))}
                  disabled={currentResultsPage === 1}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={styles.cls101}
                  onClick={() => setCurrentResultsPage((page) => Math.min(totalResultPages, page + 1))}
                  disabled={currentResultsPage === totalResultPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        <div className={styles.cls015}>
          <Button type="button" variant="outline" className={styles.cls058} onClick={handleReset}>
            Scan Another Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cls059}>
      <div className={styles.cls060}>
        <h2 className={styles.cls003}>Upload & Analyze Menu</h2>
        <p className={styles.cls061}>Upload a menu photo or PDF and get personalized safety results instantly.</p>
      </div>

      <Card className={styles.cls043}>
        <CardContent className={styles.cls062}>
          <div className={styles.cls063}>
            <label className={styles.cls064}>Restaurant Name</label>
            <Input placeholder="Enter restaurant name" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className={styles.cls065} />
          </div>

          <div className={styles.cls066}>
            {/* IMPORTANT: Dropzone opens normal file chooser (more stable) */}
            <div
              className={styles.cls067}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
              }}
            >
              <div className={styles.cls068}>
                <Upload className={styles.cls069} />
              </div>
              <p className={styles.cls070}>Upload Menu</p>
              <p className={styles.cls071}>{isTouchDevice ? 'Tap to choose file (camera button below)' : 'Click to browse or drag & drop'}</p>
              <p className={styles.cls011}>Accepted: PNG, JPG, PDF (max 10MB)</p>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileUpload} className={styles.cls072} />

            {isTouchDevice && (
              <>
                <div className={styles.cls073}>
                  <div className={styles.cls074}>
                    <div className={styles.cls075} />
                  </div>
                  <div className={styles.cls076}>
                    <span className={styles.cls077}>or</span>
                  </div>
                </div>

                {/* Camera is explicit button */}
                <Button type="button" variant="outline" className={styles.cls078} onClick={() => cameraInputRef.current?.click()}>
                  <Camera className={styles.cls079} />
                  <span className={styles.cls080}>Take Photo</span>
                </Button>

                <Button type="button" variant="outline" className={styles.cls081} onClick={() => fileInputRef.current?.click()}>
                  <Upload className={styles.cls082} />
                  Choose File / PDF
                </Button>

                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleCameraCapture} className={styles.cls072} />
              </>
            )}
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {uploadedFile && (
            <div className={styles.cls083}>
              <div className={styles.cls084}>
                <FileImage className={styles.cls029} />
                <div className={styles.cls058}>
                  <p className={styles.cls085}>{uploadedFile.name}</p>
                  <p className={styles.cls086}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
                  <X className={styles.cls087} />
                </Button>
              </div>
            </div>
          )}

          <Button
            type="button"
            onClick={handleScanMenu}
            disabled={!uploadedFile || isProcessing || !restaurantName.trim()}
            className={styles.cls088}
          >
            {isProcessing ? (
              <>
                <Loader2 className={styles.cls018} />
                Analyzing Menu...
              </>
            ) : (
              <>
                <UtensilsCrossed className={styles.cls082} />
                Analyze Menu
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

