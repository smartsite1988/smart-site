import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./index.css"; // ✅ CSS files are fine
import App from "./App.js"; // ✅ Add `.js`
import Register from "./pages/Register.js"; // ✅ Add `.js`
import Dashboard from "./pages/Dashboard.js"; // ✅ Add `.js`
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
