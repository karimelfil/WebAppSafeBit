import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import { Plus, Edit, Trash2, Check, AlertTriangle, ShieldAlert, Activity } from "lucide-react";
import {
  styles,
  getIconButtonClass,
} from "../styles/admin/HealthDataManagement.styles.js";
import {
  getAllAllergens, createAllergen, updateAllergen, deleteAllergen,
  getAllDiseases,  createDisease,  updateDisease,  deleteDisease,
} from "../services/adminHealthServices";

const PAGE_SIZE = 10;

// Reusable icon button component for edit/delete actions
function IconButton({ onClick, title, tone = "amber", children }) {
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

// Card component to wrap the data tables with consistent styling
function DataCard({ children }) {
  return <div className={styles.cls032}>{children}</div>;
}
// Component to display paginated tables for allergens and diseases with edit/delete actions
function DataTable({ data, loading, currentPage, onPageChange, onEdit, onDelete }) {
  const totalPages    = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [currentPage, data]);

  return (
    <div className={styles.cls033}>
      <div className={styles.cls034}>
        <Table className={styles.cls035}>
          <TableHeader className={styles.cls036}>
              <TableRow className={styles.cls037}>
                {["ID", "Name", "Category", "Added Date"].map((h) => (
                <TableHead key={h} className={styles.cls072}>
                  {h}
                </TableHead>
              ))}
              <TableHead className={styles.cls038}>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={`sk-${i}`} className={styles.cls039}>
                  <TableCell className={styles.cls040}><div className={styles.cls041} /></TableCell>
                  <TableCell className={styles.cls040}><div className={styles.cls042} /></TableCell>
                  <TableCell className={styles.cls040}><div className={styles.cls043} /></TableCell>
                  <TableCell className={styles.cls040}><div className={styles.cls044} /></TableCell>
                  <TableCell className={styles.cls045}><div className={styles.cls046} /></TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className={styles.cls047}>
                  <div className={styles.cls073}>
                    <Activity className={styles.cls074} />
                    <span>No entries found</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow
                  key={item.id}
                  className={styles.cls079}
                >
                  <TableCell className={styles.cls048}>
                    <span className={styles.cls080}>
                      {item.id}
                    </span>
                  </TableCell>
                  <TableCell className={styles.cls049}>{item.name}</TableCell>
                  <TableCell className={styles.cls050}>
                    {item.category ? (
                      <span className={styles.cls071}>
                        {item.category}
                      </span>
                    ) : (
                      <span className={styles.cls081}>—</span>
                    )}
                  </TableCell>
                  <TableCell className={styles.cls048}>
                    {item.addedAt
                      ? new Date(item.addedAt).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                        })
                      : <span className={styles.cls081}>—</span>}
                  </TableCell>
                  <TableCell className={styles.cls051}>
                    <div className={styles.cls052}>
                      <IconButton
                        title="Edit"
                        onClick={() => onEdit(item)}
                        tone="amber"
                      >
                        <Edit className={styles.cls053} />
                      </IconButton>
                      <IconButton
                        title="Delete"
                        onClick={() => onDelete(item)}
                        tone="red"
                      >
                        <Trash2 className={styles.cls053} />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && data.length > 0 && (
        <div className={styles.cls055}>
          <p className={styles.cls004}>
            Showing{" "}
            <span className={styles.cls077}>
              {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, data.length)}
            </span>{" "}
            of{" "}
            <span className={styles.cls077}>{data.length}</span>
          </p>
          <div className={styles.cls056}>
            <button
              type="button"
              onClick={() => onPageChange((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={styles.cls078}
            >
              Previous
            </button>
            <span className={styles.cls057}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={styles.cls078}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HealthDataManagement() {
  const [allergies, setAllergies]   = useState([]);
  const [diseases, setDiseases]     = useState([]);
  const [activeTab, setActiveTab]   = useState("allergies");

  const [loading, setLoading]       = useState(false);
  const [errMessage, setErrMessage] = useState("");

  const [showDialog, setShowDialog]     = useState(false);
  const [dialogMode, setDialogMode]     = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);

  const [formName, setFormName]         = useState("");
  const [formCategory, setFormCategory] = useState("");

  const [successMessage, setSuccessMessage]   = useState("");
  const [showSuccess, setShowSuccess]         = useState(false);

  const [allergyPage, setAllergyPage] = useState(1);
  const [diseasePage, setDiseasePage] = useState(1);

  const fetchAllAllergies = async () => { setAllergies(await getAllAllergens()); };
  const fetchAllDiseases  = async () => { setDiseases(await getAllDiseases());   };

  // Fetches all allergens and diseases, handles loading and error states
  const fetchAll = async () => {
    setErrMessage("");
    setLoading(true);
    try {
      await Promise.all([fetchAllAllergies(), fetchAllDiseases()]);
    } catch (e) {
      setErrMessage(e?.response?.data?.message || e?.message || "Failed to load health data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Adjusts current page if data length changes to ensure valid pagination
  useEffect(() => {
    const ap = Math.max(1, Math.ceil(allergies.length / PAGE_SIZE));
    const dp = Math.max(1, Math.ceil(diseases.length / PAGE_SIZE));
    if (allergyPage > ap) setAllergyPage(ap);
    if (diseasePage > dp) setDiseasePage(dp);
  }, [allergies, diseases, allergyPage, diseasePage]);

  useEffect(() => { setAllergyPage(1); setDiseasePage(1); }, [activeTab]);

  // Dialog control functions for add
  const openAddDialog = () => {
    setDialogMode("add");
    setFormName("");
    setFormCategory("");
    setSelectedItem(null);
    setShowDialog(true);
  };
// Dialog control functions for edit
  const openEditDialog = (item) => {
    setDialogMode("edit");
    setSelectedItem(item);
    setFormName(item.name || "");
    setFormCategory(item.category || "");
    setShowDialog(true);
  };

  // Dialog control functions for delete
  const openDeleteDialog = (item) => {
    setDialogMode("delete");
    setSelectedItem(item);
    setShowDialog(true);
  };

  //show toast message for successful operations
  const toast = (msg) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  //know which tab is active
  const isAllergies  = activeTab === "allergies";
  const headerTitle  = isAllergies ? "Allergen" : "Disease";

  // Handles form submission for add/edit/delete operations based on the current dialog mode and active tab
  const handleSubmit = async () => {
    setErrMessage("");
    try {
      if (dialogMode === "add") {
        if (isAllergies) { await createAllergen({ name: formName, category: formCategory }); await fetchAllAllergies(); }
        else             { await createDisease ({ name: formName, category: formCategory }); await fetchAllDiseases();  }
        toast(`${headerTitle} "${formName}" added successfully.`);
      } else if (dialogMode === "edit" && selectedItem) {
        if (isAllergies) { await updateAllergen(selectedItem.id, { name: formName, category: formCategory }); await fetchAllAllergies(); }
        else             { await updateDisease (selectedItem.id, { name: formName, category: formCategory }); await fetchAllDiseases();  }
        toast(`${headerTitle} updated successfully.`);
      } else if (dialogMode === "delete" && selectedItem) {
        if (isAllergies) { await deleteAllergen(selectedItem.id); await fetchAllAllergies(); }
        else             { await deleteDisease (selectedItem.id); await fetchAllDiseases();  }
        toast(`${headerTitle} "${selectedItem.name}" removed successfully.`);
      }
      setShowDialog(false);
      setSelectedItem(null);
      setFormName("");
      setFormCategory("");
    } catch (e) {
      setErrMessage(e?.response?.data?.message || e?.message || "Operation failed. Please try again.");
    }
  };

  return (
    <div className={styles.cls001}>

      <div className={styles.cls002}>
        <div>
          <h2 className={styles.cls003}>Health Data Management</h2>
          <p className={styles.cls004}>Manage allergens and chronic food-related diseases</p>
        </div>
        <button type="button" onClick={openAddDialog} className={styles.cls005}>
          <Plus className={styles.cls006} />
          Add {headerTitle}
        </button>
      </div>

      {!!errMessage && (
        <div className={styles.cls007}>
          <AlertTriangle className={styles.cls008} />
          <span className={styles.cls009}>{errMessage}</span>
        </div>
      )}
      {showSuccess && (
        <div className={styles.cls010}>
          <Check className={styles.cls011} />
          <span className={styles.cls012}>{successMessage}</span>
        </div>
      )}

      <div className={styles.cls013}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className={styles.cls014}>
          <TabsList className={styles.cls015}>
            <TabsTrigger value="allergies" className={styles.cls016}>
              <ShieldAlert className={styles.cls058} />
              Allergens
            </TabsTrigger>
            <TabsTrigger value="diseases" className={styles.cls016}>
              <Activity className={styles.cls058} />
              Chronic Diseases
            </TabsTrigger>
          </TabsList>

          <TabsContent value="allergies" className={styles.cls017}>
            <DataCard>
              <DataTable
                data={allergies}
                loading={loading}
                currentPage={allergyPage}
                onPageChange={setAllergyPage}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
              />
            </DataCard>
          </TabsContent>

          <TabsContent value="diseases" className={styles.cls017}>
            <DataCard>
              <DataTable
                data={diseases}
                loading={loading}
                currentPage={diseasePage}
                onPageChange={setDiseasePage}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
              />
            </DataCard>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDialog && dialogMode !== "delete"} onOpenChange={setShowDialog}>
        <DialogContent className={styles.cls018}>
          <div className={styles.cls063}>
            <DialogHeader>
              <DialogTitle className={styles.cls019}>
                {dialogMode === "add" ? "Add New" : "Edit"} {headerTitle}
              </DialogTitle>
              <DialogDescription className={styles.cls020}>
                {dialogMode === "add"
                  ? `Add a new ${headerTitle.toLowerCase()} to the database.`
                  : `Update the ${headerTitle.toLowerCase()} information.`}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className={styles.cls064}>
            <div className={styles.cls021}>
              <div className={styles.cls022}>
                <label htmlFor="name" className={styles.cls059}>
                  Name <span className={styles.cls060}>*</span>
                </label>
                <input
                  id="name"
                  autoFocus
                  placeholder={`Enter ${headerTitle.toLowerCase()} name`}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={styles.cls062}
                />
              </div>
              <div className={styles.cls022}>
                <label htmlFor="category" className={styles.cls059}>
                  Category <span className={styles.cls061}>(optional)</span>
                </label>
                <input
                  id="category"
                  placeholder="e.g. Nut, Dairy, Autoimmune…"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className={styles.cls062}
                />
              </div>
            </div>
          </div>

          <div className={styles.cls065}>
            <button
              type="button"
              onClick={() => setShowDialog(false)}
              className={styles.cls066}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formName.trim()}
              className={styles.cls025}
            >
              {dialogMode === "add" ? `Add ${headerTitle}` : "Save Changes"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog && dialogMode === "delete"} onOpenChange={setShowDialog}>
        <DialogContent className={styles.cls018}>
          <div className={styles.cls063}>
            <DialogHeader>
              <DialogTitle className={styles.cls026}>
                <div className={styles.cls067}>
                  <AlertTriangle className={styles.cls068} />
                </div>
                Delete {headerTitle}
              </DialogTitle>
              <DialogDescription className={styles.cls069}>
                This action cannot be undone. The {headerTitle.toLowerCase()} will be permanently removed.
              </DialogDescription>
            </DialogHeader>
          </div>

          {selectedItem && (
            <div className={styles.cls064}>
              <div className={styles.cls028}>
                <div className={styles.cls029}>
                  <span className={styles.cls030}>Name</span>
                  <span className={styles.cls070}>{selectedItem.name}</span>
                </div>
                {!!selectedItem.category && (
                  <div className={styles.cls029}>
                    <span className={styles.cls030}>Category</span>
                    <span className={styles.cls071}>
                      {selectedItem.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={styles.cls065}>
            <button
              type="button"
              onClick={() => setShowDialog(false)}
              className={styles.cls066}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={styles.cls031}
            >
              Delete {headerTitle}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
