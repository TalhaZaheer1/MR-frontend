import { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import {
  getPurchasingPOs,
  getSupplierPOs,
  getRecievedPOs,
  changeStatus,
  rejectDelivery,
  partiallyDeliver,
  getAllPOs,
} from "../services/api";
import * as XLSX from "xlsx";

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "text-yellow-600 bg-yellow-100";
    case "recieved":
      return "text-blue-600 bg-blue-100";
    case "not recieved":
      return "text-red-600 bg-red-100";
    case "dispatched":
      return "text-green-600 bg-green-100";
    case "partially dispatched":
      return "text-indigo-600 bg-indigo-100";
    case "dispatching rejected":
      return "text-red-700 bg-red-200";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const PoManagement = () => {
  const { user } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [showPartiallyDispatchModal, setShowPartiallyDispatchModal] =
    useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPo, setSelectedPo] = useState<any>(null);
  const [itemsToPartiallyDeliver, setItemsToPartiallyDeliver] = useState<any[]>(
    [],
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "admin") {
      getAllPOs().then((data) => setPurchaseOrders(data.purchaseOrders));
    } else if (user?.role === "purchasing") {
      getPurchasingPOs().then((data) => setPurchaseOrders(data.purchaseOrders));
    } else if (user?.role === "supplier") {
      getSupplierPOs().then((data) => setPurchaseOrders(data.purchaseOrders));
    } else if (user?.role === "store" || user?.role === "invoicing") {
      getRecievedPOs().then((data) => setPurchaseOrders(data.purchaseOrders));
    }
  }, [user?.role]);

  const handleStatusChange = (poId: string, status: string) => {
    changeStatus({ purchaseOrderId: poId, status }).then(() => {
      setPurchaseOrders((prevOrders) =>
        prevOrders.map((po) => (po._id === poId ? { ...po, status } : po)),
      );
    });
  };

  const handleRejectDelivery = (poId: string, reason: string) => {
    rejectDelivery({ purchaseOrderId: poId, reason }).then(() => {
      setPurchaseOrders((prevOrders) =>
        prevOrders.map((po) =>
          po._id === poId ? { ...po, status: "delivery rejected" } : po,
        ),
      );
    });
  };

  const handlePartiallyDeliver = (poId: string, items: any[]) => {
    partiallyDeliver({ purchaseOrderId: poId, items }).then(() => {
      setPurchaseOrders((prevOrders) =>
        prevOrders.map((po) =>
          po._id === poId ? { ...po, status: "partially dispatched" } : po,
        ),
      );
    });
    setShowPartiallyDispatchModal(false);
  };

  const handleOpenPartiallyDispatchModal = (po: any) => {
    setItemsToPartiallyDeliver(
      po.items.map((item: any) => ({ ...item, quantity: 0 })),
    );
    setSelectedPo(po);
    setShowPartiallyDispatchModal(true);
  };

  const handlePartiallyDispatchSubmit = () => {
    // Validate the entered quantities to ensure they do not exceed the original quantities
    for (let i = 0; i < itemsToPartiallyDeliver.length; i++) {
      const item = itemsToPartiallyDeliver[i];
      const originalQuantity = selectedPo.items.find(
        (i: any) => i.maximoId === item.maximoId,
      ).quantity;

      if (item.quantity > originalQuantity) {
        setErrorMessage(
          `Quantity for item ${item.materialName} cannot exceed the available quantity (${originalQuantity}).`,
        );
        return;
      }
    }

    const updatedItems = itemsToPartiallyDeliver.map((item: any) => ({
      maximoId: item.maximoId,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      totalAmount: item.quantity * item.pricePerUnit,
    }));

    handlePartiallyDeliver(selectedPo._id, updatedItems);
    setErrorMessage(null); // Clear error message
  };

  const handleOpenDetailsModal = (po: any) => {
    setSelectedPo(po);
    setShowDetailsModal(true);
  };

  // Function to export data as Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(purchaseOrders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchase Orders");
    XLSX.writeFile(wb, "purchase_orders.xlsx");
  };

  return (
    <div className="container p-6 sm:pl-[18rem]">
      <h2 className="text-2xl font-semibold mb-4">Purchase Orders</h2>

      {/* Export as Excel Button */}
      <div className="w-full flex justify-end">
        <button
          onClick={exportToExcel}
          className="bg-green-600  text-white px-4 py-2 rounded mb-4 hover:bg-green-700"
        >
          Export As Excel
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="border-b">
            <tr>
              <th className="px-4 py-2 text-sm sm:text-base">Supplier</th>
              {user?.role !== "purchasing" && (
                <th className="px-4 py-2 text-sm sm:text-base">Created By</th>
              )}
              <th className="px-4 py-2 text-sm sm:text-base">Created At</th>
              <th className="px-4 py-2 text-sm sm:text-base">Delivery Date</th>
              <th className="px-4 py-2 text-sm sm:text-base">Receive Date</th>
              <th className="px-4 py-2 text-sm sm:text-base">Status</th>
              <th className="px-4 py-2 text-sm sm:text-base">Total Amount</th>
              {user?.role === "admin" ||
                user?.role === "purchasing" ||
                user?.role === "supplier" ? (
                <th className="px-4 py-2 text-sm sm:text-base">Actions</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.length > 0 ? (
              purchaseOrders.map((po: any) => (
                <tr key={po._id} onClick={() => handleOpenDetailsModal(po)}>
                  <td className="px-4 py-2 text-sm sm:text-base">
                    {po.supplierUsername}
                  </td>
                  {user?.role !== "purchasing" && (
                    <td className="px-4 py-2 text-sm sm:text-base">
                      {po.createdByUsername}
                    </td>
                  )}
                  <td className="px-4 py-2 text-sm sm:text-base">
                    {new Date(po.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm sm:text-base">
                    {po.deliveryDate
                      ? new Date(po.deliveryDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2 text-sm sm:text-base">
                    {po.recievedDate
                      ? new Date(po.recievedDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(po.status)}`}
                    >
                      {po.status}
                    </span>
                  </td>

                  <td className="px-4 py-2 text-sm sm:text-base">
                    {po.totalAmount}
                  </td>
                  {user?.role === "admin" || user?.role === "purchasing" ? (
                    <td className="px-4 py-2 flex gap-5 justify-center text-sm sm:text-base">
                      {(po.status === "dispatched" ||
                        po.status === "partially dispatched") && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(po._id, "recieved");
                              }}
                              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Received
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(po._id, "not recieved");
                              }}
                              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Not Received
                            </button>
                          </>
                        )}
                    </td>
                  ) : null}
                  {user?.role === "supplier" && po.status === "pending" && (
                    <td className="px-4 py-2 flex gap-5 justify-center text-sm sm:text-base">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(po._id, "dispatched");
                        }}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Completely Dispatched
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPartiallyDispatchModal(po);
                        }}
                        className="px-4 py-2 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                      >
                        Partially Dispatched
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectDelivery(po._id, "Reason");
                        }}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject Dispatching
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-2 text-sm sm:text-base text-center"
                >
                  No purchase orders available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Partially Dispatch Modal */}
      {showPartiallyDispatchModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-black/50 fixed inset-0"
            onClick={() => setShowPartiallyDispatchModal(false)}
          ></div>

          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md z-60">
            <h2 className="text-2xl font-semibold mb-4">Partially Dispatch</h2>
            {errorMessage && (
              <div className="text-red-500 mb-4">{errorMessage}</div>
            )}
            <div>
              {selectedPo?.items.map((item: any, index: number) => (
                <div key={item.maximoId} className="mb-4">
                  <label className="block text-sm mb-2">
                    {item.materialName} ({item.maximoId}) - {item.quantity} pcs
                  </label>
                  <input
                    type="number"
                    value={itemsToPartiallyDeliver[index]?.quantity || 0}
                    onChange={(e) =>
                      setItemsToPartiallyDeliver((prev) => {
                        const updatedItems = [...prev];
                        updatedItems[index].quantity = e.target.value;
                        return updatedItems;
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter quantity"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Price per unit: {item.pricePerUnit}
                  </p>
                </div>
              ))}
              <div className="flex justify-end mt-6">
                <button
                  className="bg-gray-300 px-4 py-2 rounded mr-2"
                  onClick={() => setShowPartiallyDispatchModal(false)}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePartiallyDispatchSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Order Details Modal for Admin/Purchasing */}
      {showDetailsModal && selectedPo && (
        <div className="fixed inset-8 max-h-[95vh] overflow-y-scroll flex items-center justify-center z-50">
          <div
            className="bg-black/50 fixed inset-0"
            onClick={() => setShowDetailsModal(false)}
          ></div>

          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md z-60">
            <h2 className="text-2xl font-semibold mb-4">
              Purchase Order Details
            </h2>
            <div>
              <p>
                <strong>Supplier:</strong> {selectedPo.supplierUsername}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(selectedPo.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong> {selectedPo.status}
              </p>
              <p>
                <strong>Payment Terms:</strong> {selectedPo.paymentTerms}
              </p>
              <p>
                <strong>Delivery Date:</strong>{" "}
                {new Date(selectedPo.deliveryDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Received Date:</strong>{" "}
                {new Date(selectedPo.recievedDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Total Amount:</strong> {selectedPo.totalAmount}
              </p>
              <h3 className="mt-4 text-lg font-semibold">Requested Items</h3>
              {selectedPo.items.map((item: any) => (
                <div key={item.maximoId} className="mb-2">
                  <p>
                    {item.materialName} ({item.maximoId}) - {item.quantity} pcs
                  </p>
                  <p>Price per Unit: {item.pricePerUnit}</p>
                  <p>Total Amount: {item.totalAmount}</p>
                </div>
              ))}
              <h3 className="mt-4 text-lg font-semibold">
                Partially Dispatched Items
              </h3>
              {selectedPo.partiallyDeliveredItems?.length > 0 ? (
                selectedPo.partiallyDeliveredItems.map((item: any) => (
                  <div key={item.maximoId} className="mb-2">
                    <p>
                      {item.materialName} ({item.maximoId}) - {item.quantity}{" "}
                      pcs
                    </p>
                    <p>Price per Unit: {item.pricePerUnit}</p>
                    <p>Total Amount: {item.totalAmount}</p>
                  </div>
                ))
              ) : (
                <p>No partially delivered items</p>
              )}
              <div className="flex justify-end mt-6">
                <button
                  className="bg-gray-300 px-4 py-2 rounded mr-2"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoManagement;
