// Global variables to store data
let projects = JSON.parse(localStorage.getItem("projects")) || [];
let dailyTasks = JSON.parse(localStorage.getItem("dailyLogs")) || [];
let trades = JSON.parse(localStorage.getItem("trades")) || [];

// DOM elements for dashboard stats
const totalProjectsEl = document.getElementById("total-projects");
const tasksTodayEl = document.getElementById("tasks-today");
const tradesLoggedEl = document.getElementById("trades-logged");
const summaryChartCanvas = document.getElementById("summaryChart");
let summaryChart;

// Utility Functions
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function generateId() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString();
}

// --- Dashboard Functions ---

function updateDashboardStats() {
  totalProjectsEl.textContent = projects.length;

  const today = formatDate(new Date());
  const todayTasks = dailyTasks.filter((task) => task.date === today);

  tasksTodayEl.textContent = todayTasks.length;

  tasksTodayEl.textContent = dailyTasks.length;

  tradesLoggedEl.textContent = trades.length;

  updateSummaryChart();
}

function updateSummaryChart() {
  const projectCount = projects.length;
  const todayTasksCount = dailyTasks.filter(
    (task) => formatDate(new Date(task.date)) === formatDate(new Date())
  ).length;

  const barTaskCount = dailyTasks.length;

  const totalTrades = trades.length;
  const taskCountsByCategory = dailyTasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {});

  if (summaryChart) {
    summaryChart.destroy();
  }

  const categoryLabels = Object.keys(taskCountsByCategory);
  const categoryData = Object.values(taskCountsByCategory);

  summaryChart = new Chart(summaryChartCanvas, {
    type: "bar",
    data: {
      labels: [
        "Projects",
        "Total Logs",
        ...categoryLabels, // Spread category labels first
        "Total Trades", // Then "Total Trades"
      ],
      datasets: [
        {
          label: "Summary",
          data: [
            projectCount,
            barTaskCount,
            ...categoryData, // Spread category data first
            totalTrades, // Then total trades count
          ],
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)", // Projects - Blue
            "rgba(75, 192, 192, 0.6)", // Tasks Today - Teal

            ...Object.keys(taskCountsByCategory).map((_, index) => {
              const colors = [
                "rgba(255, 206, 86, 0.6)", // Coding - Yellow
                "rgba(153, 102, 255, 0.6)", // Forex - Purple
                "rgba(255, 159, 64, 0.6)", // Exercise - Orange
                "rgba(101, 205, 166, 0.6)", // Learning - Light Green
                "rgba(179, 139, 109, 0.6)", // Others - Brown
              ];
              // Cycle through colors if there are more categories than defined colors
              return colors[index % colors.length];
            }),
            "rgba(255, 99, 132, 0.6)", // Total Trades - Red (moved to the end)
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(75, 192, 192, 1)",
            // Dynamically generate or order border colors for categories
            ...Object.keys(taskCountsByCategory).map((_, index) => {
              const colors = [
                "rgba(255, 206, 86, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
                "rgba(101, 205, 166, 1)",
                "rgba(179, 139, 109, 1)",
              ];
              return colors[index % colors.length];
            }),
            "rgba(255, 99, 132, 1)", // Total Trades - Red (moved to the end)
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Count",
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Data Summary",
        },
        legend: {
          display: false,
        },
      },
    },
  });
}

// --- Project Functions ---

const projectForm = document.getElementById("project-form");
const projectList = document.getElementById("project-list");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const sortOrder = document.getElementById("sort-order");

function saveProjects() {
  localStorage.setItem("projects", JSON.stringify(projects));
  updateDashboardStats();
}

function renderProjects(projectArray) {
  projectList.innerHTML = "";
  projectArray.forEach((project) => {
    const li = document.createElement("li");
    li.className = "project-item";
    li.dataset.id = project.id;

    const title = document.createElement("h3");
    title.textContent = project.name + (project.completed ? " ✅" : "");

    const purpose = document.createElement("p");
    purpose.textContent = `Purpose: ${project.purpose}`;

    const date = document.createElement("small");
    date.textContent = `Added: ${formatDateTime(project.dateAdded)}`;

    const stepsList = document.createElement("ul");
    project.steps.forEach((step) => {
      const stepItem = document.createElement("li");
      stepItem.textContent = step;
      stepsList.appendChild(stepItem);
    });

    const completeLabel = document.createElement("label");
    completeLabel.innerHTML = `
            <input type="checkbox" ${
              project.completed ? "checked" : ""
            }/> Mark as Completed
        `;
    completeLabel.querySelector("input").addEventListener("change", (e) => {
      project.completed = e.target.checked;
      saveProjects();
      renderProjects(projects);
    });

    const editBtn = document.createElement("button");
    editBtn.className = "log-edit-btn small-btn";
    editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
    editBtn.addEventListener("click", () => {
      editProject(project.id);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "log-delete-btn small-btn";
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.addEventListener("click", () => {
      deleteProject(project.id);
    });

    li.appendChild(title);
    li.appendChild(purpose);
    li.appendChild(date);
    li.appendChild(stepsList);
    li.appendChild(completeLabel);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    projectList.appendChild(li);
  });
}

function deleteProject(id) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this project?"
  );
  if (!confirmDelete) return;

  projects = projects.filter((project) => project.id !== id);
  saveProjects();
  renderProjects(projects);
}

