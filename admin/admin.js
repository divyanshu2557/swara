/* ================= CONFIG ================= */

const API_BASE = "https://backend-swarabharat.onrender.com/api";
const DASHBOARD_API = `${API_BASE}/dashboard`;

/* ================= GLOBALS ================= */

let emotionChart = null;
let issueChart = null;

/* ================= SAFE FETCH ================= */

async function safeFetch(url, options = {}, retries = 2) {
  try {
    const res = await fetch(url, { cache: "no-store", ...options });
    if (!res.ok) throw new Error(res.status);
    return res;
  } catch (e) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1200));
      return safeFetch(url, options, retries - 1);
    }
    throw e;
  }
}

/* ================= DASHBOARD ================= */

async function loadDashboard() {
  try {
    const res = await safeFetch(DASHBOARD_API);
    const data = await res.json();

    totalVoices.innerText = data.totalVoices ?? 0;
    highUrgency.innerText = data.highUrgency ?? 0;
    topIssue.innerText = data.topIssue ?? "None";

    renderEmotionChart(data.emotions || {});
    renderIssueChart(data.issues || {});
  } catch (e) {
    console.error("Dashboard error:", e);
  }
}

/* ================= STATUS ================= */

async function refreshStatus() {
  try {
    const res = await safeFetch(`${API_BASE}/demo_status`);
    const d = await res.json();
    liveStatus.innerText = `AI: live (${d.ai_provider})`;
    liveStatus.style.color = "#34d399";
  } catch {
    liveStatus.innerText = "AI: unreachable";
    liveStatus.style.color = "#ef4444";
  }

  try {
    const res = await safeFetch(`${API_BASE}/demo_quota`);
    const q = await res.json().then(d => d.quota);
    quotaStatus.innerText =
      `Daily ${q.daily_count}/${q.daily_limit} • Min ${q.minute_count}/${q.minute_limit}`;
  } catch {
    quotaStatus.innerText = "";
  }
}

/* ================= CHARTS ================= */

function renderEmotionChart(emotions) {
  const labels = Object.keys(emotions);
  const values = Object.values(emotions);

  if (emotionChart) emotionChart.destroy();

  emotionChart = new Chart(
    document.getElementById("emotionChart").getContext("2d"),
    {
      type: "bar",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: "#6366f1"
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        responsive: true
      }
    }
  );
}

function renderIssueChart(issues) {
  const labels = Object.keys(issues);
  const values = Object.values(issues);

  if (issueChart) issueChart.destroy();

  issueChart = new Chart(
    document.getElementById("issueChart").getContext("2d"),
    {
      type: "pie",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: [
            "#6366f1","#22c55e","#f59e0b","#ef4444","#0ea5e9"
          ]
        }]
      },
      options: { responsive: true }
    }
  );
}

/* ================= DEMO ANALYZE ================= */

document.getElementById("analyzeDemo").addEventListener("click", async () => {
  const msg = demoMessage.value.trim();
  if (!msg) return;

  try {
    const res = await safeFetch(`${API_BASE}/demo_analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });

    const d = await res.json();
    demoResult.innerHTML = `
      <div class="card">
        <b>Issue:</b> ${d.analysis.issue}<br>
        <b>Emotion:</b> ${d.analysis.emotion}<br>
        <b>Urgency:</b> ${d.analysis.urgency}<br>
        <b>Summary:</b> ${d.analysis.summary}
      </div>
    `;
  } catch (e) {
    alert("Analyze failed");
  }
});

/* ================= INIT ================= */

loadDashboard();
refreshStatus();

setInterval(loadDashboard, 5000);
setInterval(refreshStatus, 15000);