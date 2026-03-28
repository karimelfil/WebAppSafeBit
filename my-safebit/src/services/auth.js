import { http } from "./http";

// IndexedDB constants for menu upload draft
const IDB_DB = "safebite_menu_upload"; 
const IDB_STORE = "files";
const IDB_KEY = "last_menu_file";

// Function to clear menu upload draft from sessionStorage and IndexedDB
function clearMenuUploadDraft() {
  try {
    sessionStorage.removeItem("restaurantName");
    sessionStorage.removeItem("sb_active_section");
  } catch {
  }

  
  if (typeof indexedDB === "undefined") return Promise.resolve();

  
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_DB, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => {
        try {
          const db = req.result;
          const tx = db.transaction(IDB_STORE, "readwrite");
          tx.objectStore(IDB_STORE).delete(IDB_KEY);
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      };
      req.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

// API function to call the login endpoint 
export async function loginApi(payload) {
  const res = await http.post("/auth/login", payload);
  return res.data;
}

// API function to call the forgot password endpoint
export async function forgotPasswordApi(email) {
  const res = await http.post("/auth/forgot-password", { email });
  return res.data;
}

// API function to call the reset password endpoint
export async function resetPasswordApi(payload) {
  const res = await http.post("/auth/reset-password", payload);
  return res.data;
}

// API function to call the logout endpoint and clear local session
export async function logout() {
  try {
    await http.post("/auth/logout");
  } catch {
    // Clear local session 
  } finally {
    localStorage.removeItem("sb_token");
    localStorage.removeItem("sb_role");
    localStorage.removeItem("sb_userId");
    sessionStorage.removeItem("sb_session_active");
    await clearMenuUploadDraft();// Clear menu upload draft data
  }
}
// API function to call the deactivate account endpoint
export async function deactivateAccountApi() {
  const res = await http.post("/auth/deactivate-account");
  return res.data;
}

