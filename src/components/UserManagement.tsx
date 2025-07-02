import { useEffect, useState } from "react";
import {
  getAllUsers,
  getAllDepartments,
  registerUser,
  updateUser,
  bulkRegister,
} from "../services/api";
import { Dialog } from "@headlessui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import ProtectedAdmin from "./auth/ProtectedAdmin";
import { Table } from "@mantine/core";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

type Department = {
  _id: string;
  name: string;
};

type User = {
  _id: string;
  username: string;
  email: string;
  role: string;
  department?: Department;
};

const ROLES = [
  "admin",
  "department",
  "invoicing",
  "store",
  "purchasing",
  "supplier",
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<any>({});

  const fetchData = async () => {
    const { users } = await getAllUsers();
    const { departments } = await getAllDepartments();
    setUsers(users);
    setDepartments(departments);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setForm({ ...user, password: "" });
    setIsCreating(false);
    setShowFormModal(true);
  };

  const openCreate = () => {
    setForm({
      username: "",
      email: "",
      password: "",
      role: "department",
      department: "",
    });
    setIsCreating(true);
    setShowFormModal(true);
  };

  const handleSubmit = async () => {
    if (isCreating) {
      await registerUser(form);
    } else {
      await updateUser(form._id, form); // ✅ Call update API
    }
    setShowFormModal(false);
    fetchData();
  };

  const handleExport = () => {
    const exportData = users.map(
      ({ _id, username, email, role, department }) => ({
        _id,
        username,
        email,
        role,
        department: department?.name || "",
      }),
    );

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "users.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const parsed = XLSX.utils.sheet_to_json(sheet);

    // Fetch departments to map names to ObjectIds
    const { departments } = await getAllDepartments();

    // Map department names to ObjectIds
    const departmentMap = departments.reduce((acc: any, department: any) => {
      acc[department.name.toLowerCase()] = department._id;
      return acc;
    }, {});

    // Validate the data
    const valid = parsed.every(
      (row: any) =>
        row.username &&
        row.email &&
        row.role &&
        row.department &&
        typeof row.role === "string" &&
        departmentMap[row.department.toLowerCase()], // Ensure department exists in the map
    );

    if (!valid) {
      toast.error("Invalid format. Please match the template.");
      return;
    }

    // Map department name to ObjectId
    const usersWithDepartmentIds = parsed.map((row: any) => ({
      ...row,
      department: departmentMap[row.department], // Replace department name with ObjectId
    }));

    try {
      // Import users with department ObjectId
      await bulkRegister(usersWithDepartmentIds); // Assuming `bulkRegister` can handle an array of users
      fetchData();
      toast.success("Users imported successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <ProtectedAdmin>
      <div className="p-6 w-full sm:pl-[18rem]">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">User Management</h2>

          <div className="flex flex-wrap gap-4">
            <button
              className="px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded hover:bg-blue-700 w-full sm:w-auto"
              onClick={openCreate}
            >
              + Create User
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
            <thead className="text-xs sm:text-sm">
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs sm:text-sm">
              {users.map((u) => (
                <tr
                  key={u._id}
                  onClick={() => openEdit(u)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td className="capitalize">{u.role}</td>
                  <td>{u.department?.name || "—"}</td>
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
              <Dialog.Title className="text-lg sm:text-xl font-medium mb-4">
                {isCreating ? "Create User" : "Update User"}
              </Dialog.Title>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full border rounded px-3 py-2"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full border rounded px-3 py-2"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full border rounded px-3 py-2 pr-10"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                    />
                    <span
                      className="absolute top-2 right-3 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-gray-500" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-gray-500" />
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={form.department?._id || form.department || ""}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
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
