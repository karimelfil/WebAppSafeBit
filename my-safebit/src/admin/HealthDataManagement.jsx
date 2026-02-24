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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Health Data Management</h2>
          <p className="text-sm text-gray-600">
            Manage allergies and chronic food-related diseases
          </p>
        </div>
        <Button onClick={openAddDialog} className="bg-green-600 hover:bg-green-700 shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Add {headerTitle}
        </Button>
      </div>

      {!!errMessage && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{errMessage}</AlertDescription>
        </Alert>
      )}
      {showSuccessMessage && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="w-full">
          <TabsList
            className="
              w-full
              bg-gray-100
              rounded-full
              p-1
              flex
              gap-1
              shadow-inner
            "
          >
            <TabsTrigger
              value="allergies"
              className="
                flex-1 rounded-full px-4 py-2 text-sm font-medium
                data-[state=active]:bg-white data-[state=active]:text-gray-900
                data-[state=active]:shadow
                data-[state=inactive]:text-gray-700
                transition
              "
            >
              Allergens
            </TabsTrigger>
            <TabsTrigger
              value="diseases"
              className="
                flex-1 rounded-full px-4 py-2 text-sm font-medium
                data-[state=active]:bg-white data-[state=active]:text-gray-900
                data-[state=active]:shadow
                data-[state=inactive]:text-gray-700
                transition
              "
            >
              Chronic Diseases
            </TabsTrigger>
          </TabsList>

          <TabsContent value="allergies" className="mt-4">
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

          <TabsContent value="diseases" className="mt-4">
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
          className="
            sm:max-w-lg
            bg-white
            shadow-2xl
            border border-gray-200
            rounded-xl
            p-6
          "
        >
          <DialogHeader>
            <DialogTitle className="text-lg">
              {dialogMode === "add" ? "Add New" : "Edit"} {headerTitle}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {dialogMode === "add"
                ? `Add a new ${headerTitle.toLowerCase()} to the database.`
                : `Update the ${headerTitle.toLowerCase()} information.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                autoFocus
                className="focus-visible:ring-green-600"
                placeholder={`Enter ${headerTitle.toLowerCase()} name`}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Enter category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formName.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {dialogMode === "add" ? "Add" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog && dialogMode === "delete"} onOpenChange={setShowDialog}>

        <DialogContent
          className="
            sm:max-w-lg
            bg-white
            shadow-2xl
            border border-gray-200
            rounded-xl
            p-6
          "
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete {headerTitle}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to remove this {headerTitle.toLowerCase()}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="py-2 space-y-2">
              <p className="text-sm">
                <strong className="text-gray-800">Name:</strong> {selectedItem.name}
              </p>
              {!!selectedItem.category && (
                <p className="text-sm">
                  <strong className="text-gray-800">Category:</strong> {selectedItem.category}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700">
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
      className="
        bg-white border border-gray-200 rounded-xl
        shadow-sm
        overflow-hidden
      "
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
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="sticky top-0 z-10 bg-gray-50">
            <TableRow className="border-b border-gray-200">
              <TableHead className="text-gray-600">ID</TableHead>
              <TableHead className="text-gray-600">Name</TableHead>
              <TableHead className="text-gray-600">Category</TableHead>
              <TableHead className="text-gray-600">Added Date</TableHead>
              <TableHead className="text-right text-gray-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`s-${i}`} className="animate-pulse">
                    <TableCell className="py-4">
                      <div className="h-3 w-12 bg-gray-200 rounded" />
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-3 w-28 bg-gray-200 rounded" />
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-3 w-20 bg-gray-200 rounded" />
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-3 w-24 bg-gray-200 rounded" />
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <div className="h-3 w-16 bg-gray-200 rounded ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-gray-500">
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
                  <TableCell className="whitespace-nowrap">{item.id}</TableCell>
                  <TableCell className="max-w-[320px] truncate">{item.name}</TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {item.category || "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(item)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
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
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}
            {" - "}
            {Math.min(currentPage * PAGE_SIZE, data.length)}
            {" of "}
            {data.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700">
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
