const canvas = document.getElementById("signature-pad");
const ctx = canvas.getContext("2d");
let drawing = false;

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("touchstart", startDrawing);
canvas.addEventListener("touchend", stopDrawing);
canvas.addEventListener("touchmove", draw);

function startDrawing(e) {
  e.preventDefault();
  drawing = true;
  ctx.beginPath();
}

function stopDrawing(e) {
  e.preventDefault();
  drawing = false;
}

function draw(e) {
  e.preventDefault();
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
  const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
  ctx.lineTo(x, y);
  ctx.stroke();
}

function clearSignature() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("signature-status").textContent = "";
}

async function submitSignature() {
  const name = document.getElementById("operative-name").value.trim();
  const signatureData = canvas.toDataURL();
  const documentId = "RAMS-001"; // Change to dynamic ID if needed

  if (!name) {
    alert("Please enter your name.");
    return;
  }

  try {
    const response = await fetch("/api/save-signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, signature: signatureData, documentId })
    });

    const result = await response.json();
    if (result.success) {
      document.getElementById("signature-status").textContent = "Signature saved successfully!";
      clearSignature();
    } else {
      throw new Error(result.error);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to save signature.");
  }
}
