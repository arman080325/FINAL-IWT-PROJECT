// ==============================
// GLOBAL STATE
// ==============================

// Transactions & trip info
let transactions = JSON.parse(localStorage.getItem('travelTransactions')) || [];
let currentTrip = JSON.parse(localStorage.getItem('currentTrip')) || {
  name: 'My Trip',
  destination: 'Worldwide'
};
let tripBudget = parseFloat(localStorage.getItem('tripBudget')) || 0;

// DOM Elements
const elements = {
  balance: document.getElementById('balance'),
  income: document.getElementById('income'),
  expense: document.getElementById('expense'),
  budgetLeft: document.getElementById('budgetLeft'),
  transactionsList: document.getElementById('transactions-list'),
  transactionForm: document.getElementById('transaction-form'),
  tripName: document.getElementById('tripName'),
  tripDestination: document.getElementById('tripDestination'),
  setTripBtn: document.getElementById('setTripBtn'),
  resetBtn: document.getElementById('resetBtn'),
  exportBtn: document.getElementById('exportBtn'),
  date: document.getElementById('date'),
  usdAmount: document.getElementById('usdAmount'),
  convertedAmount: document.getElementById('convertedAmount'),
  currencySelect: document.getElementById('currencySelect'),
  targetFlag: document.getElementById('targetFlag'),
  targetCurrency: document.getElementById('targetCurrency')
};

// Category elements for breakdown
const categoryElements = {
  flights: document.getElementById('flights'),
  accommodation: document.getElementById('accommodation'),
  food: document.getElementById('food'),
  transport: document.getElementById('transport'),
  shopping: document.getElementById('shopping'),
  activities: document.getElementById('activities')
};

// ==============================
// CHART INITIALIZATION
// ==============================

const travelChart = new Chart(document.getElementById('travelChart'), {
  type: 'doughnut',
  data: {
    labels: ['Flights', 'Accommodation', 'Food', 'Transport', 'Activities', 'Shopping', 'Other'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0, 0],
      backgroundColor: [
        '#3498db', '#e74c3c', '#27ae60', '#f39c12',
        '#9b59b6', '#1abc9c', '#34495e'
      ],
      borderWidth: 0,
      hoverOffset: 8
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 20, font: { size: 12 } }
      }
    },
    cutout: '60%'
  }
});

// ==============================
// UTILS
// ==============================

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

function updateTripDisplay() {
  const titleEl = document.querySelector('.travel-info h1');
  if (!titleEl) return;
  titleEl.textContent = `${currentTrip.name} - ${currentTrip.destination}`;
}

// Category totals for chart & summary
function getCategoryTotals() {
  const totals = {};
  Object.keys(categoryElements).forEach(cat => (totals[cat] = 0));
  totals.other = 0;

  transactions.forEach(t => {
    if (categoryElements.hasOwnProperty(t.category)) {
      totals[t.category] += t.amount;
    } else {
      totals.other += t.amount;
    }
  });

  return totals;
}

function updateCategoryBreakdown() {
  const totals = getCategoryTotals();

  Object.keys(categoryElements).forEach(cat => {
    if (categoryElements[cat]) {
      categoryElements[cat].textContent = formatCurrency(totals[cat]);
    }
  });

  const chartData = [
    totals.flights || 0,
    totals.accommodation || 0,
    totals.food || 0,
    totals.transport || 0,
    totals.activities || 0,
    totals.shopping || 0,
    totals.other || 0
  ];

  travelChart.data.datasets[0].data = chartData;
  travelChart.update();
}

// ==============================
// SUMMARY
// ==============================

function updateSummary() {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const budgetPercentage = tripBudget > 0 ? Math.min((totalExpense / tripBudget) * 100, 100) : 0;

  if (elements.balance) elements.balance.textContent = formatCurrency(balance);
  if (elements.income) elements.income.textContent = formatCurrency(totalIncome);
  if (elements.expense) elements.expense.textContent = formatCurrency(totalExpense);
  if (elements.budgetLeft) {
    elements.budgetLeft.textContent = `${budgetPercentage.toFixed(1)}%`;
    elements.budgetLeft.style.color =
      budgetPercentage > 80 ? '#e74c3c' :
      budgetPercentage > 50 ? '#f39c12' :
      '#27ae60';
  }

  updateCategoryBreakdown();
}

// ==============================
// TRANSACTION LIST
// ==============================

