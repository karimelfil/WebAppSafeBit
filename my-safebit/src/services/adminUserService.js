import { http } from "./http";

const normalizeStatus = (s) =>
  String(s || "").toLowerCase() === "active" ? "active" : "suspended";

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

export async function getAllUsers() {
  const res = await http.get("/admin/get-all-users");
  return res.data.users.map(normalizeListUser);
}

export async function getUserById(userId) {
  const res = await http.get(`/admin/users/${userId}`);
  return normalizeDetailUser(res.data);
}

export async function updateUser(userId, payload) {
  const body = {
    first_Name: payload.firstName,
    last_Name: payload.lastName,
    email: payload.email,
    phone: payload.phone,
  };

  await http.put(`/admin/users/${userId}`, body);
  return getUserById(userId);
}

export async function suspendUser(userId) {
  await http.post(`/admin/users/${userId}/suspend`);
}

export async function reactivateUser(userId) {
  await http.post(`/admin/users/${userId}/reactivate`);
}
