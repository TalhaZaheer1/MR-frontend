import { Outlet } from "react-router";
import Sidebar from "./Sidebar";


export default function Layout() {
  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar />
      <div className="w-full p-6">
        <Outlet />
      </div>
    </div>
  );
}

