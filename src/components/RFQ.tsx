
import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Table } from "@mantine/core";
import { useAuth } from "../providers/AuthProvider";
import { getAllSuppliers, createQuotation, getUserQuotations, getAllMaterials } from "../services/api";
import * as XLSX from 'xlsx';

interface Supplier {
  _id: string;
  username: string;
  email: string;
}

interface QuotationItem {
  maximoId: string;
  description: string;
  quantity: number;
  unit: string;
  deliveryLocation: string;
  specifications?: string;
}

interface Quotation {
  _id: string;
  supplier: Supplier;
  dueDate: string;
  items: QuotationItem[];
  status: string;
}

interface Material {
  _id: string;
  maximoId: string;
  description: string;
}

export default function QuotationManagement() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [form, setForm] = useState<any>({
    dueDate: "",
    supplier: "",
    items: [{ maximoId: "", description: "", quantity: 0, unit: "", deliveryLocation: "" }],
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  if (!user) return;

  const fetchData = async () => {
    const supplierRes = await getAllSuppliers();
    const materialRes = await getAllMaterials();
    const quotationRes = await getUserQuotations();
    setSuppliers(supplierRes.users);
    setMaterials(materialRes.materials);
    setQuotations(quotationRes.quotations);
  };

  const handleSubmit = async () => {
    await createQuotation({ ...form, submittedBy: user._id });
    setShowFormModal(false);
    setForm({ dueDate: "", supplier: "", items: [{ maximoId: "", description: "", quantity: 0, unit: "", deliveryLocation: "" }] });
    fetchData();
  };

  // Export function
  const exportAsExcel = () => {
    const formattedData = quotations.map((q) => ({
      "Supplier": q.supplier.username,
      "Due Date": new Date(q.dueDate).toLocaleDateString(),
      "Status": q.status,
      "Items": q.items.map(item => `${item.maximoId} - ${item.description}`).join(", "),
      "Total Items": q.items.length,
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quotations");

    // Export the Excel file
    XLSX.writeFile(wb, "quotations.xlsx");
  };

  return (
    <div className="p-6 w-full sm:pl-[18rem]">
      <div className="flex justify-between items-center mb-4 flex-col sm:flex-row">
        <h2 className="text-2xl font-semibold">Quotation Management</h2>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setShowFormModal(true)}
          >
            + Create Quotation
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={exportAsExcel}
          >
            Export as Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table striped highlightOnHover className="rounded w-full shadow">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((q) => (
              <tr key={q._id}>
                <td>{q.supplier?.username}</td>
                <td>{new Date(q.dueDate).toLocaleDateString()}</td>
                <td>{q.status}</td>
                <td>{q.items.length} items</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Dialog open={showFormModal} onClose={() => setShowFormModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/20" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="w-full max-w-md sm:max-w-xl p-6 bg-white rounded shadow">
            <Dialog.Title className="text-lg font-medium mb-4">Create Quotation</Dialog.Title>
            <div className="space-y-4">
              <select
                className="w-full border rounded px-3 py-2"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>{s.username}</option>
                ))}
              </select>

              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />

              {form.items.map((item: any, index: number) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <select className="border rounded px-2 py-1" value={item.maximoId} onChange={(e) => {
                    const items = [...form.items];
                    items[index].maximoId = e.target.value;
                    const selectedMaterial = materials.find(m => m.maximoId === e.target.value);
                    items[index].description = selectedMaterial?.description || "";
                    setForm({ ...form, items });
                  }}>
                    <option value="">Select Material</option>
                    {materials.map((m) => (
                      <option key={m._id} value={m.maximoId}>{m.maximoId} - {m.description}</option>
                    ))}
                  </select>
                  <input type="text" placeholder="Description" className="border rounded px-2 py-1" value={item.description} readOnly />
                  <input type="number" placeholder="Qty" className="border rounded px-2 py-1" value={item.quantity} onChange={(e) => {
                    const items = [...form.items];
                    items[index].quantity = parseInt(e.target.value) || 0;
                    setForm({ ...form, items });
                  }} />
                  <input type="text" placeholder="Unit" className="border rounded px-2 py-1" value={item.unit} onChange={(e) => {
                    const items = [...form.items];
                    items[index].unit = e.target.value;
                    setForm({ ...form, items });
                  }} />
                  <input type="text" placeholder="Delivery Location" className="col-span-2 border rounded px-2 py-1" value={item.deliveryLocation} onChange={(e) => {
                    const items = [...form.items];
                    items[index].deliveryLocation = e.target.value;
                    setForm({ ...form, items });
                  }} />
                </div>
              ))}

              <button onClick={() => setForm({ ...form, items: [...form.items, { maximoId: "", description: "", quantity: 0, unit: "", deliveryLocation: "" }] })} className="text-blue-600 text-sm underline">
                + Add another item
              </button>
            </div>

            <div className="flex justify-end mt-6">
              <button className="bg-gray-300 px-4 py-2 rounded mr-2" onClick={() => setShowFormModal(false)}>
                Cancel
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

