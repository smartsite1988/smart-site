import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="p-8 max-w-lg mx-auto bg-white shadow-lg rounded-lg text-center">
      <h1 className="text-2xl font-bold text-blue-600">📊 SmartSite Dashboard</h1>
      
      <div className="mt-4">
        <p className="text-gray-700">Ongoing Projects: <strong>5 Active</strong></p>
        <p className="text-gray-700">Compliance Alerts: <strong>2 High-Risk Incidents</strong></p>
        <p className="text-gray-700">Financial Overview: <strong>£200,000 Invoiced</strong></p>
      </div>

      <button onClick={() => window.location.href = "/"} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700">
        Logout
      </button>
    </div>
  );
}
