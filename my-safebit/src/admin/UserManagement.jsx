import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  styles,
  getStatusPillClass,
  getStatusDotClass,
  getIconButtonClass,
  getSuspendToneWrapClass,
  getSuspendToneIconClass,
  getSuspendActionButtonClass,
} from "../styles/admin/UserManagement.styles.js";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import {
  Search, Eye, Edit, Ban, Check, AlertTriangle,
  Users, UserCheck, UserX, Loader2,
} from "lucide-react";
import {
  getAllUsers, getUserById, updateUser, suspendUser, reactivateUser,
} from "../services/adminUserService";

//transform data to more visible format
const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

//transform data to more visible format with time
const fmtDateTime = (v) =>
  v ? new Date(v).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

//get the error message from the api response or fallback to a default message
const getAxiosMsg = (err, fallback) => {
  if (!axios.isAxiosError(err)) return fallback;
  const d = err.response?.data;
  if (d && typeof d === "object" && d.errors) {
    const k = Object.keys(d.errors)[0];
    const v = d.errors[k];
    return Array.isArray(v) ? v[0] : String(v);
  }
  const msg = d?.message || d || err.message;
  return typeof msg === "string" ? msg : fallback;
};

// Component to display user status with appropriate styling
function StatusPill({ status }) {
  const active = status === "active";
  return (
    <span className={getStatusPillClass(active)}>
      <span className={getStatusDotClass(active)} />
      {active ? "Active" : "Suspended"}
    </span>
  );
}


// Component to display a label and value pair in user details view
function DetailField({ label, value, span }) {
  return (
    <div className={span ? styles.cls039 : ""}>
      <p className={styles.cls093}>{label}</p>
      <p className={styles.cls094}>{value || "—"}</p>
    </div>
  );
}
// Component to display a statistic card with an icon, label, and value
function StatCard({ label, value, icon: Icon, cardCls, valueCls, wrapCls, iconCls }) {
  return (
    <div className={cardCls}>
      <div className={styles.cls010}>
        <div>
          <p className={styles.cls011}>{label}</p>
          <p className={valueCls}>{value}</p>
        </div>
        <div className={wrapCls}>
          <Icon className={iconCls} />
        </div>
      </div>
    </div>
  );
}

// Reusable button component for action icons in the user table for details , active and reactive actions 
function IconButton({ onClick, title, tone, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={getIconButtonClass(tone)}
    >
      {children}
    </button>
  );
}

// Simple spinner component using the Loader2 icon for loading states
function Spinner() {
  return <Loader2 className={styles.cls044} />;
}