function editProject(id) {
  const project = projects.find((p) => p.id === id);
  if (!project) return;

  document.getElementById("project-name").value = project.name;
  document.getElementById("project-purpose").value = project.purpose;
  document.getElementById("project-steps").value = project.steps.join("\n");

  projects = projects.filter((p) => p.id !== id);
  saveProjects();
  renderProjects(projects);
}

function applyProjectFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const status = statusFilter.value;
  const sort = sortOrder.value;

  let filtered = [...projects];

  if (searchTerm) {
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(searchTerm)
    );
  }

  if (status === "completed") {
    filtered = filtered.filter((p) => p.completed);
  } else if (status === "pending") {
    filtered = filtered.filter((p) => !p.completed);
  }

  if (sort === "newest") {
    filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  } else if (sort === "oldest") {
    filtered.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
  } else if (sort === "completed") {
    filtered = filtered.filter((p) => p.completed);
  }

  renderProjects(filtered);
}

// --- Daily Log Functions ---

const dailyForm = document.getElementById("daily-form");
const dailyTaskInput = document.getElementById("daily-task");
const dailyDateInput = document.getElementById("daily-date");
const dailyCategoryInput = document.getElementById("daily-category");
const dailyList = document.getElementById("daily-list");
const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort");

function saveLogs() {
  localStorage.setItem("dailyLogs", JSON.stringify(dailyTasks));
  updateDashboardStats();
}

