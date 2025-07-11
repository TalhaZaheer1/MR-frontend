import React, { useEffect, useState } from "react";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
} from "../services/api";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "" });
  const [updateData, setUpdateData] = useState({ name: "", code: "" });
  const [errors, setErrors] = useState({ name: "", code: "" });

  useEffect(() => {
    getAllDepartments().then((data) => setDepartments(data.departments));
  }, []);

  // Form Validation
  const validateForm = () => {
    const errors = { name: "", code: "" };
    if (!formData.name) {
      errors.name = "Department name is required";
    }
    if (!formData.code) {
      errors.code = "Department code is required";
    }
    setErrors(errors);
    return !errors.name && !errors.code;
  };

  // Handle form submission for creating department
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await createDepartment(formData);
        setShowCreateModal(false);
        setFormData({ name: "", code: "" }); // Clear form data after submission
        setDepartments([...departments, formData]); // Update the department list
      } catch (error) {
        console.error("Error creating department", error);
      }
    }
  };

  // Handle form submission for updating department
  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDepartment(updateData);
      setShowUpdateModal(false);
      getAllDepartments().then((data) => setDepartments(data.departments));
    } catch (error) {
      console.error("Error updating department", error);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle update input change
  const handleUpdateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateData({ ...updateData, [name]: value });
  };

  // Open update department modal with pre-filled data
  const handleUpdateDepartmentClick = (department: any) => {
    setUpdateData({ ...department });
    setShowUpdateModal(true);
  };

  return (
    <div className="container p-6 sm:pl-[18rem]">
      <h2 className="text-2xl font-semibold mb-4">Department Management</h2>

      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Department
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="border-b">
            <tr>
              <th className="px-4 py-2 text-sm sm:text-base">
                Department Name
              </th>
              <th className="px-4 py-2 text-sm sm:text-base">
                Department Code
              </th>
            </tr>
          </thead>
          <tbody>
            {departments.length > 0 ? (
              departments.map((department: any, index) => (
                <tr
                  key={index}
                  onClick={() => handleUpdateDepartmentClick(department)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <td className="px-4 py-2 text-sm sm:text-base">
                    {department.name}
                  </td>
                  <td className="px-4 py-2 text-sm sm:text-base">
                    {department.code}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-2 text-sm sm:text-base text-center"
                >
                  No departments available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-black/50 fixed inset-0"
            onClick={() => setShowCreateModal(false)}
          ></div>

          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md z-60">
            <h2 className="text-2xl font-semibold mb-4">Create Department</h2>

            <form onSubmit={handleCreateDepartment}>
              <div className="mb-4">
                <label className="block text-sm mb-2">Department Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter department name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-2">Department Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter department code"
                />
                {errors.code && (
                  <p className="text-red-500 text-xs">{errors.code}</p>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded mr-2"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Department Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-black/50 fixed inset-0"
            onClick={() => setShowUpdateModal(false)}
          ></div>

          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md z-60">
            <h2 className="text-2xl font-semibold mb-4">Update Department</h2>

            <form onSubmit={handleUpdateDepartment}>
              <div className="mb-4">
                <label className="block text-sm mb-2">Department Name</label>
                <input
                  type="text"
                  name="name"
                  value={updateData.name}
                  onChange={handleUpdateInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter department name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-2">Department Code</label>
                <input
                  type="text"
                  name="code"
                  value={updateData.code}
                  onChange={handleUpdateInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter department code"
                />
                {errors.code && (
                  <p className="text-red-500 text-xs">{errors.code}</p>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded mr-2"
                  onClick={() => setShowUpdateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