function addTransactionDOM(transaction) {
  if (!elements.transactionsList) return;

  const item = document.createElement('div');
  item.classList.add('transaction-item', transaction.type);

  const categoryIcons = {
    flights: 'fas fa-plane',
    accommodation: 'fas fa-bed',
    food: 'fas fa-utensils',
    transport: 'fas fa-car',
    activities: 'fas fa-camera',
    shopping: 'fas fa-shopping-bag',
    insurance: 'fas fa-shield-alt',
    visa: 'fas fa-passport',
    other: 'fas fa-ellipsis-h'
  };

  const iconClass = categoryIcons[transaction.category] || 'fas fa-ellipsis-h';
  const iconColor = transaction.type === 'income' ? '#27ae60' : '#e74c3c';

  item.innerHTML = `
    <div class="transaction-info">
      <div class="transaction-icon" style="background:${iconColor}">
        <i class="${iconClass}"></i>
      </div>
      <div class="transaction-details">
        <h3>${transaction.title}</h3>
        <p>${transaction.date} • ${transaction.category.replace(/\b\w/g, l => l.toUpperCase())} • ${currentTrip.destination}</p>
      </div>
    </div>
    <div class="transaction-amount" style="font-weight:700;font-size:18px;color:${transaction.type === 'income' ? '#27ae60' : '#e74c3c'}">
      ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
    </div>
    <button class="delete-btn" data-id="${transaction.id}" style="background:none;border:none;color:#e74c3c;cursor:pointer;font-size:18px;padding:5px;">
      <i class="fas fa-trash-alt"></i>
    </button>
  `;

  item.querySelector('.delete-btn').addEventListener('click', () => deleteTransaction(transaction.id));

  elements.transactionsList.insertBefore(item, elements.transactionsList.firstChild);
}

// For quick add buttons
window.quickAdd = function (category, amount) {
  const cat = document.getElementById('category');
  const amt = document.getElementById('amount');
  const title = document.getElementById('title');
  if (cat) cat.value = category;
  if (amt) amt.value = amount;
  if (title) title.focus();
};

function generateID() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}

function addTransaction(e) {
  e.preventDefault();

  const titleEl = document.getElementById('title');
  const amountEl = document.getElementById('amount');
  const categoryEl = document.getElementById('category');
  const dateEl = document.getElementById('date');

  const title = titleEl ? titleEl.value.trim() : '';
  const amount = amountEl ? parseFloat(amountEl.value) : NaN;
  const selectedOption = document.querySelector('.radio-option[data-type].selected');
  const category = categoryEl ? categoryEl.value : '';
  const date = dateEl ? dateEl.value : '';

  if (!title || !amount || !(amount > 0) || !selectedOption || !category || !date) {
    alert('Please fill all fields correctly');
    return;
  }

  const type = selectedOption.dataset.type;
  const transaction = {
    id: generateID(),
    title,
    amount,
    type,
    category,
    date: new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  };

  transactions.unshift(transaction);
  localStorage.setItem('travelTransactions', JSON.stringify(transactions));

  addTransactionDOM(transaction);
  updateSummary();

  e.target.reset();
  if (elements.date) elements.date.valueAsDate = new Date();
  document.querySelectorAll('.radio-option').forEach(opt => opt.classList.remove('selected'));

  alert(`✅ ${type === 'income' ? 'Income' : 'Expense'} added successfully!`);
}

function deleteTransaction(id) {
  if (!confirm('Delete this transaction?')) return;

  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem('travelTransactions', JSON.stringify(transactions));
  updateSummary();

  if (elements.transactionsList) {
    elements.transactionsList.innerHTML = '';
    transactions.forEach(addTransactionDOM);
  }
}

// ==============================
// TRIP SETTINGS
// ==============================

function setCurrentTrip() {
  const name = elements.tripName.value.trim() || 'My Trip';
  const destination = elements.tripDestination.value.trim() || 'Worldwide';

  currentTrip = { name, destination };
  localStorage.setItem('currentTrip', JSON.stringify(currentTrip));
  updateTripDisplay();

  alert(`✈️ Trip set: ${name} - ${destination}`);
}

