import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPurchasingQuotationRequests,
  getSupplierQuotationRequests,
  createQuotationRequest,
  getAllQuotationRequests,
} from "../services/api";
import { useAuth } from "../providers/AuthProvider";
import { getAllMaterials } from "../services/api"; // Assuming this function is already created
import { getAllSuppliers } from "../services/api"; // Assuming this function is already created
import Select from "react-select";

const QuotationRequestManagement = () => {
  const { user } = useAuth();
  const [quotationRequests, setQuotationRequests] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<{
dueDate:string,
items:any,
suppliers:any,
notes:string
}>({
    dueDate: "",
    items: [],
    suppliers: [],
    notes: "",
  });

  const navigate = useNavigate();

  const fetchData = async () => {
    if (user?.role === "purchasing") {
      getPurchasingQuotationRequests()
        .then((data) => setQuotationRequests(data.quotationRequests))
        .catch((error) =>
          console.error("Error fetching purchasing quotations:", error),
        );
      getAllMaterials().then((data) => setMaterials(data.materials));
      getAllSuppliers().then((data) => setSuppliers(data.users));
    } else if (user?.role === "supplier") {
      getSupplierQuotationRequests()
        .then((data) => setQuotationRequests(data.quotationRequests))
        .catch((error) =>
          console.error("Error fetching supplier quotations:", error),
        );
    } else {
      getAllQuotationRequests().then((data) =>
        setQuotationRequests(data.quotationRequests),
      );
      getAllMaterials().then((data) => setMaterials(data.materials));
      getAllSuppliers().then((data) => setSuppliers(data.users));
    }
    // Fetch materials and suppliers for the form
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRowClick = (id: string) => {
    navigate(`/quotation-requests/${id}`);
  };

  const handleCreateQuotation = () => {
    setShowModal(true); // Open the modal to create a new quotation
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    const updatedItems:any = [...formData.items];
    updatedItems[index][name] = value;
    setFormData({ ...formData, items: updatedItems });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { maximoId: "", quantity: 0 }],
    });
  };

  const handleSubmit = async () => {
    const payload = {
      dueDate: formData.dueDate,
      items: formData.items,
      suppliers: formData.suppliers.map((supplier:any) => supplier.value), // Extracting _id from selected suppliers
      notes: formData.notes,
      submittedBy: user?._id,
    };

    try {
      await createQuotationRequest(payload);
      setShowModal(false);
      setFormData({ dueDate: "", items: [], suppliers: [], notes: "" }); // Reset form
      alert("Quotation Request Created Successfully");
      await fetchData();
    } catch (error) {
      console.error("Error creating quotation:", error);
    }
  };

  // Transform the suppliers data into a format compatible with React Select
  const supplierOptions = suppliers.map((supplier) => ({
    label: supplier.username,
    value: supplier._id,
  }));

  // Function to truncate supplier names and add ellipsis if more than two
  const formatSuppliers = (suppliers: any[]) => {
    if (suppliers.length > 2) {
      return `${suppliers
        .slice(0, 2)
        .map((s: any) => s.username)
        .join(", ")}...`;
    }
    return suppliers.map((s: any) => s.username).join(", ");
  };

  return (
    <div className="container p-6 sm:pl-[18rem]">
      <h2 className="text-2xl font-semibold mb-4">Quotation Requests</h2>

      {(user?.role === "purchasing" || user?.role === "admin") && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleCreateQuotation}
            className="px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Create Quotation Request
          </button>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="border-b">
            <tr>
              {user?.role === "purchasing" || user?.role === "admin" ? (
                <>
                  <th className="px-4 py-2 text-sm sm:text-base">Supplier</th>
                  <th className="px-4 py-2 text-sm sm:text-base">Due Date</th>
                  <th className="px-4 py-2 text-sm sm:text-base">Items</th>
                  <th className="px-4 py-2 text-sm sm:text-base">Status</th>
                  <th className="px-4 py-2 text-sm sm:text-base">
                    Creation Date
                  </th>
                  <th className="px-4 py-2 text-sm sm:text-base">Currency</th>
                  <th className="px-4 py-2 text-sm sm:text-base">
                    Submitted By
                  </th>
                </>
              ) : (
                <>
                  <th className="px-4 py-2 text-sm sm:text-base">
                    Create Date
                  </th>
                  <th className="px-4 py-2 text-sm sm:text-base">Due Date</th>
                  <th className="px-4 py-2 text-sm sm:text-base">Currency</th>
                  <th className="px-4 py-2 text-sm sm:text-base">
                    Submitted By
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {quotationRequests.length > 0 ? (
              quotationRequests.map((request: any) => (
                <tr
                  key={request._id}
                  onClick={() => handleRowClick(request._id)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  {user?.role === "purchasing" || user?.role === "admin" ? (
                    <>
                      <td className="px-4 py-2 text-sm sm:text-base">
                        {formatSuppliers(request.suppliers)}
                      </td>
                      <td className="px-4 py-2 text-sm sm:text-base">
                        {new Date(request.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm sm:text-base">
                        {request.items.length} items
                      </td>
                      <td className="px-4 py-2 text-sm sm:text-base">
                        {request.status}
                      </td>
                      <td className="px-4 py-2 text-sm sm:text-base">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm sm:text-base">
                        {request.currency}
                      </td>
                      <td className="px-4 py-2 text-sm sm:text-base">
                        {request.submittedBy?.username}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2 text-sm sm:text-base">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm sm:text-base">
                        {new Date(request.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm sm:text-base">
                        {request.currency}
                      </td>
                      <td className="px-4 py-2 text-sm sm:text-base">
                        {request.submittedBy?.username}
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    user?.role === "purchasing" || user?.role === "admin"
                      ? 7
                      : 4
                  }
                  className="px-4 py-2 text-sm sm:text-base text-center"
                >
                  No requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Background overlay */}
          <div
            className="bg-black/50 fixed inset-0"
            onClick={() => setShowModal(false)}
            style={{ zIndex: 50 }} // Set z-index for the overlay to ensure it stays behind the modal
          ></div>

          {/* Modal content */}
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md z-60">
            <h2 className="text-2xl font-semibold mb-4">
              Create Quotation Request
            </h2>
            <div>
              <label className="block text-sm mb-2">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleFormChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Items</label>
              {formData.items.map((item:any, index:number) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    name="maximoId"
                    value={item.maximoId}
                    onChange={(e:any) => handleItemChange(index, e)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Material</option>
                    {materials.map((m) => (
                      <option key={m._id} value={m.maximoId}>
                        {m.maximoId} - {m.description}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, e)}
                    placeholder="Quantity"
                    className="w-1/4 border rounded px-3 py-2"
                  />
                </div>
              ))}
              <button
                onClick={handleAddItem}
                className="text-blue-600 text-sm underline"
              >
                + Add Item
              </button>
            </div>

            <div>
              <label className="block text-sm mb-2">Suppliers</label>
              <Select
                isMulti
                name="suppliers"
                options={supplierOptions}
                value={formData.suppliers}
                onChange={(selectedOptions) => {
                  setFormData({
                    ...formData,
                    suppliers: selectedOptions,
                  });
                }}
                getOptionLabel={(e) => e.label}
                getOptionValue={(e) => e.value}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                className="w-full border rounded px-3 py-2"
                rows={4}
                placeholder="Enter notes for the quotation request"
              ></textarea>
            </div>

            <div className="flex justify-end mt-6">
              <button
                className="bg-gray-300 px-4 py-2 rounded mr-2"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationRequestManagement;