export function UserManagement() {
  //Max 10 users per page
  const PAGE_SIZE = 10;

  // State variables for user data, loading states, errors, search term, pagination, selected user details, view modes, and action feedback
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [listError, setListError]   = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode]     = useState(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving]         = useState(false);
  const [actionError, setActionError] = useState(null);

  // Fetches the list of users when the component mounts and handles loading and error states
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setListError(null);
      try {
        const data = await getAllUsers();
        if (!cancelled) setUsers(data);
      } catch (err) {
        if (!cancelled) setListError(getAxiosMsg(err, "Failed to load users."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  //stats for the top cards
  const totalUsers     = users.length;
  const activeUsers    = useMemo(() => users.filter((u) => u.status === "active").length,    [users]);
  const suspendedUsers = useMemo(() => users.filter((u) => u.status === "suspended").length, [users]);

  //serach for users by name, email or id
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

  //pagination logic
  const totalPages    = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredUsers]);

  // Reset to first page when search term changes 
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  //show toast message for 4 seconds
  const toast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  //open detail dialog 
  const openDetail = async (user, mode) => {
    setActionError(null);
    try {
      const detail = await getUserById(user.id);
      setSelectedUser(detail);
      setViewMode(mode);
    } catch (err) {
      setActionError(getAxiosMsg(err, "Failed to load user details."));
    }
  };

  //put the user in the selected list and open the suspend dialog
  const handleSuspendUser = (user) => {
    setSelectedUser({ ...user });
    setShowSuspendDialog(true);
  };

  //confirm the suspend or reactivate action and update the user list accordingly
  const confirmSuspend = async () => {
    if (!selectedUser?.id) return;
    setSaving(true);
    setActionError(null);
    try {
      if (selectedUser.status === "active") await suspendUser(selectedUser.id);
      else                                   await reactivateUser(selectedUser.id);

      const newStatus = selectedUser.status === "active" ? "suspended" : "active";
      setUsers((prev) =>
        prev.map((u) => u.id === selectedUser.id ? { ...u, status: newStatus } : u)
      );
      toast(
        newStatus === "suspended"
          ? `${selectedUser.email || selectedUser.id} has been suspended.`
          : `${selectedUser.email || selectedUser.id} has been reactivated.`
      );
    } catch (err) {
      setActionError(getAxiosMsg(err, "Operation failed."));
    } finally {
      setSaving(false);
      setShowSuspendDialog(false);
      setSelectedUser(null);
    }
  };

  //save the edited user information and update the user list with the new details
  const handleSaveEdit = async () => {
    if (!selectedUser?.id) return;
    setSaving(true);
    setActionError(null);
    try {
      const updated = await updateUser(selectedUser.id, {
        firstName: selectedUser.firstName,
        lastName:  selectedUser.lastName,
        email:     selectedUser.email,
        phone:     selectedUser.phone,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === updated.id
            ? {
                ...u,
                email:       updated.email,
                displayName: updated.displayName ||
                  [updated.firstName, updated.lastName].filter(Boolean).join(" "),
              }
            : u
        )
      );
      toast("User information updated successfully.");
      setViewMode(null);
      setSelectedUser(null);
    } catch (err) {
      setActionError(getAxiosMsg(err, "Update failed."));
    } finally {
      setSaving(false);
    }
  };

  
  const displayName = (u) =>
    u.displayName ||
    [u.firstName, u.lastName].filter(Boolean).join(" ") ||
    "—";

  return (
    <div className={styles.cls001}>

      <div className={styles.cls002}>
        <div>
          <h2 className={styles.cls003}>User Management</h2>
          <p className={styles.cls004}>View and manage all registered users</p>
        </div>
        <div className={styles.cls005}>
          <Search className={styles.cls006} />
          <input
            type="text"
            placeholder="Search by name, email or ID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.cls007}
          />
        </div>
      </div>

      <div className={styles.cls008}>
        <StatCard
          label="Total Users" value={totalUsers} icon={Users}
          cardCls={styles.cls009} valueCls={styles.cls012}
          wrapCls={styles.cls013} iconCls={styles.cls014}
        />
        <StatCard
          label="Active Users" value={activeUsers} icon={UserCheck}
          cardCls={styles.cls100}
          valueCls={styles.cls015} wrapCls={styles.cls016} iconCls={styles.cls017}
        />
        <StatCard
          label="Suspended" value={suspendedUsers} icon={UserX}
          cardCls={styles.cls101}
          valueCls={styles.cls018} wrapCls={styles.cls019} iconCls={styles.cls020}
        />
      </div>

      {listError && (
        <div className={styles.cls021}>
          <AlertTriangle className={styles.cls022} />
          <span className={styles.cls023}>{listError}</span>
        </div>
      )}
      {actionError && (
        <div className={styles.cls021}>
          <AlertTriangle className={styles.cls022} />
          <span className={styles.cls023}>{actionError}</span>
        </div>
      )}
      {successMessage && (
        <div className={styles.cls024}>
          <Check className={styles.cls025} />
          <span className={styles.cls026}>{successMessage}</span>
        </div>
      )}

      <div className={styles.cls027}>
        <div className={styles.cls028}>
          <Table>
            <TableHeader className={styles.cls060}>
              <TableRow>
                {["User ID", "Name", "Email", "Status", "Registered"].map((h) => (
                  <TableHead key={h} className={styles.cls059}>
                    {h}
                  </TableHead>
                ))}
                <TableHead className={`${styles.cls059} ${styles.cls029}`}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className={styles.cls030}>
                    <span className={styles.cls050}>
                      <Loader2 className={styles.cls051} />
                      Loading users…
                    </span>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className={styles.cls030}>
                    <div className={styles.cls052}>
                      <Users className={styles.cls053} />
                      <span>No users found</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id} className={styles.cls054}>
                    <TableCell className={styles.cls055}>
                      <span className={styles.cls056}>
                        {user.id}
                      </span>
                    </TableCell>
                    <TableCell className={styles.cls057}>
                      {displayName(user)}
                    </TableCell>
                    <TableCell className={styles.cls058}>
                      {user.email || "—"}
                    </TableCell>
                    <TableCell className={styles.cls055}>
                      <StatusPill status={user.status} />
                    </TableCell>
                    <TableCell className={styles.cls058}>
                      {fmtDate(user.registeredAt)}
                    </TableCell>
                    <TableCell className={`${styles.cls055} ${styles.cls029}`}>
                      <div className={styles.cls031}>
                        <IconButton
                          title="View details"
                          onClick={() => openDetail(user, "view")}
                          tone="blue"
                        >
                          <Eye className={styles.cls032} />
                        </IconButton>
                        <IconButton
                          title="Edit user"
                          onClick={() => openDetail(user, "edit")}
                          tone="amber"
                        >
                          <Edit className={styles.cls032} />
                        </IconButton>
                        <IconButton
                          title={user.status === "active" ? "Suspend user" : "Reactivate user"}
                          onClick={() => handleSuspendUser(user)}
                          tone={user.status === "suspended" ? "emerald" : "red"}
                        >
                          {user.status === "suspended"
                            ? <Check className={styles.cls032} />
                            : <Ban  className={styles.cls032} />}
                        </IconButton>
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
              Showing{" "}
              <span className={styles.cls061}>
                {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filteredUsers.length)}
              </span>{" "}
              of{" "}
              <span className={styles.cls061}>{filteredUsers.length}</span> users
            </p>
            <div className={styles.cls034}>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={styles.cls062}
              >
                Previous
              </button>
              <span className={styles.cls035}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={styles.cls062}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={viewMode === "view"} onOpenChange={() => setViewMode(null)}>
        <DialogContent className={styles.cls068}>
          <div className={styles.cls069}>
            <DialogHeader>
              <DialogTitle className={styles.cls036}>User Details</DialogTitle>
              <DialogDescription className={styles.cls004}>
                Personal information for this account
              </DialogDescription>
            </DialogHeader>
          </div>

          {selectedUser && (
            <div className={styles.cls070}>
              <div className={styles.cls071}>
                <p className={styles.cls072}>Account Status</p>
                <StatusPill status={selectedUser.status} />
              </div>

              <div className={styles.cls037}>
                <DetailField label="User ID"    value={selectedUser.id}        />
                <DetailField label="Registered" value={fmtDateTime(selectedUser.registeredAt)} />
                <DetailField label="First Name" value={selectedUser.firstName} />
                <DetailField label="Last Name"  value={selectedUser.lastName}  />
                <DetailField label="Email"      value={selectedUser.email}     />
                <DetailField label="Phone"      value={selectedUser.phone}     />
                <DetailField label="Date of Birth" value={fmtDate(selectedUser.dob)} />
                <DetailField label="Gender"     value={selectedUser.gender}    />
              </div>
            </div>
          )}

          <div className={styles.cls073}>
            <button
              type="button"
              onClick={() => setViewMode(null)}
              className={styles.cls074}
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewMode === "edit"} onOpenChange={() => setViewMode(null)}>
        <DialogContent className={styles.cls068}>
          <div className={styles.cls069}>
            <DialogHeader>
              <DialogTitle className={styles.cls036}>Edit User Information</DialogTitle>
              <DialogDescription className={styles.cls004}>
                Update this user's personal details
              </DialogDescription>
            </DialogHeader>
          </div>

          {selectedUser && (
            <div className={styles.cls070}>
              <div className={styles.cls037}>
                {[
                  { label: "First Name", key: "firstName" },
                  { label: "Last Name",  key: "lastName"  },
                  { label: "Email",      key: "email"     },
                  { label: "Phone",      key: "phone"     },
                ].map(({ label, key }) => (
                  <div key={key} className={styles.cls040}>
                    <label className={styles.cls063}>
                      {label}
                    </label>
                    <input
                      value={selectedUser[key] ?? ""}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, [key]: e.target.value })
                      }
                      className={styles.cls064}
                    />
                  </div>
                ))}
              </div>

              {actionError && (
                <div className={styles.cls065}>
                  <AlertTriangle className={styles.cls066} />
                  <p className={styles.cls067}>{actionError}</p>
                </div>
              )}
            </div>
          )}

          <div className={styles.cls075}>
            <button
              type="button"
              onClick={() => setViewMode(null)}
              className={styles.cls074}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={saving}
              className={styles.cls042}
            >
              {saving
                ? <span className={styles.cls043}><Spinner /> Saving…</span>
                : "Save Changes"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className={styles.cls068}>
          <div className={styles.cls069}>
            <DialogHeader>
              <DialogTitle className={styles.cls076}>
                <div className={getSuspendToneWrapClass(selectedUser?.status === "active")}>
                  <AlertTriangle className={getSuspendToneIconClass(selectedUser?.status === "active")} />
                </div>
                {selectedUser?.status === "active" ? "Suspend User Account" : "Reactivate User Account"}
              </DialogTitle>
              <DialogDescription className={styles.cls082}>
                {selectedUser?.status === "active"
                  ? "The user will not be able to log in until reactivated."
                  : "The user will regain full access to their account."}
              </DialogDescription>
            </DialogHeader>
          </div>

          {selectedUser && (
            <div className={styles.cls070}>
              <div className={styles.cls048}>
                <div className={styles.cls083}>
                  <p className={styles.cls072}>Name</p>
                  <p className={styles.cls049}>{displayName(selectedUser)}</p>
                </div>
                <div className={styles.cls083}>
                  <p className={styles.cls072}>Email</p>
                  <p className={styles.cls049}>{selectedUser.email || "—"}</p>
                </div>
                <div className={styles.cls083}>
                  <p className={styles.cls072}>Current Status</p>
                  <StatusPill status={selectedUser.status} />
                </div>
              </div>
            </div>
          )}

          <div className={styles.cls075}>
            <button
              type="button"
              onClick={() => setShowSuspendDialog(false)}
              className={styles.cls074}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmSuspend}
              disabled={saving}
              className={getSuspendActionButtonClass(selectedUser?.status === "active")}
            >
              {saving
                ? <span className={styles.cls043}><Spinner />Processing…</span>
                : selectedUser?.status === "active" ? "Suspend Account" : "Reactivate Account"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
