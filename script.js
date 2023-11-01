const calculateButton = document.getElementById("calculateButton");
const resetButton = document.getElementById("resetButton");
const zoomInButton = document.getElementById("zoomInButton");
const zoomOutButton = document.getElementById("zoomOutButton");
const resultElement = document.getElementById("result");
const extremePointElement = document.getElementById("extremePoint");
const canvas = document.getElementById("quadraticChart");
const ctx = canvas.getContext("2d");
const historyElement = document.getElementById("history");

let initialDistance = 0;
let currentDistance = 0;
let isPinching = false;

canvas.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    isPinching = true;
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    initialDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  }
});

canvas.addEventListener("touchmove", (e) => {
  if (isPinching && e.touches.length === 2) {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );

    // Menghitung faktor perbesaran berdasarkan perubahan jarak
    const zoomFactor = currentDistance / initialDistance;

    // Perbarui faktor perbesaran kanvas
    zoom *= zoomFactor;

    // Atur ulang nilai awal
    initialDistance = currentDistance;

    // Gambar ulang kanvas dengan faktor perbesaran yang baru
    drawQuadraticChart();
  }
});

canvas.addEventListener("touchend", () => {
  isPinching = false;
});

let zoom = 1;
let a, b, c; // Variabel untuk menyimpan nilai a, b, c
let roots = []; // Variabel untuk menyimpan akar-akar

function calculateQuadratic() {
  a = parseFloat(document.getElementById("a").value);
  b = parseFloat(document.getElementById("b").value);
  c = parseFloat(document.getElementById("c").value);

  if (isNaN(a) || isNaN(b) || isNaN(c)) {
    resultElement.textContent = "Harap masukkan nilai a, b, dan c yang valid.";
    return;
  }

  historyElement.innerHTML = "";

  const discriminant = b ** 2 - 4 * a * c;

  if (discriminant > 0) {
    const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    const result = `Akar-akar persamaan: x1 = ${root1.toFixed(
      2
    )} dan x2 = ${root2.toFixed(2)}`;
    resultElement.textContent = result;
    const extremeX = -b / (2 * a);
    const extremeY = a * extremeX * extremeX + b * extremeX + c;
    const extremeResult = `Titik Ekstremum: x = ${extremeX.toFixed(
      2
    )}, y = ${extremeY.toFixed(2)}`;
    extremePointElement.textContent = extremeResult;
    roots = [root1, root2];
    drawQuadraticChart();
    addToHistory(a, b, c, result, extremeResult);
  } else if (discriminant === 0) {
    const root = -b / (2 * a);
    const result = `Satu akar ganda: x = ${root.toFixed(2)}`;
    resultElement.textContent = result;
    const extremeX = -b / (2 * a);
    const extremeY = a * extremeX * extremeX + b * extremeX + c;
    const extremeResult = `Titik Ekstremum: x = ${extremeX.toFixed(
      2
    )}, y = ${extremeY.toFixed(2)}`;
    extremePointElement.textContent = extremeResult;
    roots = [root];
    drawQuadraticChart();
    addToHistory(a, b, c, result, extremeResult);
  } else {
    const result = "Persamaan tidak memiliki akar real.";
    resultElement.textContent = result;
    extremePointElement.textContent = "";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    addToHistory(a, b, c, result, "");
    roots = [];
  }
}

calculateButton.addEventListener("click", calculateQuadratic);

resetButton.addEventListener("click", function () {
  document.getElementById("a").value = "";
  document.getElementById("b").value = "";
  document.getElementById("c").value = "";
  resultElement.textContent = "";
  extremePointElement.textContent = "";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  historyElement.innerHTML = "";
  a = b = c = undefined; // Reset nilai a, b, c
  roots = []; // Reset akar-akar
});

zoomInButton.addEventListener("click", function () {
  zoom *= 1.5; // Faktor perbesaran
  drawQuadraticChart();
});

zoomOutButton.addEventListener("click", function () {
  zoom /= 1.5; // Faktor perkecilan
  drawQuadraticChart();
});

function drawQuadraticChart() {
  if (
    typeof a === "undefined" ||
    typeof b === "undefined" ||
    typeof c === "undefined"
  ) {
    return; // Tidak menggambar jika nilai a, b, atau c belum diinput
  }

  const data = [];
  for (let x = -100; x <= 100; x += 0.1) {
    const y = a * x * x + b * x + c;
    data.push({ x, y });
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  ctx.fillStyle = "black";
  ctx.font = "12px Arial";

  for (let i = -100; i <= 100; i++) {
    ctx.fillText(
      i,
      i * 20 * zoom + canvas.width / 2 - 5,
      canvas.height / 2 + 15
    );
  }

  for (let i = -100; i <= 100; i++) {
    ctx.fillText(
      i,
      canvas.width / 2 + 10,
      -i * 20 * zoom + canvas.height / 2 + 5
    );
  }

  // Tambahkan garis putus-putus vertikal di titik ekstremum
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = "red";
  const extremeX = -b / (2 * a);
  ctx.beginPath();
  ctx.moveTo(extremeX * 20 * zoom + canvas.width / 2, 0);
  ctx.lineTo(extremeX * 20 * zoom + canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "red"; // Warna titik merah untuk titik ekstremum
  const extremeY = a * extremeX * extremeX + b * extremeX + c;
  ctx.beginPath();
  ctx.arc(
    extremeX * 20 * zoom + canvas.width / 2,
    -extremeY * 20 * zoom + canvas.height / 2,
    6,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "black"; // Kembali ke warna hitam

  ctx.fillStyle = "black";
  ctx.beginPath();
  for (const root of roots) {
    ctx.arc(
      root * 20 * zoom + canvas.width / 2,
      canvas.height / 2,
      6,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;

  for (let i = 0; i < data.length - 1; i++) {
    ctx.beginPath();
    ctx.moveTo(
      data[i].x * 20 * zoom + canvas.width / 2,
      -data[i].y * 20 * zoom + canvas.height / 2
    );
    ctx.lineTo(
      data[i + 1].x * 20 * zoom + canvas.width / 2,
      -data[i + 1].y * 20 * zoom + canvas.height / 2
    );
    ctx.stroke();
  }
}

function addToHistory(a, b, c, result, extremeResult) {
  const historyItem = document.createElement("li");
  historyItem.innerHTML = `Persamaan: ${a}x^2 + ${b}x + ${c}<br>Hasil ${result}<br>${extremeResult}`;
  historyElement.appendChild(historyItem);
  resultElement.textContent = "";
  extremePointElement.textContent = "";
}
