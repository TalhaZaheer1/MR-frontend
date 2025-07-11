import { useEffect, useState } from "react";
import { bulkAddRequests, getAllMaterials } from "../services/api";
import { Dialog } from "@headlessui/react";
import { useAuth } from "../providers/AuthProvider";

interface Material {
  _id: string;
  maximoId: string;
  description: string;
  unit:string,
  itemType:string
  quantity:number;
  workOrders:string 
  priority:string
}



const CreateMaterialRequest = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<any>({
    items: [] as Material[], // List of selected items
    purpose: "",
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); // For searching materials
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]); // Materials based on search query
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch materials with pagination
  const fetchMaterials = async (page: number) => {
    const data = await getAllMaterials(page);
    setMaterials(data.materials);
    setTotalPages(data.pagination.totalPages);
  };

  useEffect(() => {
    fetchMaterials(currentPage);
  }, [currentPage]);

  // Handle searching materials
  useEffect(() => {
    if (searchQuery === "") {
      setFilteredMaterials(materials);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      setFilteredMaterials(
        materials.filter(
          (material) =>
            material.maximoId.toLowerCase().includes(lowercasedQuery) ||
            material.description.toLowerCase().includes(lowercasedQuery),
        ),
      );
    }
  }, [searchQuery, materials]);

  const handleSubmit = async () => {
    if (!user) return;
    const payload = {
      ...form,
      requesterId: user._id,
      requestDate: new Date().toLocaleString(),
    };
    await bulkAddRequests({ request: payload });
    setForm({ items: [], purpose: "" }); // Clear form data after submission
    setShowFormModal(false);
  };

  const canCreateRequest =
    user?.role === "department" ;

  // Handle adding an item to the request
  const handleAddItem = (item: Material) => {
    const newItem = {
      maximoId: item.maximoId,
      unit: item.unit,
      itemType: item.itemType,
      description:item.description,
      priority: "low", // Default priority
      workOrders: "", // Default workOrders
      quantity: 0,
    };
    setForm((prevForm:any) => ({
      ...prevForm,
      items: [...prevForm.items, newItem],
    }));
  };

  // Handle input changes for each selected item
  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const updatedItems = [...form.items];
    updatedItems[index][name] = value;
    setForm({ ...form, items: updatedItems });
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
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Maximo ID or Description"
          className="w-full p-2 border rounded"
        />
      </div>

      {/* List of materials to select */}
      <div className="mb-4">
        <h3 className="font-semibold">Available Materials</h3>
        <ul>
          {filteredMaterials.map((material) => (
            <li
              key={material._id}
              className="p-2 border-b flex justify-between items-center"
            >
              <span>
                {material.maximoId} - {material.description}
              </span>
              <button
                onClick={() => handleAddItem(material)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mb-4">
        <button
          className="px-4 py-2 bg-gray-600 text-white rounded"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-4 py-2 bg-gray-600 text-white rounded"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>

      {/* Selected items */}
      <div className="mb-4">
        <h3 className="font-semibold">Selected Items</h3>
        <div>
          {form.items.map((item:Material, index:number) => (
            <div
              key={index}
              className="flex items-center justify-between border-b py-2"
            >
              <span>
                {item.maximoId} - {item.description}
              </span>
              <div className="flex gap-3">
                <select
                  name="priority"
                  value={item.priority}
                  onChange={(e) => handleItemChange(index, e)}
                  className="p-2 border rounded"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input
                  type="number"
                  name="quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, e)}
                  placeholder="Quantity"
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="workOrders"
                  value={item.workOrders}
                  onChange={(e) => handleItemChange(index, e)}
                  placeholder="Work Order"
                  className="p-2 border rounded"
                />
              </div>
            </div>
          ))}
        </div>
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
              Create Request
            </Dialog.Title>

            <div className="space-y-4">
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
                Submit
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default CreateMaterialRequest;