function renderLogs(logs) {
  dailyList.innerHTML = "";
  logs.forEach((log) => {
    const li = document.createElement("li");
    li.className = "daily-log-item";
    li.dataset.id = log.id;

    const taskText = document.createElement("p");
    taskText.className = "log-task";
    taskText.textContent = log.task;

    const dateText = document.createElement("small");
    dateText.className = "log-date";
    dateText.textContent = `Date: ${log.date}`;

    const categoryText = document.createElement("span");
    categoryText.className = "log-category";
    categoryText.textContent = `Category: ${log.category}`;

    const completeLabel = document.createElement("label");
    completeLabel.className = "log-completed";
    completeLabel.innerHTML = `
            <input type="checkbox" ${
              log.completed ? "checked" : ""
            }/> Mark as Completed
        `;
    completeLabel.querySelector("input").addEventListener("change", () => {
      log.completed = !log.completed;
      saveLogs();
      renderLogs(dailyTasks);
    });

    const editBtn = document.createElement("button");
    editBtn.className = "log-edit-btn small-btn";
    editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
    editBtn.addEventListener("click", () => {
      editLog(log.id);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "log-delete-btn small-btn";
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.addEventListener("click", () => {
      deleteLog(log.id);
    });

    const detailsContainer = document.createElement("div");
    detailsContainer.className = "log-details";
    detailsContainer.appendChild(taskText);
    detailsContainer.appendChild(dateText);
    detailsContainer.appendChild(categoryText);

    li.appendChild(detailsContainer);
    li.appendChild(completeLabel);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    dailyList.appendChild(li);
  });
}

function deleteLog(id) {
  const confirmDelete = confirm("Are you sure you want to delete this log?");
  if (!confirmDelete) return;

  dailyTasks = dailyTasks.filter((log) => log.id !== id);
  saveLogs();
  renderLogs(dailyTasks);
}

function editLog(id) {
  const logToEdit = dailyTasks.find((log) => log.id === id);
  if (!logToEdit) return;

  dailyTaskInput.value = logToEdit.task;
  dailyDateInput.value = logToEdit.date;
  dailyCategoryInput.value = logToEdit.category;

  const submitButton = dailyForm.querySelector("button");
  submitButton.textContent = "Update";

  const handleUpdate = (e) => {
    e.preventDefault();

    const task = document.getElementById("daily-task").value.trim();
    const date = document.getElementById("daily-date").value;
    const category = document.getElementById("daily-category").value;

    if (!task || !date || !category) {
      alert("Please fill in all fields!");
      return;
    }

    const newLog = {
      id: Date.now(),
      task,
      date,
      category,
      completed: false,
    };

    dailyTasks.push(newLog);
    saveLogs();
    renderLogs(dailyTasks);
    clearForms();

    dailyForm.removeEventListener("submit", handleUpdate);
  };

  dailyForm.addEventListener("submit", handleUpdate);
}

function applyDailyFilters() {
  const category = categoryFilter.value;
  const sort = sortSelect.value;

  let filtered = [...dailyTasks];

  if (category !== "all") {
    filtered = filtered.filter((task) => task.category === category);
  }

  if (sort === "newest") {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sort === "oldest") {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sort === "completed") {
    filtered = filtered.filter((task) => task.completed);
  }

  renderLogs(filtered);
}

// --- Trading Journal Functions ---

const tradeForm = document.getElementById("trade-form");
const tradeTableBody = document.querySelector("#trade-table tbody");

const totalTradesEl = document.getElementById("total-trades");
const winsEl = document.getElementById("wins");
const lossesEl = document.getElementById("losses");
const winRateEl = document.getElementById("win-rate");
const totalPLEl = document.getElementById("total-pl");
const rrrEl = document.getElementById("rrr");
const bestTradeEl = document.getElementById("best-trade");
const worstTradeEl = document.getElementById("worst-trade");
const profitFactorEl = document.getElementById("profit-factor");

// Save trades to localStorage
function saveTrades() {
  localStorage.setItem("trades", JSON.stringify(trades));
  renderTrades();
  updateStats(trades);
}

// ...

// Add one trade row to the table
function addTradeToTable(trade, index) {
  const row = document.createElement("tr");
  row.innerHTML = `<td>${trade.date}</td>
    <td>${trade.type}</td>
    <td>${trade.pair}</td>
    <td>${trade.entry}</td>
    <td>${trade.exit}</td>
    <td>${trade.lot}</td>
    <td>${trade.leverage}</td>
    <td>${trade.strategy}</td>
    <td>${trade.notes}</td>
    <td>${
      !isNaN(Number(trade.profitLoss))
        ? Number(trade.profitLoss).toFixed(2)
        : "N/A"
    }</td>

    <td><button onclick="deleteTrade(${index})"><i class="fas fa-trash-alt"></i></button></td>
  `;
  tradeTableBody.appendChild(row);
}

// Re-render the whole table
function renderTrades() {
  tradeTableBody.innerHTML = ""; // Clear existing rows before rendering
  trades.forEach((trade, index) => addTradeToTable(trade, index));
}

// Delete a trade
function deleteTrade(index) {
  trades.splice(index, 1);
  saveTrades();
  updateDashboardStats();
}

function updateStats(trades) {
  const validTrades = trades.filter(
    (t) =>
      t.profitLoss !== null &&
      t.profitLoss !== undefined &&
      !isNaN(Number(t.profitLoss))
  );

  const totalTrades = validTrades.length;
  const wins = validTrades.filter((t) => Number(t.profitLoss) > 0).length;
  const losses = validTrades.filter((t) => Number(t.profitLoss) < 0).length;

  const profitLosses = validTrades.map((t) => Number(t.profitLoss));
  const totalPL = profitLosses.length
    ? profitLosses.reduce((acc, val) => acc + val, 0).toFixed(2)
    : "0.00";

  const winRate = totalTrades
    ? ((wins / totalTrades) * 100).toFixed(1) + "%"
    : "0%";

  const riskRewardRatios = validTrades.map((t) =>
    Math.abs(Number(t.profitLoss) / 10)
  );
  const avgRRR = riskRewardRatios.length
    ? (
        riskRewardRatios.reduce((a, b) => a + b, 0) / riskRewardRatios.length
      ).toFixed(2)
    : "0.00";

  const bestTrade = profitLosses.length
    ? Math.max(...profitLosses).toFixed(2)
    : "0.00";

  const worstTrade = profitLosses.length
    ? Math.min(...profitLosses).toFixed(2)
    : "0.00";

  const totalProfit = validTrades
    .filter((t) => Number(t.profitLoss) > 0)
    .reduce((acc, t) => acc + Number(t.profitLoss), 0);

  const totalLoss = validTrades
    .filter((t) => Number(t.profitLoss) < 0)
    .reduce((acc, t) => acc + Math.abs(Number(t.profitLoss)), 0);

  const profitFactor =
    totalLoss > 0 ? (totalProfit / totalLoss).toFixed(2) : "N/A";

  // Update DOM
  totalTradesEl.textContent = totalTrades;
  winsEl.textContent = wins;
  lossesEl.textContent = losses;
  totalPLEl.textContent = totalPL;
  winRateEl.textContent = winRate;
  rrrEl.textContent = avgRRR;
  bestTradeEl.textContent = bestTrade;
  worstTradeEl.textContent = worstTrade;
  profitFactorEl.textContent = profitFactor;
}

// Export to CSV
function exportToCSV() {
  const headers = [
    "Date",
    "Type",
    "Currency Pair",
    "Entry Price",
    "Exit Price",
    "Lot Size",
    "Leverage",
    "Strategy",
    "Notes",
    "Profit/Loss",
  ];

  const rows = trades.map((t) => [
    t.date,
    t.type,
    t.pair,
    t.entry,
    t.exit,
    t.lot,
    t.leverage,
    t.strategy,
    t.notes,
    t.profitLoss.toFixed(2),
  ]);

  let csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...rows].map((e) => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "trading_journal.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Clear form inputs
function clearForms() {
  tradeForm.reset();
}

// Handle trade form submission
tradeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const trade = {
    date: document.getElementById("trade-date").value,
    type: document.getElementById("trade-type").value,
    pair: document.getElementById("currency-pair").value,
    entry: parseFloat(document.getElementById("entry-price").value),
    exit: parseFloat(document.getElementById("exit-price").value),
    lot: parseFloat(document.getElementById("lot-size").value),
    leverage: document.getElementById("leverage").value,
    spread: parseFloat(document.getElementById("spread").value),
    swap: parseFloat(document.getElementById("swap").value),
    strategy: document.getElementById("strategy").value,
    notes: document.getElementById("trade-notes").value,
  };

  const isJPY = trade.pair.includes("JPY");
  const contractSize = 120000; // Standard contract size per lot

  // Calculate price difference depending on trade type
  const priceDifference =
    trade.type === "Buy" ? trade.exit - trade.entry : trade.entry - trade.exit;

  // Calculate profit in quote currency
  let profitInQuoteCurrency = priceDifference * contractSize * trade.lot;

  // If JPY pair, profit is already in JPY; convert to USD (account currency) using exit price
  if (isJPY) {
    // Assuming account base currency is USD, convert JPY profit to USD
    profitInQuoteCurrency = profitInQuoteCurrency / trade.exit;
  }

  // Now profitInQuoteCurrency is profit in USD approx.
  trade.profitLoss = profitInQuoteCurrency;

  trades.push(trade);
  saveTrades();
  updateDashboardStats();
  clearForms();
});

// --- Event Listeners ---

// Project form submission
projectForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("project-name").value.trim();
  const purpose = document.getElementById("project-purpose").value.trim();
  const steps = document
    .getElementById("project-steps")
    .value.trim()
    .split("\n")
    .map((step) => step.trim())
    .filter((step) => step);
  const createdAt = formatDate(new Date());

  const project = {
    id: generateId(),
    name,
    purpose,
    steps,
    status: "pending",
    dateAdded: createdAt,
    completed: false,
  };

  projects.unshift(project);
  saveProjects();
  renderProjects(projects);
  clearForms();
});

