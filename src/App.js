import React from "react";
import { Link } from "react-router-dom";

export default function App() {
  return (
    <div className="p-8 max-w-lg mx-auto bg-white shadow-lg rounded-lg text-center">
      <h1 className="text-3xl font-bold text-blue-600">🚀 SmartSite - AI Construction Management</h1>
      <p className="text-gray-600 mt-2">Manage your projects with AI-powered automation.</p>
      <div className="mt-4">
        <Link to="/register">
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition">
            Get Started
          </button>
        </Link>
        <Link to="/dashboard" className="ml-4">
          <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-800 transition">
            Go to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
