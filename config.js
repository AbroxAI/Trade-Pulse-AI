// ==================== CONFIG.JS ====================
// Shared data and utility functions for the dashboard

const rates = { NGN:1, USD:0.00067, EUR:0.00061, GBP:0.00052 };
const symbols = { NGN:'₦', USD:'$', EUR:'€', GBP:'£' };
let currentCurrency = 'NGN';
const FEE = 50;
let balanceHidden = false;
let overviewPeriod = 'today';

// Settings state (persisted in localStorage)
let settings = { darkMode: true, pushNotifications: true, language: 'en' };
const savedSettings = localStorage.getItem('dashboardSettings');
if (savedSettings) {
  try { settings = JSON.parse(savedSettings); } catch(e) {}
}

const base = {
  homeBalance:322000,
  totalInvested:100000,
  totalProfit:68000,
  totalWithdrawn:154000,
  walletTotal:322000,
  walletAvailable:318000,
  walletLocked:4000,
  nairaWallet:318000,
  withdrawable:318000,
  txFee:FEE,
  activePlans:2,
  planMin1:1000,
  planMax1:49999,
  planMin2:50000,
  planMax2:199999,
  planMin3:200000,
  planMax3:499999,
  planMin4:500000
};

let chartData = [
  { label:'Feb 18', value:0 },
  { label:'Feb 22', value:8000 },
  { label:'Mar 01', value:15000 },
  { label:'Mar 10', value:22000 },
  { label:'Mar 20', value:30000 },
  { label:'Mar 30', value:45000 },
  { label:'Apr 05', value:60000 },
  { label:'Apr 12', value:78000 },
  { label:'Apr 20', value:95000 },
  { label:'Apr 28', value:120000 },
  { label:'May 05', value:150000 },
  { label:'May 10', value:190000 },
  { label:'May 15', value:230000 },
  { label:'May 18', value:270000 },
  { label:'May 22', value:322000 }
];

let allTransactions = [
  { title:'Deposit', subtitle:'From GTBank', meta:'Feb 18, 2026 10:15 AM', amount:15000, amountColor:'#4ade80', iconType:'bank', status:'Completed' },
  { title:'Deposit', subtitle:'From GTBank', meta:'Feb 25, 2026 02:22 PM', amount:20000, amountColor:'#4ade80', iconType:'bank', status:'Completed' },
  { title:'Deposit', subtitle:'From GTBank', meta:'Mar 05, 2026 09:45 AM', amount:30000, amountColor:'#4ade80', iconType:'bank', status:'Completed' },
  { title:'Withdrawal', subtitle:'To Opay', meta:'Mar 15, 2026 05:30 PM', amount:-10000, amountColor:'#f87171', iconType:'opay', status:'Completed' },
  { title:'Deposit', subtitle:'From GTBank', meta:'Mar 28, 2026 11:10 AM', amount:50000, amountColor:'#4ade80', iconType:'bank', status:'Completed' },
  { title:'Withdrawal', subtitle:'To USDT (TRC20)', meta:'Apr 05, 2026 08:20 AM', amount:-20000, amountColor:'#f87171', iconType:'usdt', status:'Completed' },
  { title:'Deposit', subtitle:'From GTBank', meta:'Apr 15, 2026 03:00 PM', amount:80000, amountColor:'#4ade80', iconType:'bank', status:'Completed' },
  { title:'Withdrawal', subtitle:'To Opay', meta:'Apr 28, 2026 09:55 AM', amount:-25000, amountColor:'#f87171', iconType:'opay', status:'Completed' },
  { title:'Deposit', subtitle:'From GTBank', meta:'May 10, 2026 07:15 PM', amount:100000, amountColor:'#4ade80', iconType:'bank', status:'Completed' },
  { title:'Withdrawal', subtitle:'To GTBank', meta:'May 18, 2026 04:30 PM', amount:-50000, amountColor:'#f87171', iconType:'bank', status:'Completed' },
  { title:'Withdrawal', subtitle:'To Opay', meta:'May 22, 2026 12:10 PM', amount:-20000, amountColor:'#f87171', iconType:'opay', status:'Completed' },
  { title:'Deposit', subtitle:'From GTBank', meta:'May 22, 2026 02:00 PM', amount:29000, amountColor:'#4ade80', iconType:'bank', status:'Completed' },
  { title:'Deposit (USDT)', subtitle:'From Binance', meta:'May 15, 2026 11:20 AM', amount:500, amountColor:'#4ade80', currency:'USD', iconType:'usdt', status:'Completed' },
  { title:'Withdrawal (USDT)', subtitle:'To Wallet', meta:'May 20, 2026 09:45 AM', amount:-200, amountColor:'#f87171', currency:'USD', iconType:'usdt', status:'Completed' }
];

let withdrawalsOnly = allTransactions.filter(tx => tx.title.includes('Withdrawal'));

// Utility functions
function convert(a) {
  return (a * rates[currentCurrency]).toFixed(2);
}

function fmt(a) {
  return symbols[currentCurrency] + ' ' + Number(convert(a)).toLocaleString('en', { minimumFractionDigits:2, maximumFractionDigits:2 });
}

function addTransaction(type, amount, subtitle, meta, currency=null, iconType=null) {
  const tx = {
    title: type,
    subtitle,
    meta,
    amount,
    amountColor: amount > 0 ? '#4ade80' : '#f87171',
    iconType: iconType || (amount > 0 ? 'bank' : 'opay'),
    status: 'Completed',
    currency
  };
  allTransactions.push(tx);
  if (type === 'Withdrawal') withdrawalsOnly.push(tx);
}

function getIconSVG(type) {
  if (type === 'bank') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>';
  if (type === 'opay') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M22 8h-6a2 2 0 0 0 0 4h6"/></svg>';
  if (type === 'usdt') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="17" text-anchor="middle" fill="currentColor" font-size="10" font-weight="bold">₮</text></svg>';
  if (type === 'deposit') return '<svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>';
  if (type === 'withdraw') return '<svg viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/></svg>';
  if (type === 'wallet' || type === 'transfer') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7h14"/><path d="m18 4 3 3-3 3"/><path d="M17 17H3"/><path d="m6 14-3 3 3 3"/></svg>';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
}

// Theme application helper
function applyTheme() {
  document.body.classList.toggle('light-mode', !settings.darkMode);
}
