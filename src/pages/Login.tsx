
import React, { useState } from "react";
import { useAuth } from "../providers/AuthProvider.tsx";

const LoginPage = () => {
  const { login } = useAuth() ;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    login({  username, password });
    
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Left Panel */}
      <div className="w-1/2 bg-[#1561ad] hidden md:block"></div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 bg-[#1c77ac] flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-[#1561ad]">
            Login
          </h2>

          <label className="block text-[#1dbab4] font-medium mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1dbab4]"
          />

          <label className="block text-[#1dbab4] font-medium mb-1">Password</label>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1dbab4] pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#fc5226] font-semibold text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1dbab4] hover:bg-[#17a49f] text-white py-2 rounded-md font-semibold transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
