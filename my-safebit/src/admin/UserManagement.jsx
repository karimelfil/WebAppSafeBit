import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { styles } from '../styles/admin/UserManagement.styles.js';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import {
  Search, Eye, Edit, Ban, Check, AlertTriangle, Users, UserCheck, UserX,
} from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Label } from "../components/ui/label";

import {
  getAllUsers,
  getUserById,
  updateUser,
  suspendUser,
  reactivateUser,
} from "../services/adminUserService";

const statusClasses = (status) =>
  status === "active"
    ? "bg-green-100 text-green-800 border border-green-200"
    : "bg-red-100 text-red-800 border border-red-200";


const dialogPanel =
  "bg-white text-gray-900 border border-gray-200 shadow-xl rounded-xl " +
  "sm:max-w-2xl w-full";

const dialogLabel = "text-xs font-medium text-gray-600";
const dialogValue = "text-sm text-gray-800 mt-1";


const dialogSectionTitle = "text-sm font-medium text-gray-900";



export function UserManagement() {
  const PAGE_SIZE = 10;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState(null);

  const [showSuspendDialog, setShowSuspendDialog] = useState(false);

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setListError(null);
      try {
        const data = await getAllUsers();
        if (!cancelled) setUsers(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          const msg =
            (axios.isAxiosError(err) &&
              (err.response?.data?.message || err.response?.data || err.message)) ||
            "Failed to load users.";
          setListError(typeof msg === "string" ? msg : "Failed to load users.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const suspendedUsers = users.filter((u) => u.status === "suspended").length;

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.displayName || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.id || "").toLowerCase().includes(q)
    );
  }, [searchTerm, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const toast = (msg) => {
    setSuccessMessage(msg);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleViewUser = async (rowUser) => {
    setActionError(null);
    try {
      const detail = await getUserById(rowUser.id);
      setSelectedUser(detail);
      setViewMode("view");
    } catch (err) {
      console.error(err);
      const msg =
        (axios.isAxiosError(err) &&
          (err.response?.data?.message || err.response?.data || err.message)) ||
        "Failed to load user details.";
      setActionError(typeof msg === "string" ? msg : "Failed to load user details.");
    }
  };

  const handleEditUser = async (rowUser) => {
    setActionError(null);
    try {
      const detail = await getUserById(rowUser.id);
      setSelectedUser(detail);
      setViewMode("edit");
    } catch (err) {
      console.error(err);
      const msg =
        (axios.isAxiosError(err) &&
          (err.response?.data?.message || err.response?.data || err.message)) ||
        "Failed to load user details.";
      setActionError(typeof msg === "string" ? msg : "Failed to load user details.");
    }
  };

  const handleSuspendUser = (rowUser) => {
    setSelectedUser({
      ...rowUser,
    });
    setShowSuspendDialog(true);
  };

  const confirmSuspend = async () => {
    if (!selectedUser?.id) return;
    setSaving(true);
    setActionError(null);
    try {
      if (selectedUser.status === "active") {
        await suspendUser(selectedUser.id);
      } else {
        await reactivateUser(selectedUser.id);
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, status: selectedUser.status === "active" ? "suspended" : "active" }
            : u
        )
      );

      toast(
        selectedUser.status === "active"
          ? `User ${selectedUser.email || selectedUser.displayName || selectedUser.id} has been suspended successfully.`
          : `User ${selectedUser.email || selectedUser.displayName || selectedUser.id} has been reactivated successfully.`
      );
    } catch (err) {
      console.error(err);
      const msg =
        (axios.isAxiosError(err) &&
          (err.response?.data?.message || err.response?.data || err.message)) ||
        "Operation failed.";
      setActionError(typeof msg === "string" ? msg : "Operation failed.");
    } finally {
      setSaving(false);
      setShowSuspendDialog(false);
      setSelectedUser(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedUser?.id) return;
    setSaving(true);
    setActionError(null);
    try {
      const updated = await updateUser(selectedUser.id, {
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        email: selectedUser.email,
        phone: selectedUser.phone,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === updated.id
            ? {
                ...u,
                email: updated.email,
                displayName:
                  updated.displayName ||
                  [updated.firstName, updated.lastName].filter(Boolean).join(" "),
              }
            : u
        )
      );

      toast("User information updated successfully.");
      setViewMode(null);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      const data = axios.isAxiosError(err) ? err.response?.data : null;
      if (data && typeof data === "object" && data.errors) {
        const firstErrField = Object.keys(data.errors)[0];
        const firstErrMsg = Array.isArray(data.errors[firstErrField])
          ? data.errors[firstErrField][0]
          : String(data.errors[firstErrField]);
        setActionError(firstErrMsg || "Update failed.");
      } else {
        const msg =
          (axios.isAxiosError(err) && (data?.message || data || err.message)) ||
          "Update failed.";
        setActionError(typeof msg === "string" ? msg : "Update failed.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.cls001}>
      <div className={styles.cls002}>
        <div>
          <h2 className={styles.cls003}>User Management</h2>
          <p className={styles.cls004}>View and manage all registered users</p>
        </div>
        <div className={styles.cls005}>
          <Search className={styles.cls006} />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.cls007}
          />
        </div>
      </div>

      <div className={styles.cls008}>
        <div className={styles.cls009}>
          <div className={styles.cls010}>
            <div>
              <p className={styles.cls011}>Total Users</p>
              <p className={styles.cls012}>{totalUsers}</p>
            </div>
            <div className={styles.cls013}>
              <Users className={styles.cls014} />
            </div>
          </div>
        </div>

        <div className={styles.cls009}>
          <div className={styles.cls010}>
            <div>
              <p className={styles.cls011}>Active Users</p>
              <p className={styles.cls015}>{activeUsers}</p>
            </div>
            <div className={styles.cls016}>
              <UserCheck className={styles.cls017} />
            </div>
          </div>
        </div>

        <div className={styles.cls009}>
          <div className={styles.cls010}>
            <div>
              <p className={styles.cls011}>Suspended Users</p>
              <p className={styles.cls018}>{suspendedUsers}</p>
            </div>
            <div className={styles.cls019}>
              <UserX className={styles.cls020} />
            </div>
          </div>
        </div>
      </div>

      {listError && (
        <Alert className={styles.cls021}>
          <AlertTriangle className={styles.cls022} />
          <AlertDescription className={styles.cls023}>{listError}</AlertDescription>
        </Alert>
      )}
      {actionError && (
        <Alert className={styles.cls021}>
          <AlertTriangle className={styles.cls022} />
          <AlertDescription className={styles.cls023}>{actionError}</AlertDescription>
        </Alert>
      )}
      {showSuccessMessage && (
        <Alert className={styles.cls024}>
          <Check className={styles.cls025} />
          <AlertDescription className={styles.cls026}>
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className={styles.cls027}>
        <div className={styles.cls028}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className={styles.cls029}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className={styles.cls030}>Loading usersâ€¦</div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className={styles.cls030}>No users found.</div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      {user.displayName ||
                        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                        "â€”"}
                    </TableCell>
                    <TableCell>{user.email || "â€”"}</TableCell>
                    <TableCell>
                      <Badge
                        className={`px-2.5 py-0.5 rounded-full text-xs capitalize ${statusClasses(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.registeredAt
                        ? new Date(user.registeredAt).toLocaleDateString()
                        : "â€”"}
                    </TableCell>
                    <TableCell className={styles.cls029}>
                      <div className={styles.cls031}>
                        <Button size="sm" variant="ghost" onClick={() => handleViewUser(user)}>
                          <Eye className={styles.cls032} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEditUser(user)}>
                          <Edit className={styles.cls032} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSuspendUser(user)}
                          className={
                            user.status === "suspended" ? "text-green-600" : "text-red-600"
                          }
                        >
                          {user.status === "suspended" ? (
                            <Check className={styles.cls032} />
                          ) : (
                            <Ban className={styles.cls032} />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {!loading && filteredUsers.length > 0 && (
          <div className={styles.cls033}>
            <p className={styles.cls004}>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}
              {" - "}
              {Math.min(currentPage * PAGE_SIZE, filteredUsers.length)}
              {" of "}
              {filteredUsers.length}
            </p>
            <div className={styles.cls034}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className={styles.cls035}>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={viewMode === "view"} onOpenChange={() => setViewMode(null)}>
        <DialogContent className={dialogPanel}>
          <DialogHeader>
            <DialogTitle className={styles.cls036}>User Details</DialogTitle>
            <DialogDescription className={styles.cls004}>
              View personal information 
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className={styles.cls037}>
              <div>
                <div className={dialogLabel}>User ID</div>
                <p className={dialogValue}>{selectedUser.id}</p>
              </div>
              <div>
                <div className={dialogLabel}>Status</div>
                <div className={styles.cls038}>
                  <Badge
                    className={`px-2.5 py-0.5 rounded-full text-xs capitalize ${statusClasses(
                      selectedUser.status
                    )}`}
                  >
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>

              <div>
                <div className={dialogLabel}>First Name</div>
                <p className={dialogValue}>{selectedUser.firstName || "â€”"}</p>
              </div>
              <div>
                <div className={dialogLabel}>Last Name</div>
                <p className={dialogValue}>{selectedUser.lastName || "â€”"}</p>
              </div>

              <div>
                <div className={dialogLabel}>Email</div>
                <p className={dialogValue}>{selectedUser.email || "â€”"}</p>
              </div>
              <div>
                <div className={dialogLabel}>Phone</div>
                <p className={dialogValue}>{selectedUser.phone || "â€”"}</p>
              </div>

              <div>
                <div className={dialogLabel}>Date of Birth</div>
                <p className={dialogValue}>
                  {selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : "â€”"}
                </p>
              </div>
              <div>
                <div className={dialogLabel}>Gender</div>
                <p className={dialogValue}>{selectedUser.gender || "â€”"}</p>
              </div>

              <div className={styles.cls039}>
                <div className={dialogLabel}>Registered At</div>
                <p className={dialogValue}>
                  {selectedUser.registeredAt
                    ? new Date(selectedUser.registeredAt).toLocaleString()
                    : "â€”"}
                </p>
              </div>

            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewMode(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewMode === "edit"} onOpenChange={() => setViewMode(null)}>
        <DialogContent className={dialogPanel}>
          <DialogHeader>
            <DialogTitle className={styles.cls036}>Edit User Information</DialogTitle>
            <DialogDescription className={styles.cls004}>
              Update user's personal details
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className={styles.cls037}>
              <div className={styles.cls040}>
                <div className={dialogLabel}>First Name</div>
                <Input
                  value={selectedUser.firstName ?? ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, firstName: e.target.value })
                  }
                  className={styles.cls041}
                />
              </div>
              <div className={styles.cls040}>
                <div className={dialogLabel}>Last Name</div>
                <Input
                  value={selectedUser.lastName ?? ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, lastName: e.target.value })
                  }
                  className={styles.cls041}
                />
              </div>
              <div className={styles.cls040}>
                <div className={dialogLabel}>Email</div>
                <Input
                  value={selectedUser.email ?? ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                  className={styles.cls041}
                />
              </div>
              <div className={styles.cls040}>
                <div className={dialogLabel}>Phone</div>
                <Input
                  value={selectedUser.phone ?? ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, phone: e.target.value })
                  }
                  className={styles.cls041}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewMode(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving}
              className={styles.cls042}
            >
              {saving ? (
                <span className={styles.cls043}>
                  <svg
                    className={styles.cls044}
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className={styles.cls045}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className={styles.cls046}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Savingâ€¦
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className={dialogPanel}>
          <DialogHeader>
            <DialogTitle className={styles.cls034}>
              <AlertTriangle className={styles.cls047} />
              {selectedUser?.status === "active"
                ? "Suspend User Account"
                : "Reactivate User Account"}
            </DialogTitle>
            <DialogDescription className={styles.cls004}>
              {selectedUser?.status === "active"
                ? "Are you sure you want to suspend this user account? The user will not be able to log in until reactivated."
                : "Are you sure you want to reactivate this user account?"}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className={styles.cls048}>
              <div>
                <span className={dialogSectionTitle}>User: </span>
                <span className={styles.cls049}>
                  {selectedUser.displayName || selectedUser.id}
                </span>
              </div>
              <div>
                <span className={dialogSectionTitle}>Email: </span>
                <span className={styles.cls049}>
                  {selectedUser.email || "â€”"}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmSuspend}
              disabled={saving}
              className={
                selectedUser?.status === "active"
                  ? "bg-red-600 hover:bg-red-700 disabled:opacity-70"
                  : "bg-green-600 hover:bg-green-700 disabled:opacity-70"
              }
            >
              {saving ? (
                <span className={styles.cls043}>
                  <svg
                    className={styles.cls044}
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className={styles.cls045}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className={styles.cls046}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : selectedUser?.status === "active" ? (
                "Suspend Account"
              ) : (
                "Reactivate Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



