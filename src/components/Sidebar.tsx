import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider.tsx";
import { FiMenu, FiX } from "react-icons/fi"; // Add close icon

const roleRoutes: Record<string, { name: string; path: string }[]> = {
  admin: [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Manage Materials", path: "materials" },
    { name: "Material Requests", path: "material-requests" },
    { name: "Users", path: "users" },
    { name: "Quotation Requests", path: "quotation-requests" },
    { name: "Quotations", path: "/quotations" },
    { name: "Purchase Orders", path: "/po" },
{name:"Departments",path:"/department"}
  ],
  department: [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Material Requests", path: "material-requests" },
  ],
  invoicing: [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Invoices", path: "/" },
    { name: "Purchase Orders", path: "/po" },
  ],
  store: [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Store Status", path: "/" },
    { name: "Purchase Orders", path: "/po" },
  ],
  purchasing: [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Purchase Orders", path: "/po" },
    { name: "Material Requests", path: "material-requests" },
    { name: "Quotation Requests", path: "quotation-requests" },
  ],
  supplier: [
    { name: "Quotations", path: "/quotations" },
    { name: "Purchase Orders", path: "/po" },
    { name: "Quotation Requests", path: "quotation-requests" },

  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // Manage the sidebar open/close state
  if (!user) return null;

  const links = roleRoutes[user.role];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Navbar with Hamburger Menu */}
      <div className="flex sm:hidden items-center justify-between p-4 bg-[#fc5226] text-white">
        <button onClick={toggleSidebar} className="p-2 text-white">
          <FiMenu className="w-6 h-6" />
        </button>
        <span className="font-semibold">Material System</span>
      </div>

      {/* Sidebar */}

      <aside
        className={`fixed inset-0 sm:w-64 bg-[#fc5226] h-full shadow-lg p-4 transition-all duration-300 transform ${isOpen ? "translate-x-0" : "-translate-x-full"
          } sm:translate-x-0 sm:fixed sm:h-full`} // Use h-full here
      >
        {/* Close Button for mobile */}
        <div className="sm:hidden flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="text-white text-2xl"
          >
            <FiX />
          </button>
        </div>

        <h2 className="text-xl font-bold mb-6 text-[#e8e4d8] sm:hidden">
          Material System
        </h2>
        <nav className="flex flex-col gap-3">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md font-medium ${isActive
                  ? "bg-[#1dbab4] text-white"
                  : "text-white hover:bg-[#f0c9b8] hover:text-[#fc5226]"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="absolute bottom-5 text-lg text-white hover:underline"
        >
          Logout
        </button>
        <p className="absolute bottom-15 text-lg text-white">
          User Role: {user.role}
        </p>
      </aside>
    </>
  );
};

export default Sidebar;
