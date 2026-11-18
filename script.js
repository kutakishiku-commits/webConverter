// возвращает курсы всех валют
const API_URL = "https://open.er-api.com/v6/latest/";

const CURRENCIES = {
  KGS: "Kyrgyzstani Som", USD: "US Dollar", EUR: "Euro", RUB: "Russian Ruble",
  CNY: "Chinese Yuan", KZT: "Kazakhstani Tenge", UZS: "Uzbekistani Som",
  TRY: "Turkish Lira", GBP: "British Pound", JPY: "Japanese Yen",
  KRW: "South Korean Won", AED: "UAE Dirham", INR: "Indian Rupee",
};

// Элементы страницы
const $ = (id) => document.getElementById(id);
const fromEl = $("from"), toEl = $("to"), amountEl = $("amount");
const convertedEl = $("converted"), rateEl = $("rate"), errorEl = $("error");
const panel = $("historyPanel"), listEl = $("historyList");

// выпадающие списки 
for (const [code, name] of Object.entries(CURRENCIES)) {
  fromEl.add(new Option(`${code} - ${name}`, code));
  toEl.add(new Option(`${code} - ${name}`, code));
}
fromEl.value = "CNY";
toEl.value = "USD";

// запрос к API
async function convert() {
  errorEl.textContent = "";
  const amount = parseFloat(amountEl.value);
  const from = fromEl.value, to = toEl.value;

  if (!amount || amount <= 0) {
    errorEl.textContent = "Type number more than 0";
    return;
  }

  convertedEl.textContent = "...";
  try {
    const response = await fetch(API_URL + from);          // запрос
    if (!response.ok) throw new Error("NO RESPOND");
    const data = await response.json();                    // ответ -> объект JS

    if (data.result !== "success") throw new Error("API Error return");
    const rate = data.rates[to];                           // курс from -> to
    if (!rate) throw new Error("No currency for this value");

    const result = amount * rate;
    convertedEl.textContent = `${result.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ${to}`;
    rateEl.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;

    saveHistory(`${amount} ${from} → ${result.toFixed(2)} ${to}`);
  } catch (err) {
    convertedEl.textContent = "—";
    errorEl.textContent = "Check your internet connection";
    console.error(err);
  }
}

// История
function getHistory() {
  return JSON.parse(localStorage.getItem("history") || "[]");
}
function saveHistory(text) {
  const items = getHistory();
  items.unshift({ text, time: new Date().toLocaleString("ru-RU") });
  localStorage.setItem("history", JSON.stringify(items.slice(0, 20))); // последние 20
  renderHistory();
}
function renderHistory() {
  const items = getHistory();
  listEl.innerHTML = items.length
    ? items.map(i => `<li>${i.text}<br><small>${i.time}</small></li>`).join("")
    : "<li>Clear,u should write at least 1 convert request</li>";
}

// Тёмная тема 
function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  $("themeBtn").textContent = dark ? "Light mode" : "Dark mode";
  localStorage.setItem("dark", dark);
}
applyTheme(localStorage.getItem("dark") === "true");

// cобытия
$("convertBtn").addEventListener("click", convert);
amountEl.addEventListener("keydown", (e) => { if (e.key === "Enter") convert(); });
$("swapBtn").addEventListener("click", () => {
  [fromEl.value, toEl.value] = [toEl.value, fromEl.value];
  if (amountEl.value) convert();
});
$("themeBtn").addEventListener("click", () => applyTheme(!document.body.classList.contains("dark")));
$("historyBtn").addEventListener("click", () => { renderHistory(); panel.hidden = false; });
$("closeBtn").addEventListener("click", () => panel.hidden = true);
$("clearBtn").addEventListener("click", () => { localStorage.removeItem("history"); renderHistory(); });