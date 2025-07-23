// Global variables to store data
let projects = JSON.parse(localStorage.getItem("projects")) || [];
let dailyTasks = JSON.parse(localStorage.getItem("dailyLogs")) || [];
let trades = JSON.parse(localStorage.getItem("trades")) || [];

// DOM elements for dashboard stats
const totalProjectsEl = document.getElementById("total-projects");
const tasksTodayEl = document.getElementById("tasks-today");
const tradesLoggedEl = document.getElementById("trades-logged");
const summaryChartCanvas = document.getElementById("summaryChart");
const tradingMetricsChartCanvas = document.getElementById("tradingMetricsChart");
let summaryChart;
let tradingMetricsChart;

// DOM elements for empty states
const noProjectsMessage = document.getElementById("no-projects-message");
const noDailyLogsMessage = document.getElementById("no-daily-logs-message");
const noTradesMessage = document.getElementById("no-trades-message");

// Utility Functions
function formatDate(date) {
  if (!date) return "";
  if (typeof date === 'string') {
    date = new Date(date); // Convert string to Date object
  }
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

function generateId() {
  return "_" + Math.random().toString(36).substring(2, 11); // More robust ID
}

function formatDateTime(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

// --- Local Storage Functions ---
function saveProjects() {
  localStorage.setItem("projects", JSON.stringify(projects));
}

function saveLogs() {
  localStorage.setItem("dailyLogs", JSON.stringify(dailyTasks));
}

function saveTrades() {
  localStorage.setItem("trades", JSON.stringify(trades));
}

// --- Modal Handling ---
function openForm(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function closeForm(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// Clear form inputs
function clearForms(formType) {
  if (formType === 'project') {
    document.getElementById("project-name").value = "";
    document.getElementById("project-purpose").value = "";
    document.getElementById("project-steps").value = "";
    document.getElementById("project-form-submit-btn").textContent = "Add Project";
    document.getElementById("project-form").dataset.editingId = "";
  } else if (formType === 'daily') {
    document.getElementById("daily-task").value = "";
    document.getElementById("daily-date").value = "";
    document.getElementById("daily-category").value = "";
    document.getElementById("daily-form-submit-btn").textContent = "Add Log";
    document.getElementById("daily-form").dataset.editingId = "";
  } else if (formType === 'trade') {
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
    document.getElementById("trade-form-submit-btn").textContent = "Add Trade";
    document.getElementById("trade-form").dataset.editingId = "";
  }
}

// --- Dashboard Functions ---
function updateDashboardStats() {
  totalProjectsEl.textContent = projects.length;

  const today = formatDate(new Date());
  const todayTasks = dailyTasks.filter((task) => task.date === today);
  tasksTodayEl.textContent = todayTasks.length; // Corrected to show tasks for today

  tradesLoggedEl.textContent = trades.length;

  updateSummaryChart();
  updateTradingMetricsChart();
}

function updateSummaryChart() {
  const projectCount = projects.length;
  const todayTasksCount = dailyTasks.filter(task => task.date === formatDate(new Date())).length;
  const totalTasksCount = dailyTasks.length; // Total daily tasks
  const tradesCount = trades.length;

  const data = {
    labels: ["Projects", "Today's Tasks", "Total Tasks", "Trades"],
    datasets: [{
      label: "Overview",
      data: [projectCount, todayTasksCount, totalTasksCount, tradesCount],
      backgroundColor: [
        "rgba(236, 24, 57, 0.7)", // skin-color
        "rgba(60, 179, 113, 0.7)", // MediumSeaGreen
        "rgba(255, 165, 0, 0.7)", // Orange
        "rgba(0, 123, 255, 0.7)", // Blue
      ],
      borderColor: [
        "rgba(236, 24, 57, 1)",
        "rgba(60, 179, 113, 1)",
        "rgba(255, 165, 0, 1)",
        "rgba(0, 123, 255, 1)",
      ],
      borderWidth: 1,
    }, ],
  };

  const config = {
    type: "bar",
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Overall Progress Summary",
          color: getComputedStyle(document.body).getPropertyValue('--text-black-900'),
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-black-700'),
          },
          grid: {
            color: getComputedStyle(document.body).getPropertyValue('--border-color'),
          }
        },
        x: {
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-black-700'),
          },
          grid: {
            color: getComputedStyle(document.body).getPropertyValue('--border-color'),
          }
        },
      },
    },
  };

  if (summaryChart) {
    summaryChart.destroy();
  }
  summaryChart = new Chart(summaryChartCanvas, config);
}

