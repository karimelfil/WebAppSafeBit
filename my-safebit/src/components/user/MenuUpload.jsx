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
} from 'lucide-react';
import { http } from '../../services/http';


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
  const [restaurantName, setRestaurantName] = useState(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem('restaurantName') || '';
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedDishes, setDetectedDishes] = useState(null);
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

      const storedDishes = extractStoredDishes(payload);
      const storedDishIdByName = new Map(storedDishes.map((dish) => [dish.name, dish.id]));

      const normalizedDishes = apiDishes.map((dish, index) => {
        const normalized = normalizeAiDish(dish, index);
        if (normalized.id) return normalized;

        const matchedId = storedDishIdByName.get(cleanDishName(normalized.name));
        return { ...normalized, id: matchedId ?? null };
      });

      setDetectedDishes(normalizedDishes);
      setShowResults(true);
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === 'string' ? error.response.data : '') ||
        error?.message ||
        'Failed to analyze menu. Please try again.';

      setErrorMessage(apiMessage);
      setDetectedDishes(null);
      setShowResults(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setDetectedDishes(null);
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

  const safePercentage = totalDishes > 0 ? Math.round((safeDishes / totalDishes) * 100) : 0;
  const safetyTone =
    safePercentage >= 70 ? 'text-green-700' : safePercentage >= 40 ? 'text-amber-700' : 'text-red-700';
  const safetyBarColor =
    safePercentage >= 70 ? 'bg-green-600' : safePercentage >= 40 ? 'bg-amber-500' : 'bg-red-600';

  if (showReportForm) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Report Detection Issue</h2>
          <p className="text-sm text-gray-600 mt-1">
            Tell us what is wrong with <span className="font-medium text-gray-900">{selectedDish?.name || 'this dish'}</span>
          </p>
        </div>

        <Card className="border-gray-200 shadow-sm bg-white">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Dish</p>
              <p className="text-base font-semibold text-gray-900">{selectedDish?.name || '-'}</p>
              <p className="text-xs text-gray-500 mt-1">Dish ID: {selectedDish?.id ?? 'Not available'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Your Message</label>
              <Textarea
                placeholder="Describe the incorrect detection, missing ingredients, or any issue..."
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                className="min-h-36 resize-none border-gray-300 !bg-white !text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-gray-900"
              />
              <p className="text-xs text-gray-500 mt-2">Be specific so we can improve detection quality.</p>
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

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 h-11" onClick={() => setShowReportForm(false)} disabled={reportSubmitting}>
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 h-11 bg-green-600 hover:bg-green-700"
                onClick={handleSubmitReport}
                disabled={reportSubmitting || !reportMessage.trim()}
              >
                {reportSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Menu Analysis Results</h2>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Personalized safety analysis for <span className="font-semibold text-gray-800">{restaurantName}</span>
              </p>
            </div>
            <Badge className="w-fit px-3 py-1.5 bg-gray-900 text-white hover:bg-gray-900">
              {totalDishes} items analyzed
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-green-200 bg-green-50/70">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">Safe</span>
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-700 mt-2">{safeDishes}</div>
          </div>
          <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50/70">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-700">Warning</span>
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-yellow-700 mt-2">{warningDishes}</div>
          </div>
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/70">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-700">Unsafe</span>
              <Ban className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-700 mt-2">{unsafeDishes}</div>
          </div>
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Total</span>
              <UtensilsCrossed className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-700 mt-2">{totalDishes}</div>
          </div>
        </div>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className={`h-5 w-5 ${safePercentage >= 40 ? 'text-green-600' : 'text-red-600'}`} />
              <span className="font-semibold text-gray-900">Safety Summary</span>
            </div>
            <p className={`text-sm md:text-base mb-4 ${safetyTone}`}>{safePercentage}% of menu items are safe for you</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div className={`${safetyBarColor} h-2.5 rounded-full transition-all duration-300`} style={{ width: `${safePercentage}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Menu Items Analysis</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detectedDishes.map((dish, index) => (
              <div
                key={dish.id ?? index}
                className={`p-5 rounded-xl border transition-all ${
                  dish.isSafe ? 'border-green-200 bg-green-50/40' : dish.hasWarning ? 'border-yellow-200 bg-yellow-50/40' : 'border-red-200 bg-red-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-gray-900 text-lg leading-6">{dish.name}</h3>
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
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Detected Ingredients</p>
                    <div className="flex flex-wrap gap-2">
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

                <Button type="button" variant="ghost" size="sm" className="mt-3 px-2 text-gray-600 hover:text-gray-900 hover:bg-white/70" onClick={() => handleReportIssue(dish)}>
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                  Report incorrect detection
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={handleReset}>
            Scan Another Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 md:p-8 shadow-sm text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Upload & Analyze Menu</h2>
        <p className="text-sm md:text-base text-gray-600 mt-2">Upload a menu photo or PDF and get personalized safety results instantly.</p>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Restaurant Name</label>
            <Input placeholder="Enter restaurant name" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className="w-full h-11" />
          </div>

          <div className="space-y-4">
            {/* IMPORTANT: Dropzone opens normal file chooser (more stable) */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-green-500 hover:bg-green-50/40 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
              }}
            >
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Upload className="h-6 w-6 text-gray-500" />
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-1">Upload Menu</p>
              <p className="text-xs text-gray-500">{isTouchDevice ? 'Tap to choose file (camera button below)' : 'Click to browse or drag & drop'}</p>
              <p className="text-xs text-gray-500 mt-1">Accepted: PNG, JPG, PDF (max 10MB)</p>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />

            {isTouchDevice && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                {/* Camera is explicit button */}
                <Button type="button" variant="outline" className="w-full h-14 flex-col gap-2" onClick={() => cameraInputRef.current?.click()}>
                  <Camera className="h-6 w-6" />
                  <span className="text-sm">Take Photo</span>
                </Button>

                <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File / PDF
                </Button>

                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleCameraCapture} className="hidden" />
              </>
            )}
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {uploadedFile && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <FileImage className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">{uploadedFile.name}</p>
                  <p className="text-xs text-green-600">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <Button
            type="button"
            onClick={handleScanMenu}
            disabled={!uploadedFile || isProcessing || !restaurantName.trim()}
            className="w-full bg-green-700 hover:bg-green-800 h-12 text-base"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Menu...
              </>
            ) : (
              <>
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                Analyze Menu
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}