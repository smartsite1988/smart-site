// FILE: public/js/scanner.js

document.getElementById('file-input').addEventListener('change', (event) => {
  const file = event.target.files[0];
  const img = document.getElementById('uploaded-image');
  img.src = URL.createObjectURL(file);
  img.style.display = 'block';
});

function parseCardDetails(text) {
  const lines = text.split("\n").map(line => line.trim()).filter(line => line);

  const nameRegex = /([A-Z][a-z]+\s[A-Z][a-z]+)/;
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

  const worker = await Tesseract.createWorker({ logger: m => console.log(m) });
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');

  const { data: { text } } = await worker.recognize(img);
  await worker.terminate();

  const details = parseCardDetails(text);

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${details.name}</td>
    <td>${details.qualifications}</td>
    <td>${details.expiry}</td>
    <td>${details.number}</td>
  `;
  document.getElementById('matrix-body').appendChild(row);
};
