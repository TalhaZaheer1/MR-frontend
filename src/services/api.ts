const BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log({ BASE_URL });

const request = async (endpoint: string, method = "GET", data = null) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Something went wrong");
    }

    return await res.json();
  } catch (err) {
    throw err;
  }
};

export const registerUser = (payload: any) =>
  request("/user/register", "POST", payload);
export const bulkRegister = (payload: any) =>
  request("/user/register-bulk", "POST", payload);
export const getAllUsers = () => request("/user/all");
export const getAllRequests = () => request("/request");
export const getUserRequests = () => request("/request/mine");
export const updateUser = (id: string, data: any) =>
  request(`/user/update/${id}`, "POST", data);
export const approveRequest = (payload: any) =>
  request("/request/approve-request", "POST", payload);
export const rejectRequest = (payload: any) =>
  request("/request/reject-request", "POST", payload);
export const recieveRequest = (payload: any) =>
  request("/request/recieve-request", "POST", payload);
export const supplyRequest = (payload: any) =>
  request("/request/supply-request", "POST", payload);
export const bulkAddRequests = (payload: any) =>
  request("/request/bulk-add", "POST", payload);
export const bulkAddRequestsFromFile = (payload: any) =>
  request("/request/bulk-from-file", "POST", payload);
export const repairRequest = (payload: any) =>
  request("/request/repair", "POST", payload);

export const createMaterial = (payload: any) =>
  request("/material", "POST", payload);
export const bulkCreateMaterials = (payload: any) =>
  request("/material/bulk", "POST", payload);
export const getAllMaterials = (page: number = 1) =>
  request(`/material?page${page}&pageSize=15`);
export const updateMaterial = (id: string, payload: any) =>
  request(`/material/update/${id}`, "POST", payload);

export const getAllSuppliers = () => request("/user/suppliers");
export const bulkCreateQuotation = (payload: any) =>
  request("/rfq/bulk", "POST", payload);
export const getUserQuotations = () => request("/rfq/my");
export const getDashboardStats = () => request("/user/dashboard");

export const createQuotationRequest = (payload: any) =>
  request("/quotation-request", "POST", payload);
export const getPurchasingQuotationRequests = () =>
  request("/quotation-request/purchasing");
export const getSupplierQuotationRequests = () =>
  request("/quotation-request/supplier");
export const getQuotationRequestById = (id: string) =>
  request(`/quotation-request/details/${id}`);
export const getAllQuotationRequests = () => request("/quotation-request/all");
export const closeQuotationRequests = (id: string) =>
  request(`/quotation-request/close/${id}`);
export const closeQuotationRequestDetails = (id: string) =>
  request(`/quotation-request/${id}`);

//quotations
export const getQuotations = (requestId: string) =>
  request(`/quotation/purchasing/${requestId}`);
export const createQuotation = (payload: any) =>
  request(`/quotation`, "POST", payload);
export const approveQuotaion = (payload: any) =>
  request("/quotation/approve", "POST", payload);
export const rejectQuotaion = (payload: any) =>
  request("/quotation/reject", "POST", payload);
export const getSupplierQuotations = () => request("/quotation/supplier");
export const getAllQuotations = () => request("/quotation");

// purchase orders
export const getPurchasingPOs = () => request("/po/purchasing");
export const getSupplierPOs = () => request("/po/supplier");
export const rejectDelivery = (payload: any) =>
  request("/po/reject-delivery", "POST", payload);
export const partiallyDeliver = (payload: any) =>
  request("/po/partially-deliver", "POST", payload);
export const changeStatus = (payload: any) =>
  request("/po/change-status", "POST", payload);
export const getRecievedPOs = () => request("/po/recieved");
export const getAllPOs = () => request("/po");

//department
export const getAllDepartments = () => request("/department");
export const createDepartment = (payload: any) =>
  request("/department", "POST", payload);
export const updateDepartment = (payload: any) =>
  request(`/department/update/${payload._id}`, "POST", payload);

export const adminBackup = () => request("/user/backup");
export const getUserNotifications = () => request("/notification");