function updateTradingMetricsChart() {
  const plValues = trades.map(trade => parseFloat(trade.profitOrLoss));
  const dates = trades.map(trade => formatDate(trade.date));

  const data = {
    labels: dates,
    datasets: [{
      label: "Profit/Loss per Trade",
      data: plValues,
      backgroundColor: plValues.map(pl => pl >= 0 ? 'rgba(60, 179, 113, 0.7)' : 'rgba(236, 24, 57, 0.7)'), // Green for profit, red for loss
      borderColor: plValues.map(pl => pl >= 0 ? 'rgba(60, 179, 113, 1)' : 'rgba(236, 24, 57, 1)'),
      borderWidth: 1,
      barPercentage: 0.8, // Adjust bar width
      categoryPercentage: 0.8 // Adjust space between bars
    }, ],
  };

  const config = {
    type: "bar",
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Individual Trade Profit/Loss",
          color: getComputedStyle(document.body).getPropertyValue('--text-black-900'),
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-black-700'),
          },
          grid: {
            color: getComputedStyle(document.body).getPropertyValue('--border-color'),
          }
        },
        x: {
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-black-700'),
          },
          grid: {
            color: getComputedStyle(document.body).getPropertyValue('--border-color'),
          }
        },
      },
    },
  };

  if (tradingMetricsChart) {
    tradingMetricsChart.destroy();
  }
  tradingMetricsChart = new Chart(tradingMetricsChartCanvas, config);
}


// --- Project Functions ---
const projectList = document.getElementById("project-list");
const projectForm = document.getElementById("project-form");
const projectNameInput = document.getElementById("project-name");
const projectPurposeInput = document.getElementById("project-purpose");
const projectStepsInput = document.getElementById("project-steps");
const projectSortSelect = document.getElementById("project-sort");

function renderProjects() {
  projectList.innerHTML = "";
  if (projects.length === 0) {
    noProjectsMessage.style.display = 'block';
  } else {
    noProjectsMessage.style.display = 'none';
  }

  const sortedProjects = [...projects]; // Create a copy for sorting
  const sortValue = projectSortSelect.value;

  switch (sortValue) {
    case 'name-asc':
      sortedProjects.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      sortedProjects.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'date-asc':
      sortedProjects.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
      break;
    case 'date-desc':
      sortedProjects.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      break;
    case 'status':
      sortedProjects.sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? -1 : 1); // Completed first
      break;
  }


  sortedProjects.forEach((project) => {
    const li = document.createElement("li");
    li.className = `project-item ${project.completed ? 'completed' : ''}`;
    li.dataset.id = project.id; // Store ID for easy access

    const stepsHtml = project.steps
      .map((step) => `<li>${step}</li>`)
      .join("");

    li.innerHTML = `
            <h3>
                ${project.name}
                <div class="item-actions">
                    <button onclick="editProject('${project.id}')"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteProject('${project.id}')"><i class="fas fa-trash-alt"></i></button>
                </div>
            </h3>
            <p><strong>Purpose:</strong> ${project.purpose}</p>
            <p><strong>Added On:</strong> ${formatDate(project.dateAdded)}</p>
            <h4>Steps:</h4>
            <ul class="project-steps-list">
                ${stepsHtml}
            </ul>
            <div class="completion-checkbox">
                <input type="checkbox" id="project-completed-${project.id}" ${project.completed ? 'checked' : ''} onchange="toggleProjectStatus('${project.id}')">
                <label for="project-completed-${project.id}">Mark as Completed</label>
            </div>
            <span class="status-indicator ${project.completed ? 'completed' : 'in-progress'}">
                ${project.completed ? 'Completed' : 'In Progress'}
            </span>
        `;
    projectList.appendChild(li);
  });
  updateDashboardStats();
}

projectForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = projectNameInput.value.trim();
  const purpose = projectPurposeInput.value.trim();
  const steps = projectStepsInput.value
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s !== "");

  if (!name || !purpose) {
    alert("Please fill in Project Name and Purpose.");
    return;
  }

  const editingId = projectForm.dataset.editingId;

  if (editingId) {
    // Update existing project
    const projectIndex = projects.findIndex((p) => p.id === editingId);
    if (projectIndex !== -1) {
      projects[projectIndex].name = name;
      projects[projectIndex].purpose = purpose;
      projects[projectIndex].steps = steps;
      // Preserve original dateAdded and completed status
    }
  } else {
    // Add new project
    const newProject = {
      id: generateId(),
      name,
      purpose,
      steps,
      dateAdded: formatDate(new Date()),
      completed: false,
    };
    projects.push(newProject);
  }

  saveProjects();
  renderProjects();
  clearForms('project');
  closeForm('project-form-modal');
});

function editProject(id) {
  const projectToEdit = projects.find((project) => project.id === id);
  if (!projectToEdit) return;

  projectNameInput.value = projectToEdit.name;
  projectPurposeInput.value = projectToEdit.purpose;
  projectStepsInput.value = projectToEdit.steps.join("\n");

  document.getElementById("project-form-submit-btn").textContent = "Update Project";
  projectForm.dataset.editingId = id; // Store the ID being edited
  openForm('project-form-modal');
}

function deleteProject(id) {
  if (confirm("Are you sure you want to delete this project?")) {
    projects = projects.filter((project) => project.id !== id);
    saveProjects();
    renderProjects();
  }
}

function toggleProjectStatus(id) {
  const projectIndex = projects.findIndex((project) => project.id === id);
  if (projectIndex !== -1) {
    projects[projectIndex].completed = !projects[projectIndex].completed;
    saveProjects();
    renderProjects();
  }
}

projectSortSelect.addEventListener('change', renderProjects);


// --- Daily Log Functions ---
const dailyLogList = document.getElementById("daily-log-list");
const dailyForm = document.getElementById("daily-form");
const dailyTaskInput = document.getElementById("daily-task");
const dailyDateInput = document.getElementById("daily-date");
const dailyCategoryInput = document.getElementById("daily-category");
const dailySortSelect = document.getElementById("daily-sort");


function renderLogs() {
  dailyLogList.innerHTML = "";
  if (dailyTasks.length === 0) {
    noDailyLogsMessage.style.display = 'block';
  } else {
    noDailyLogsMessage.style.display = 'none';
  }

  const sortedDailyTasks = [...dailyTasks];
  const sortValue = dailySortSelect.value;

  switch (sortValue) {
    case 'date-asc':
      sortedDailyTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'date-desc':
      sortedDailyTasks.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case 'category':
      sortedDailyTasks.sort((a, b) => a.category.localeCompare(b.category));
      break;
    case 'status':
      sortedDailyTasks.sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? -1 : 1); // Completed first
      break;
  }

  sortedDailyTasks.forEach((log) => {
    const li = document.createElement("li");
    li.className = `daily-log-item ${log.completed ? 'completed' : ''}`;
    li.dataset.id = log.id;

    li.innerHTML = `
            <h3>
                ${log.task}
                <div class="item-actions">
                    <button onclick="editLog('${log.id}')"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteLog('${log.id}')"><i class="fas fa-trash-alt"></i></button>
                </div>
            </h3>
            <p><strong>Date:</strong> ${formatDate(log.date)}</p>
            <span class="category-tag">${log.category}</span>
            <div class="completion-checkbox">
                <input type="checkbox" id="log-completed-${log.id}" ${log.completed ? 'checked' : ''} onchange="toggleLogStatus('${log.id}')">
                <label for="log-completed-${log.id}">Mark as Completed</label>
            </div>
        `;
    dailyLogList.appendChild(li);
  });
  updateDashboardStats();
}

dailyForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const task = dailyTaskInput.value.trim();
  const date = dailyDateInput.value;
  const category = dailyCategoryInput.value;

  if (!task || !date || !category) {
    alert("Please fill in all fields!");
    return;
  }

  const editingId = dailyForm.dataset.editingId;

  if (editingId) {
    // Update existing log
    const logIndex = dailyTasks.findIndex((log) => log.id === editingId);
    if (logIndex !== -1) {
      dailyTasks[logIndex].task = task;
      dailyTasks[logIndex].date = date;
      dailyTasks[logIndex].category = category;
      // Preserve completed status
    }
  } else {
    // Add new log
    const newLog = {
      id: generateId(),
      task,
      date,
      category,
      completed: false,
    };
    dailyTasks.push(newLog);
  }

  saveLogs();
  renderLogs();
  clearForms('daily');
  closeForm('daily-form-modal');
});

function editLog(id) {
  const logToEdit = dailyTasks.find((log) => log.id === id);
  if (!logToEdit) return;

  dailyTaskInput.value = logToEdit.task;
  dailyDateInput.value = logToEdit.date;
  dailyCategoryInput.value = logToEdit.category;

  document.getElementById("daily-form-submit-btn").textContent = "Update Log";
  dailyForm.dataset.editingId = id;
  openForm('daily-form-modal');
}

function deleteLog(id) {
  if (confirm("Are you sure you want to delete this daily log?")) {
    dailyTasks = dailyTasks.filter((log) => log.id !== id);
    saveLogs();
    renderLogs();
  }
}

function toggleLogStatus(id) {
  const logIndex = dailyTasks.findIndex((log) => log.id === id);
  if (logIndex !== -1) {
    dailyTasks[logIndex].completed = !dailyTasks[logIndex].completed;
    saveLogs();
    renderLogs();
  }
}

dailySortSelect.addEventListener('change', renderLogs);


// --- Trading Journal Functions ---
const tradeTableBody = document.querySelector("#trade-table tbody");
const tradeForm = document.getElementById("trade-form");
const tradeSortSelect = document.getElementById("trade-sort");

// Trading Journal Stat Elements
const totalTradesEl = document.getElementById("total-trades");
const winsEl = document.getElementById("wins");
const lossesEl = document.getElementById("losses");
const winRateEl = document.getElementById("win-rate");
const totalPlEl = document.getElementById("total-pl");
const rrrEl = document.getElementById("rrr");
const bestTradeEl = document.getElementById("best-trade");
const worstTradeEl = document.getElementById("worst-trade");
const profitFactorEl = document.getElementById("profit-factor");

const contractSize = 100000; // Standard lot size for calculation (e.g., 100,000 units for major pairs)

