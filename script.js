const form = document.getElementById("calculator-form");
const principalInput = document.getElementById("principal");
const monthlyContributionInput = document.getElementById("monthlyContribution");
const annualRateInput = document.getElementById("annualRate");
const yearsInput = document.getElementById("years");

const futureValueOutput = document.getElementById("futureValue");
const contributionsOutput = document.getElementById("contributions");
const gainsOutput = document.getElementById("gains");
const canvas = document.getElementById("growthChart");
const ctx = canvas.getContext("2d");

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

function calculateSeries(principal, monthlyContribution, annualRate, years) {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  let balance = principal;
  const points = [{ month: 0, value: principal }];

  for (let month = 1; month <= months; month += 1) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    points.push({ month, value: balance });
  }

  const totalContributions = principal + monthlyContribution * months;
  return {
    points,
    futureValue: balance,
    totalContributions,
    gains: balance - totalContributions
  };
}

function drawChart(points) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const pad = { top: 30, right: 20, bottom: 36, left: 68 };
  const maxX = points[points.length - 1].month;
  const maxY = Math.max(...points.map((point) => point.value));
  const minY = 0;
  const chartWidth = canvas.width - pad.left - pad.right;
  const chartHeight = canvas.height - pad.top - pad.bottom;

  function x(month) {
    return pad.left + (month / maxX) * chartWidth;
  }

  function y(value) {
    const ratio = (value - minY) / (maxY - minY || 1);
    return pad.top + chartHeight - ratio * chartHeight;
  }

  ctx.strokeStyle = "#2a3650";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, canvas.height - pad.bottom);
  ctx.lineTo(canvas.width - pad.right, canvas.height - pad.bottom);
  ctx.stroke();

  ctx.fillStyle = "#9ba8c7";
  ctx.font = "12px sans-serif";
  for (let i = 0; i <= 4; i += 1) {
    const value = (maxY / 4) * i;
    const yPos = y(value);
    ctx.fillText(currency.format(value), 8, yPos + 4);
    ctx.strokeStyle = "rgba(110, 168, 254, 0.12)";
    ctx.beginPath();
    ctx.moveTo(pad.left, yPos);
    ctx.lineTo(canvas.width - pad.right, yPos);
    ctx.stroke();
  }

  ctx.strokeStyle = "#6ea8fe";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  points.forEach((point, index) => {
    const xPos = x(point.month);
    const yPos = y(point.value);
    if (index === 0) {
      ctx.moveTo(xPos, yPos);
    } else {
      ctx.lineTo(xPos, yPos);
    }
  });
  ctx.stroke();

  const end = points[points.length - 1];
  ctx.fillStyle = "#58d68d";
  ctx.beginPath();
  ctx.arc(x(end.month), y(end.value), 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#9ba8c7";
  ctx.fillText(`0y`, pad.left, canvas.height - 12);
  ctx.fillText(`${Math.round(maxX / 12)}y`, canvas.width - pad.right - 24, canvas.height - 12);
}

function update() {
  const principal = Number(principalInput.value) || 0;
  const monthlyContribution = Number(monthlyContributionInput.value) || 0;
  const annualRate = Number(annualRateInput.value) || 0;
  const years = Number(yearsInput.value) || 0;

  const { points, futureValue, totalContributions, gains } = calculateSeries(
    principal,
    monthlyContribution,
    annualRate,
    years
  );

  futureValueOutput.textContent = currency.format(futureValue);
  contributionsOutput.textContent = currency.format(totalContributions);
  gainsOutput.textContent = currency.format(gains);
  drawChart(points);
}

form.addEventListener("input", update);
update();
