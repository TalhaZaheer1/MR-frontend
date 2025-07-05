import React, { useEffect, useState } from "react";
import {  useParams } from "react-router-dom";
import {
  getQuotations,
  createQuotation,
  approveQuotaion,
  rejectQuotaion,
  getQuotationRequestById,
} from "../services/api";
import { useAuth } from "../providers/AuthProvider";

// Utility function for status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "text-yellow-600 bg-yellow-100";
    case "approved":
      return "text-blue-600 bg-blue-100";
    case "rejected":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const QuotationRequestDetails = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [quotationRequest, setQuotationRequest] = useState<any>(null);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({
    items: [],
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string>("");
  const [showApproveModal, setShowApproveModal] = useState(false); // State for showing the approval modal
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");

  console.log({ quotationRequest, quotations });

  useEffect(() => {
    if (id) {
      if (user?.role === "admin" || user?.role === "purchasing") {
        getQuotations(id).then((data) => {
          setQuotations(data.quotations);
        });
      }
      getQuotationRequestById(id).then((data) => {
        setFormData({ ...formData, items: data.quotationRequest.items });
        setQuotationRequest(data.quotationRequest);
      });
    }
  }, [id]);

  // Handle approval of the quotation
  const handleApprove = async (quotationId: string) => {
    setShowApproveModal(true); // Show the approval modal for inputs
    setSelectedQuotationId(quotationId); // Store selected quotation ID
  };

  // Handle form submission for approval
  const handleApproveSubmit = async () => {
    const payload = {
      quotationId: selectedQuotationId,
      expectedDeliveryDate,
      paymentTerms,
    };
    await approveQuotaion(payload);
    setShowApproveModal(false); // Close the modal after approval
    // Re-fetch quotations to get the updated status
    if (user?.role === "admin" || user?.role === "purchasing") {
      getQuotations(id as string).then((data) => {
        setQuotations(data.quotations);
      });
    }
    getQuotationRequestById(id as string).then((data) =>
      setQuotationRequest(data.quotationRequest),
    );
  };

  const handleReject = async (quotationId: string) => {
    if (rejectionReason.trim() === "") {
      alert("Please provide a reason for rejection.");
      return;
    }
    await rejectQuotaion({ quotationId, reason: rejectionReason });
    // Re-fetch quotations to get the updated status
    if (user?.role === "admin" || user?.role === "purchasing") {
      const data = await getQuotations(id as string);
      setQuotations(data.quotations);
    }
    const data = await getQuotationRequestById(id as string);
    setQuotationRequest(data.quotationRequest), setShowRejectionModal(false);
  };

  const handleCreateQuotation = () => {
    setShowModal(true); // Open the modal to create a new quotation
  };

  
  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    updatedItems[index][name] = value;

    // Calculate total price if price per unit and quantity are available
    if (name === "pricePerUnit" || name === "quantity") {
      const pricePerUnit = updatedItems[index].pricePerUnit || 0;
      const quantity = updatedItems[index].quantity || 0;
      updatedItems[index].totalPrice = pricePerUnit * quantity;
    }

    setFormData({ ...formData, items: updatedItems });
  };

  
  const handleSubmitQuotation = async () => {
    const payload = {
      quotationRequestId: id,
      items: formData.items,
    };
    try {
      await createQuotation(payload);
      setShowModal(false);
      alert("Quotation Created Successfully");
    } catch (error) {
      console.error("Error creating quotation:", error);
    }
  };

  return (
    <div className="container p-6 sm:pl-[18rem]">
      <h2 className="text-2xl font-semibold mb-4">Quotation Request Details</h2>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Quotation Request Items</h3>
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full table-auto">
            <thead className="border-b">
              <tr>
                <th className="px-4 py-2 text-sm sm:text-base">Item</th>
                <th className="px-4 py-2 text-sm sm:text-base">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {quotationRequest?.items.map((item: any) => (
                <tr key={item._id}>
                  <td className="px-4 py-2 text-sm sm:text-base">
                    {item.maximoId} - {item.material.description}
                  </td>
                  <td className="px-4 py-2 text-sm sm:text-base">
                    {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quotation List for Admin/Purchasing Roles */}
      {(user?.role === "purchasing" || user?.role === "admin") && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Quotation List</h3>
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full table-auto">
              <thead className="border-b">
                <tr>
                  <th className="px-4 py-2 text-sm sm:text-base">
                    Creation Date
                  </th>
                  <th className="px-4 py-2 text-sm sm:text-base">Status</th>
                  <th className="px-4 py-2 text-sm sm:text-base">
                    Submitted By
                  </th>
                  <th className="px-4 py-2 text-sm sm:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((quotation: any) => (
                  <tr key={quotation._id}>
                    <td className="px-4 py-2 text-sm sm:text-base">
                      {new Date(quotation.date).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(quotation.status)}`}
                      >
                        {quotation.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm sm:text-base">
                      {quotation.supplierId.username}
                    </td>
                    <td className="px-4 py-2 text-sm sm:text-base">
                      {quotation.status === "pending" && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(quotation._id)}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setShowRejectionModal(true);
                              setSelectedQuotationId(quotation._id);
                            }}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {quotation.status === "approved" && (
                        <span className="text-green-600">Approved</span>
                      )}
                      {quotation.status === "rejected" && (
                        <span className="text-red-600">Rejected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quotation Form for Supplier Role */}
      {user?.role === "supplier" && (
        <div className="mb-4">
          <button
            onClick={handleCreateQuotation}
            className="px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Quotation
          </button>
        </div>
      )}

      {/* Quotation Form Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-black/50 fixed inset-0"
            onClick={() => setShowModal(false)}
          ></div>

          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md z-60">
            <h2 className="text-2xl font-semibold mb-4">Create Quotation</h2>
            {quotationRequest?.items.map((item: any, index: number) => (
              <div key={item._id} className="mb-4">
                <label className="block text-sm mb-2">
                  {item.maximoId} - {item.material.description}
                </label>
                <input
                  type="number"
                  name="pricePerUnit"
                  value={formData.items[index]?.pricePerUnit || ""}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter price per unit"
                />
                <input
                  type="number"
                  name="totalPrice"
                  value={formData.items[index]?.totalPrice || ""}
                  className="w-full border rounded px-3 py-2 mt-2"
                  disabled
                  placeholder="Total Price"
                />
              </div>
            ))}
            <div className="flex justify-end mt-6">
              <button
                className="bg-gray-300 px-4 py-2 rounded mr-2"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleSubmitQuotation}
              >
                Submit Quotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-black/50 fixed inset-0"
            onClick={() => setShowRejectionModal(false)}
          ></div>

          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md z-60">
            <h2 className="text-2xl font-semibold mb-4">Reject Quotation</h2>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={4}
              placeholder="Enter reason for rejection"
            ></textarea>
            <div className="flex justify-end mt-6">
              <button
                className="bg-gray-300 px-4 py-2 rounded mr-2"
                onClick={() => setShowRejectionModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => handleReject(selectedQuotationId)}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-black/50 fixed inset-0"
            onClick={() => setShowApproveModal(false)}
          ></div>

          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md z-60">
            <h2 className="text-2xl font-semibold mb-4">Approve Quotation</h2>
            <div className="mb-4">
              <label className="block text-sm mb-2">Expected Delivery Date</label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2">Payment Terms</label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter payment terms"
              />
            </div>
            <div className="flex justify-end mt-6">
              <button
                className="bg-gray-300 px-4 py-2 rounded mr-2"
                onClick={() => setShowApproveModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleApproveSubmit}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationRequestDetails;

