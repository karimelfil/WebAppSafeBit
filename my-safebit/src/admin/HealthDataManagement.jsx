import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Plus, Edit, Trash2, Check, AlertTriangle } from "lucide-react";
import { styles } from '../styles/admin/HealthDataManagement.styles.js';
import {
  getAllAllergens,
  createAllergen,
  updateAllergen,
  deleteAllergen,
  getAllDiseases,
  createDisease,
  updateDisease,
  deleteDisease,
} from "../services/adminHealthServices";

const PAGE_SIZE = 10;

export default function HealthDataManagement() {
  const [allergies, setAllergies] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [activeTab, setActiveTab] = useState("allergies");

  const [loading, setLoading] = useState(false);
  const [errMessage, setErrMessage] = useState("");

  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);

  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [allergyPage, setAllergyPage] = useState(1);
  const [diseasePage, setDiseasePage] = useState(1);

  const fetchAllAllergies = async () => {
    const list = await getAllAllergens();
    setAllergies(list);
  };

  const fetchAllDiseases = async () => {
    const list = await getAllDiseases();
    setDiseases(list);
  };

  const fetchAll = async () => {
    setErrMessage("");
    setLoading(true);
    try {
      await Promise.all([fetchAllAllergies(), fetchAllDiseases()]);
    } catch (e) {
      setErrMessage(
        e?.response?.data?.message || e?.message || "Failed to load health data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    const allergyPages = Math.max(1, Math.ceil(allergies.length / PAGE_SIZE));
    const diseasePages = Math.max(1, Math.ceil(diseases.length / PAGE_SIZE));

    if (allergyPage > allergyPages) {
      setAllergyPage(allergyPages);
    }
    if (diseasePage > diseasePages) {
      setDiseasePage(diseasePages);
    }
  }, [allergies, diseases, allergyPage, diseasePage]);

  useEffect(() => {
    setAllergyPage(1);
    setDiseasePage(1);
  }, [activeTab]);

  const openAddDialog = () => {
    setDialogMode("add");
    setFormName("");
    setFormCategory("");
    setSelectedItem(null);
    setShowDialog(true);
  };

  const openEditDialog = (item) => {
    setDialogMode("edit");
    setSelectedItem(item);
    setFormName(item.name || "");
    setFormCategory(item.category || "");
    setShowDialog(true);
  };

  const openDeleteDialog = (item) => {
    setDialogMode("delete");
    setSelectedItem(item);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    setErrMessage("");
    try {
      if (dialogMode === "add") {
        if (activeTab === "allergies") {
          await createAllergen({ name: formName, category: formCategory });
          await fetchAllAllergies();
        } else {
          await createDisease({ name: formName, category: formCategory });
          await fetchAllDiseases();
        }
        setSuccessMessage(
          `${activeTab === "allergies" ? "Allergen" : "Disease"} "${formName}" added successfully.`
        );
      } else if (dialogMode === "edit" && selectedItem) {
        if (activeTab === "allergies") {
          await updateAllergen(selectedItem.id, { name: formName, category: formCategory });
          await fetchAllAllergies();
        } else {
          await updateDisease(selectedItem.id, { name: formName, category: formCategory });
          await fetchAllDiseases();
        }
        setSuccessMessage(
          `${activeTab === "allergies" ? "Allergen" : "Disease"} updated successfully.`
        );
      } else if (dialogMode === "delete" && selectedItem) {
        if (activeTab === "allergies") {
          await deleteAllergen(selectedItem.id);
          await fetchAllAllergies();
        } else {
          await deleteDisease(selectedItem.id);
          await fetchAllDiseases();
        }
        setSuccessMessage(
          `${activeTab === "allergies" ? "Allergen" : "Disease"} "${selectedItem.name}" removed successfully.`
        );
      }

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      setShowDialog(false);
      setSelectedItem(null);
      setFormName("");
      setFormCategory("");
    } catch (e) {
      setErrMessage(
        e?.response?.data?.message || e?.message || "Operation failed. Please try again."
      );
    }
  };

  const headerTitle = useMemo(
    () => (activeTab === "allergies" ? "Allergen" : "Disease"),
    [activeTab]
  );

  return (
    <div className={styles.cls001}>
      <div className={styles.cls002}>
        <div>
          <h2 className={styles.cls003}>Health Data Management</h2>
          <p className={styles.cls004}>
            Manage allergies and chronic food-related diseases
          </p>
        </div>
        <Button onClick={openAddDialog} className={styles.cls005}>
          <Plus className={styles.cls006} />
          Add {headerTitle}
        </Button>
      </div>

      {!!errMessage && (
        <Alert className={styles.cls007}>
          <AlertTriangle className={styles.cls008} />
          <AlertDescription className={styles.cls009}>{errMessage}</AlertDescription>
        </Alert>
      )}
      {showSuccessMessage && (
        <Alert className={styles.cls010}>
          <Check className={styles.cls011} />
          <AlertDescription className={styles.cls012}>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className={styles.cls013}>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className={styles.cls014}>
          <TabsList
            className={styles.cls015}
          >
            <TabsTrigger
              value="allergies"
              className={styles.cls016}
            >
              Allergens
            </TabsTrigger>
            <TabsTrigger
              value="diseases"
              className={styles.cls016}
            >
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
        <DialogContent
          className={styles.cls018}
        >
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

          <div className={styles.cls021}>
            <div className={styles.cls022}>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                autoFocus
                className={styles.cls023}
                placeholder={`Enter ${headerTitle.toLowerCase()} name`}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className={styles.cls022}>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Enter category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className={styles.cls024}>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formName.trim()}
              className={styles.cls025}
            >
              {dialogMode === "add" ? "Add" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog && dialogMode === "delete"} onOpenChange={setShowDialog}>

        <DialogContent
          className={styles.cls018}
        >
          <DialogHeader>
            <DialogTitle className={styles.cls026}>
              <AlertTriangle className={styles.cls027} />
              Delete {headerTitle}
            </DialogTitle>
            <DialogDescription className={styles.cls020}>
              Are you sure you want to remove this {headerTitle.toLowerCase()}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className={styles.cls028}>
              <p className={styles.cls029}>
                <strong className={styles.cls030}>Name:</strong> {selectedItem.name}
              </p>
              {!!selectedItem.category && (
                <p className={styles.cls029}>
                  <strong className={styles.cls030}>Category:</strong> {selectedItem.category}
                </p>
              )}
            </div>
          )}

          <DialogFooter className={styles.cls024}>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className={styles.cls031}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function DataCard({ children }) {
  return (
    <div
      className={styles.cls032}
    >
      {children}
    </div>
  );
}

function DataTable({ data, loading, currentPage, onPageChange, onEdit, onDelete }) {
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
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
              <TableHead className={styles.cls020}>ID</TableHead>
              <TableHead className={styles.cls020}>Name</TableHead>
              <TableHead className={styles.cls020}>Category</TableHead>
              <TableHead className={styles.cls020}>Added Date</TableHead>
              <TableHead className={styles.cls038}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`s-${i}`} className={styles.cls039}>
                    <TableCell className={styles.cls040}>
                      <div className={styles.cls041} />
                    </TableCell>
                    <TableCell className={styles.cls040}>
                      <div className={styles.cls042} />
                    </TableCell>
                    <TableCell className={styles.cls040}>
                      <div className={styles.cls043} />
                    </TableCell>
                    <TableCell className={styles.cls040}>
                      <div className={styles.cls044} />
                    </TableCell>
                    <TableCell className={styles.cls045}>
                      <div className={styles.cls046} />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className={styles.cls047}>
                  No data found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, idx) => (
                <TableRow
                  key={item.id}
                  className={`
                    ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
                    hover:bg-green-50/50 transition-colors
                  `}
                >
                  <TableCell className={styles.cls048}>{item.id}</TableCell>
                  <TableCell className={styles.cls049}>{item.name}</TableCell>
                  <TableCell className={styles.cls050}>
                    {item.category || "-"}
                  </TableCell>
                  <TableCell className={styles.cls048}>
                    {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className={styles.cls051}>
                    <div className={styles.cls052}>
                      <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
                        <Edit className={styles.cls053} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(item)}
                        className={styles.cls054}
                      >
                        <Trash2 className={styles.cls053} />
                      </Button>
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
            Showing {(currentPage - 1) * PAGE_SIZE + 1}
            {" - "}
            {Math.min(currentPage * PAGE_SIZE, data.length)}
            {" of "}
            {data.length}
          </p>
          <div className={styles.cls056}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className={styles.cls057}>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


