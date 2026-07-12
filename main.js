// ===== Trade Pulse AI – main.js (FULL FILE – ALL FIXES, INCLUDING PROFILE PHOTO SYNC) =====
(function() {
  const $ = (id) => document.getElementById(id);
  const rates = { USDT:0.000667, USD:0.00067, EUR:0.00061, GBP:0.00052, NGN:1 };
  const symbols = { USDT:'₮', USD:'$', EUR:'€', GBP:'£', NGN:'₦' };
  let currentCurrency = 'NGN';
  const FEE = 50;
  let balanceHidden = false;
  let overviewPeriod = 'today';
  let currentUser = null;
  let currentInvestMinInCurrency = 0;

  // ========== PAYMENT ACCOUNTS ==========
  const paymentAccounts = {
    NGN:  { bank: 'Jaiz Bank', accountNumber: '0025722037', accountName: 'Anthony Diamond' },
    USDT: { bank: 'USDT TRC20 Network', accountNumber: 'TY23RUXeNaibpnTnvxxu18qiqtMpDws6yB', accountName: '' },
    USD:  { bank: 'Bank of America', accountNumber: '482715936204', routingNumber: '026009593', accountName: 'Anthony Diamond' },
    EUR:  { bank: 'Deutsche Bank', accountNumber: '9876543210', iban: 'DE12 5007 0010 9876 5432 10', bic: 'DEUTDEFFXXX', blz: '50070010', accountName: 'Anthony Diamond' },
    GBP:  { bank: 'Barclays', accountNumber: '47289163', sortCode: '20-45-67', iban: 'GB29 BARC 204567 47289163', bic: 'BARCGB22', accountName: 'Anthony Diamond' }
  };

  // ========== WITHDRAWAL BANKS PER CURRENCY ==========
  const withdrawalBanks = {
    NGN: [
      { name: 'GTBank', icon: 'assets/banks/gtbank.png' },
      { name: 'Access Bank', icon: 'assets/banks/access.png' },
      { name: 'Opay', icon: 'assets/banks/opay.png' },
      { name: 'First Bank', icon: 'assets/banks/firstbank.png' },
      { name: 'UBA', icon: 'assets/banks/uba.png' },
      { name: 'Zenith Bank', icon: 'assets/banks/zenith.png' },
      { name: 'Palmpay', icon: 'assets/banks/palmpay.png' },
      { name: 'Kuda Bank', icon: 'assets/banks/kuda.png' },
      { name: 'Wema Bank', icon: 'assets/banks/wema.png' }
    ],
    USD: [
      { name: 'Bank of America', icon: 'assets/banks/boa.png' },
      { name: 'Chase', icon: 'assets/banks/chase.png' },
      { name: 'Wells Fargo', icon: 'assets/banks/wells_fargo.png' },
      { name: 'Citibank', icon: 'assets/banks/citibank.png' },
      { name: 'PayPal', icon: 'assets/banks/paypal.png' },
      { name: 'Cash App', icon: 'assets/banks/cashapp.png' },
      { name: 'Venmo', icon: 'assets/banks/venmo.png' },
      { name: 'Zelle', icon: 'assets/banks/zelle.png' },
      { name: 'USAA', icon: 'assets/banks/usaa.png' }
    ],
    EUR: [
      { name: 'Deutsche Bank', icon: 'assets/banks/deutsche.png' },
      { name: 'BNP Paribas', icon: 'assets/banks/bnp_paribas.png' },
      { name: 'ING', icon: 'assets/banks/ing.png' },
      { name: 'Santander', icon: 'assets/banks/santander.png' },
      { name: 'Revolut', icon: 'assets/banks/revolut.png' },
      { name: 'N26', icon: 'assets/banks/n26.png' },
      { name: 'Bunq', icon: 'assets/banks/bunq.png' },
      { name: 'Commerzbank', icon: 'assets/banks/commerzbank.png' },
      { name: 'Vivid', icon: 'assets/banks/vivid.png' }
    ],
    GBP: [
      { name: 'Barclays', icon: 'assets/banks/barclays.png' },
      { name: 'HSBC UK', icon: 'assets/banks/hsbc_uk.png' },
      { name: 'Lloyds', icon: 'assets/banks/lloyds.png' },
      { name: 'NatWest', icon: 'assets/banks/natwest.png' },
      { name: 'Monzo', icon: 'assets/banks/monzo.png' },
      { name: 'Starling', icon: 'assets/banks/starling.png' },
      { name: 'Revolut UK', icon: 'assets/banks/revolut_uk.png' },
      { name: 'Metro Bank', icon: 'assets/banks/metro.png' },
      { name: 'Halifax', icon: 'assets/banks/halifax.png' }
    ],
    USDT: [
      { name: 'Binance Pay', icon: 'assets/banks/binance.png' },
      { name: 'Bybit', icon: 'assets/banks/bybit.png' },
      { name: 'OKX', icon: 'assets/banks/okx.png' },
      { name: 'Coinbase', icon: 'assets/banks/coinbase.png' },
      { name: 'Kraken', icon: 'assets/banks/kraken.png' },
      { name: 'Trust Wallet', icon: 'assets/banks/trustwallet.png' },
      { name: 'MetaMask', icon: 'assets/banks/metamask.png' },
      { name: 'KuCoin', icon: 'assets/banks/kucoin.png' },
      { name: 'Huobi', icon: 'assets/banks/huobi.png' }
    ]
  };

  const depositPresets = {
    NGN: [7500, 10000, 25000, 50000, 100000],
    USD: [5, 10, 50, 100, 500, 1000],
    EUR: [5, 10, 50, 100, 500, 1000],
    GBP: [5, 10, 50, 100, 500, 1000],
    USDT: [5, 10, 50, 100, 500, 1000]
  };

  const withdrawPresets = {
    NGN: [1000, 5000, 10000, 50000, 'max'],
    USD: [50, 100, 200, 500, 'max'],
    EUR: [50, 100, 200, 500, 'max'],
    GBP: [50, 100, 200, 500, 'max'],
    USDT: [10, 50, 100, 500, 'max']
  };

  // ----- Helpers -----
  function openModal(id) { const el = $(id); if (el) el.classList.add('open'); }
  function closeModal(id) { const el = $(id); if (el) el.classList.remove('open'); }

  function getStoredUser() {
    try { return JSON.parse(sessionStorage.getItem('tradePulseCurrentUser') || 'null'); } catch { return null; }
  }

  function saveUser(user) {
    sessionStorage.setItem('tradePulseLoggedIn', 'true');
    sessionStorage.setItem('tradePulseCurrentUser', JSON.stringify(user));
    currentUser = user;
    try {
      const users = JSON.parse(localStorage.getItem('tradePulseUsers') || '[]');
      const idx = users.findIndex(u => u.username === user.username);
      if (idx !== -1) users[idx] = user;
      else users.push(user);
      localStorage.setItem('tradePulseUsers', JSON.stringify(users));
      localStorage.setItem('tradePulseUser', JSON.stringify(user));
    } catch(e) {}
    updateDrawerUserInfo();
    updateAll();
    // Force a second update to ensure avatar shows immediately
    setTimeout(() => updateDrawerUserInfo(), 50);
  }

  // ★ Bridge to profile.js – keeps internal currentUser in sync
  window.updateCurrentUser = (user) => { currentUser = user; };

  function showProcessing(text) {
    const overlay = $('processingOverlay');
    const label = document.querySelector('.processing-text');
    if (label) label.textContent = text || 'Processing...';
    if (overlay) overlay.classList.add('open');
  }

  function hideProcessing() {
    const overlay = $('processingOverlay');
    if (overlay) overlay.classList.remove('open');
  }

  function showSuccess(title, message) {
    console.log(title, message);
  }

  function showPaymentNotDetected() {
    const existing = document.getElementById('paymentNotDetectedModal');
    if (existing) existing.remove();
    const modalDiv = document.createElement('div');
    modalDiv.id = 'paymentNotDetectedModal';
    modalDiv.className = 'modal-overlay open';
    modalDiv.innerHTML = `
      <div class="modal-panel" style="text-align:center;">
        <div class="modal-header">
          <div class="modal-title">Payment Not Detected</div>
          <button class="modal-close-btn" id="closePaymentNotDetectedBtn">✕</button>
        </div>
        <div class="notice-box">
          <div class="notice-text">Payment not detected. Please contact support or retry again.</div>
        </div>
        <div style="display:flex; gap:12px; margin-top:20px;">
          <button id="paymentRetryBtn" class="withdraw-btn" style="flex:1;">Retry</button>
          <button id="paymentSupportBtn" class="btn btn-outline" style="flex:1;">Contact Support</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
    document.getElementById('closePaymentNotDetectedBtn').addEventListener('click', () => modalDiv.remove());
    document.getElementById('paymentRetryBtn').addEventListener('click', () => modalDiv.remove());
    document.getElementById('paymentSupportBtn').addEventListener('click', () => {
      window.open('https://t.me/trade_pulse_ai_support', '_blank');
      modalDiv.remove();
    });
    modalDiv.addEventListener('click', (e) => { if (e.target === modalDiv) modalDiv.remove(); });
  }

  function showDepositFirstModal() {
    const existing = document.getElementById('depositFirstModal');
    if (existing) existing.remove();
    const modalDiv = document.createElement('div');
    modalDiv.id = 'depositFirstModal';
    modalDiv.className = 'modal-overlay open';
    modalDiv.innerHTML = `
      <div class="modal-panel" style="text-align:center;">
        <div class="modal-header">
          <div class="modal-title">Deposit First</div>
          <button class="modal-close-btn" id="closeDepositFirstModalBtn">✕</button>
        </div>
        <div class="notice-box">
          <div class="notice-text">You need to deposit funds before using this feature.</div>
        </div>
        <div style="display:flex; gap:12px; margin-top:20px;">
          <button id="depositFirstGoBtn" class="withdraw-btn" style="flex:1;">Deposit Now</button>
          <button id="depositFirstCancelBtn" class="btn btn-outline" style="flex:1;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
    document.getElementById('closeDepositFirstModalBtn').addEventListener('click', () => modalDiv.remove());
    document.getElementById('depositFirstCancelBtn').addEventListener('click', () => modalDiv.remove());
    document.getElementById('depositFirstGoBtn').addEventListener('click', () => {
      modalDiv.remove();
      openDepositModal();
    });
    modalDiv.addEventListener('click', (e) => { if (e.target === modalDiv) modalDiv.remove(); });
  }

  function showInsufficientBalanceModal() {
    const existing = document.getElementById('insufficientBalanceModal');
    if (existing) existing.remove();
    const modalDiv = document.createElement('div');
    modalDiv.id = 'insufficientBalanceModal';
    modalDiv.className = 'modal-overlay open';
    modalDiv.innerHTML = `
      <div class="modal-panel" style="text-align:center;">
        <div class="modal-header">
          <div class="modal-title">Insufficient Balance</div>
          <button class="modal-close-btn" id="closeInsufficientModalBtn">✕</button>
        </div>
        <div class="notice-box">
          <div class="notice-text">You have no funds to withdraw. Please deposit first.</div>
        </div>
        <div style="display:flex; gap:12px; margin-top:20px;">
          <button id="insufficientGoDeposit" class="withdraw-btn" style="flex:1;">Deposit Now</button>
          <button id="insufficientCancel" class="btn btn-outline" style="flex:1;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
    document.getElementById('closeInsufficientModalBtn').addEventListener('click', () => modalDiv.remove());
    document.getElementById('insufficientCancel').addEventListener('click', () => modalDiv.remove());
    document.getElementById('insufficientGoDeposit').addEventListener('click', () => {
      modalDiv.remove();
      openDepositModal();
    });
    modalDiv.addEventListener('click', (e) => { if (e.target === modalDiv) modalDiv.remove(); });
  }

  function convert(amount) { return (amount * rates[currentCurrency]).toFixed(2); }
  function fmt(amount, isUSDT = false) {
    if (isUSDT) return amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDT';
    const symbol = symbols[currentCurrency];
    const converted = amount * rates[currentCurrency];
    return `${symbol} ${converted.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // ========== BASE – scaled old user ==========
  let base = {
    homeBalance: 1460243,
    totalInvested: 658000,
    totalProfit: 517000,
    totalWithdrawn: 1277225,
    walletTotal: 1460243,
    walletAvailable: 1450843,
    walletLocked: 9400,
    nairaWallet: 1450843,
    withdrawable: 1450843,
    txFee: FEE,
    activePlans: 3,
    planMin1: 10000,
    planMax1: 49999,
    planMin2: 50000,
    planMax2: 199999,
    planMin3: 200000,
    planMax3: 499999,
    planMin4: 500000
  };

  const planRates = {
    beginner: { range: '3.0%', avg: 3.0 },
    standard: { range: '3.5%', avg: 3.5 },
    premium:  { range: '4.0%', avg: 4.0 },
    vip:      { range: '4.5%', avg: 4.5 }
  };
  let currentPlanAvg = 0;

  // ========== CHART DATA (scaled) ==========
  let chartData = [
    { label:'Feb 18', value:0 },
    { label:'Feb 22', value:18800 },
    { label:'Mar 01', value:42300 },
    { label:'Mar 10', value:98700 },
    { label:'Mar 20', value:169200 },
    { label:'Mar 30', value:270250 },
    { label:'Apr 05', value:380700 },
    { label:'Apr 12', value:521700 },
    { label:'Apr 20', value:683850 },
    { label:'Apr 28', value:834250 },
    { label:'May 05', value:984650 },
    { label:'May 10', value:1146800 },
    { label:'May 15', value:1290150 },
    { label:'May 18', value:1391200 },
    { label:'May 22', value:1460243 }
  ];

  // ========== TRANSACTIONS (scaled) ==========
  let allTransactions = [
    { title:'Deposit', subtitle:'From GTBank', meta:'Feb 10, 2026 09:15 AM', amount:352500, amountColor:'#4ade80', iconType:'bank', status:'Completed' },
    { title:'Deposit', subtitle:'From GTBank', meta:'Feb 12, 2026 11:20 AM', amount:470000, amountColor:'#4ade80', iconType:'bank', status:'Completed' },
    { title:'Deposit', subtitle:'From Palmpay', meta:'Feb 14, 2026 03:45 PM', amount:822500, amountColor:'#4ade80', iconType:'opay', status:'Completed' },
    { title:'Withdrawal', subtitle:'To Access Bank', meta:'Feb 16, 2026 10:30 AM', amount:-58750, amountColor:'#f87171', iconType:'bank', status:'Completed' },
    { title:'Withdrawal', subtitle:'To Opay', meta:'Feb 20, 2026 02:10 PM', amount:-42300, amountColor:'#f87171', iconType:'opay', status:'Completed' },
    { title:'Deposit', subtitle:'From GTBank', meta:'Feb 25, 2026 01:00 PM', amount:282000, amountColor:'#4ade80', iconType:'bank', status:'Completed' },
    { title:'Withdrawal', subtitle:'To GTBank', meta:'Mar 01, 2026 09:05 AM', amount:-75200, amountColor:'#f87171', iconType:'bank', status:'Completed' },
    { title:'Withdrawal', subtitle:'To First Bank', meta:'Mar 08, 2026 04:20 PM', amount:-51700, amountColor:'#f87171', iconType:'bank', status:'Completed' },
    { title:'Deposit', subtitle:'From Palmpay', meta:'Mar 15, 2026 07:30 AM', amount:188000, amountColor:'#4ade80', iconType:'opay', status:'Completed' },
    { title:'Withdrawal', subtitle:'To UBA', meta:'Mar 22, 2026 11:55 AM', amount:-106925, amountColor:'#f87171', iconType:'bank', status:'Completed' },
    { title:'Withdrawal', subtitle:'To Zenith Bank', meta:'Mar 30, 2026 08:15 AM', amount:-70500, amountColor:'#f87171', iconType:'bank', status:'Completed' },
    { title:'Deposit', subtitle:'From GTBank', meta:'Apr 05, 2026 10:45 AM', amount:223250, amountColor:'#4ade80', iconType:'bank', status:'Completed' },
    { title:'Withdrawal', subtitle:'To Palmpay', meta:'Apr 10, 2026 05:10 PM', amount:-85775, amountColor:'#f87171', iconType:'opay', status:'Completed' },
    { title:'Withdrawal', subtitle:'To GTBank', meta:'Apr 18, 2026 12:20 PM', amount:-122200, amountColor:'#f87171', iconType:'bank', status:'Completed' },
    { title:'Deposit', subtitle:'From Binance (USDT)', meta:'Apr 25, 2026 02:30 PM', amount:1762, amountColor:'#4ade80', currency:'USD', iconType:'usdt', status:'Completed' },
    { title:'Withdrawal', subtitle:'To Opay', meta:'May 02, 2026 09:40 AM', amount:-96350, amountColor:'#f87171', iconType:'opay', status:'Completed' },
    { title:'Withdrawal', subtitle:'To First Bank', meta:'May 10, 2026 03:15 PM', amount:-90475, amountColor:'#f87171', iconType:'bank', status:'Completed' },
    { title:'Deposit', subtitle:'From Palmpay', meta:'May 15, 2026 06:05 AM', amount:152750, amountColor:'#4ade80', iconType:'opay', status:'Completed' },
    { title:'Withdrawal', subtitle:'To Access Bank', meta:'May 22, 2026 07:50 AM', amount:-68150, amountColor:'#f87171', iconType:'bank', status:'Completed' },
    { title:'Withdrawal', subtitle:'To UBA', meta:'Jun 01, 2026 01:25 PM', amount:-108100, amountColor:'#f87171', iconType:'bank', status:'Completed' },
    { title:'Deposit', subtitle:'From GTBank', meta:'Jun 08, 2026 11:00 AM', amount:246597, amountColor:'#4ade80', iconType:'bank', status:'Completed' },
    { title:'Withdrawal', subtitle:'To Palmpay', meta:'Jun 12, 2026 04:35 PM', amount:-82250, amountColor:'#f87171', iconType:'opay', status:'Completed' },
    { title:'Withdrawal (USDT)', subtitle:'To Wallet', meta:'Jun 16, 2026 09:20 AM', amount:-470, amountColor:'#f87171', currency:'USD', iconType:'usdt', status:'Completed' }
  ];
  allTransactions.forEach((tx, i) => { tx.id = i + 1; });
  let withdrawalsOnly = allTransactions.filter(tx => tx.title.includes('Withdrawal'));

  let notifications = [];
  function updateNotificationBadge() {
    const unread = notifications.filter(n => !n.read).length;
    const topBadge = $('notificationBadge');
    if (topBadge) {
      topBadge.textContent = unread;
      topBadge.style.display = unread > 0 ? 'flex' : 'none';
    }
  }

  function renderNotificationsModal() {
    const list = $('notificationsList');
    if (!list) return;
    if (!notifications.length) {
      list.innerHTML = '<div style="padding:20px;text-align:center;color:#9ca3af;">No notifications yet</div>';
      updateNotificationBadge();
      return;
    }
    list.innerHTML = notifications.map(n => `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05);opacity:${n.read ? 0.72 : 1};">
        <div class="tx-ico" style="background:${n.type === 'success' ? 'rgba(34,197,94,.12)' : 'rgba(168,85,247,.12)'}">
          ${n.type === 'success'
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>'}
        </div>
        <div style="min-width:0;">
          <div style="font-weight:600;">${n.title}</div>
          <div style="font-size:12px;color:#9ca3af;">${n.message}</div>
          <div style="font-size:10px;color:#6b7280;margin-top:4px;">${n.time}</div>
        </div>
      </div>
    `).join('');
    updateNotificationBadge();
  }

  function addNotification(title, message, type = 'success') {
    notifications.unshift({ id: Date.now(), title, message, type, time: new Date().toLocaleString(), read: false });
    if (notifications.length > 20) notifications.pop();
    updateNotificationBadge();
    renderNotificationsModal();
  }

  function markNotificationsRead() {
    notifications = notifications.map(n => ({ ...n, read: true }));
    updateNotificationBadge();
    renderNotificationsModal();
  }

  // ========== DRAWER / USER INFO ==========
  function updateDrawerUserInfo() {
    const user = currentUser || getStoredUser();
    if (!user) return;
    const firstLetter = String(user.username || 'U').trim().charAt(0).toUpperCase();
    const drawerFullName = $('drawerFullName');
    const drawerMembership = $('drawerMembership');
    const drawerUserId = $('drawerUserId');
    const referralCodeDisplay = $('referralCodeDisplay');
    if (drawerFullName) drawerFullName.textContent = user.username || 'User';
    if (drawerMembership) {
      const textNode = drawerMembership.childNodes[0];
      if (textNode && textNode.nodeType === 3) {
        textNode.textContent = 'Premium Member ';
      }
    }
    if (drawerUserId) drawerUserId.textContent = user.userId || '------';
    if (referralCodeDisplay) referralCodeDisplay.textContent = user.referralCode || '--------';

    const kycBadge = $('drawerKycBadge');
    if (kycBadge) {
      kycBadge.textContent = 'Verified';
      kycBadge.style.background = 'rgba(34,197,94,.15)';
      kycBadge.style.color = '#4ade80';
    }

    const avatar = $('drawerAvatar');
    if (avatar) {
      let img = avatar.querySelector('img');
      let initial = avatar.querySelector('.avatar-initial');
      if (user.avatar) {
        if (!img) { img = document.createElement('img'); avatar.prepend(img); }
        img.src = user.avatar;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
        img.style.position = 'absolute';
        img.style.top = '0';
        img.style.left = '0';
        if (initial) initial.remove();
      } else {
        if (img) img.remove();
        if (!initial) {
          initial = document.createElement('span');
          initial.className = 'avatar-initial';
          initial.style.fontSize = '26px';
          initial.style.fontWeight = '800';
          avatar.prepend(initial);
        }
        initial.textContent = firstLetter;
      }
    }

    const copyBtn = $('copyUidBtn');
    if (copyBtn && user.userId) {
      if (!copyBtn.classList.contains('copy-uid-btn')) {
        copyBtn.classList.add('copy-uid-btn');
      }
      const newBtn = copyBtn.cloneNode(true);
      copyBtn.parentNode.replaceChild(newBtn, copyBtn);
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(user.userId).then(() => {}).catch(() => alert('Failed to copy'));
      });
    }
  }
  window.updateDrawerUserInfo = updateDrawerUserInfo;

  function updateCardDisplay() {
    const user = currentUser || getStoredUser();
    const cardDisplay = $('cardDetailsDisplay');
    if (cardDisplay) {
      if (user?.savedCard) {
        cardDisplay.innerHTML = `
          <div class="payment-account-name">Linked Card</div>
          <div class="payment-account-number">•••• ${user.savedCard.last4}</div>
          <div class="payment-account-bank">Expires ${user.savedCard.expiry}</div>
        `;
      } else {
        cardDisplay.innerHTML = `
          <div class="payment-account-name">No card added</div>
          <div class="payment-account-number">Add your card to get started</div>
        `;
      }
    }
  }

  function addTransaction(type, amount, subtitle, meta, currency = null, iconType = null) {
    const tx = { title: type, subtitle, meta, amount, amountColor: amount > 0 ? '#4ade80' : '#f87171', iconType: iconType || (amount > 0 ? 'bank' : 'opay'), status: 'Completed', currency, id: allTransactions.length + 1 };
    allTransactions.push(tx);
    if (type === 'Withdrawal') withdrawalsOnly.push(tx);
  }

  const bankIconMap = {
    'GTBank': 'assets/banks/gtbank.png', 'Opay': 'assets/banks/opay.png', 'Palmpay': 'assets/banks/palmpay.png',
    'Access Bank': 'assets/banks/access.png', 'First Bank': 'assets/banks/firstbank.png',
    'UBA': 'assets/banks/uba.png', 'Zenith Bank': 'assets/banks/zenith.png',
    'Kuda Bank': 'assets/banks/kuda.png', 'Wema Bank': 'assets/banks/wema.png',
    'Bank of America': 'assets/banks/boa.png', 'Chase': 'assets/banks/chase.png',
    'Wells Fargo': 'assets/banks/wells_fargo.png', 'Citibank': 'assets/banks/citibank.png',
    'Deutsche Bank': 'assets/banks/deutsche.png', 'BNP Paribas': 'assets/banks/bnp_paribas.png',
    'ING': 'assets/banks/ing.png', 'Santander': 'assets/banks/santander.png',
    'Barclays': 'assets/banks/barclays.png', 'HSBC UK': 'assets/banks/hsbc_uk.png',
    'Lloyds': 'assets/banks/lloyds.png', 'NatWest': 'assets/banks/natwest.png',
    'Binance Pay': 'assets/banks/binance.png', 'Bybit': 'assets/banks/bybit.png',
    'Coinbase': 'assets/banks/coinbase.png', 'OKX': 'assets/banks/okx.png',
    'Kraken': 'assets/banks/kraken.png', 'Trust Wallet': 'assets/banks/trustwallet.png',
    'MetaMask': 'assets/banks/metamask.png', 'KuCoin': 'assets/banks/kucoin.png',
    'Huobi': 'assets/banks/huobi.png', 'PayPal': 'assets/banks/paypal.png',
    'Cash App': 'assets/banks/cashapp.png', 'Venmo': 'assets/banks/venmo.png',
    'Zelle': 'assets/banks/zelle.png', 'USAA': 'assets/banks/usaa.png',
    'Revolut': 'assets/banks/revolut.png', 'N26': 'assets/banks/n26.png',
    'Bunq': 'assets/banks/bunq.png', 'Commerzbank': 'assets/banks/commerzbank.png',
    'Vivid': 'assets/banks/vivid.png', 'Monzo': 'assets/banks/monzo.png',
    'Starling': 'assets/banks/starling.png', 'Revolut UK': 'assets/banks/revolut_uk.png',
    'Metro Bank': 'assets/banks/metro.png', 'Halifax': 'assets/banks/halifax.png',
    'USDT': 'assets/banks/usdt.png', 'USDT TRC20 Network': 'assets/banks/usdt.png',
    'Wallet': 'assets/banks/wallet.png'
  };

  const whiteBackgroundExceptions = ['Binance Pay', 'Bybit', 'Cash App', 'Vivid', 'USAA'];
  function shouldUseWhiteBackground(name) { return !whiteBackgroundExceptions.includes(name); }

  function extractBankName(subtitle) {
    if (!subtitle) return '';
    let name = subtitle.replace(/^(To|From)\s+/i, '').trim();
    if (name.toLowerCase().includes('usdt')) return 'USDT';
    return name;
  }

  function getBankIconPath(bankName) {
    if (bankIconMap[bankName]) return bankIconMap[bankName];
    for (let key of Object.keys(bankIconMap)) {
      if (bankName.toLowerCase().includes(key.toLowerCase())) return bankIconMap[key];
    }
    return null;
  }

  const fallbackBankSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>';

  // ========== FIXED: Transaction icon alignment ==========
  function getTxIconHTML(tx) {
    let bankName = extractBankName(tx.subtitle);
    let iconPath = getBankIconPath(bankName);
    let bg = shouldUseWhiteBackground(bankName) ? 'background:#ffffff; padding:6px;' : '';
    if (iconPath) {
      return `<div class="tx-ico" style="${bg} display:grid; place-items:center; border-radius:50%; overflow:hidden;">
                <img src="${iconPath}" style="width:100%; height:100%; object-fit:contain;" 
                     onerror="this.style.display='none';this.parentNode.style.background='${tx.amount>0?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'}';this.parentNode.innerHTML='${fallbackBankSVG.replace(/'/g, "\\'")}';">
              </div>`;
    } else {
      return `<div class="tx-ico" style="background:${tx.amount>0?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'}">
                ${fallbackBankSVG}
              </div>`;
    }
  }

  function updateEyeIcons() {
    const homeEye = $('homeBalanceEye');
    const withdrawEye = document.querySelector('.withdraw-eye');
    const walletEye = document.querySelector('.wallet-eye');
    const normalEye = '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>';
    const slashedEye = '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path d="M3 21l18-18"/>';
    if (balanceHidden) {
      if (homeEye) homeEye.innerHTML = slashedEye;
      if (withdrawEye) withdrawEye.innerHTML = slashedEye;
      if (walletEye) walletEye.innerHTML = slashedEye;
    } else {
      if (homeEye) homeEye.innerHTML = normalEye;
      if (withdrawEye) withdrawEye.innerHTML = normalEye;
      if (walletEye) walletEye.innerHTML = normalEye;
    }
    const toggleEl = $('hideBalanceToggle');
    if (toggleEl) toggleEl.querySelector('span').textContent = balanceHidden ? 'Show Balance' : 'Hide Balance';
  }

  // ========== DYNAMIC WALLET ACCOUNTS ==========
  function renderWalletAccounts() {
    let container = document.getElementById('walletAccountsContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'walletAccountsContainer';
      const walletView = document.getElementById('walletView');
      if (walletView) walletView.appendChild(container);
      else return;
    }
    const totalUsdt = base.homeBalance * rates.USDT;

    if (currentCurrency === 'USDT') {
      const trc20Balance = totalUsdt * 0.7;
      const bep20Balance = totalUsdt * 0.3;
      container.innerHTML = `
        <div class="wallet-account">
          <div class="wallet-account-top-row">
            <div class="wallet-account-left">
              <div class="wallet-coin green" style="background:linear-gradient(135deg, #15803d, #22c55e)">₮</div>
              <div class="wallet-account-info">
                <div class="wallet-account-top"><span class="wallet-account-name">USDT (TRC20)</span><span class="primary-tag">Primary</span></div>
                <div class="wallet-account-value">${balanceHidden ? '****' : trc20Balance.toFixed(2) + ' USDT'}</div>
                <div class="wallet-account-sub">≈ ${fmt(base.homeBalance * 0.7)}</div>
              </div>
            </div>
            <svg class="row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg>
          </div>
          <div class="wallet-account-actions">
            <button class="small-action deposit-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/></svg>Deposit</button>
            <button class="small-action btn-disabled" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/></svg>Withdraw</button>
          </div>
        </div>
        <div class="wallet-account">
          <div class="wallet-account-top-row">
            <div class="wallet-account-left">
              <div class="wallet-coin amber" style="background:linear-gradient(135deg, #a16207, #f59e0b)">₮</div>
              <div class="wallet-account-info">
                <div class="wallet-account-top"><span class="wallet-account-name">USDT (BEP20)</span></div>
                <div class="wallet-account-value">${balanceHidden ? '****' : bep20Balance.toFixed(2) + ' USDT'}</div>
                <div class="wallet-account-sub">≈ ${fmt(base.homeBalance * 0.3)}</div>
              </div>
            </div>
            <svg class="row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg>
          </div>
          <div class="wallet-account-actions">
            <button class="small-action deposit-amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/></svg>Deposit</button>
            <button class="small-action btn-disabled" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/></svg>Withdraw</button>
          </div>
        </div>`;
    } else {
      const symbolMap = { NGN: '₦', USD: '$', EUR: '€', GBP: '£' };
      const nameMap = { NGN: 'Naira Wallet', USD: 'USD Wallet', EUR: 'EUR Wallet', GBP: 'GBP Wallet' };
      const colorClass = currentCurrency === 'NGN' ? 'purple' : 'green';
      const bg = currentCurrency === 'NGN' ? 'linear-gradient(135deg, #5b21b6, #7c3aed)' : 'linear-gradient(135deg, #15803d, #22c55e)';
      const coin = symbolMap[currentCurrency] || '?';
      const name = nameMap[currentCurrency] || `${currentCurrency} Wallet`;
      const balanceInCurrency = base.homeBalance * rates[currentCurrency];
      const secondary = currentCurrency === 'NGN' ? `≈ $ ${(base.homeBalance * rates.USD).toFixed(2)}` : `≈ ${fmt(base.homeBalance)}`;
      const currencySymbol = symbolMap[currentCurrency] || '';

      container.innerHTML = `
        <div class="wallet-account">
          <div class="wallet-account-top-row">
            <div class="wallet-account-left">
              <div class="wallet-coin ${colorClass}" style="background:${bg}">${coin}</div>
              <div class="wallet-account-info">
                <div class="wallet-account-top"><span class="wallet-account-name">${name}</span><span class="primary-tag">Primary</span></div>
                <div class="wallet-account-value">${balanceHidden ? '****' : `${currencySymbol} ${balanceInCurrency.toFixed(2)}`}</div>
                <div class="wallet-account-sub">${secondary}</div>
              </div>
            </div>
            <svg class="row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg>
          </div>
          <div class="wallet-account-actions">
            <button class="small-action deposit-${colorClass}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/></svg>Deposit</button>
            <button class="small-action btn-disabled" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/></svg>Withdraw</button>
          </div>
        </div>`;
    }

    container.querySelectorAll('.small-action:not(.btn-disabled)').forEach(btn => btn.addEventListener('click', openDepositModal));
  }

  function forceUpdateWithdrawHero() {
    const withdrawBalanceEl = document.getElementById('withdrawBalance');
    const withdrawFxEl = document.getElementById('withdrawFx');
    const withdrawableAmtEl = document.getElementById('withdrawableAmount');

    if (balanceHidden) {
      if (withdrawBalanceEl) withdrawBalanceEl.textContent = '****';
      if (withdrawFxEl) withdrawFxEl.textContent = '****';
      if (withdrawableAmtEl) withdrawableAmtEl.textContent = '****';
      return;
    }

    if (withdrawBalanceEl) {
      const sym = symbols[currentCurrency];
      const converted = base.homeBalance * rates[currentCurrency];
      withdrawBalanceEl.textContent = `${sym} ${converted.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (withdrawFxEl) {
      withdrawFxEl.textContent = `≈ $ ${(base.homeBalance * rates['USD']).toFixed(2)}`;
    }
    if (withdrawableAmtEl) {
      const sym = symbols[currentCurrency];
      const converted = base.withdrawable * rates[currentCurrency];
      withdrawableAmtEl.textContent = `${sym} ${converted.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }

  // ========== UPDATE ALL (null‑safe) ==========
  function updateAll() {
    $('currencyBtn').textContent = currentCurrency + ' ▾';
    document.querySelectorAll('.currency-option').forEach(o => o.classList.toggle('selected', o.dataset.currency === currentCurrency));

    ['planMin1','planMax1','planMin2','planMax2','planMin3','planMin4'].forEach(id => {
      const el = $(id); if (el && base[id] !== undefined) el.textContent = fmt(base[id]);
    });

    if (balanceHidden) {
      const ids = ['homeBalance','homeFx','walletTotalBalance','walletTotalFx','availableBalance','lockedBalance','nairaWallet','withdrawBalance','withdrawFx','withdrawableAmount','totalInvested','totalProfit','totalWithdrawn'];
      ids.forEach(id => { const el = $(id); if (el) el.textContent = '****'; });
      document.querySelectorAll('.value').forEach(el => el.textContent = '****');
      $('profitPercent').textContent = '0%';
      updateEyeIcons();
      renderWalletAccounts();
      forceUpdateWithdrawHero();
      return;
    }

    base.walletTotal = base.homeBalance;
    base.walletAvailable = base.homeBalance;
    base.nairaWallet = base.homeBalance;
    base.withdrawable = base.homeBalance;
    base.totalProfit = base.homeBalance - base.totalInvested - base.totalWithdrawn;

    const elHomeBalance = $('homeBalance'); if (elHomeBalance) elHomeBalance.textContent = fmt(base.homeBalance);
    const elHomeFx = $('homeFx'); if (elHomeFx) elHomeFx.textContent = `≈ $ ${(base.homeBalance * rates['USD']).toFixed(2)}`;
    const elTotalInvested = $('totalInvested'); if (elTotalInvested) elTotalInvested.textContent = fmt(base.totalInvested);
    const elTotalProfit = $('totalProfit'); if (elTotalProfit) elTotalProfit.textContent = fmt(Math.max(0, base.totalProfit));
    const elTotalWithdrawn = $('totalWithdrawn'); if (elTotalWithdrawn) elTotalWithdrawn.textContent = fmt(base.totalWithdrawn);
    const elActivePlansCount = $('activePlansCount'); if (elActivePlansCount) elActivePlansCount.textContent = base.activePlans;
    const elWalletTotalBalance = $('walletTotalBalance'); if (elWalletTotalBalance) elWalletTotalBalance.textContent = fmt(base.walletTotal);
    const elWalletTotalFx = $('walletTotalFx'); if (elWalletTotalFx) elWalletTotalFx.textContent = `≈ $ ${(base.walletTotal * rates['USD']).toFixed(2)}`;
    const elAvailableBalance = $('availableBalance'); if (elAvailableBalance) elAvailableBalance.textContent = fmt(base.walletAvailable);
    const elLockedBalance = $('lockedBalance'); if (elLockedBalance) elLockedBalance.textContent = fmt(base.walletLocked);
    const elNairaWallet = $('nairaWallet'); if (elNairaWallet) elNairaWallet.textContent = fmt(base.nairaWallet);

    forceUpdateWithdrawHero();

    renderRecentTx();
    renderRecentWithdrawals();
    renderWalletTx();
    renderOverviewCards();
    buildChart();
    renderWalletAccounts();

    const withdrawBtn = $('withdrawNavBtn');
    if (withdrawBtn) {
      if (base.homeBalance <= 0) { withdrawBtn.classList.add('btn-disabled'); withdrawBtn.disabled = true; }
      else { withdrawBtn.classList.remove('btn-disabled'); withdrawBtn.disabled = false; }
    }
  }

  function buildChart() {
    const container = $('chartContainer');
    if (!container) return;
    if (chartData.length === 0) { container.innerHTML = '<div style="height:250px; display:flex; align-items:center; justify-content:center; color:#6b7280;">No data yet. Start investing!</div>'; return; }
    let maxV = Math.max(...chartData.map(d => d.value)) * 1.1 || 1000;
    let W = 400, H = 250, pl = 60, pr = 20, pt = 26, pb = 30;
    let gw = W - pl - pr, gh = H - pt - pb;
    let xs = i => pl + (i / (chartData.length - 1)) * gw;
    let ys = v => pt + gh - (v / maxV) * gh;
    let lp = '', ap = '';
    chartData.forEach((p, i) => {
      let x = xs(i), y = ys(p.value);
      if (i === 0) { lp += `M ${x} ${y}`; ap += `M ${x} ${H-pb} L ${x} ${y}`; }
      else { lp += ` L ${x} ${y}`; ap += ` L ${x} ${y}`; }
    });
    ap += ` L ${xs(chartData.length-1)} ${H-pb} Z`;
    let yl = [0, Math.round(maxV/2), Math.round(maxV)];
    let yle = yl.map(v => `<text class="ytext" x="${pl-8}" y="${ys(v)+4}" text-anchor="end">${symbols[currentCurrency]} ${convert(v)}</text>`).join('');
    let xle = chartData.filter((_,i) => i%3===0 || i===chartData.length-1).map(p => `<text class="axis-text" x="${xs(chartData.indexOf(p))}" y="${H-8}" text-anchor="middle">${p.label}</text>`).join('');
    container.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="fillGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#22c55e" stop-opacity="0.25"/><stop offset="70%" stop-color="#22c55e" stop-opacity="0.05"/><stop offset="100%" stop-color="#22c55e" stop-opacity="0"/></linearGradient></defs>${yl.map(v => `<line x1="${pl}" y1="${ys(v)}" x2="${W-pr}" y2="${ys(v)}" stroke="rgba(255,255,255,.06)"/>`).join('')}${yle}${xle}<path d="${ap}" fill="url(#fillGreen)"/><path d="${lp}" fill="none" stroke="#22c55e" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${xs(chartData.length-1)}" cy="${ys(chartData[chartData.length-1].value)}" r="6" fill="#22c55e"/><circle cx="${xs(chartData.length-1)}" cy="${ys(chartData[chartData.length-1].value)}" r="2.5" fill="#fff"/></svg>`;
  }

  function renderRecentTx() {
    const c = $('recentTransactions');
    if (!c) return;
    if (allTransactions.length === 0) { c.innerHTML = '<div class="tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No transactions yet</div><div class="tx-sub">Deposit funds to get started</div></div></div>'; return; }
    c.innerHTML = allTransactions.slice(-4).reverse().map(tx => {
      let s = tx.currency === 'USD' ? `${tx.amount>=0?'+':'-'}$${Math.abs(tx.amount).toFixed(2)}` : `${tx.amount>=0?'+':''}${fmt(Math.abs(tx.amount))}`;
      return `<div class="tx-row" data-tx-id="${tx.id}">${getTxIconHTML(tx)}<div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div></div>`;
    }).join('');
  }

  function renderRecentWithdrawals() {
    const c = $('recentWithdrawals');
    if (!c) return;
    if (withdrawalsOnly.length === 0) { c.innerHTML = '<div class="tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No withdrawals yet</div><div class="tx-sub">Your withdrawals will appear here</div></div></div>'; return; }
    c.innerHTML = withdrawalsOnly.slice(-14).reverse().map(tx => {
      let s = tx.currency === 'USD' ? `-$${Math.abs(tx.amount).toFixed(2)}` : `-${fmt(Math.abs(tx.amount))}`;
      return `<div class="tx-row" data-tx-id="${tx.id}">${getTxIconHTML(tx)}<div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div></div>`;
    }).join('');
  }

  function renderWalletTx() {
    const c = $('walletRecentTx');
    if (!c) return;
    if (allTransactions.length === 0) { c.innerHTML = '<div class="wallet-tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No transactions</div></div></div>'; return; }
    c.innerHTML = allTransactions.slice(-4).reverse().map(tx => {
      let s = tx.currency === 'USD' ? `${tx.amount>=0?'+':'-'}$${Math.abs(tx.amount).toFixed(2)}` : `${tx.amount>=0?'+':''}${fmt(Math.abs(tx.amount))}`;
      return `<div class="wallet-tx-row">${getTxIconHTML(tx)}<div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div></div>`;
    }).join('');
  }

  function renderOverviewCards() {
    const c = $('overviewCards');
    if (!c) return;
    let totalProfitValue = base.totalProfit;
    let investedValue = base.totalInvested;
    let referralValue = currentUser ? (currentUser.commission || 0) : 0;
    let withdrawnValue = base.totalWithdrawn;
    if (overviewPeriod === 'week') {
      totalProfitValue = Math.round(base.totalProfit * 0.25);
      investedValue = Math.round(base.totalInvested * 0.25);
      withdrawnValue = Math.round(base.totalWithdrawn * 0.2);
    }
    const cards = [
      { title:"Total Profit", value:totalProfitValue, sub:"+0%", subColor:"#34d399", iconBg:"rgba(34,197,94,.12)", iconColor:"#4ade80", icon:'<path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/>' },
      { title:"Active Investments", value:investedValue, sub:"0 Plans", subColor:"#94a3b8", iconBg:"rgba(59,130,246,.12)", iconColor:"#60a5fa", icon:'<path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"/><path d="M8 13c1.7 0 3-1.3 3-3S9.7 7 8 7 5 8.3 5 10s1.3 3 3 3Z"/>' },
      { title:"Referral Earnings", value:referralValue, sub:"0 Referrals", subColor:"#94a3b8", iconBg:"rgba(245,158,11,.12)", iconColor:"#fbbf24", icon:'<path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"/><path d="M8 13c1.7 0 3-1.3 3-3S9.7 7 8 7 5 8.3 5 10s1.3 3 3 3Z"/>' },
      { title:"Withdrawn", value:withdrawnValue, sub:"This Month", subColor:"#94a3b8", iconBg:"rgba(168,85,247,.12)", iconColor:"#c084fc", icon:'<path d="M3 7h18v10H3z"/><path d="M16 12h4"/><circle cx="16.5" cy="12" r="1.2" fill="#c084fc" stroke="none"/>' }
    ];
    c.innerHTML = cards.map(ca => `<div class="stat" data-title="${ca.title}" data-value="${fmt(ca.value)}" data-sub="${ca.sub}"><div class="ico" style="background:${ca.iconBg}"><svg viewBox="0 0 24 24" fill="none" stroke="${ca.iconColor}" stroke-width="2">${ca.icon}</svg></div><div class="title">${ca.title}</div><div class="value">${balanceHidden?'****':fmt(ca.value)}</div><div class="sub" style="color:${ca.subColor}">${ca.sub}</div></div>`).join('');
    document.querySelectorAll('#overviewCards .stat').forEach(card => {
      card.addEventListener('click', () => {
        $('overviewDetailTitle').textContent = card.querySelector('.title').textContent;
        $('overviewDetailValue').textContent = card.querySelector('.value').textContent;
        $('overviewDetailDesc').textContent = card.querySelector('.sub').textContent;
        openModal('overviewDetailModal');
      });
    });
  }

  // ========== CURRENCY SWITCHER ==========
  $('currencyBtn').addEventListener('click', () => $('currencyDropdown').classList.toggle('open'));
  $('currencyDropdown').addEventListener('click', e => {
    const opt = e.target.closest('.currency-option');
    if (!opt) return;
    currentCurrency = opt.dataset.currency;
    $('currencyDropdown').classList.remove('open');
    closeModal('depositModal');
    closeModal('paymentModal');

    updateMethodCardsVisibility();
    if (currentCurrency === 'USDT') {
      if (!activeWithdrawMethod.startsWith('usdt')) setWithdrawMethod('usdt_trc20');
    } else {
      if (activeWithdrawMethod.startsWith('usdt')) setWithdrawMethod('bank');
    }

    updateAll();
    forceUpdateWithdrawHero();
    updateDepositModalCurrency();
    renderWalletAccounts();
    renderWithdrawForm(activeWithdrawMethod);

    if ($('referModal')?.classList.contains('open')) {
      updateReferModal();
    }
  });
  document.addEventListener('click', e => { if (!e.target.closest('#currencySelector')) $('currencyDropdown').classList.remove('open'); });

  // Balance Hide Toggles
  $('homeBalanceEye')?.addEventListener('click', () => { balanceHidden = !balanceHidden; updateAll(); });
  document.querySelector('.withdraw-eye')?.addEventListener('click', () => { balanceHidden = !balanceHidden; updateAll(); });
  document.querySelector('.wallet-eye')?.addEventListener('click', () => { balanceHidden = !balanceHidden; updateAll(); });
  $('hideBalanceToggle')?.addEventListener('click', () => { balanceHidden = !balanceHidden; updateAll(); });
  $('notificationBell')?.addEventListener('click', () => { markNotificationsRead(); openModal('notificationsModal'); });
  $('closeNotificationsModalBtn')?.addEventListener('click', () => closeModal('notificationsModal'));

  // Overview Period Chip
  const periodChip = $('overviewPeriodChip');
  const periods = ['Today','Week','Month'];
  let periodIndex = 0;
  periodChip.addEventListener('click', () => {
    periodIndex = (periodIndex + 1) % periods.length;
    overviewPeriod = periods[periodIndex].toLowerCase();
    periodChip.innerHTML = `${periods[periodIndex]}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6-6 6"/></svg>`;
    renderOverviewCards();
  });

  // ========== WITHDRAW METHOD SWITCHING ==========
  let activeWithdrawMethod = currentCurrency === 'USDT' ? 'usdt_trc20' : 'bank';
  const withdrawFormContainer = $('withdrawDetailsForm');

  function setWithdrawMethod(method) {
    if (!withdrawFormContainer || method === activeWithdrawMethod) return;
    activeWithdrawMethod = method;
    document.querySelectorAll('.method-card').forEach(card => card.classList.toggle('active', card.dataset.method === method));
    renderWithdrawForm(method);
  }

  document.querySelectorAll('.method-card').forEach(card => card.addEventListener('click', () => setWithdrawMethod(card.dataset.method)));

  function updateMethodCardsVisibility() {
    const allCards = {
      bank: document.querySelector('.method-card[data-method="bank"]'),
      usdt_trc20: document.querySelector('.method-card[data-method="usdt_trc20"]'),
      usdt_bep20: document.querySelector('.method-card[data-method="usdt_bep20"]'),
      ewallet: document.querySelector('.method-card[data-method="ewallet"]')
    };

    if (allCards.bank) {
      allCards.bank.style.setProperty('display', currentCurrency === 'USDT' ? 'none' : '', 'important');
    }
    if (currentCurrency === 'USDT' && activeWithdrawMethod === 'bank') setWithdrawMethod('usdt_trc20');
    if (currentCurrency !== 'USDT' && activeWithdrawMethod.startsWith('usdt')) setWithdrawMethod('bank');
  }

  function renderWithdrawForm(method) {
    if (!withdrawFormContainer) return;
    let html = '';

    if (currentCurrency === 'USDT') {
        if (method === 'bank' || method === 'ewallet') {
            method = 'usdt_trc20';
            activeWithdrawMethod = method;
            document.querySelectorAll('.method-card').forEach(card => card.classList.toggle('active', card.dataset.method === method));
        }
    }

    if (method === 'bank') {
      const banks = withdrawalBanks[currentCurrency] || withdrawalBanks.NGN;
      const options = banks.map(bank => `<option value="${bank.name}">${bank.name}</option>`).join('');
      const firstBank = banks[0];
      const logoBg = shouldUseWhiteBackground(firstBank.name) ? 'background:#ffffff;' : '';

      let extraFields = '';
      if (currentCurrency === 'USD') {
        extraFields = `<div class="field-label">Routing Number</div><div class="amount-input"><input type="text" id="withdrawRoutingInput" placeholder="9-digit routing number" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"></div>`;
      } else if (currentCurrency === 'EUR') {
        extraFields = `<div class="field-label">IBAN</div><div class="amount-input"><input type="text" id="withdrawIbanInput" placeholder="International Bank Account Number" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"></div>
                       <div class="field-label">BIC / SWIFT</div><div class="amount-input"><input type="text" id="withdrawBicInput" placeholder="Bank Identifier Code" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"></div>`;
      } else if (currentCurrency === 'GBP') {
        extraFields = `<div class="field-label">Sort Code</div><div class="amount-input"><input type="text" id="withdrawSortCodeInput" placeholder="6-digit sort code (e.g. 20-45-67)" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"></div>
                       <div class="field-label">IBAN</div><div class="amount-input"><input type="text" id="withdrawIbanInput" placeholder="IBAN" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"></div>`;
      }

      html = `
        <div class="field-label">Recipient Account Number</div>
        <div class="amount-input"><input type="text" id="withdrawAccountInput" placeholder="Enter account number" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"></div>
        <div class="field-label">Account Holder Name</div>
        <div class="amount-input"><input type="text" id="withdrawHolderName" placeholder="Full name on the account" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"></div>
        <div class="field-label">Bank Name</div>
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
          <img id="bankLogoImage" src="${firstBank.icon}" style="width:32px; height:32px; border-radius:50%; object-fit:contain; ${logoBg} padding:2px;" onerror="this.style.display='none';">
          <select id="bankSelect" style="flex:1; height:56px; border-radius:16px; border:1px solid rgba(255,255,255,.08); background:#0b1020; color:#fff; padding:0 16px; font-size:16px; cursor:pointer;">${options}</select>
        </div>
        ${extraFields}
        <div class="field-label">Amount</div>
        <div class="amount-input"><input type="number" id="withdrawInput" placeholder="Enter amount" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"><span class="currency">${currentCurrency}</span></div>
        <div class="amount-presets">${generateWithdrawPresets()}</div>
        <div class="fee-row"><span>Transaction Fee</span><span id="withdrawFee">${fmt(50)}</span></div>
        <div class="receive-row"><span>You Will Receive</span><span id="receiveAmount">${fmt(0)}</span></div>
        <span class="field-error" id="withdrawError"></span>
        <button class="withdraw-btn" id="requestWithdrawalBtn">Request Withdrawal</button>
        <div class="notice-box"><div class="notice-title">Withdrawal Notice:</div><div class="notice-text">Please ensure your details are correct. Incorrect details may cause delay or failed transactions.</div></div>
      `;
    } else if (method === 'usdt_trc20' || method === 'usdt_bep20') {
      const network = method === 'usdt_trc20' ? 'TRC20' : 'BEP20';
      const wallets = withdrawalBanks.USDT;
      const options = wallets.map(w => `<option value="${w.name}">${w.name}</option>`).join('');
      const firstWallet = wallets[0];
      const logoBg = shouldUseWhiteBackground(firstWallet.name) ? 'background:#ffffff;' : '';
      html = `
        <div class="field-label">Select Wallet / Exchange</div>
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
          <img id="walletLogoImage" src="${firstWallet.icon}" style="width:32px; height:32px; border-radius:50%; object-fit:contain; ${logoBg} padding:2px;" onerror="this.style.display='none';">
          <select id="walletSelect" style="flex:1; height:56px; border-radius:16px; border:1px solid rgba(255,255,255,.08); background:#0b1020; color:#fff; padding:0 16px; font-size:16px; cursor:pointer;">${options}</select>
        </div>
        <div class="field-label">Wallet Address (${network})</div>
        <div class="amount-input"><input type="text" id="withdrawAccountInput" placeholder="Enter ${network} wallet address" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"></div>
        <div class="field-label">Amount (USDT)</div>
        <div class="amount-input"><input type="number" id="withdrawInput" placeholder="Enter amount" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"><span class="currency">USDT</span></div>
        <div class="amount-presets"><button type="button" class="preset" data-amount="10">10 USDT</button><button type="button" class="preset" data-amount="50">50 USDT</button><button type="button" class="preset" data-amount="100">100 USDT</button><button type="button" class="preset" data-amount="500">500 USDT</button><button type="button" class="preset preset-max" id="maxBtn">Max</button></div>
        <div class="fee-row"><span>Network Fee</span><span id="withdrawFee">1 USDT</span></div>
        <div class="receive-row"><span>You Will Receive</span><span id="receiveAmount">0.00 USDT</span></div>
        <span class="field-error" id="withdrawError"></span>
        <button class="withdraw-btn" id="requestWithdrawalBtn">Request Withdrawal</button>
        <div class="notice-box"><div class="notice-title">Withdrawal Notice:</div><div class="notice-text">Ensure the wallet address is correct. USDT withdrawals are processed automatically.</div></div>
      `;
    } else if (method === 'ewallet') {
      html = `
        <div class="field-label">E-Wallet ID / Email</div>
        <div class="amount-input"><input type="text" id="withdrawAccountInput" placeholder="Enter e-wallet ID or email" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"></div>
        <div class="field-label">Amount</div>
        <div class="amount-input"><input type="number" id="withdrawInput" placeholder="Enter amount" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"><span class="currency">${currentCurrency}</span></div>
        <div class="amount-presets">${generateWithdrawPresets()}</div>
        <div class="fee-row"><span>Transaction Fee</span><span id="withdrawFee">${currentCurrency === 'USDT' ? '1 USDT' : fmt(50)}</span></div>
        <div class="receive-row"><span>You Will Receive</span><span id="receiveAmount">${fmt(0)}</span></div>
        <span class="field-error" id="withdrawError"></span>
        <button class="withdraw-btn" id="requestWithdrawalBtn">Request Withdrawal</button>
        <div class="notice-box"><div class="notice-title">Withdrawal Notice:</div><div class="notice-text">Ensure your e-wallet details are correct. Instant processing.</div></div>
      `;
    }

    withdrawFormContainer.innerHTML = html;
    bindWithdrawFormEvents();
  }

  function generateWithdrawPresets() {
    const presets = withdrawPresets[currentCurrency] || withdrawPresets.NGN;
    return presets.map(amount => {
      if (amount === 'max') return `<button type="button" class="preset preset-max" id="maxBtn">Max</button>`;
      let label;
      if (currentCurrency === 'NGN') label = `₦${amount.toLocaleString()}`;
      else if (currentCurrency === 'USDT') label = `${amount} USDT`;
      else label = `${symbols[currentCurrency]}${amount.toLocaleString()}`;
      return `<button type="button" class="preset" data-amount="${amount}">${label}</button>`;
    }).join('');
  }

  function bindWithdrawFormEvents() {
    const withdrawInput = $('withdrawInput');
    const requestBtn = $('requestWithdrawalBtn');
    const errorEl = $('withdrawError');
    if (withdrawInput) {
      withdrawInput.addEventListener('input', () => {
        const amt = parseFloat(withdrawInput.value) || 0;
        if (activeWithdrawMethod.startsWith('usdt')) {
          $('receiveAmount').textContent = (Math.max(0, amt - 1)).toFixed(2) + ' USDT';
          $('withdrawFee').textContent = '1 USDT';
        } else {
          $('receiveAmount').textContent = fmt(Math.max(0, amt - FEE));
          $('withdrawFee').textContent = fmt(amt > 0 ? FEE : 0);
        }
      });
    }
    document.querySelectorAll('.preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = $('withdrawInput');
        if (!input) return;
        if (btn.id === 'maxBtn') {
          input.value = (activeWithdrawMethod.startsWith('usdt')) ? 1000 : base.withdrawable;
        } else {
          input.value = btn.dataset.amount;
        }
        input.dispatchEvent(new Event('input'));
      });
    });

    const selectEl = document.getElementById('bankSelect') || document.getElementById('walletSelect');
    if (selectEl) {
      const logoEl = document.getElementById('bankLogoImage') || document.getElementById('walletLogoImage');
      const sourceList = (activeWithdrawMethod.startsWith('usdt')) ? withdrawalBanks.USDT : (withdrawalBanks[currentCurrency] || withdrawalBanks.NGN);
      selectEl.addEventListener('change', () => {
        const selected = sourceList.find(i => i.name === selectEl.value);
        if (selected && logoEl) {
          logoEl.src = selected.icon;
          logoEl.style.display = 'block';
          if (shouldUseWhiteBackground(selected.name)) { logoEl.style.background = '#ffffff'; logoEl.style.padding = '2px'; }
          else { logoEl.style.background = 'transparent'; logoEl.style.padding = '0'; }
        }
      });
    }

    if (requestBtn) {
      requestBtn.addEventListener('click', () => {
        if (base.homeBalance <= 0) { showInsufficientBalanceModal(); return; }
        const amount = parseFloat($('withdrawInput').value);
        const accountNumber = $('withdrawAccountInput').value.trim();
        const holderName = ($('withdrawHolderName')?.value || '').trim();
        const bankName = activeWithdrawMethod === 'bank' ? (document.getElementById('bankSelect')?.value || 'Bank') : (document.getElementById('walletSelect')?.value || activeWithdrawMethod);

        let routingNumber = '', iban = '', bic = '', sortCode = '';
        if (currentCurrency === 'USD') routingNumber = ($('withdrawRoutingInput')?.value || '').trim();
        if (currentCurrency === 'EUR') { iban = ($('withdrawIbanInput')?.value || '').trim(); bic = ($('withdrawBicInput')?.value || '').trim(); }
        if (currentCurrency === 'GBP') { sortCode = ($('withdrawSortCodeInput')?.value || '').trim(); iban = ($('withdrawIbanInput')?.value || '').trim(); }

        if (errorEl) { errorEl.textContent = ''; errorEl.style.display = 'none'; }
        if (isNaN(amount) || amount <= 0) { errorEl.textContent = 'Please enter a valid amount.'; errorEl.style.display = 'block'; return; }
        if (!accountNumber || !holderName) { errorEl.textContent = 'Please fill in account number and holder name.'; errorEl.style.display = 'block'; return; }
        if (currentCurrency === 'USD' && !routingNumber) { errorEl.textContent = 'Routing number is required.'; errorEl.style.display = 'block'; return; }
        if (currentCurrency === 'EUR' && (!iban || !bic)) { errorEl.textContent = 'IBAN and BIC are required.'; errorEl.style.display = 'block'; return; }
        if (currentCurrency === 'GBP' && (!sortCode || !iban)) { errorEl.textContent = 'Sort code and IBAN are required.'; errorEl.style.display = 'block'; return; }
        if (amount > base.homeBalance) { errorEl.textContent = 'Insufficient balance.'; errorEl.style.display = 'block'; return; }

        if (currentUser && currentUser.twoFaEnabled) {
          const pin = prompt('Enter your 6-digit 2FA PIN to confirm withdrawal:');
          if (pin !== currentUser.twoFaPin) { alert('Invalid PIN. Withdrawal cancelled.'); return; }
        }

        const fee = activeWithdrawMethod.startsWith('usdt') ? 1 : FEE;
        const receive = Math.max(0, amount - fee);
        let confirmBankText = `${bankName} - ${accountNumber}`;
        if (holderName) confirmBankText += ` (${holderName})`;
        if (routingNumber) confirmBankText += ` • Routing: ${routingNumber}`;
        if (sortCode) confirmBankText += ` • Sort: ${sortCode}`;
        if (iban) confirmBankText += ` • IBAN: ${iban}`;
        if (bic) confirmBankText += ` • BIC: ${bic}`;

        $('confirmBank').textContent = confirmBankText;
        $('confirmAmount').textContent = activeWithdrawMethod.startsWith('usdt') ? amount + ' USDT' : fmt(amount);
        $('confirmFee').textContent = activeWithdrawMethod.startsWith('usdt') ? '1 USDT' : fmt(fee);
        $('confirmReceive').textContent = activeWithdrawMethod.startsWith('usdt') ? receive + ' USDT' : fmt(receive);
        $('confirmDate').textContent = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
        openModal('withdrawConfirmModal');
      });
    }
  }

  // 2FA
  function refresh2faUI() {
    const user = currentUser || getStoredUser();
    if (!$('enable2faBtn')) return;
    if (user?.twoFaEnabled) { $('enable2faBtn').style.display = 'none'; $('changePinBtn').style.display = 'block'; }
    else { $('enable2faBtn').style.display = 'block'; $('changePinBtn').style.display = 'none'; }
  }
  $('enable2faBtn')?.addEventListener('click', () => {
    const pin = $('twoFaPin').value.trim();
    const confirm = $('twoFaPinConfirm').value.trim();
    const pinError = $('pinError');
    if (!/^\d{6}$/.test(pin) || !/^\d{6}$/.test(confirm)) { pinError.textContent = 'Enter a valid 6-digit PIN.'; pinError.style.display = 'block'; return; }
    if (pin !== confirm) { pinError.textContent = 'PINs do not match.'; pinError.style.display = 'block'; return; }
    if (currentUser) {
      currentUser.twoFaEnabled = true; currentUser.twoFaPin = pin; saveUser(currentUser);
      pinError.style.display = 'none';
      addNotification('2FA Updated', 'Your transaction PIN has been saved.', 'success');
      showSuccess('2FA Saved', 'Your 6-digit PIN has been updated successfully.');
      refresh2faUI(); closeModal('securityModal');
    }
  });
  $('changePinBtn')?.addEventListener('click', () => openModal('securityModal'));
  $('secureNowBtn')?.addEventListener('click', () => openModal('securityModal'));

  // Deposit Modal
  function updateDepositModalCurrency() {
    const presets = depositPresets[currentCurrency] || depositPresets.NGN;
    const presetsContainer = document.querySelector('#depositModal .amount-presets');
    if (presetsContainer) {
      presetsContainer.innerHTML = presets.map(amount => `<button type="button" class="preset" data-amount="${amount}">${symbols[currentCurrency]}${amount.toLocaleString()}</button>`).join('');
      document.querySelectorAll('#depositModal .preset').forEach(b => b.addEventListener('click', () => { $('depositAmountInput').value = b.dataset.amount; }));
    }
    const currencySpan = document.querySelector('#depositModal .currency');
    if (currencySpan) currencySpan.textContent = currentCurrency;
  }

  function openDepositModal() {
    const pillText = $('currencyBtn').textContent.trim().split(' ')[0];
    if (currentCurrency !== pillText) {
      currentCurrency = pillText;
      updateAll();
    }
    updateDepositModalCurrency();
    $('depositModal').classList.add('open');
  }

  $('drawerDepositBtn')?.addEventListener('click', () => openDepositModal());
  document.querySelectorAll('.deposit-purple, .deposit-green, .deposit-amber').forEach(btn => btn.addEventListener('click', () => openDepositModal()));

  function openPaymentModal(amount, isInvestment = false) {
    const symbol = symbols[currentCurrency];
    $('paymentAmount').textContent = `${symbol} ${amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    const currencyLabel = document.querySelector('#paymentModal .currency');
    if (currencyLabel) currencyLabel.textContent = currentCurrency;

    const account = paymentAccounts[currentCurrency] || paymentAccounts.NGN;
    document.querySelector('#paymentModal .payment-account-name').textContent = account.bank;
    const accNumEl = document.querySelector('#paymentModal .payment-account-number');
    accNumEl.style.wordBreak = 'break-all';
    let extraInfo = '';
    if (account.routingNumber) extraInfo += `<br><small style="color:#9ca3af;">Routing: ${account.routingNumber}</small>`;
    if (account.sortCode) extraInfo += `<br><small style="color:#9ca3af;">Sort Code: ${account.sortCode}</small>`;
    if (account.iban) extraInfo += `<br><small style="color:#9ca3af;">IBAN: ${account.iban}</small>`;
    if (account.bic) extraInfo += `<br><small style="color:#9ca3af;">SWIFT/BIC: ${account.bic}</small>`;
    if (account.blz) extraInfo += `<br><small style="color:#9ca3af;">Bank Code (BLZ): ${account.blz}</small>`;
    accNumEl.innerHTML = account.accountNumber + extraInfo;
    document.querySelector('#paymentModal .payment-account-bank').textContent = account.accountName || '';
    $('paymentModalTitle').textContent = isInvestment ? 'Investment Payment' : 'Deposit Payment';
    openModal('paymentModal');
  }

  $('confirmDepositBtn')?.addEventListener('click', () => {
    const amount = parseFloat($('depositAmountInput').value);
    const err = $('depositError');
    if (isNaN(amount) || amount <= 0) { err.textContent = 'Enter a valid deposit amount'; err.style.display = 'block'; setTimeout(() => err.style.display = 'none', 3000); return; }
    if (currentCurrency === 'NGN' && amount < 7500) { err.textContent = 'Minimum deposit is ₦7,500'; err.style.display = 'block'; setTimeout(() => err.style.display = 'none', 3000); return; }
    if (currentCurrency !== 'NGN' && amount < 5) { const sym = symbols[currentCurrency] || ''; err.textContent = `Minimum deposit is ${sym}5`; err.style.display = 'block'; setTimeout(() => err.style.display = 'none', 3000); return; }

    closeModal('depositModal');
    showProcessing('Processing deposit...');
    setTimeout(() => {
      hideProcessing();
      openPaymentModal(amount);
    }, 2000);
  });

  $('confirmPaymentBtn')?.addEventListener('click', () => { closeModal('paymentModal'); showProcessing('Verifying payment...'); setTimeout(() => { hideProcessing(); showPaymentNotDetected(); }, 2000); });
  $('copyAccountBtn')?.addEventListener('click', async () => {
    const account = $('accountNumberDisplay')?.textContent.trim() || '8034467998';
    try {
      await navigator.clipboard.writeText(account);
      const btn = $('copyAccountBtn');
      btn.classList.add('copied');
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 13 4 4L19 7"/></svg>Copied!';
      setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy'; }, 2000);
    } catch(err) { alert('Failed to copy'); }
  });

  // Investment Flow
  function openInvestModal(planName, minNgn, planKey) {
    const minInCurrency = minNgn * rates[currentCurrency];
    currentInvestMinInCurrency = minInCurrency;
    $('investPlanName').textContent = planName;
    $('investMin').textContent = `${symbols[currentCurrency]} ${minInCurrency.toFixed(2)}`;
    const rateInfo = planRates[planKey];
    if (rateInfo) { $('investDailyRate').textContent = rateInfo.range; currentPlanAvg = rateInfo.avg; }
    $('investAmountInput').value = '';
    document.querySelector('#investModal .currency').textContent = currentCurrency;
    updateInvestExpected();
    openModal('investModal');
  }

  function updateInvestExpected() {
    const amount = parseFloat($('investAmountInput').value) || 0;
    const amountNgn = amount / rates[currentCurrency];
    const totalReturnNgn = amountNgn + (amountNgn * currentPlanAvg / 100 * 30);
    $('investExpectedReturn').textContent = fmt(totalReturnNgn);
  }

  $('investAmountInput')?.addEventListener('input', updateInvestExpected);
  $('confirmInvestBtn')?.addEventListener('click', () => {
    const amount = parseFloat($('investAmountInput').value);
    const investErr = document.getElementById('investError');
    if (isNaN(amount) || amount <= 0) { if (investErr) { investErr.textContent = 'Enter a valid amount.'; investErr.style.display = 'block'; setTimeout(() => investErr.style.display = 'none', 3000); } return; }
    if (amount < currentInvestMinInCurrency) {
      if (investErr) {
        investErr.textContent = `Minimum investment is ${symbols[currentCurrency]}${currentInvestMinInCurrency.toFixed(2)}`;
        investErr.style.display = 'block'; setTimeout(() => investErr.style.display = 'none', 3000);
      }
      return;
    }
    closeModal('investModal');
    showProcessing('Processing investment...');
    setTimeout(() => {
      hideProcessing();
      openPaymentModal(amount, true);
    }, 2000);
  });

  document.querySelectorAll('.invest-now-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.plan-card');
      const plan = card.dataset.plan;
      const minNgn = plan === 'beginner' ? 10000 : plan === 'standard' ? 50000 : plan === 'premium' ? 200000 : 500000;
      openInvestModal(card.querySelector('.plan-title').textContent, minNgn, plan);
    });
  });

  // ========== INVEST TABS (ensure static content works) ==========
  const investTabs = document.querySelectorAll('#investTabs .tab');
  investTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      investTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      document.getElementById('investPlansView').style.display = tabName === 'plans' ? 'block' : 'none';
      document.getElementById('myInvestmentsView').style.display = tabName === 'myinvestments' ? 'block' : 'none';
      document.getElementById('investHistoryView').style.display = tabName === 'history' ? 'block' : 'none';
    });
  });

  // Transfer
  $('confirmTransferBtn')?.addEventListener('click', () => {
    if (base.homeBalance <= 0) { showDepositFirstModal(); return; }
    const amount = parseFloat($('transferAmountInput').value);
    const recipient = $('transferRecipient').value.trim();
    if (isNaN(amount) || amount <= 0) return alert('Enter valid amount.');
    if (!recipient) return alert('Enter recipient username.');
    if (amount > base.walletAvailable) return alert('Insufficient balance.');
    closeModal('transferModal');
    showProcessing('Processing transfer...');
    setTimeout(() => {
      hideProcessing();
      base.homeBalance -= amount;
      base.walletTotal = base.homeBalance;
      base.walletAvailable -= amount;
      base.nairaWallet = base.walletAvailable;
      base.withdrawable = base.walletAvailable;
      chartData.push({ label: new Date().getHours()+':'+String(new Date().getMinutes()).padStart(2,'0'), value: base.homeBalance });
      addTransaction('Transfer', -amount, `To ${recipient}`, new Date().toLocaleString(), null, 'wallet');
      addNotification('Transfer Sent', `${fmt(amount)} sent to ${recipient}`, 'success');
      updateAll();
      showSuccess('Transfer Sent', `${fmt(amount)} has been sent to ${recipient}.`);
      $('transferAmountInput').value = ''; $('transferRecipient').value = '';
    }, 1500);
  });

  // Cards
  $('saveCardBtn')?.addEventListener('click', () => {
    if (base.homeBalance <= 0) { showDepositFirstModal(); return; }
    const cardNumber = $('cardNumber').value.replace(/\s/g, ''), expiry = $('cardExpiry').value, cvv = $('cardCvv').value;
    if (!cardNumber || cardNumber.length < 15 || !expiry || !cvv) return alert('Please fill all card details');
    const last4 = cardNumber.slice(-4);
    if (currentUser) {
      currentUser.savedCard = { last4, expiry, cardNumber, cvv };
      saveUser(currentUser);
      addNotification('Card Added', `Card ending in ${last4} has been linked.`, 'success');
      closeModal('cardModal'); $('cardNumber').value = ''; $('cardExpiry').value = ''; $('cardCvv').value = '';
      updateCardDisplay();
    }
  });

  // History Modals
  function showModalWithGuard(title, arr) {
    if (base.homeBalance <= 0) { showDepositFirstModal(); return; }
    $('modalTitle').textContent = title;
    const list = $('modalTransactionsList');
    list.innerHTML = arr.map(tx => {
      let s = tx.currency === 'USD' ? `${tx.amount>=0?'+':'-'}$${Math.abs(tx.amount).toFixed(2)}` : `${tx.amount>=0?'+':''}${fmt(Math.abs(tx.amount))}`;
      return `<div class="tx-row" data-tx-id="${tx.id}">${getTxIconHTML(tx)}<div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div></div>`;
    }).join('');
    openModal('transactionModal');
  }
  $('viewAllTransactionsBtn')?.addEventListener('click', () => showModalWithGuard('All Transactions', allTransactions));
  $('viewAllWithdrawalsBtn')?.addEventListener('click', () => showModalWithGuard('All Withdrawals', withdrawalsOnly));
  $('viewAllWalletTx')?.addEventListener('click', () => showModalWithGuard('Wallet Transactions', allTransactions));
  $('modalCloseBtn')?.addEventListener('click', () => closeModal('transactionModal'));

  // Withdraw Confirm
  $('finalConfirmWithdrawBtn')?.addEventListener('click', () => {
    const amount = parseFloat($('withdrawInput').value);
    const accountNumber = $('withdrawAccountInput').value.trim();
    let bankName = activeWithdrawMethod === 'bank' ? (document.getElementById('bankSelect')?.value || 'Bank') : (document.getElementById('walletSelect')?.value || activeWithdrawMethod);
    const fee = activeWithdrawMethod.startsWith('usdt') ? 1 : FEE;
    const receive = Math.max(0, amount - fee);
    const dateStr = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
    const ref = 'WD' + Math.floor(Math.random()*90000000+10000000);
    closeModal('withdrawConfirmModal');
    showProcessing('Processing withdrawal...');
    setTimeout(() => {
      hideProcessing();
      base.homeBalance -= amount;
      base.walletTotal = base.homeBalance; base.walletAvailable -= amount; base.nairaWallet = base.walletAvailable;
      base.withdrawable = base.walletAvailable; base.totalWithdrawn += amount;
      base.totalProfit = base.homeBalance - base.totalInvested - base.totalWithdrawn;
      chartData.push({ label: new Date().getHours()+':'+String(new Date().getMinutes()).padStart(2,'0'), value: base.homeBalance });
      addTransaction('Withdrawal', -amount, `To ${bankName}`, new Date().toLocaleString(), null, 'bank');
      addNotification('Withdrawal Processed', `${activeWithdrawMethod.startsWith('usdt') ? amount + ' USDT' : fmt(amount)} sent to ${bankName}`, 'success');
      updateAll();
      showSuccess('Withdrawal Successful', `${activeWithdrawMethod.startsWith('usdt') ? receive + ' USDT' : fmt(receive)} will be sent to your ${bankName}. Reference: ${ref}`);
      $('withdrawInput').value = ''; $('withdrawAccountInput').value = '';
    }, 2500);
  });

  // VIP Upgrade Scroll
  $('upgradeVipBtn')?.addEventListener('click', () => { setView('invest'); setTimeout(() => { const vipCard = $('vipPlanCard'); if (vipCard) vipCard.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300); });

  // View Switching
  function setView(v) {
    ['homeView','investView','withdrawView','walletView','communityView'].forEach(id => $(id).classList.remove('active'));
    $(v+'View').classList.add('active');
    $('pageTitle').textContent = { home:'Home', invest:'Invest', withdraw:'Withdrawal', wallet:'Wallet', community:'Community' }[v] || 'Home';
    document.querySelectorAll('.nav-item[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === v));
    updateAll();

    if (v === 'withdraw') {
      forceUpdateWithdrawHero();
      updateMethodCardsVisibility();
      renderWithdrawForm(activeWithdrawMethod);
    }
    if (v === 'wallet') {
      renderWalletAccounts();
      setTimeout(() => renderWalletAccounts(), 10);
    }

    toggleBanner(v === 'home');
  }
  window.setView = setView;

  document.querySelectorAll('.nav-item[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  document.addEventListener('click', e => { let t = e.target.closest('[data-nav]'); if (t && t.dataset.nav) setView(t.dataset.nav); });

  // Wallet Actions
  const walletActions = document.querySelectorAll('.wallet-actions .wallet-action');
  if (walletActions[0]) walletActions[0].addEventListener('click', () => openDepositModal());
  if (walletActions[1]) walletActions[1].addEventListener('click', () => setView('withdraw'));
  if (walletActions[2]) walletActions[2].addEventListener('click', () => openModal('transferModal'));
  if (walletActions[3]) walletActions[3].addEventListener('click', () => showModalWithGuard('All Transactions', allTransactions));
  if (walletActions[4]) walletActions[4].addEventListener('click', () => openModal('cardModal'));

  // Drawer
  function openDrawer() { $('drawerOverlay')?.classList.add('open'); $('drawerPanel')?.classList.add('open'); const badge = $('notificationBadge'); if (badge) badge.style.display = 'none'; }
  function closeDrawer() { $('drawerOverlay')?.classList.remove('open'); $('drawerPanel')?.classList.remove('open'); updateNotificationBadge(); }
  $('menuBtn')?.addEventListener('click', openDrawer);
  $('drawerCloseBtn')?.addEventListener('click', closeDrawer);
  $('drawerOverlay')?.addEventListener('click', closeDrawer);

  // Quick Actions
  (function initQuickActions(){
    const actions = [
      { label:"Invest", color:"linear-gradient(135deg,#6d28d9,#8b5cf6)", nav:'invest', icon:'<path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-6"/><path d="M12 16V8"/><path d="M16 16v-3"/>' },
      { label:"Deposit", color:"linear-gradient(135deg,#16a34a,#4ade80)", nav:'wallet', icon:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>' },
      { label:"Withdraw", color:"linear-gradient(135deg,#d97706,#f59e0b)", nav:'withdraw', icon:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>' },
      { label:"Transfer", color:"linear-gradient(135deg,#2563eb,#60a5fa)", nav:'wallet', icon:'<path d="M7 7h14"/><path d="m18 4 3 3-3 3"/><path d="M17 17H3"/><path d="m6 14-3 3 3 3"/>' },
      { label:"Wallet", color:"linear-gradient(135deg,#db2777,#f472b6)", nav:'wallet', icon:'<path d="M3 7h18v10H3z"/><path d="M16 12h4"/><circle cx="16.5" cy="12" r="1.2" fill="white" stroke="none"/>' },
      { label:"Community", color:"linear-gradient(135deg,#5b21b6,#8b5cf6)", nav:'community', icon:'<path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"/><path d="M8 13c1.7 0 3-1.3 3-3S9.7 7 8 7 5 8.3 5 10s1.3 3 3 3Z"/><path d="M3 19c.7-2.7 3-4 5-4s4.3 1.3 5 4"/>' }
    ];
    $('quickActions').innerHTML = actions.map(a => `<div class="action" data-nav="${a.nav}"><div class="circle" style="background:${a.color}"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">${a.icon}</svg></div><div class="label">${a.label}</div></div>`).join('');
  })();

  // Other Buttons
  $('promoUpgradeBtn')?.addEventListener('click', () => $('vipPlanCard')?.scrollIntoView({behavior:'smooth'}));
  $('drawerTxHistoryBtn')?.addEventListener('click', () => showModalWithGuard('All Transactions', allTransactions));
  $('drawerHelpBtn')?.addEventListener('click', () => openModal('helpModal'));
  $('drawerNotificationsBtn')?.addEventListener('click', () => openModal('notificationsModal'));
  $('drawerSecurityBtn')?.addEventListener('click', () => openModal('securityModal'));
  $('drawerSettingsBtn')?.addEventListener('click', () => openModal('settingsModal'));
  $('comparePlansBtn')?.addEventListener('click', () => openModal('comparePlansModal'));

  // Referral modal
  function updateReferModal() {
    if (!$('referModal')) return;
    const user = currentUser || getStoredUser();
    if (!user) return;
    const codeDisplay = $('referralCodeDisplay');
    if (codeDisplay) codeDisplay.textContent = user.referralCode || '--------';
    const countEl = $('referralCount');
    if (countEl) countEl.textContent = user.referrals || 0;
    const commEl = $('commissionEarned');
    if (commEl) {
      const comm = (user.commission || 0) * rates[currentCurrency];
      const sym = symbols[currentCurrency];
      commEl.textContent = `${sym} ${comm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }

  function initReferHowToggle() {
    const title = $('referHowTitle');
    const instructions = $('referInstructions');
    if (!title || !instructions) return;
    title.addEventListener('click', () => {
      const isExpanded = title.classList.toggle('expanded');
      instructions.classList.toggle('show', isExpanded);
    });
  }

  $('drawerReferBtn')?.addEventListener('click', () => {
    updateReferModal();
    openModal('referModal');
  });

  $('copyReferBtn')?.addEventListener('click', () => {
    const user = currentUser || getStoredUser();
    if (user && user.referralCode) {
      navigator.clipboard.writeText(user.referralCode).then(() => {
        const btn = $('copyReferBtn'); if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy Referral Code'; }, 2000); }
      }).catch(() => alert('Failed to copy'));
    }
  });

  // Modal Close buttons
  $('closeInvestModalBtn')?.addEventListener('click', () => closeModal('investModal'));
  $('closeSuccessModalBtn')?.addEventListener('click', () => closeModal('successModal'));
  $('successModalOkBtn')?.addEventListener('click', () => closeModal('successModal'));
  $('closeHelpModalBtn')?.addEventListener('click', () => closeModal('helpModal'));
  $('closeSettingsModalBtn')?.addEventListener('click', () => closeModal('settingsModal'));
  $('closeSecurityModalBtn')?.addEventListener('click', () => closeModal('securityModal'));
  $('closeReferModalBtn')?.addEventListener('click', () => closeModal('referModal'));
  $('closeCompareModalBtn')?.addEventListener('click', () => closeModal('comparePlansModal'));
  $('closeOverviewDetailBtn')?.addEventListener('click', () => closeModal('overviewDetailModal'));
  $('closeDepositModalBtn')?.addEventListener('click', () => closeModal('depositModal'));
  $('closePaymentModalBtn')?.addEventListener('click', () => closeModal('paymentModal'));
  $('closeTransferModalBtn')?.addEventListener('click', () => closeModal('transferModal'));
  $('closeCardModalBtn')?.addEventListener('click', () => closeModal('cardModal'));
  $('closeWithdrawConfirmBtn')?.addEventListener('click', () => closeModal('withdrawConfirmModal'));
  $('closeTransferSuccessBtn')?.addEventListener('click', () => closeModal('transferSuccessModal'));

  // Logout
  const logoutBtn = $('drawerLogoutBtn');
  if (logoutBtn) { const newLogoutBtn = logoutBtn.cloneNode(true); logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn); newLogoutBtn.addEventListener('click', () => openModal('logoutConfirmModal')); }
  $('confirmLogoutBtn')?.addEventListener('click', () => { sessionStorage.removeItem('tradePulseLoggedIn'); sessionStorage.removeItem('tradePulseCurrentUser'); location.reload(); });
  $('cancelLogoutBtn')?.addEventListener('click', () => closeModal('logoutConfirmModal'));

  // Modal overlay click to close
  ['investModal','depositModal','paymentModal','withdrawConfirmModal','cardModal','transferModal','successModal',
   'withdrawalSuccessModal','withdrawalReceiptModal','transactionModal','securityModal','notificationsModal',
   'helpModal','settingsModal','referModal','comparePlansModal','overviewDetailModal','transferSuccessModal',
   'logoutConfirmModal','forgotPasswordModal'].forEach(id => { const el = $(id); if (el) el.addEventListener('click', e => { if (e.target === el) closeModal(id); }); });

  // Chart Auto-refresh
  setInterval(() => {
    if (!$('homeView')?.classList.contains('active')) return;
    if (base.homeBalance <= 0) return;
    let last = chartData[chartData.length-1];
    if (!last) return;
    let newValue = last.value + Math.floor(Math.random() * 1500) + 500;
    chartData.push({ label: new Date().getHours()+':'+String(new Date().getMinutes()).padStart(2,'0'), value: newValue });
    if (chartData.length > 20) chartData.shift();
    base.homeBalance = newValue;
    updateAll();
  }, 30000);

  // Banner Carousel
  let currentBannerIndex = 0;
  const totalBanners = 3;
  let bannerInterval;
  function showBanner(index) {
    const slides = document.getElementById('bannerSlides');
    if (!slides) return;
    slides.style.transform = `translateX(-${index * 100}%)`;
    document.querySelectorAll('.banner-dots .dot').forEach(d => d.classList.remove('active'));
    const activeDot = document.querySelector(`.banner-dots .dot[data-index="${index}"]`);
    if (activeDot) activeDot.classList.add('active');
    currentBannerIndex = index;
  }
  function nextBanner() { showBanner((currentBannerIndex + 1) % totalBanners); }
  function startBannerAutoPlay() { stopBannerAutoPlay(); bannerInterval = setInterval(nextBanner, 4000); }
  function stopBannerAutoPlay() { clearInterval(bannerInterval); }
  const bannerDotsEl = document.getElementById('bannerDots');
  if (bannerDotsEl) {
    bannerDotsEl.addEventListener('click', (e) => {
      const dot = e.target.closest('.dot');
      if (!dot) return;
      showBanner(parseInt(dot.dataset.index));
      stopBannerAutoPlay(); startBannerAutoPlay();
    });
  }
  let touchStartX = 0;
  const bannerEl = document.querySelector('.banner-carousel');
  if (bannerEl) {
    bannerEl.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; stopBannerAutoPlay(); });
    bannerEl.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) showBanner((currentBannerIndex + 1) % totalBanners);
        else showBanner((currentBannerIndex - 1 + totalBanners) % totalBanners);
      }
      startBannerAutoPlay();
    });
  }
  function toggleBanner(active) {
    if (active) { showBanner(0); startBannerAutoPlay(); }
    else stopBannerAutoPlay();
  }

  // Withdrawal Receipt
  function openWithdrawalReceipt(tx) {
    const bankName = tx.subtitle.replace('To ','');
    const isUSDT = bankName.includes('USDT');
    const fee = isUSDT ? 1 : FEE;
    const absAmount = Math.abs(tx.amount);
    const received = Math.max(0, absAmount - fee);
    const receiptBankSpan = document.getElementById('receiptBank');
    const iconPath = getBankIconPath(bankName);
    const bg = shouldUseWhiteBackground(bankName) ? 'background:#ffffff; padding:2px;' : '';
    if (iconPath) {
      receiptBankSpan.innerHTML = `<img src="${iconPath}" style="width:24px; height:24px; border-radius:4px; vertical-align:middle; margin-right:6px; ${bg} object-fit:contain;" onerror="this.style.display='none';"> ${bankName}`;
    } else receiptBankSpan.textContent = bankName;
    document.getElementById('receiptAmount').textContent = isUSDT ? `${absAmount} USDT` : fmt(absAmount);
    document.getElementById('receiptFee').textContent = isUSDT ? `- ${fee} USDT` : `- ${fmt(fee)}`;
    document.getElementById('receiptReceive').textContent = isUSDT ? `${received} USDT` : fmt(received);
    document.getElementById('receiptDateTime').textContent = tx.meta;
    document.getElementById('receiptStatus').textContent = tx.status;
    const datePart = tx.meta ? tx.meta.replace(/[^0-9]/g, '').substring(0,8) : '00000000';
    document.getElementById('receiptRef').textContent = 'WD' + tx.id.toString().padStart(6,'0') + datePart;
    document.getElementById('withdrawalReceiptModal').classList.add('open');
  }
  function handleWithdrawalRowClick(e) {
    const row = e.target.closest('.tx-row[data-tx-id]');
    if (!row) return;
    const txId = parseInt(row.dataset.txId);
    const tx = allTransactions.find(t => t.id === txId);
    if (tx) openWithdrawalReceipt(tx);
  }
  document.getElementById('recentWithdrawals').addEventListener('click', handleWithdrawalRowClick);
  document.getElementById('modalTransactionsList').addEventListener('click', handleWithdrawalRowClick);
  document.getElementById('closeWithdrawalReceiptBtn').addEventListener('click', () => document.getElementById('withdrawalReceiptModal').classList.remove('open'));
  document.getElementById('closeReceiptBtn').addEventListener('click', () => document.getElementById('withdrawalReceiptModal').classList.remove('open'));
  document.getElementById('withdrawalReceiptModal').addEventListener('click', (e) => { if (e.target === document.getElementById('withdrawalReceiptModal')) document.getElementById('withdrawalReceiptModal').classList.remove('open'); });

  // ========== INITIALIZATION ==========
  function tryInitialize() {
    if (window.__appInitialized) return true;
    const stored = getStoredUser();
    if (!stored) return false;

    currentUser = stored;
    // FORCE PREMIUM + VERIFIED KYC
    currentUser.membership = 'Premium';
    currentUser.kycStatus = 'verified';
    currentUser.kycVerified = true;
    saveUser(currentUser);

    base.homeBalance = currentUser.homeBalance || 1460243;
    base.totalInvested = currentUser.totalInvested || 658000;
    base.totalWithdrawn = currentUser.totalWithdrawn || 1277225;
    base.activePlans = currentUser.activePlans || 3;

    if (currentCurrency === 'USDT') {
      setWithdrawMethod('usdt_trc20');
      updateMethodCardsVisibility();
    } else {
      setWithdrawMethod('bank');
    }

    updateAll();
    updateDrawerUserInfo();
    refresh2faUI();
    updateCardDisplay();
    initReferHowToggle();

    setTimeout(() => {
      renderWalletAccounts();
      forceUpdateWithdrawHero();
      if (activeWithdrawMethod) renderWithdrawForm(activeWithdrawMethod);

      // ========== INJECT OLD USER'S STATIC INVESTMENTS & HISTORY ==========
      const myInvestmentsView = document.getElementById('myInvestmentsView');
      if (myInvestmentsView) {
        myInvestmentsView.innerHTML = `
          <div class="section">
            <div class="panel" style="padding:16px;">
              <div class="plan-card" style="margin:0; border:1px solid rgba(245,158,11,.3); background:linear-gradient(145deg, rgba(45,25,20,.96), rgba(30,15,10,.96));">
                <div class="plan-main">
                  <div class="plan-badge" style="color:#f2a31b"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 9.4 7.5l-6 .9 4.3 4.2-1 6 5.3-2.8 5.3 2.8-1-6 4.3-4.2-6-.9L12 2Z"/></svg><div class="name">Premium Plan</div></div>
                  <div class="plan-copy">
                    <div class="plan-title-row"><div class="plan-title" style="color:#f2a31b">Premium Plan</div><span class="popular" style="background:rgba(245,158,11,.2); color:#fbbf24;">Active</span></div>
                    <p class="plan-desc">Invested ₦470,000 on 15 May 2026. Daily profit 4.0%. Matures on 14 June 2026.</p>
                  </div>
                  <div class="profit-box" style="color:#f2a31b">
                    <div class="small">Daily Profit</div>
                    <div class="rate">4.0%</div>
                    <div style="font-size:13px; margin-top:8px;">Expected Return<br>₦ 1,034,000</div>
                  </div>
                </div>
                <div class="plan-meta">
                  <div class="meta-item"><div class="meta-label">Invested Amount</div><div class="meta-value">₦ 470,000</div></div>
                  <div class="meta-item"><div class="meta-label">Start Date</div><div class="meta-value">15 May 2026</div></div>
                  <div class="meta-item"><div class="meta-label">End Date</div><div class="meta-value">14 Jun 2026</div></div>
                  <div class="meta-item"><div class="meta-label">Status</div><div class="meta-value" style="color:#22c55e;">Active</div></div>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      const investHistoryView = document.getElementById('investHistoryView');
      if (investHistoryView) {
        investHistoryView.innerHTML = `
          <div class="section">
            <div class="panel transactions" style="padding:0;">
              <div class="tx-row">
                <div class="tx-ico" style="background:rgba(34,197,94,.12);"><svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><path d="M4 7h10a2 2 0 0 1 2 2v10H6a2 2 0 0 1-2-2V7Z"/><path d="M8 7V5a2 2 0 0 1 2-2h8v10"/></svg></div>
                <div class="tx-main"><div class="tx-title">Standard Plan (Completed)</div><div class="tx-sub">Invested ₦39,950 • 10 Apr 2026 – 10 May 2026 • Profit ₦41,947</div></div>
                <div class="tx-right"><div class="tx-amt" style="color:#4ade80;">+₦41,947</div><div class="status">Completed</div></div>
              </div>
              <div class="tx-row">
                <div class="tx-ico" style="background:rgba(34,197,94,.12);"><svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><path d="M4 7h10a2 2 0 0 1 2 2v10H6a2 2 0 0 1-2-2V7Z"/><path d="M8 7V5a2 2 0 0 1 2-2h8v10"/></svg></div>
                <div class="tx-main"><div class="tx-title">Beginner Plan (Completed)</div><div class="tx-sub">Invested ₦23,500 • 5 Mar 2026 – 4 Apr 2026 • Profit ₦21,150</div></div>
                <div class="tx-right"><div class="tx-amt" style="color:#4ade80;">+₦21,150</div><div class="status">Completed</div></div>
              </div>
            </div>
          </div>
        `;
      }
    }, 100);

    window.__appInitialized = true;
    return true;
  }

  let initAttempts = 0;
  (function pollInit() {
    if (tryInitialize()) {
      setView('home');
      return;
    }
    if (++initAttempts > 50) return;
    setTimeout(pollInit, 100);
  })();

})();