async function exportData() {
  const jsPDF = window.jspdf.jsPDF;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Title
  pdf.setFontSize(24);
  pdf.setTextColor(20, 184, 166);
  pdf.text("Travel Budget Report", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  pdf.setFontSize(16);
  pdf.setTextColor(50, 50, 50);
  pdf.text(`${currentTrip.name}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;
  pdf.text(`${currentTrip.destination}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Summary Stats
  pdf.setFontSize(12);
  pdf.setTextColor(80, 80, 80);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const stats = [
    { label: "Total Income", value: formatCurrency(totalIncome), color: "#27ae60" },
    { label: "Total Spent", value: formatCurrency(totalExpense), color: "#e74c3c" },
    { label: "Remaining Budget", value: formatCurrency(balance), color: balance >= 0 ? "#27ae60" : "#e74c3c" },
    { label: "Transactions", value: transactions.length + " entries", color: "#3498db" }
  ];

  pdf.setFontSize(14);
  stats.forEach(stat => {
    pdf.setTextColor(100, 100, 100);
    pdf.text(stat.label + ":", margin, yPosition);
    pdf.setTextColor(...hexToRgb(stat.color));
    pdf.setFont("helvetica", "bold");
    pdf.text(stat.value, pageWidth - margin, yPosition, { align: "right" });
    pdf.setFont("helvetica", "normal");
    yPosition += 10;
  });

  yPosition += 10;

  // Add Chart as Image
  try {
    const chartCanvas = document.getElementById('travelChart');
    const chartImg = await html2canvas(chartCanvas, { scale: 2 });
    const chartDataUrl = chartImg.toDataURL('image/png');

    const imgWidth = pageWidth - 2 * margin;
    const imgHeight = (chartImg.height * imgWidth) / chartImg.width;

    if (yPosition + imgHeight > pageHeight - 30) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.addImage(chartDataUrl, 'PNG', margin, yPosition, imgWidth, imgHeight);
    yPosition += imgHeight + 15;
  } catch (err) {
    console.warn("Chart capture failed, skipping chart");
  }

  // Transactions Table
  if (transactions.length > 0) {
    pdf.setFontSize(16);
    pdf.setTextColor(20, 184, 166);
    pdf.text("Transaction History", margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);

    const tableData = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.title,
      t.category.replace(/\b\w/g, l => l.toUpperCase()),
      t.type === 'income' ? '+ ' + formatCurrency(t.amount) : '- ' + formatCurrency(t.amount)
    ]);

    pdf.autoTable({
      head: [['Date', 'Description', 'Category', 'Amount']],
      body: tableData,
      startY: yPosition,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [20, 184, 166], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: margin, right: margin }
    });

    yPosition = pdf.lastAutoTable.finalY + 15;
  }

  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Generated on ${new Date().toLocaleString()} • Powered by TripBoss`, pageWidth / 2, pageHeight - 10, { align: "center" });

  // Download
  const fileName = `Travel_Budget_${currentTrip.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0,10)}.pdf`;
  pdf.save(fileName);

  alert("PDF Exported Successfully! Check your downloads folder.");
}

// Helper to convert hex color to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
}

function resetData() {
  if (!confirm('⚠️ Delete all trip data? This cannot be undone!')) return;

  transactions = [];
  currentTrip = { name: 'My Trip', destination: 'Worldwide' };
  tripBudget = 0;

  localStorage.removeItem('travelTransactions');
  localStorage.removeItem('currentTrip');
  localStorage.removeItem('tripBudget');

  updateSummary();
  if (elements.transactionsList) elements.transactionsList.innerHTML = '';
  updateTripDisplay();

  alert('🗑️ All data has been reset!');
}

// ==============================
// RADIO BUTTON UI
// ==============================

function setupRadioButtons() {
  const radioOptions = document.querySelectorAll('.radio-option');

  radioOptions.forEach(option => {
    option.addEventListener('click', function () {
      radioOptions.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');

      const originalTransform = this.style.transform;
      this.style.transform = 'scale(0.98)';
      setTimeout(() => {
        this.style.transform = originalTransform;
      }, 150);

      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      this.style.background = 'rgba(255, 255, 255, 0.8)';
      setTimeout(() => {
        this.style.background = '';
      }, 100);
    });
  });
}

// ==============================
// CURRENCY CONVERTER
// ==============================

// Static rates vs USD
const currencyData = {
  // Popular
  USD: { code: 'USD', name: 'United States Dollar', flag: '🇺🇸', rate: 1.00, region: 'popular' },
  EUR: { code: 'EUR', name: 'Euro', flag: '🇪🇺', rate: 0.92, region: 'popular' },
  GBP: { code: 'GBP', name: 'British Pound', flag: '🇬🇧', rate: 0.79, region: 'popular' },
  JPY: { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', rate: 150.50, region: 'popular' },
  AUD: { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', rate: 1.51, region: 'popular' },

  // Europe
  CHF: { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', rate: 0.87, region: 'europe' },
  SEK: { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪', rate: 10.50, region: 'europe' },
  NOK: { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴', rate: 10.80, region: 'europe' },
  DKK: { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰', rate: 6.90, region: 'europe' },
  CZK: { code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿', rate: 23.00, region: 'europe' },
  RUB: { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺', rate: 97.00, region: 'europe' },
  TRY: { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷', rate: 34.00, region: 'europe' },

  // Asia
  CNY: { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', rate: 7.20, region: 'asia' },
  INR: { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', rate: 83.50, region: 'asia' },
  KRW: { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷', rate: 1350.00, region: 'asia' },
  SGD: { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', rate: 1.34, region: 'asia' },
  THB: { code: 'THB', name: 'Thai Baht', flag: '🇹🇭', rate: 36.50, region: 'asia' },
  PHP: { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭', rate: 58.00, region: 'asia' },
  ILS: { code: 'ILS', name: 'Israeli Shekel', flag: '🇮🇱', rate: 3.75, region: 'asia' },
  AED: { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', rate: 3.67, region: 'asia' },
  SAR: { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', rate: 3.75, region: 'asia' },

  // Americas
  CAD: { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', rate: 1.38, region: 'america' },
  MXN: { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽', rate: 19.50, region: 'america' },
  BRL: { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷', rate: 5.60, region: 'america' },
  ARS: { code: 'ARS', name: 'Argentine Peso', flag: '🇦🇷', rate: 950.00, region: 'america' },
  CLP: { code: 'CLP', name: 'Chilean Peso', flag: '🇨🇱', rate: 950.00, region: 'america' },

  // Africa
  ZAR: { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', rate: 18.50, region: 'africa' },
  NGN: { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', rate: 1600.00, region: 'africa' },
  KES: { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪', rate: 130.00, region: 'africa' },

  // Oceania
  NZD: { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿', rate: 1.65, region: 'oceania' }
};

let conversionHistory = JSON.parse(localStorage.getItem('currencyHistory')) || [];
let currentSource = 'USD';
let currentTarget = 'EUR';

function initCurrencyConverter() {
  populateCurrencyGrid();
  setupTabFunctionality();
  setupInputListeners();
  setupSwapFunctionality();
  updateConversionDisplay();
  loadConversionHistory();
  updateTimestamp();

  // Fade-in
  const converter = document.querySelector('.currency-converter.enhanced');
  if (converter) {
    converter.style.opacity = '0';
    converter.style.transform = 'translateY(30px)';
    setTimeout(() => {
      converter.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      converter.style.opacity = '1';
      converter.style.transform = 'translateY(0)';
    }, 100);
  }

  // Auto animation every 3 sec if value exists
  setInterval(() => {
    const usdInput = document.getElementById('usdAmount');
    if (usdInput && usdInput.value) {
      animateConversion(parseFloat(usdInput.value) || 0);
    }
  }, 3000);

  // Default tab click
  const defaultTab = document.querySelector('.tab-btn.active') || document.querySelector('.tab-btn[data-target="popular"]');
  if (defaultTab) defaultTab.click();
}

// Build grid of currencies
function populateCurrencyGrid() {
  const grid = document.getElementById('currencyGrid');
  if (!grid) return;

  const regions = ['popular', 'europe', 'asia', 'america', 'africa', 'oceania'];

  regions.forEach(region => {
    const currencies = Object.values(currencyData).filter(c => c.region === region);
    currencies.forEach(currency => {
      const item = document.createElement('div');
      item.className = 'currency-item';
      item.dataset.currency = currency.code;
      item.dataset.region = currency.region;
      item.innerHTML = `
        <div class="currency-flag-grid">${currency.flag}</div>
        <div class="currency-code-grid">${currency.code}</div>
        <div class="currency-name-grid">${currency.name}</div>
      `;
      item.addEventListener('click', () => selectCurrencyTarget(item, currency));
      grid.appendChild(item);
    });
  });
}

// Tabs that filter the grid
function setupTabFunctionality() {
  const tabs = document.querySelectorAll('.tab-btn');
  const items = document.querySelectorAll('.currency-item');

  if (!tabs.length || !items.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      const target = this.dataset.target;

      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      items.forEach(item => {
        const code = item.dataset.currency;
        const curr = currencyData[code];
        if (!curr) return;
        item.style.display = (target === 'all' || curr.region === target) ? 'block' : 'none';
      });

      document.querySelectorAll('.currency-item').forEach((item, index) => {
        if (item.style.display !== 'none') {
          setTimeout(() => {
            item.style.animation = 'fadeInUp 0.5s ease forwards';
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
            }, 50);
          }, index * 50);
        }
      });
    });
  });
}

// Input listeners
function setupInputListeners() {
  const usdInput = document.getElementById('usdAmount');
  const resultInput = document.getElementById('convertedAmount');

  if (!usdInput || !resultInput) return;

  usdInput.addEventListener('input', function () {
    const value = parseFloat(this.value) || 0;
    animateConversion(value);
    addToHistory();
  });

  resultInput.addEventListener('animationend', function () {
    this.style.transform = 'scale(1)';
    this.style.opacity = '1';
  });
}

// Swap USD ↔ Target
function setupSwapFunctionality() {
  const swapBtn = document.getElementById('swapBtn');
  if (!swapBtn) return;

  swapBtn.addEventListener('click', function () {
    const temp = currentSource;
    currentSource = currentTarget;
    currentTarget = temp;

    const sourceCurrency = currencyData[currentSource];
    const targetCurrency = currencyData[currentTarget];

    const sourceFlagEl = document.getElementById('sourceFlag');
    const sourceCodeEl = document.getElementById('sourceCode');
    const sourceNameEl = document.getElementById('sourceCurrencyName');
    const targetFlagEl = document.getElementById('targetFlag');
    const targetCodeEl = document.getElementById('targetCode');
    const targetNameEl = document.getElementById('targetCurrencyName') || document.getElementById('targetCurrency');

    if (sourceFlagEl) sourceFlagEl.textContent = sourceCurrency.flag;
    if (sourceCodeEl) sourceCodeEl.textContent = sourceCurrency.code;
    if (sourceNameEl) sourceNameEl.textContent = sourceCurrency.name;

    if (targetFlagEl) targetFlagEl.textContent = targetCurrency.flag;
    if (targetCodeEl) targetCodeEl.textContent = targetCurrency.code;
    if (targetNameEl) targetNameEl.textContent = targetCurrency.name;

    const usdInput = document.getElementById('usdAmount');
    const resultInput = document.getElementById('convertedAmount');
    const usdValue = resultInput ? parseFloat(resultInput.value) || 0 : 0;
    const convertedValue = usdInput ? parseFloat(usdInput.value) || 0 : 0;

    if (usdInput) usdInput.value = usdValue ? usdValue.toFixed(2) : '';
    animateConversion(convertedValue);

    this.style.animation = 'rotate360 0.6s ease';
    setTimeout(() => {
      this.style.animation = '';
    }, 600);
  });
}

// When a grid item is clicked
function selectCurrencyTarget(element, currency) {
  document.querySelectorAll('.currency-item').forEach(item => item.classList.remove('selected'));
  element.classList.add('selected');

  currentTarget = currency.code;

  const targetFlagEl = document.getElementById('targetFlag');
  const targetCodeEl = document.getElementById('targetCode');
  const targetNameEl = document.getElementById('targetCurrencyName') || document.getElementById('targetCurrency');

  if (targetFlagEl) targetFlagEl.textContent = currency.flag;
  if (targetCodeEl) targetCodeEl.textContent = currency.code;
  if (targetNameEl) targetNameEl.textContent = currency.name;

  element.style.transform = 'scale(0.95)';
  setTimeout(() => {
    element.style.transform = 'scale(1.05)';
  }, 150);
  setTimeout(() => {
    element.style.transform = 'translateY(-3px) scale(1.03)';
  }, 300);

  const usdInput = document.getElementById('usdAmount');
  const usdValue = usdInput ? parseFloat(usdInput.value) || 0 : 0;
  animateConversion(usdValue);
}

// Core conversion
function animateConversion(amount = 0) {
  const targetCurrency = currencyData[currentTarget];
  if (!targetCurrency) return;

  const converted = amount * targetCurrency.rate;
  const resultInput = document.getElementById('convertedAmount');
  const rateEl = document.getElementById('currentRate');

  if (!resultInput) return;

  resultInput.style.transform = 'scale(1.1)';
  resultInput.style.opacity = '0.7';

  setTimeout(() => {
    resultInput.value = converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    resultInput.style.transform = 'scale(1)';
    resultInput.style.opacity = '1';

    if (rateEl) {
      rateEl.textContent = `1 ${currentSource} = ${targetCurrency.rate.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      })} ${currentTarget}`;
    }
  }, 200);

  updateTimestamp();
}

// History
function addToHistory() {
  const usdInput = document.getElementById('usdAmount');
  const convertedInput = document.getElementById('convertedAmount');
  if (!usdInput || !convertedInput) return;

  const usdValue = parseFloat(usdInput.value) || 0;
  const convertedValue = parseFloat(convertedInput.value) || 0;

  if (usdValue > 0) {
    const historyItem = {
      from: currentSource,
      fromAmount: usdValue,
      to: currentTarget,
      toAmount: convertedValue,
      timestamp: new Date().toISOString()
    };

    conversionHistory.unshift(historyItem);
    if (conversionHistory.length > 10) {
      conversionHistory = conversionHistory.slice(0, 10);
    }

    localStorage.setItem('currencyHistory', JSON.stringify(conversionHistory));
    updateHistoryDisplay();
  }
}

function updateHistoryDisplay() {
  const historyList = document.getElementById('historyList');
  if (!historyList) return;

  if (conversionHistory.length === 0) {
    historyList.innerHTML = '<div class="history-item placeholder">No conversions yet</div>';
    return;
  }

  historyList.innerHTML = conversionHistory.map(item => {
    const timeAgo = getTimeAgo(item.timestamp);
    return `
      <div class="history-item">
        <span>${item.fromAmount.toLocaleString()} ${item.from} → ${item.toAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${item.to}</span>
        <small>${timeAgo}</small>
      </div>
    `;
  }).join('');
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diff = now - then;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
  return `${Math.floor(diff / 86400000)} day ago`;
}

function updateTimestamp() {
  const updateTimeEl = document.getElementById('updateTime');
  if (!updateTimeEl) return;

  const now = new Date();
  updateTimeEl.textContent = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function updateConversionDisplay() {
  const sourceCurrency = currencyData[currentSource];
  const targetCurrency = currencyData[currentTarget];

  const sourceFlagEl = document.getElementById('sourceFlag');
  const sourceCodeEl = document.getElementById('sourceCode');
  const sourceNameEl = document.getElementById('sourceCurrencyName');
  const targetFlagEl = document.getElementById('targetFlag');
  const targetCodeEl = document.getElementById('targetCode');
  const targetNameEl = document.getElementById('targetCurrencyName') || document.getElementById('targetCurrency');

  if (sourceFlagEl) sourceFlagEl.textContent = sourceCurrency.flag;
  if (sourceCodeEl) sourceCodeEl.textContent = sourceCurrency.code;
  if (sourceNameEl) sourceNameEl.textContent = sourceCurrency.name;

  if (targetFlagEl) targetFlagEl.textContent = targetCurrency.flag;
  if (targetCodeEl) targetCodeEl.textContent = targetCurrency.code;
  if (targetNameEl) targetNameEl.textContent = targetCurrency.name;
}

function loadConversionHistory() {
  updateHistoryDisplay();
}

// ==============================
// MAIN INITIALIZER
// ==============================

document.addEventListener('DOMContentLoaded', function () {
  // Trip defaults
  if (elements.tripName) elements.tripName.value = currentTrip.name || 'My Trip';
  if (elements.tripDestination) elements.tripDestination.value = currentTrip.destination || 'Worldwide';
  if (elements.date) elements.date.valueAsDate = new Date();

  // Event listeners
  if (elements.transactionForm) elements.transactionForm.addEventListener('submit', addTransaction);
  if (elements.setTripBtn) elements.setTripBtn.addEventListener('click', setCurrentTrip);
  if (elements.exportBtn) elements.exportBtn.addEventListener('click', exportData);
  if (elements.resetBtn) elements.resetBtn.addEventListener('click', resetData);

  // UI init
  setupRadioButtons();
  initCurrencyConverter();

  // Load existing transactions
  transactions.forEach(addTransactionDOM);

  // Initial render
  updateTripDisplay();
  updateSummary();
});
