import React from "react";
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="p-8 max-w-md mx-auto bg-white shadow-lg rounded-lg text-center">
      <h1 className="text-2xl font-bold text-blue-600">Register for SmartSite</h1>
      <form action="/register" method="POST" className="mt-4">
        <label className="block text-gray-700">Username:</label>
        <input type="text" name="username" required className="border w-full p-2 mt-1" />
        
        <label className="block text-gray-700 mt-2">Email:</label>
        <input type="email" name="email" required className="border w-full p-2 mt-1" />
        
        <label className="block text-gray-700 mt-2">Password:</label>
        <input type="password" name="password" required className="border w-full p-2 mt-1" />
        
        <button type="submit" className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700">
          Register
        </button>
      </form>

      <p className="mt-4 text-gray-600">
        Already registered? <Link to="/" className="text-blue-500">Go to Home</Link>
      </p>
    </div>
  );
}
