<<<<<<< HEAD
// File: public/js/card-scanner.js

let isFront = true;

function openCamera() {
  const video = document.getElementById("cameraPreview");
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    }).catch(console.error);
}

function scanCard() {
  takePhoto();
}

function takePhoto() {
  const video = document.getElementById("cameraPreview");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  canvas.toBlob(blob => {
    uploadImage(blob, isFront);
  }, "image/jpeg");
}

function uploadCard(front) {
  isFront = front;
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = e => {
    const file = e.target.files[0];
    if (file) uploadImage(file, front);
  };
  input.click();
}

function uploadImage(file, front) {
  const formData = new FormData();
  formData.append("image", file);

  fetch("/scan-card", {
    method: "POST",
    body: formData,
  })
    .then(res => res.json())
    .then(data => {
      if (front) {
        document.getElementById("uploadedFrontImage").src = URL.createObjectURL(file);
      } else {
        document.getElementById("uploadedBackImage").src = URL.createObjectURL(file);
      }

      const lines = data.extracted_text.split('\n');
      const name = lines.find(l => l.toLowerCase().includes("name")) || "";
      const number = lines.find(l => /\d{10}/.test(l)) || "";
      const expiry = lines.find(l => /\d{2}\/\d{4}/.test(l)) || "";
      const qual = lines.find(l => l.toLowerCase().includes("qualification")) || "";

      document.getElementById("cardName").textContent = name;
      document.getElementById("cardNumber").textContent = number;
      document.getElementById("expiryDate").textContent = expiry;
      document.getElementById("qualifications").textContent = qual;

      const row = document.createElement("tr");
      row.innerHTML = `<td>${name}</td><td>${qual}</td><td>${expiry}</td>`;
      document.getElementById("trainingMatrix").appendChild(row);
    })
    .catch(err => {
      alert("Scan failed: " + err.message);
    });
}
=======
document.getElementById('file-input').addEventListener('change', (event) => {
  const file = event.target.files[0];
  const img = document.getElementById('uploaded-image');
  img.src = URL.createObjectURL(file);
});

async function preprocessImage(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const scaleFactor = 1000 / img.width;

  canvas.width = img.width * scaleFactor;
  canvas.height = img.height * scaleFactor;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imgData.data.length; i += 4) {
      const avg = (imgData.data[i] + imgData.data[i+1] + imgData.data[i+2]) / 3;
      const binary = avg > 128 ? 255 : 0;
      imgData.data[i] = imgData.data[i+1] = imgData.data[i+2] = binary;
  }
  ctx.putImageData(imgData, 0, 0);

  return canvas.toDataURL('image/png');
}

function parseCardDetails(text) {
  const lines = text.split("\n").map(line => line.trim()).filter(line => line);

  const nameRegex = /([A-Z][a-z]+)\s([A-Z][a-z]+)/;
  const numberRegex = /\b\d{6,}\b/;
  const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s?(\d{4})/i;
  const qualRegex = /(Supervisor|Operator|Manager|Technical|Experienced.*|Skilled.*)/i;

  const details = {
      name: "Not Found",
      number: "Not Found",
      expiry: "Not Found",
      qualifications: "Not Found"
  };

  lines.forEach(line => {
      if (details.name === "Not Found" && nameRegex.test(line)) {
          details.name = line.match(nameRegex)[0];
      }
      if (details.number === "Not Found" && numberRegex.test(line)) {
          details.number = line.match(numberRegex)[0];
      }
      if (details.expiry === "Not Found" && dateRegex.test(line)) {
          details.expiry = line.match(dateRegex)[0];
      }
      if (details.qualifications === "Not Found" && qualRegex.test(line)) {
          details.qualifications = line.match(qualRegex)[0];
      }
  });

  return details;
}

document.getElementById('scan-button').onclick = async () => {
  const img = document.getElementById('uploaded-image');

  if (!img.src) {
      alert("Please upload an image first!");
      return;
  }

  document.getElementById('name').innerText = "Scanning...";
  document.getElementById('number').innerText = "Scanning...";
  document.getElementById('expiry').innerText = "Scanning...";
  document.getElementById('qualifications').innerText = "Scanning...";

  const processedImg = await preprocessImage(img);

  const worker = await Tesseract.createWorker({
      logger: m => console.log(m)
  });

  await worker.loadLanguage('eng');
  await worker.initialize('eng');

  const { data: { text } } = await worker.recognize(processedImg);
  console.log("OCR Result:", text);

  const details = parseCardDetails(text);

  document.getElementById('name').innerText = details.name;
  document.getElementById('number').innerText = details.number;
  document.getElementById('expiry').innerText = details.expiry;
  document.getElementById('qualifications').innerText = details.qualifications;

  await worker.terminate();
  
};
>>>>>>> 26616ec7163e1ab66128b818b6695dca44533352