// Project list filter and sort
searchInput.addEventListener("input", applyProjectFilters);
statusFilter.addEventListener("change", applyProjectFilters);
sortOrder.addEventListener("change", applyProjectFilters);

// Daily form submission
dailyForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const task = document.getElementById("daily-task").value.trim();
  const date = document.getElementById("daily-date").value;
  const category = document.getElementById("daily-category").value;

  if (!task || !date || !category) {
    alert("Please fill in all fields!");
    return;
  }

  const newLog = {
    id: Date.now(),
    task,
    date,
    category,
    completed: false,
  };

  dailyTasks.push(newLog);
  saveLogs();
  renderLogs(dailyTasks);
  clearForms();
});

// Daily log filter and sort
categoryFilter.addEventListener("change", applyDailyFilters);
sortSelect.addEventListener("change", applyDailyFilters);

function clearForms() {
  // Clear project form
  document.getElementById("project-name").value = "";
  document.getElementById("project-purpose").value = "";
  document.getElementById("project-steps").value = "";

  // Clear daily log form
  document.getElementById("daily-task").value = "";
  document.getElementById("daily-date").value = "";
  document.getElementById("daily-category").value = "";

  // Clear trade form
  document.getElementById("trade-date").value = "";
  document.getElementById("trade-type").value = "";
  document.getElementById("currency-pair").value = "";
  document.getElementById("entry-price").value = "";
  document.getElementById("exit-price").value = "";
  document.getElementById("lot-size").value = "";
  document.getElementById("leverage").value = "";
  document.getElementById("spread").value = "";
  document.getElementById("swap").value = "";
  document.getElementById("strategy").value = "";
  document.getElementById("trade-notes").value = "";
}

// --- Global Functions (accessible from HTML) ---

function openProjectForm() {
  document.getElementById("project-form").style.display = "block";
}

function openDailyForm() {
  document.getElementById("daily-form").style.display = "block";
}

function openTradeForm() {
  document.getElementById("trade-form").style.display = "block";
}

function scrollToSection(sectionId) {
  document.querySelector(sectionId).scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// --- Initialization ---

document.addEventListener("DOMContentLoaded", () => {
  renderProjects(projects);
  renderLogs(dailyTasks);
  updateStats(trades);
  renderTrades(addTradeToTable);
  updateDashboardStats();
});
