// operative.js - Combined logic for all operative portal features

document.addEventListener("DOMContentLoaded", () => {
    highlightCurrentNav();
    fetchWeather();
    setupProfile();
    setupScan();
    setupHMRC();
    setupSettings();
  });
  
  // Highlight nav links
  function highlightCurrentNav() {
    const currentPage = location.pathname.split("/").pop();
    document.querySelectorAll(".nav-link").forEach(link => {
      if (link.href.includes(currentPage)) {
        link.classList.add("active");
      }
    });
  }
  
  // Weather widget
  function fetchWeather() {
    const weatherInfo = document.getElementById("weather-info");
    if (!weatherInfo) return;
    fetch("https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.12&current_weather=true")
      .then(res => res.json())
      .then(data => {
        weatherInfo.innerText = `${data.current_weather.temperature}°C, ${data.current_weather.weathercode === 0 ? 'Clear' : 'Cloudy'}`;
      })
      .catch(() => weatherInfo.innerText = "Unavailable");
  }
  
  // Profile logic
  function setupProfile() {
    const form = document.getElementById("profile-form");
    const selfieInput = document.getElementById("selfie");
    const preview = document.getElementById("selfie-preview");
    if (!form) return;
  
    selfieInput?.addEventListener("change", e => {
      const file = e.target.files[0];
      if (file && preview) preview.src = URL.createObjectURL(file);
    });
  
    form.addEventListener("submit", e => {
      e.preventDefault();
      alert("✅ Profile saved successfully!");
    });
  }
  
  // CSCS Scan
  function setupScan() {
    const scanBtn = document.getElementById("scan-btn");
    const result = document.getElementById("scan-result");
    scanBtn?.addEventListener("click", () => {
      result.innerHTML = "Scanning...";
      setTimeout(() => {
        result.innerHTML = `Name: John Smith<br>Card #: 123456789<br>Expiry: 01/2026`;
      }, 2000);
    });
  }
  
  // HMRC
  function setupHMRC() {
    const uploadForm = document.getElementById("receipt-upload");
    const list = document.getElementById("receipt-list");
    if (!uploadForm) return;
  
    uploadForm.addEventListener("submit", e => {
      e.preventDefault();
      const files = document.getElementById("receipts").files;
      if (!files.length) return;
      [...files].forEach(file => {
        const li = document.createElement("li");
        li.textContent = `📎 ${file.name} (uploaded)`;
        list.appendChild(li);
      });
    });
  }
  
  // Settings
  function setupSettings() {
    const lang = document.getElementById("language-select");
    const theme = document.getElementById("theme-select");
    if (!lang || !theme) return;
  
    lang.value = localStorage.getItem("language") || "en";
    theme.value = localStorage.getItem("theme") || "light";
  
    lang.addEventListener("change", e => {
      localStorage.setItem("language", e.target.value);
      alert("🌐 Language updated");
    });
  
    theme.addEventListener("change", e => {
      document.body.className = e.target.value;
      localStorage.setItem("theme", e.target.value);
    });
  }
  