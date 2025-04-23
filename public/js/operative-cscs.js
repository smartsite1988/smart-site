let scannedData = null;

function startCamera() {
  const video = document.getElementById("video");
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      video.style.display = "block";
    })
    .catch(err => alert("Camera not accessible."));
}

function takePhoto() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);

  video.srcObject.getTracks().forEach(track => track.stop());
  video.style.display = "none";

  canvas.toBlob(blob => {
    const file = new File([blob], "captured.jpg", { type: "image/jpeg" });
    const dt = new DataTransfer();
    dt.items.add(file);
    document.getElementById("cardInput").files = dt.files;
  }, "image/jpeg");
}

function scanCard() {
  const input = document.getElementById("cardInput");
  if (!input.files.length) {
    alert("Please upload or capture a card image.");
    return;
  }

  const formData = new FormData();
  formData.append("image", input.files[0]);

  fetch("https://smartsite-mvp-de16b70f49d2.herokuapp.com/scan", {
    method: "POST",
    body: formData
  })  
    .then(res => res.json())
    .then(data => {
      scannedData = data;
      document.getElementById("name").textContent = data.name || "-";
      document.getElementById("cardNumber").textContent = data.cardNumber || "-";
      document.getElementById("expiry").textContent = data.expiry || "-";
      document.getElementById("qualifications").textContent = data.qualifications || "-";
      document.getElementById("preview").src = data.imageUrl || "";
      document.getElementById("result").style.display = "block";
    })
    .catch(err => {
      console.error(err);
      alert("❌ Scan failed.");
    });
}

function addToTrainingMatrix() {
  if (!scannedData) return;

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${scannedData.name}</td>
    <td>${scannedData.qualifications}</td>
    <td>${scannedData.expiry}</td>
    <td><a href="${scannedData.imageUrl}" target="_blank">View</a></td>
  `;
  document.querySelector("#trainingTable tbody").appendChild(row);
  scannedData = null;
  document.getElementById("result").style.display = "none";
}
