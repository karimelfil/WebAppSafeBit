  // this is admin user service
  import axios from "axios";

  const API_BASE =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_API_BASE) ||
    "http://192.168.18.10:5000/api";

  // Axios instance
  const api = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Attach JWT automatically for EVERY request
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("sb_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // ---------- Helpers ----------
  const normalizeStatus = (s) =>
    String(s || "").toLowerCase() === "active" ? "active" : "suspended";

  // ---------- Normalizers ----------
  const normalizeListUser = (u) => ({
    id: String(u.user_Id),
    displayName: u.username,
    email: u.email,
    status: normalizeStatus(u.status),
    registeredAt: u.registration_Date,
  });

  const normalizeDetailUser = (data) => {
    const u = data.user;
    return {
      id: String(u.user_Id),
      firstName: u.first_Name,
      lastName: u.last_Name,
      email: u.email,
      phone: u.phone,
      dob: u.date_Of_Birth,
      gender: u.gender,
      status: normalizeStatus(u.status),
      registeredAt: u.registration_Date,
    };
  };

  // ---------- API calls ----------

  // ADMIN ONLY
  export async function getAllUsers() {
    const res = await api.get("/admin/get-all-users");
    return res.data.users.map(normalizeListUser);
  }

  export async function getUserById(userId) {
    const res = await api.get(`/admin/users/${userId}`);
    return normalizeDetailUser(res.data);
  }

  export async function updateUser(userId, payload) {
    const body = {
      first_Name: payload.firstName,
      last_Name: payload.lastName,
      email: payload.email,
      phone: payload.phone,
    };

    await api.put(`/admin/users/${userId}`, body);
    return getUserById(userId); // refresh data
  }

  export async function suspendUser(userId) {
    await api.post(`/admin/users/${userId}/suspend`);
  }

  export async function reactivateUser(userId) {
    await api.post(`/admin/users/${userId}/reactivate`);
  }

  export default {
    getAllUsers,
    getUserById,
    updateUser,
    suspendUser,
    reactivateUser,
  };
