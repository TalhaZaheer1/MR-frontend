import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  getAllRequests,
  getUserRequests,
  approveRequest,
  rejectRequest,
  recieveRequest,
  supplyRequest,
  bulkAddRequests,
  getAllMaterials,
  repairRequest,
} from "../services/api";
import { Dialog } from "@headlessui/react";
import { Table } from "@mantine/core";
import { useAuth } from "../providers/AuthProvider";
import toast from "react-hot-toast";

interface Material {
  _id: string;
  maximoId: string;
  description: string;
}

interface MaterialRequest {
  _id: string;
  materialMaximoId: string;
  quantity: number;
  status: string;
  purpose: string;
  requesterId?: any;
  requestDate?: string;
  approvalDate?: string;
  reason?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending approval":
      return "text-yellow-600 bg-yellow-100";
    case "approved":
      return "text-blue-600 bg-blue-100";
    case "rejected":
      return "text-red-600 bg-red-100";
    case "supplied":
      return "text-green-600 bg-green-100";
    case "partially supplied":
      return "text-indigo-600 bg-indigo-100";
    case "recieved - confirmed quality":
      return "text-green-700 bg-green-200";
    case "recieved - rejected quality":
      return "text-red-700 bg-red-200";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const MaterialRequestManagement = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [form, setForm] = useState({
    materialMaximoId: "",
    quantity: 0,
    purpose: "",
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<MaterialRequest | null>(
    null,
  );
  const [materials, setMaterials] = useState<Material[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<MaterialRequest | null>(null);

  const fetchRequests = async () => {
    if (!user) return;
    let data;
    if (user.role === "department") {
      data = await getUserRequests();
    } else if (user.role === "admin" || user.role === "purchasing") {
      data = await getAllRequests();
    }
    if (data) setRequests(data.requests);
  };

  useEffect(() => {
    fetchRequests();
    getAllMaterials().then((res) => setMaterials(res.materials));
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    const payload = {
      ...form,
      requesterId: user._id,
      requestDate: new Date().toLocaleString(),
    };
    if (editingRequest) {
      await repairRequest({ ...payload, requestId: editingRequest._id });
    } else {
      await bulkAddRequests({ requests: [payload] });
    }
    setForm({ materialMaximoId: "", quantity: 0, purpose: "" });
    setEditingRequest(null);
    setShowFormModal(false);
    fetchRequests();
  };

  const handleAction = async (action: string, request: MaterialRequest) => {
    try {
      if (action === "approve")
        await approveRequest({ requestId: request._id });
      if (action === "reject") setConfirmRejectId(request._id);
      if (action === "supply") await supplyRequest({ requestId: request._id });
      if (action === "recieve")
        await recieveRequest({ requestId: request._id, quality: "confirmed" });
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const submitRejection = async () => {
    if (!confirmRejectId || !rejectionReason) return;
    await rejectRequest({
      requestId: confirmRejectId,
      reason: rejectionReason,
    });
    setConfirmRejectId(null);
    setRejectionReason("");
    fetchRequests();
  };

  const canCreateRequest =
    user?.role === "department" || user?.role === "admin";

  const handleExport = () => {
    const exportData = requests.map(
      ({
        _id,
        materialMaximoId,
        quantity,
        status,
        purpose,
        requesterId,
        requestDate,
        approvalDate,
        reason,
      }) => ({
        _id,
        materialMaximoId,
        quantity,
        status,
        purpose,
        requester: requesterId?.username || requesterId, // show readable name if available
        requestDate,
        approvalDate,
        reason,
      }),
    );
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Requests");
    XLSX.writeFile(workbook, "material_requests.xlsx");
  };

  // Import Handler

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?._id) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const parsed = XLSX.utils.sheet_to_json(sheet);

    // Validate
    const valid = parsed.every(
      (row: any) =>
        row.materialMaximoId && typeof row.quantity === "number" && row.purpose,
    );

    if (!valid) {
      toast.error("Invalid format. Please match the template.");
      return;
    }

    // Sanitize and add additional fields
    const sanitized = parsed.map((row: any) => ({
      ...row,
      requesterId: user._id,
      requestDate: new Date().toISOString(),
    }));

    try {
      await bulkAddRequests({ requests: sanitized });
      fetchRequests();
      toast.success("Requests imported successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-6 w-full sm:pl-[18rem]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Material Requests</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          {canCreateRequest && (
            <div className="flex gap-3">
              <button
                className="px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded hover:bg-blue-700 sm:w-auto"
                onClick={() => setShowFormModal(true)}
              >
                + Create Request
              </button>

              <input
                type="file"
                accept=".xlsx"
                className="hidden"
                id="importExcel"
                onChange={handleImport}
              />
              <label
                htmlFor="importExcel"
                className="px-4 py-2 text-sm sm:text-base bg-purple-600 text-white rounded hover:bg-purple-700 sm:w-auto cursor-pointer"
              >
                Import from Excel
              </label>
            </div>
          )}
          <button
            className="px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded hover:bg-green-700 sm:w-auto"
            onClick={handleExport}
          >
            Export to Excel
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table striped highlightOnHover className="rounded w-full shadow">
          <thead>
            <tr>
              <th>Serial</th>
              <th>Maximo ID</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Purpose</th>
              <th>Made By</th>
              <th>Request Date</th>
              <th>Approval Date</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y  divide-gray-200">
            {requests.map((req) => (
              <tr
                key={req._id}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => setSelectedRequest(req)}
              >
                <td>{req._id}</td>
                <td>{req.materialMaximoId}</td>
                <td>{req.quantity}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(req.status)}`}
                  >
                    {req.status}
                  </span>
                </td>
                <td>{req.purpose}</td>
                <td>{req.requesterId?.username || "-"}</td>
                <td>
                  {req.requestDate
                    ? new Date(req.requestDate).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  {req.approvalDate
                    ? new Date(req.approvalDate).toLocaleDateString()
                    : "-"}
                </td>
                <td>{req.status === "rejected" ? req.reason : "-"}</td>
                <td className="flex flex-wrap gap-2">
                  {user?.role === "department" && req.status === "rejected" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingRequest(req);
                        setForm(req);
                        setShowFormModal(true);
                      }}
                      className="px-3 py-1 text-sm sm:text-base bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Repair
                    </button>
                  )}
                  {user?.role === "department" &&
                    (req.status === "supplied" ||
                      req.status === "partially supplied") && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction("recieve", req);
                          }}
                          className="px-3 py-1 text-sm sm:text-base bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            recieveRequest({
                              requestId: req._id,
                              quality: "rejected",
                            });
                          }}
                          className="px-3 py-1 text-sm sm:text-base bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Reject Quality
                        </button>
                      </>
                    )}
                  {(user?.role === "admin" || user?.role === "purchasing") &&
                    req.status === "pending approval" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction("approve", req);
                          }}
                          className="px-3 py-1 text-sm sm:text-base bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction("reject", req);
                          }}
                          className="px-3 py-1 text-sm sm:text-base bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  {(user?.role === "admin" || user?.role === "purchasing") &&
                    req.status === "approved" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction("supply", req);
                        }}
                        className="px-3 py-1 text-sm sm:text-base bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Supply
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Dialog
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/20" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
            <Dialog.Title className="text-xl font-semibold mb-4">
              Request Details
            </Dialog.Title>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Serial:</strong> {selectedRequest?._id}
              </p>
              <p>
                <strong>Maximo ID:</strong> {selectedRequest?.materialMaximoId}
              </p>
              <p>
                <strong>Quantity:</strong> {selectedRequest?.quantity}
              </p>
              <p>
                <strong>Status:</strong> {selectedRequest?.status}
              </p>
              <p>
                <strong>Purpose:</strong> {selectedRequest?.purpose}
              </p>
              <p>
                <strong>Made By:</strong>{" "}
                {selectedRequest?.requesterId?.username || "-"}
              </p>
              <p>
                <strong>Request Date:</strong>{" "}
                {selectedRequest?.requestDate
                  ? new Date(selectedRequest.requestDate).toLocaleString()
                  : "-"}
              </p>
              <p>
                <strong>Approval Date:</strong>{" "}
                {selectedRequest?.approvalDate
                  ? new Date(selectedRequest.approvalDate).toLocaleString()
                  : "-"}
              </p>
              {selectedRequest?.reason && (
                <p>
                  <strong>Reason:</strong> {selectedRequest.reason}
                </p>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      <Dialog
        open={!!confirmRejectId}
        onClose={() => setConfirmRejectId(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/20" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="w-full max-w-sm p-6 bg-white rounded shadow">
            <Dialog.Title className="text-lg font-medium mb-2">
              Enter Rejection Reason
            </Dialog.Title>
            <textarea
              className="w-full border rounded px-3 py-2 mb-4"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection"
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setConfirmRejectId(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={submitRejection}
              >
                Submit
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog
        open={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingRequest(null);
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/20" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="w-full max-w-md p-6 bg-white rounded shadow">
            <Dialog.Title className="text-lg font-medium mb-4">
              {editingRequest ? "Repair Request" : "Create Request"}
            </Dialog.Title>

            <div className="space-y-4">
              <select
                className="w-full border rounded px-3 py-2"
                value={form.materialMaximoId}
                onChange={(e) =>
                  setForm({ ...form, materialMaximoId: e.target.value })
                }
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
                placeholder="Quantity"
                className="w-full border rounded px-3 py-2"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: parseInt(e.target.value) || 0 })
                }
              />
              <textarea
                placeholder="Purpose"
                className="w-full border rounded px-3 py-2"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
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
                {editingRequest ? "Resubmit" : "Submit"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default MaterialRequestManagement;