function calculateTradePL(trade) {
  const entry = parseFloat(trade.entryPrice);
  const exit = parseFloat(trade.exitPrice);
  const lot = parseFloat(trade.lotSize);
  const spread = parseFloat(trade.spread || 0); // Default to 0 if null/undefined
  const swap = parseFloat(trade.swap || 0);     // Default to 0 if null/undefined

  // Basic validation for essential numbers
  if (isNaN(entry) || isNaN(exit) || isNaN(lot) || entry === 0 || lot === 0) {
    return 0;
  }

  let pips;
  if (trade.type === "Buy") {
    pips = (exit - entry);
  } else { // Sell
    pips = (entry - exit);
  }

  // Determine pip value divisor based on currency pair
  // For JPY pairs, 1 pip is 0.01. For most others, 1 pip is 0.0001.
  // This handles the common distinction between 2/4 decimal pairs and 3/5 decimal pairs.
  let pipValueDivisor;
  // Check if currency pair ends with JPY (case-insensitive)
  if (trade.currencyPair && trade.currencyPair.toUpperCase().endsWith("JPY")) {
    pipValueDivisor = 0.01;
  } else {
    pipValueDivisor = 0.0001;
  }

  // Calculate profit in quote currency
  let profitInQuoteCurrency = pips * (contractSize * lot);

  // Convert profit to account currency (assuming account currency is the base for simplicity)
  // For pairs like EUR/USD (where USD is quote), profitInQuoteCurrency is already in USD.
  // For pairs like USD/JPY (where JPY is quote), need to convert from JPY to USD.
  // This is a simplified approach. A more robust solution would need current exchange rates.
  let profitLoss;
  if (trade.currencyPair && trade.currencyPair.toUpperCase().startsWith("USD") && trade.currencyPair.toUpperCase().endsWith("JPY")) {
    // USD/JPY pair, profit in JPY, convert to USD using exit price
    profitLoss = profitInQuoteCurrency / exit;
  } else if (trade.currencyPair && trade.currencyPair.toUpperCase().startsWith("USD")) {
      // USD/XXX pair, profit in XXX, convert to USD using 1/exit rate (simplified)
      profitLoss = profitInQuoteCurrency; // Already in base currency if USD is base
  }
  else if (trade.currencyPair && trade.currencyPair.toUpperCase().endsWith("USD")) {
    // XXX/USD pair, profit in USD (quote currency)
    profitLoss = profitInQuoteCurrency;
  }
  else {
    // Generic case, assuming profitInQuoteCurrency is already the account currency or very close
    // This is a simplification; ideally, you'd need a cross-rate.
    profitLoss = profitInQuoteCurrency;
  }

  // Apply spread and swap (pips are converted to monetary value)
  const spreadCost = spread * pipValueDivisor * contractSize * lot;
  const swapCost = swap * pipValueDivisor * contractSize * lot;

  // Deduct spread and swap from profit/loss
  profitLoss -= spreadCost;
  profitLoss -= swapCost;

  // Use a small tolerance for floating point comparisons to avoid 0.00 for tiny amounts
  const tolerance = 1e-6; // A very small number

  if (Math.abs(profitLoss) < tolerance) {
      return 0; // Treat very small numbers as 0
  }

  return profitLoss;
}


