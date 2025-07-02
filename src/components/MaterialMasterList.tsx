import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  getAllMaterials,
  createMaterial,
  updateMaterial,
  bulkCreateMaterials,
} from "../services/api";
import { Dialog } from "@headlessui/react";
import ProtectedAdmin from "./auth/ProtectedAdmin";
import { Table } from "@mantine/core";
import toast from "react-hot-toast";

const ITEM_TYPES = ["consumable", "spare-part"];

type Material = {
  _id: string;
  maximoId: string;
  description: string;
  itemType: string;
  unit: string;
  initialStock: number;
  currentStock: number;
  lowStock: boolean;
  lowStockValue: number;
};

export default function MaterialManagement() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null,
  );
  const [showFormModal, setShowFormModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<any>({});

  const fetchData = async () => {
    const { materials } = await getAllMaterials();
    setMaterials(materials);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEdit = (material: Material) => {
    setSelectedMaterial(material);
    setForm({ ...material });
    setIsCreating(false);
    setShowFormModal(true);
  };

  const openCreate = () => {
    setForm({
      maximoId: "",
      description: "",
      itemType: "consumable",
      unit: "Pcs",
      initialStock: 0,
    });
    setIsCreating(true);
    setShowFormModal(true);
  };

  const handleSubmit = async () => {
    if (isCreating) {
      await createMaterial(form);
    } else {
      await updateMaterial(form._id, form); // ✅ Call update API
    }
    setShowFormModal(false);
    fetchData();
  };

  const handleExport = () => {
    const exportData = materials.map(
      ({
        maximoId,
        description,
        itemType,
        unit,
        initialStock,
        currentStock,
        lowStockValue,
        lowStock,
      }) => ({
        "Maximo ID": maximoId,
        Description: description,
        "Item Type": itemType,
        Unit: unit,
        "Initial Stock": initialStock,
        "Current Stock": currentStock,
        "Low Stock Threshold": lowStockValue,
        "Low Stock Alert": lowStock,
      }),
    );

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Materials");
    XLSX.writeFile(wb, "materials.xlsx");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const parsed = XLSX.utils.sheet_to_json(sheet);

    // Validate
    const valid = parsed.every(
      (row: any) =>
        row.maximoId &&
        typeof row.initialStock === "number" &&
        row.description &&
        row.itemType,
    );

    if (!valid) {
      toast.error("Invalid format. Please match the template.");
      return;
    }

    // Adding additional fields for the import process
    const materialsWithAdditionalFields = parsed.map((row: any) => ({
      ...row,
      currentStock: row.initialStock || 0,
      lowStock: row.lowStock || false,
      lowStockValue: row.lowStockValue || 0,
    }));

    // Submit the data
    try {
      await bulkCreateMaterials({ materials: materialsWithAdditionalFields });
      fetchData();
      toast.success("Materials imported successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <ProtectedAdmin>
      <div className="p-6 w-full sm:pl-[18rem]">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Material Master List</h2>

          <div className="flex flex-wrap gap-4">
            <button
              className="px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto"
              onClick={openCreate}
            >
              + Create Material 
            </button>
            <label
              htmlFor="import-users"
              className="px-4 py-2 text-center text-sm sm:text-base bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer w-full sm:w-auto"
            >
              Import from Excel
            </label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImport}
              className="hidden"
              id="import-users"
            />
            <button
              className="px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded hover:bg-green-700 w-full sm:w-auto"
              onClick={handleExport}
            >
              Export in Excel
            </button>
          </div>
        </div>
         {/* Make the table horizontally scrollable on small screens */}
        <div className="overflow-x-auto">
          <Table striped highlightOnHover className="rounded w-full shadow">
            <thead>
              <tr className="text-xs sm:text-sm">
                <th>Maximo ID</th>
                <th>Description</th>
                <th>Type</th>
                <th>Unit</th>
                <th>Initial Stock</th>
                <th>Current Stock</th>
                <th>Low Stock Threshold</th>
                <th>Low Stock Alert</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm divide-y divide-gray-200">
              {materials.map((m) => (
                <tr
                  key={m._id}
                  onClick={() => openEdit(m)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <td>{m.maximoId}</td>
                  <td>{m.description}</td>
                  <td className="capitalize">{m.itemType}</td>
                  <td>{m.unit}</td>
                  <td>{m.initialStock}</td>
                  <td>{m.currentStock}</td>
                  <td>{m.lowStockValue}</td>
                  <td>{m.lowStock ? "TRUE" : "FALSE"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <Dialog
          open={showFormModal}
          onClose={() => setShowFormModal(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/20" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center">
            <Dialog.Panel className="w-full max-w-md p-6 bg-white rounded shadow">
              <Dialog.Title className="text-lg font-medium mb-4">
                {isCreating ? "Create Material" : "View Material"}
              </Dialog.Title>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Maximo ID
                  </label>
                  <input
                    type="text"
                    placeholder="Maximo ID"
                    className="w-full border rounded px-3 py-2"
                    value={form.maximoId}
                    onChange={(e) =>
                      setForm({ ...form, maximoId: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Description"
                    className="w-full border rounded px-3 py-2"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Item Type
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={form.itemType}
                    onChange={(e) =>
                      setForm({ ...form, itemType: e.target.value })
                    }
                  >
                    {ITEM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="Unit (e.g., Pcs)"
                    className="w-full border rounded px-3 py-2"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={form.initialStock}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        initialStock: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Current Stock
                </label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={form.currentStock}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      currentStock: parseInt(e.target.value) || 0,
                    })}
                    />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={form.lowStockValue}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lowStockValue: parseInt(e.target.value) || 0,
                    })}
                    />
              </div>

              <div className="flex justify-end mt-6">
                <button
                  className="bg-gray-300 px-4 py-2 rounded mr-2"
                  onClick={() => setShowFormModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  onClick={handleSubmit}
                >
                  {isCreating ? "Create" : "Update"}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </ProtectedAdmin>
  );
}

