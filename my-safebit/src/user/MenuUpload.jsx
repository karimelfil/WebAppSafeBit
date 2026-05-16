import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
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
import { http } from '../services/http';
import { getScanDetails } from '../services/scanHistoryService';
import {
  styles,
  getSafetyIconClass,
  getSafetyToneClass,
  getSafetyBarClass,
  getSafetyBarWidthStyle,
  getDishResultCardClass,
  getDishBadgeClass,
  getDishAnalysisBoxClass,
  getIngredientChipClass,
} from '../styles/user/MenuUpload.styles.js';

// IndexedDB utility functions for storing the last uploaded menu file
const IDB_DB = 'safebite_menu_upload';
const IDB_STORE = 'files';
const IDB_KEY = 'last_menu_file';

// Open the IndexedDB database and create the object store if it doesn't exist
function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1);
    // Create the object store if it doesn't exist
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

//save a file in IndexedDB under a specific key
async function idbSet(key, value) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

//get a file from IndexedDB by key
async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

//delete a file from IndexedDB by key
async function idbDel(key) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

//normalize text by replacing underscores with spaces, trimming, and capitalizing words
function formatToken(token) {
  if (!token) return '';
  return String(token).replaceAll('_', ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

//convert a value to trimmed text or return empty string if not a string
function toText(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

//normalize a value that can be either a string or an array of strings into an array of formatted text
function normalizeStringList(value) {
  return Array.isArray(value) ? value.map(toText).filter(Boolean) : [];
}

//clean a dish name by removing common prefixes and trimming
function cleanDishName(name) {
  return String(name ?? '').replace(/^Dish Name:\s*/i, '').trim().toLowerCase();
}

//validate and convert a value to a positive integer dish ID or return null if invalid
function toValidDishId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

//normalize a dish object from the API or history into a consistent format with id, name, description, category, displayLevel, allergens, and safety flags
function normalizeStoredDish(dish) {
  const id = toValidDishId(dish?.dishID ?? dish?.dishId ?? dish?.DishID ?? dish?.DishId ?? dish?.id);
  const name = cleanDishName(dish?.dishName ?? dish?.DishName ?? dish?.name);
  return { id, name };
}

//extract an array of stored dishes from various possible locations in the API response payload and normalize them
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

//extract the saved menu file path from various possible locations in the API response payload
function extractSavedMenuPath(payload) {
  const candidates = [
    payload?.filePath,
    payload?.FilePath,
    payload?.menuFilePath,
    payload?.MenuFilePath,
    payload?.savedFilePath,
    payload?.SavedFilePath,
    payload?.menu?.filePath,
    payload?.menu?.FilePath,
    payload?.result?.filePath,
    payload?.result?.FilePath,
    payload?.data?.filePath,
    payload?.data?.FilePath,
    payload?.aiResult?.filePath,
    payload?.aiResult?.FilePath,
  ];

  return String(candidates.find((value) => typeof value === 'string' && value.trim()) || '').trim();
}

//extract the scan ID from various possible locations in the API response payload
function extractScanId(payload) {
  const candidates = [
    payload?.scanID,
    payload?.scanId,
    payload?.ScanID,
    payload?.id,
    payload?.Id,
    payload?.data?.scanID,
    payload?.data?.scanId,
    payload?.data?.ScanID,
    payload?.result?.scanID,
    payload?.result?.scanId,
    payload?.result?.ScanID,
    payload?.menu?.scanID,
    payload?.menu?.scanId,
    payload?.menu?.ScanID,
  ];

  const found = candidates.find((value) => value !== undefined && value !== null && String(value).trim() !== '');
  return found ?? null;
}

//normalize a dish object from the AI result into a consistent format with id, name, description, category, displayLevel, allergens, and safety flags, using various possible field names and fallbacks
function normalizeAiDish(dish, index) {
  const safetyLevel = String(
    dish?.safety_level || dish?.safetyLevel || dish?.SafetyLevel || ''
  ).toLowerCase();

  const needsUserConfirmation = Boolean(dish?.needs_user_confirmation ?? dish?.needsUserConfirmation);
  const isSafe = safetyLevel === 'safe';
  const isUnsafe = safetyLevel === 'unsafe';
  const hasWarning = safetyLevel === 'risky' || needsUserConfirmation;

  const displayLevel =
    safetyLevel === 'safe'
      ? 'SAFE'
      : safetyLevel === 'risky'
      ? 'RISKY'
      : safetyLevel === 'unsafe'
      ? 'UNSAFE'
      : 'UNKNOWN';

  const ingredientsRaw = dish?.ingredients_found || dish?.ingredientsFound || dish?.IngredientsFound;
  const ingredients = normalizeStringList(ingredientsRaw).map(formatToken);

  const conflicts = Array.isArray(dish?.conflicts)
    ? dish.conflicts
    : Array.isArray(dish?.Conflicts)
    ? dish.Conflicts
    : [];

  const notes = normalizeStringList(dish?.notes ?? dish?.Notes);

  const conflictMessages = conflicts
    .map((conflict) =>
      toText(
        conflict?.Explanation ??
          conflict?.explanation ??
          conflict?.Reason ??
          conflict?.reason ??
          conflict?.Description ??
          conflict?.description
      )
    )
    .filter(Boolean);

  const directAnalysis = [
    dish?.analysis,
    dish?.Analysis,
    dish?.aiAnalysis,
    dish?.AiAnalysis,
    dish?.AIAnalysis,
    dish?.description,
    dish?.Description,
    dish?.summary,
    dish?.Summary,
    dish?.shortSummary,
    dish?.ShortSummary,
  ]
    .map(toText)
    .find(Boolean);

  const descriptionFallback =
    ingredients.length > 0 ? `Detected ingredients: ${ingredients.join(', ')}` : 'No ingredients detected';

  const combinedAnalysis = [...conflictMessages, ...notes].filter(Boolean).join(' ');
  const rawDishName = dish?.dish_name || dish?.dishName || dish?.DishName || `Dish ${index + 1}`;

  const description = isSafe
    ? descriptionFallback
    : combinedAnalysis || directAnalysis || descriptionFallback;

  return {
    id: toValidDishId(dish?.dish_id ?? dish?.dishId ?? dish?.DishId),
    name: String(rawDishName).replace(/^Dish Name:\s*/i, '').trim(),
    description,
    category: safetyLevel || 'unknown',
    displayLevel,
    allergens: ingredients,
    isSafe,
    isUnsafe,
    hasWarning,
  };
}

//normalize a dish object from the user's scan history into a consistent format, using various possible field names and fallbacks, similar to the AI dish normalization but with more leniency since historical data may be less structured
function normalizeHistoryDishForUpload(dish, index) {
  const safetyLevel = String(dish?.SafetyStatus || dish?.safetyStatus || 'unknown').toLowerCase();
  const ingredients = normalizeStringList(dish?.Ingredients ?? dish?.ingredients).map(formatToken);

  return {
    id: toValidDishId(dish?.DishID ?? dish?.dishID ?? dish?.dishId ?? dish?.id),
    name: String(dish?.DishName ?? dish?.dishName ?? dish?.name ?? `Dish ${index + 1}`)
      .replace(/^Dish Name:\s*/i, '')
      .trim(),
    description:
      toText(dish?.Analysis ?? dish?.analysis) ||
      (ingredients.length > 0 ? `Detected ingredients: ${ingredients.join(', ')}` : 'No ingredients detected'),
    category: safetyLevel || 'unknown',
    displayLevel:
      safetyLevel === 'safe'
        ? 'SAFE'
        : safetyLevel === 'risky'
        ? 'RISKY'
        : safetyLevel === 'unsafe'
        ? 'UNSAFE'
        : 'UNKNOWN',
    allergens: ingredients,
    isSafe: safetyLevel === 'safe',
    isUnsafe: safetyLevel === 'unsafe',
    hasWarning: safetyLevel === 'risky',
  };
}

//compress an image file if it's larger than a certain size, while leaving PDFs and non-image files unchanged, by creating an off-screen canvas and resizing the image, then converting it back to a File object
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

//convert a File object into a storable format with its name, type, last modified date, and an ArrayBuffer of its contents, so it can be saved in IndexedDB
async function fileToStorable(file) {
  const buffer = await file.arrayBuffer();

  return {
    name: file.name,
    type: file.type,
    lastModified: file.lastModified,
    buffer,
  };
}

//convert a storable file object from IndexedDB back into a File object that can be used in the application, by creating a Blob from the stored ArrayBuffer and then a File from that Blob
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

  //state variables for restaurant name, uploaded file, preview URL, processing status, detected dishes, analysis summary, saved menu path, current results page, and whether to show results or report form
  const [restaurantName, setRestaurantName] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedDishes, setDetectedDishes] = useState(null);
  const [analysisSummary, setAnalysisSummary] = useState('');
  const [savedMenuPath, setSavedMenuPath] = useState('');
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

  //detect if the device supports touch input to conditionally render camera capture option, by checking for touch event support, max touch points, or coarse pointer media query
  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches);

  //on component mount, try to load the last uploaded file from IndexedDB and create a preview URL for it, while handling component unmounting to avoid setting state on an unmounted component
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

  //revoke the preview URL when the component unmounts or when a new file is selected, to free up memory
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  //handle file selection from either file input or camera capture, by validating the file size, optionally compressing it if it's an image, creating a preview URL, and saving it in IndexedDB for persistence
  const handleFileSelect = async (file) => {
    if (!file) return;

    setErrorMessage('');
    setDetectedDishes(null);
    setAnalysisSummary('');
    setSavedMenuPath('');
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

  //handle file selection from either file input or camera capture, by validating the file size, optionally compressing it if it's an image, creating a preview URL, and saving it in IndexedDB for persistence
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) await handleFileSelect(file);
    e.target.value = '';
  };

  //handle file selection from either file input or camera capture, by validating the file size, optionally compressing it if it's an image, creating a preview URL, and saving it in IndexedDB for persistence
  const handleCameraCapture = async (e) => {
    const file = e.target.files?.[0];
    if (file) await handleFileSelect(file);
    e.target.value = '';
  };

  //handle the main action of scanning the menu, by validating inputs, sending the file and restaurant name to the API, processing the response to extract detected dishes and analysis summary, and handling errors gracefully with user-friendly messages
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
      const menuPath = extractSavedMenuPath(payload);
      const scanId = extractScanId(payload);
      const storedDishIdByName = new Map(storedDishes.map((dish) => [dish.name, dish.id]));

      let normalizedDishes = apiDishes.map((dish, index) => {
        const normalized = normalizeAiDish(dish, index);
        if (normalized.id) return normalized;

        const matchedId = storedDishIdByName.get(cleanDishName(normalized.name));
        return { ...normalized, id: matchedId ?? null };
      });

      if (scanId) {
        try {
          const details = await getScanDetails(scanId);
          const historyDishes = Array.isArray(details?.Dishes)
            ? details.Dishes.map(normalizeHistoryDishForUpload)
            : [];

          if (historyDishes.length > 0) {
            const historyById = new Map(historyDishes.filter((dish) => dish.id).map((dish) => [dish.id, dish]));
            const historyByName = new Map(historyDishes.map((dish) => [cleanDishName(dish.name), dish]));

            normalizedDishes = normalizedDishes.map((dish) => {
              const historyDish =
                (dish.id ? historyById.get(dish.id) : null) ||
                historyByName.get(cleanDishName(dish.name));

              return historyDish
                ? {
                    ...dish,
                    ...historyDish,
                    id: dish.id ?? historyDish.id ?? null,
                  }
                : dish;
            });
          }
        } catch {

        }
      }

      setDetectedDishes(normalizedDishes);
      setAnalysisSummary(String(summaryText).trim());
      setSavedMenuPath(menuPath);
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
      setSavedMenuPath('');
      setCurrentResultsPage(1);
      setShowResults(false);
    } finally {
      setIsProcessing(false);
    }
  };

  //handle resetting the form and state to allow a new menu upload and scan, by clearing all relevant state variables, removing the saved file from IndexedDB, and clearing the restaurant name from sessionStorage
  const handleReset = async () => {
    setRestaurantName('');
    setUploadedFile(null);
    setPreviewUrl(null);
    setDetectedDishes(null);
    setAnalysisSummary('');
    setSavedMenuPath('');
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
      sessionStorage.removeItem('restaurantName');
      await idbDel(IDB_KEY);
    } catch {

    }
  };

  //handle the action of reporting an issue with a detected dish, by setting the selected dish in state and showing the report form, while also clearing any previous report messages
  const handleReportIssue = (dish) => {
    setSelectedDish(dish);
    setShowReportForm(true);
    setReportError('');
    setReportSuccess('');
  };

  //handle submitting the report of an issue with a detected dish, by validating the input, sending the report to the API, and showing success or error messages based on the response, while also resetting the report form state
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
  const warningDishes = detectedDishes?.filter((dish) => dish.hasWarning || dish.category === 'risky').length || 0;
  const unsafeDishes = detectedDishes?.filter((dish) => dish.isUnsafe).length || 0;
  const totalDishes = detectedDishes?.length || 0;

  const totalResultPages = Math.max(1, Math.ceil(totalDishes / RESULTS_PER_PAGE));
  const paginatedDishes =
    detectedDishes?.slice((currentResultsPage - 1) * RESULTS_PER_PAGE, currentResultsPage * RESULTS_PER_PAGE) || [];

  const currentStart = totalDishes === 0 ? 0 : (currentResultsPage - 1) * RESULTS_PER_PAGE + 1;
  const currentEnd = Math.min(currentResultsPage * RESULTS_PER_PAGE, totalDishes);

  const safePercentage = totalDishes > 0 ? Math.round((safeDishes / totalDishes) * 100) : 0;

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
              <Button
                type="button"
                variant="outline"
                className={styles.cls016}
                onClick={() => setShowReportForm(false)}
                disabled={reportSubmitting}
              >
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

            <Badge className={styles.cls024}>{totalDishes} items analyzed</Badge>
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
              <span className={styles.cls032}>Risky</span>
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
              <Shield className={getSafetyIconClass(safePercentage)} />
              <span className={styles.cls046}>Safety Summary</span>
            </div>

            <p className={getSafetyToneClass(safePercentage)}>
              {safePercentage}% of menu items are safe for you
            </p>

            <div className={styles.cls047}>
              <div
                className={getSafetyBarClass(safePercentage)}
                style={getSafetyBarWidthStyle(safePercentage)}
              />
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

        {savedMenuPath && (
          <Card className={styles.cls089}>
            <CardContent className={styles.cls090}>
                <div className={styles.cls091}>
                  <div className={styles.cls092}>
                    <FileImage className={styles.cls093} />
                  </div>
                  <div className={styles.cls108}>
                    <p className={styles.cls094}>Saved Menu Location</p>
                    <p className={styles.cls109}>{savedMenuPath}</p>
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
                className={getDishResultCardClass(dish)}
              >
                <div className={styles.cls051}>
                  <h3 className={styles.cls052}>{dish.name}</h3>

                  <Badge className={getDishBadgeClass(dish)}>
                    {dish.displayLevel}
                  </Badge>
                </div>

                {!dish.isSafe && (
                  <div className={getDishAnalysisBoxClass(dish)}>
                    <p className={styles.cls107}>
                      AI analysis
                    </p>
                    {dish.description}
                  </div>
                )}

                {dish.allergens.length > 0 && (
                  <div className={styles.cls053}>
                    <p className={styles.cls054}>Ingredients</p>

                    <div className={styles.cls055}>
                      {dish.allergens.map((allergen, aIndex) => (
                        <span
                          key={aIndex}
                          className={getIngredientChipClass(dish)}
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={styles.cls056}
                  onClick={() => handleReportIssue(dish)}
                >
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
        <p className={styles.cls061}>
          Upload a menu photo or PDF and get personalized safety results instantly.
        </p>
      </div>

      <Card className={styles.cls043}>
        <CardContent className={styles.cls062}>
          <div className={styles.cls063}>
            <label className={styles.cls064}>Restaurant Name</label>

            <Input
              placeholder="Enter restaurant name"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className={styles.cls065}
            />
          </div>

          <div className={styles.cls066}>
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
              <p className={styles.cls071}>
                {isTouchDevice ? 'Tap to choose file (camera button below)' : 'Click to browse or drag & drop'}
              </p>
              <p className={styles.cls011}>Accepted: PNG, JPG, PDF (max 10MB)</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className={styles.cls072}
            />

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

                <Button
                  type="button"
                  variant="outline"
                  className={styles.cls078}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className={styles.cls079} />
                  <span className={styles.cls080}>Take Photo</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className={styles.cls081}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className={styles.cls082} />
                  Choose File / PDF
                </Button>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  className={styles.cls072}
                />
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

                <div className={styles.cls110}>
                  <p className={styles.cls085}>{uploadedFile.name}</p>
                  <p className={styles.cls086}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>

                <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
                  <X className={styles.cls087} />
                </Button>
              </div>
            </div>
          )}

          {savedMenuPath && (
            <Card className={styles.cls089}>
              <CardContent className={styles.cls090}>
                <div className={styles.cls091}>
                  <div className={styles.cls092}>
                    <FileImage className={styles.cls093} />
                  </div>

                  <div className={styles.cls108}>
                    <p className={styles.cls094}>Saved Menu Location</p>
                    <p className={styles.cls109}>{savedMenuPath}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
