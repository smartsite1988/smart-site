// js/hmrc.js - HMRC page logic

// Show previews of uploaded receipts
function handleReceiptUpload(event) {
    event.preventDefault();
    const files = document.getElementById("receipts").files;
    const preview = document.getElementById("preview");
    preview.innerHTML = "";
  
    Array.from(files).forEach(file => {
      if (file.type.includes("image")) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const img = document.createElement("img");
          img.src = e.target.result;
          img.classList.add("receipt-thumb");
          preview.appendChild(img);
        };
        reader.readAsDataURL(file);
      } else {
        const p = document.createElement("p");
        p.textContent = `📄 ${file.name}`;
        preview.appendChild(p);
      }
    });
  }
  
  document.getElementById("receiptForm")?.addEventListener("submit", handleReceiptUpload);
  