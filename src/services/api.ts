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

export const getAllDepartments = () => request("/department");
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
export const repairRequest = (payload: any) =>
  request("/request/repair", "POST", payload);

export const createMaterial = (payload: any) =>
  request("/material", "POST", payload);
export const bulkCreateMaterials = (payload: any) =>
  request("/material/bulk", "POST", payload);
export const getAllMaterials = () => request("/material");
export const updateMaterial = (id: string, payload: any) =>
  request(`/material/update/${id}`, "POST", payload);

export const getAllSuppliers = () => request("/user/suppliers");
export const createQuotation = (payload: any) =>
  request("/rfq", "POST", payload);
export const bulkCreateQuotation = (payload: any) =>
  request("/rfq/bulk", "POST", payload);
export const getUserQuotations = () => request("/rfq/my");
export const getDashboardStats = () => request("/user/dashboard");


export const adminBackup = () => request("/user/backup");