function renderTrades() {
  tradeTableBody.innerHTML = "";
  if (trades.length === 0) {
    noTradesMessage.style.display = 'block';
  } else {
    noTradesMessage.style.display = 'none';
  }

  const sortedTrades = [...trades];
  const sortValue = tradeSortSelect.value;

  switch (sortValue) {
    case 'date-asc':
      sortedTrades.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'date-desc':
      sortedTrades.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case 'pl-asc':
      sortedTrades.sort((a, b) => parseFloat(a.profitOrLoss) - parseFloat(b.profitOrLoss));
      break;
    case 'pl-desc':
      sortedTrades.sort((a, b) => parseFloat(b.profitOrLoss) - parseFloat(a.profitOrLoss));
      break;
    case 'pair':
      sortedTrades.sort((a, b) => a.currencyPair.localeCompare(b.currencyPair));
      break;
  }

  sortedTrades.forEach((trade) => {
    const row = tradeTableBody.insertRow();
    const profitLoss = parseFloat(trade.profitOrLoss);
    const profitLossClass = profitLoss >= 0 ? "trade-profit" : "trade-loss";

    row.innerHTML = `
            <td>${formatDate(trade.date)}</td>
            <td>${trade.type}</td>
            <td>${trade.currencyPair}</td>
            <td>${parseFloat(trade.entryPrice).toFixed(5)}</td>
            <td>${parseFloat(trade.exitPrice).toFixed(5)}</td>
            <td>${parseFloat(trade.lotSize).toFixed(2)}</td>
            <td>${trade.leverage || '-'}</td>
            <td>${trade.strategy || '-'}</td>
            <td>${trade.notes ? trade.notes.substring(0, 30) + (trade.notes.length > 30 ? '...' : '') : '-'}</td>
            <td class="${profitLossClass}">${profitLoss.toFixed(2)}</td>
            <td class="trade-actions">
                <button onclick="editTrade('${trade.id}')"><i class="fas fa-edit"></i></button>
                <button onclick="deleteTrade('${trade.id}')"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
  });
  updateTradeStats();
  updateDashboardStats(); // Update dashboard after trades are rendered
}

tradeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const tradeDate = document.getElementById("trade-date").value;
  const tradeType = document.getElementById("trade-type").value;
  const currencyPair = document.getElementById("currency-pair").value.trim().toUpperCase();
  const entryPrice = parseFloat(document.getElementById("entry-price").value);
  const exitPrice = parseFloat(document.getElementById("exit-price").value);
  const lotSize = parseFloat(document.getElementById("lot-size").value);
  const leverage = document.getElementById("leverage").value ? parseInt(document.getElementById("leverage").value) : null;
  const spread = document.getElementById("spread").value ? parseFloat(document.getElementById("spread").value) : 0;
  const swap = document.getElementById("swap").value ? parseFloat(document.getElementById("swap").value) : 0;
  const strategy = document.getElementById("strategy").value.trim();
  const tradeNotes = document.getElementById("trade-notes").value.trim();

  if (!tradeDate || !tradeType || !currencyPair || isNaN(entryPrice) || isNaN(exitPrice) || isNaN(lotSize) || entryPrice <= 0 || exitPrice <= 0 || lotSize <= 0) {
    alert("Please fill in all required trade fields with valid numbers (Entry/Exit/Lot Size must be positive).");
    return;
  }

  let tradeData = {
    id: generateId(),
    date: tradeDate,
    type: tradeType,
    currencyPair,
    entryPrice,
    exitPrice,
    lotSize,
    leverage,
    spread,
    swap,
    strategy,
    notes: tradeNotes,
  };

  tradeData.profitOrLoss = calculateTradePL(tradeData);

  const editingId = tradeForm.dataset.editingId;

  if (editingId) {
    const tradeIndex = trades.findIndex((t) => t.id === editingId);
    if (tradeIndex !== -1) {
      trades[tradeIndex] = { ...trades[tradeIndex], ...tradeData, id: editingId }; // Preserve ID, update other fields
    }
  } else {
    trades.push(tradeData);
  }

  saveTrades();
  renderTrades();
  clearForms('trade');
  closeForm('trade-form-modal');
});

function editTrade(id) {
  const tradeToEdit = trades.find((trade) => trade.id === id);
  if (!tradeToEdit) return;

  document.getElementById("trade-date").value = tradeToEdit.date;
  document.getElementById("trade-type").value = tradeToEdit.type;
  document.getElementById("currency-pair").value = tradeToEdit.currencyPair;
  document.getElementById("entry-price").value = tradeToEdit.entryPrice;
  document.getElementById("exit-price").value = tradeToEdit.exitPrice;
  document.getElementById("lot-size").value = tradeToEdit.lotSize;
  document.getElementById("leverage").value = tradeToEdit.leverage;
  document.getElementById("spread").value = tradeToEdit.spread;
  document.getElementById("swap").value = tradeToEdit.swap;
  document.getElementById("strategy").value = tradeToEdit.strategy;
  document.getElementById("trade-notes").value = tradeToEdit.notes;

  document.getElementById("trade-form-submit-btn").textContent = "Update Trade";
  tradeForm.dataset.editingId = id;
  openForm('trade-form-modal');
}

function deleteTrade(id) {
  if (confirm("Are you sure you want to delete this trade?")) {
    trades = trades.filter((trade) => trade.id !== id);
    saveTrades();
    renderTrades();
  }
}

function updateTradeStats() {
  const totalPL = trades.reduce((sum, trade) => sum + parseFloat(trade.profitOrLoss), 0);
  const wins = trades.filter((trade) => parseFloat(trade.profitOrLoss) >= 0).length;
  const losses = trades.filter((trade) => parseFloat(trade.profitOrLoss) < 0).length;
  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;

  const winningTrades = trades.filter(trade => parseFloat(trade.profitOrLoss) > 0).map(trade => parseFloat(trade.profitOrLoss));
  const losingTrades = trades.filter(trade => parseFloat(trade.profitOrLoss) < 0).map(trade => parseFloat(trade.profitOrLoss));

  const totalProfit = winningTrades.reduce((sum, pl) => sum + pl, 0);
  const totalLoss = losingTrades.reduce((sum, pl) => sum + Math.abs(pl), 0); // Sum of absolute losses

  const profitFactor = totalLoss > 0 ? (totalProfit / totalLoss) : (totalProfit > 0 ? Infinity : 0); // Handle division by zero

  const avgWin = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;

  const rrr = avgLoss > 0 ? (avgWin / avgLoss) : (avgWin > 0 ? Infinity : 0); // Risk/Reward Ratio

  const bestTrade = trades.length > 0 ? Math.max(...trades.map(t => parseFloat(t.profitOrLoss))) : 0;
  const worstTrade = trades.length > 0 ? Math.min(...trades.map(t => parseFloat(t.profitOrLoss))) : 0;


  totalTradesEl.textContent = trades.length;
  winsEl.textContent = wins;
  lossesEl.textContent = losses;
  winRateEl.textContent = `${winRate.toFixed(2)}%`;
  totalPlEl.textContent = `${totalPL.toFixed(2)}`;
  rrrEl.textContent = `${isFinite(rrr) ? rrr.toFixed(2) : (rrr === Infinity ? 'N/A' : '0.00')}`; // Display N/A for Infinity
  bestTradeEl.textContent = `${bestTrade.toFixed(2)}`;
  worstTradeEl.textContent = `${worstTrade.toFixed(2)}`;
  profitFactorEl.textContent = `${isFinite(profitFactor) ? profitFactor.toFixed(2) : (profitFactor === Infinity ? 'N/A' : '0.00')}`; // Display N/A for Infinity
}

tradeSortSelect.addEventListener('change', renderTrades);

function exportToCSV() {
  if (trades.length === 0) {
    alert("No trade data to export.");
    return;
  }

  const headers = [
    "Date", "Type", "Currency Pair", "Entry Price", "Exit Price", "Lot Size",
    "Leverage", "Spread", "Swap", "Strategy", "Notes", "Profit/Loss"
  ];

  const rows = trades.map(trade => [
    formatDate(trade.date),
    trade.type,
    trade.currencyPair,
    trade.entryPrice,
    trade.exitPrice,
    trade.lotSize,
    trade.leverage || '',
    trade.spread || '',
    trade.swap || '',
    `"${trade.strategy.replace(/"/g, '""')}"`, // Escape quotes for CSV
    `"${trade.notes.replace(/"/g, '""')}"`, // Escape quotes for CSV
    trade.profitOrLoss.toFixed(2)
  ]);

  let csvContent = headers.join(",") + "\n";
  rows.forEach(row => {
    csvContent += row.map(item => {
      // Ensure values that might contain commas or newlines are quoted
      if (typeof item === 'string' && (item.includes(',') || item.includes('\n') || item.includes('"'))) {
        return `"${item.replace(/"/g, '""')}"`;
      }
      return item;
    }).join(",") + "\n";
  });

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "trading_journal.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // Clean up
}

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  renderProjects();
  renderLogs();
  renderTrades(); // This will call updateTradeStats and updateDashboardStats
});

// Navigation smooth scroll (original function, maintained)
function scrollToSection(sectionId) {
  document.querySelector(sectionId).scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}