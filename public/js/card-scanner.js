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
    const avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
    const binary = avg > 128 ? 255 : 0;
    imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = binary;
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

  const processedImg = await preprocessImage(img);

  const worker = await Tesseract.createWorker({
    logger: m => console.log(m)
  });

  await worker.loadLanguage('eng');
  await worker.initialize('eng');

  const { data: { text } } = await worker.recognize(processedImg);
  const details = parseCardDetails(text);

  document.getElementById('name').innerText = details.name;
  document.getElementById('number').innerText = details.number;
  document.getElementById('expiry').innerText = details.expiry;
  document.getElementById('qualifications').innerText = details.qualifications;

  await worker.terminate();
};
