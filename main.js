// ===== ArbiFlex AI – main.js (FINAL – multicrypto, no fiat, static wallets, profile fix, 2‑day KYC, no admin) =====
(function() {
  const $ = (id) => document.getElementById(id);

  // ----- CRYPTO ONLY -----
  const rates = { USDT:1, BTC:1, ETH:1, SOL:1 };
  const symbols = { USDT:'USDT', BTC:'BTC', ETH:'ETH', SOL:'SOL' };
  let currentCurrency = 'USDT';
  const FEE = 50;   // only used in USDT withdrawal context now

  // ========== SOUNDS ==========
  function playSound(id) { const el = document.getElementById(id); if(el) { el.currentTime=0; el.play().catch(()=>{}); } }
  function playClickSound() { playSound('soundClick'); }
  function playNotificationSound() { playSound('soundNotification'); }
  function playSuccessSound() { playSound('soundSuccess'); }
  function playAlertSound() { playSound('soundAlert'); }

  // ========== STATIC WALLET ADDRESSES ==========
  const walletAddresses = {
    USDT: 'TY23RUXeNaibpnTnvxxu18qiqtMpDws6yB',
    BTC:  'bc1qar0srrr7xfkvy5l643lxdnw9re59gtzzwf5mdq',
    ETH:  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    SOL:  '7B2jGqGqHcK6nJq8zDzZyfFf8e4dA2tK5rFq9sMvJx8P'
  };

  // ========== INLINE COIN SVGs (for wallet/payment) ==========
  const coinSVGs = {
    USDT: `<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#26a17b"/><text x="20" y="28" text-anchor="middle" fill="white" font-size="22" font-weight="800">₮</text></svg>`,
    BTC:  `<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#f7931a"/><text x="20" y="28" text-anchor="middle" fill="white" font-size="22" font-weight="800">₿</text></svg>`,
    ETH:  `<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#627eea"/><text x="20" y="28" text-anchor="middle" fill="white" font-size="22" font-weight="800">Ξ</text></svg>`,
    SOL:  `<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#9945ff"/><text x="20" y="28" text-anchor="middle" fill="white" font-size="22" font-weight="800">◎</text></svg>`
  };

  // ========== WITHDRAWAL BANKS – USDT only ==========
  const withdrawalBanks = {
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

  // Deposit presets (minimum 10 for most, BTC 0.001)
  const depositPresets = {
    USDT: [10, 50, 100, 500, 1000],
    BTC:  [0.001, 0.005, 0.01, 0.05, 0.1],
    ETH:  [10, 50, 100, 500, 1000],
    SOL:  [10, 50, 100, 500, 1000]
  };

  const withdrawPresets = {
    USDT: [10, 50, 100, 500, 'max'],
    BTC:  [0.001, 0.005, 0.01, 'max'],
    ETH:  [10, 50, 100, 'max'],
    SOL:  [10, 50, 100, 'max']
  };

  // ----- Helpers -----
  function openModal(id) { const el = $(id); if(el) el.classList.add('open'); }
  function closeModal(id) { const el = $(id); if(el) el.classList.remove('open'); }

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
      if(idx !== -1) users[idx] = user;
      else users.push(user);
      localStorage.setItem('tradePulseUsers', JSON.stringify(users));
      localStorage.setItem('tradePulseUser', JSON.stringify(user));
    } catch(e) {}
    updateDrawerUserInfo();
    updateAll();
  }

  function showProcessing(text) {
    const overlay = $('processingOverlay');
    const label = document.querySelector('.processing-text');
    if(label) label.textContent = text || 'Processing...';
    if(overlay) overlay.classList.add('open');
  }
  function hideProcessing() {
    const overlay = $('processingOverlay');
    if(overlay) overlay.classList.remove('open');
  }

  function showSuccess(title, message) {
    const modalTitle = $('successModalTitle');
    const modalText = $('successModalText');
    if(modalTitle) modalTitle.textContent = title || 'Success';
    if(modalText) modalText.textContent = message || 'Done.';
    openModal('successModal');
  }

  function showPaymentNotDetected() {
    const existing = document.getElementById('paymentNotDetectedModal');
    if(existing) existing.remove();
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
    modalDiv.addEventListener('click', (e) => { if(e.target === modalDiv) modalDiv.remove(); });
    playAlertSound();
  }

  function showDepositFirstModal() {
    const existing = document.getElementById('depositFirstModal');
    if(existing) existing.remove();
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
    document.getElementById('depositFirstGoBtn').addEventListener('click', () => { modalDiv.remove(); openDepositModal(); });
    modalDiv.addEventListener('click', (e) => { if(e.target === modalDiv) modalDiv.remove(); });
  }

  function showInsufficientBalanceModal() {
    const existing = document.getElementById('insufficientBalanceModal');
    if(existing) existing.remove();
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
    document.getElementById('insufficientGoDeposit').addEventListener('click', () => { modalDiv.remove(); openDepositModal(); });
    modalDiv.addEventListener('click', (e) => { if(e.target === modalDiv) modalDiv.remove(); });
  }

  function convert(amount) { return amount; }
  function fmt(amount) {
    const sym = symbols[currentCurrency];
    return `${sym} ${amount.toLocaleString('en', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  }

  let base = {
    homeBalance: 0, totalInvested: 0, totalProfit: 0, totalWithdrawn: 0,
    walletTotal: 0, walletAvailable: 0, walletLocked: 0, nairaWallet: 0,
    withdrawable: 0, txFee: FEE, activePlans: 0,
    planMin1: 10, planMax1: 49999, planMin2: 50000, planMax2: 199999,
    planMin3: 200000, planMax3: 499999, planMin4: 500000
  };

  const planRates = {
    beginner: { range: '3.0%', avg: 3.0 },
    standard: { range: '3.5%', avg: 3.5 },
    premium:  { range: '4.0%', avg: 4.0 },
    vip:      { range: '4.5%', avg: 4.5 }
  };
  let currentPlanAvg = 0;
  let chartData = [];
  let allTransactions = [];
  let withdrawalsOnly = [];

  let notifications = [];
  function updateNotificationBadge() {
    const unread = notifications.filter(n => !n.read).length;
    const topBadge = $('notificationBadge');
    if(topBadge) {
      topBadge.textContent = unread;
      topBadge.style.display = unread > 0 ? 'flex' : 'none';
    }
  }

  function renderNotificationsModal() {
    const list = $('notificationsList');
    if(!list) return;
    if(!notifications.length) {
      list.innerHTML = '<div style="padding:20px;text-align:center;color:#9ca3af;">No notifications yet</div>';
      updateNotificationBadge();
      return;
    }
    list.innerHTML = notifications.map(n => `
      <div class="notification-item" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05);opacity:${n.read ? 0.72 : 1}; cursor:pointer;" data-id="${n.id}">
        ${n.image ? `<img src="${n.image}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;" onerror="this.style.display='none'">` : ''}
        <div style="min-width:0;">
          <div style="font-weight:600;">${n.title}</div>
          <div style="font-size:12px;color:#9ca3af;">${n.message}</div>
          <div style="font-size:10px;color:#6b7280;margin-top:4px;">${n.time}</div>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        const n = notifications.find(no => no.id == item.dataset.id);
        if(n) openNotificationPreview(n);
      });
    });
    updateNotificationBadge();
  }

  function openNotificationPreview(notification) {
    $('notifPreviewTitle').textContent = notification.title;
    $('notifPreviewImage').src = notification.image || '';
    $('notifPreviewMessage').textContent = notification.message;
    $('notificationPreviewModal').classList.add('open');
  }

  function addNotification(title, message, type = 'success', image = null) {
    notifications.unshift({ id: Date.now(), title, message, type, image, time: new Date().toLocaleString(), read: false });
    if(notifications.length > 20) notifications.pop();
    updateNotificationBadge();
    renderNotificationsModal();
    playNotificationSound();
  }

  function markNotificationsRead() {
    notifications = notifications.map(n => ({ ...n, read: true }));
    updateNotificationBadge();
    renderNotificationsModal();
  }

  function updateDrawerUserInfo() {
    const user = currentUser || getStoredUser();
    if(!user) return;
    const firstLetter = String(user.username || 'U').trim().charAt(0).toUpperCase();
    const drawerFullName = $('drawerFullName');
    const drawerMembership = $('drawerMembership');
    const drawerUserId = $('drawerUserId');
    const referralCodeDisplay = $('referralCodeDisplay');
    if(drawerFullName) drawerFullName.textContent = user.username || 'User';
    if(drawerMembership) {
      const textNode = drawerMembership.childNodes[0];
      if(textNode && textNode.nodeType === 3) {
        textNode.textContent = (user.membership || 'Beginner') + ' ';
      }
    }
    if(drawerUserId) drawerUserId.textContent = user.userId || '------';
    if(referralCodeDisplay) referralCodeDisplay.textContent = user.referralCode || '--------';

    const kycBadge = $('drawerKycBadge');
    if(kycBadge) {
      let status = user.kycStatus || (user.kycVerified ? 'verified' : 'unverified');
      if(status === 'processing') {
        kycBadge.textContent = 'Processing';
        kycBadge.style.background = 'rgba(245,158,11,.15)';
        kycBadge.style.color = '#f59e0b';
      } else if(status === 'verified') {
        kycBadge.textContent = 'Verified';
        kycBadge.style.background = 'rgba(34,197,94,.15)';
        kycBadge.style.color = '#4ade80';
      } else {
        kycBadge.textContent = 'Unverified';
        kycBadge.style.background = 'rgba(239,68,68,.15)';
        kycBadge.style.color = '#f87171';
      }
    }

    const avatar = $('drawerAvatar');
    if(avatar) {
      let img = avatar.querySelector('img');
      let initial = avatar.querySelector('.avatar-initial');
      if(user.avatar) {
        if(!img) { img = document.createElement('img'); avatar.prepend(img); }
        img.src = user.avatar;
        img.style.width = '100%'; img.style.height = '100%'; img.style.objectFit = 'cover'; img.style.borderRadius = '50%'; img.style.position = 'absolute'; img.style.top = '0'; img.style.left = '0';
        if(initial) initial.remove();
      } else {
        if(img) img.remove();
        if(!initial) {
          initial = document.createElement('span');
          initial.className = 'avatar-initial';
          initial.style.fontSize = '26px'; initial.style.fontWeight = '800';
          avatar.prepend(initial);
        }
        initial.textContent = firstLetter;
      }
    }

    const copyBtn = $('copyUidBtn');
    if(copyBtn && user.userId) {
      if(!copyBtn.classList.contains('copy-uid-btn')) copyBtn.classList.add('copy-uid-btn');
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
    if(cardDisplay) {
      if(user?.savedCard) {
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
    if(type === 'Withdrawal') withdrawalsOnly.push(tx);
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
    if(!subtitle) return '';
    let name = subtitle.replace(/^(To|From)\s+/i, '').trim();
    if(name.toLowerCase().includes('usdt')) return 'USDT';
    return name;
  }

  function getBankIconPath(bankName) {
    if(bankIconMap[bankName]) return bankIconMap[bankName];
    for(let key of Object.keys(bankIconMap)) {
      if(bankName.toLowerCase().includes(key.toLowerCase())) return bankIconMap[key];
    }
    return null;
  }

  const fallbackBankSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>';

  function getTxIconHTML(tx) {
    let bankName = extractBankName(tx.subtitle);
    let iconPath = getBankIconPath(bankName);
    let bg = shouldUseWhiteBackground(bankName) ? 'background:#ffffff; padding:6px;' : '';
    if(iconPath) {
      return `<div class="tx-ico" style="${bg} display:grid; place-items:center; border-radius:50%;">
                <img src="${iconPath}" style="width:100%; height:100%; object-fit:contain;" 
                     onerror="this.style.display='none';this.parentNode.innerHTML='<div style=\\'width:100%;height:100%;display:grid;place-items:center;border-radius:50%;background:rgba(255,255,255,0.1);color:#fff;font-size:16px;\\'>${fallbackBankSVG}</div>';">
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
    if(balanceHidden) {
      if(homeEye) homeEye.innerHTML = slashedEye;
      if(withdrawEye) withdrawEye.innerHTML = slashedEye;
      if(walletEye) walletEye.innerHTML = slashedEye;
    } else {
      if(homeEye) homeEye.innerHTML = normalEye;
      if(withdrawEye) withdrawEye.innerHTML = normalEye;
      if(walletEye) walletEye.innerHTML = normalEye;
    }
    const toggleEl = $('hideBalanceToggle');
    if(toggleEl) toggleEl.querySelector('span').textContent = balanceHidden ? 'Show Balance' : 'Hide Balance';
  }

  function renderWalletAccounts() {
    let container = document.getElementById('walletAccountsContainer');
    if(!container) {
      container = document.createElement('div');
      container.id = 'walletAccountsContainer';
      const walletView = document.getElementById('walletView');
      if(walletView) walletView.appendChild(container);
      else return;
    }
    const svg = coinSVGs[currentCurrency];
    const name = currentCurrency;
    const balanceInCoin = base.homeBalance * rates[currentCurrency];
    const symbol = symbols[currentCurrency];
    const currencyLabel = currentCurrency;

    container.innerHTML = `
      <div class="wallet-account">
        <div class="wallet-account-top-row">
          <div class="wallet-account-left">
            <div class="wallet-coin" style="background:transparent">${svg}</div>
            <div class="wallet-account-info">
              <div class="wallet-account-top"><span class="wallet-account-name">${name} Wallet</span><span class="primary-tag">Primary</span></div>
              <div class="wallet-account-value">${balanceHidden ? '****' : symbol + ' ' + balanceInCoin.toFixed(2)}</div>
              <div class="wallet-account-sub">≈ ${symbol} ${balanceInCoin.toFixed(2)}</div>
            </div>
          </div>
          <svg class="row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg>
        </div>
        <div class="wallet-account-actions">
          <button class="small-action deposit-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/></svg>Deposit</button>
          <button class="small-action btn-disabled" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/></svg>Withdraw</button>
        </div>
      </div>`;
    container.querySelectorAll('.small-action:not(.btn-disabled)').forEach(btn => btn.addEventListener('click', openDepositModal));
  }

  function forceUpdateWithdrawHero() {
    const withdrawBalanceEl = document.getElementById('withdrawBalance');
    const withdrawFxEl = document.getElementById('withdrawFx');
    const withdrawableAmtEl = document.getElementById('withdrawableAmount');

    if(balanceHidden) {
      if(withdrawBalanceEl) withdrawBalanceEl.textContent = '****';
      if(withdrawFxEl) withdrawFxEl.textContent = '****';
      if(withdrawableAmtEl) withdrawableAmtEl.textContent = '****';
      return;
    }

    const sym = symbols[currentCurrency];
    if(withdrawBalanceEl) withdrawBalanceEl.textContent = `${sym} ${base.homeBalance.toFixed(2)}`;
    if(withdrawFxEl) withdrawFxEl.textContent = `≈ $ ${(base.homeBalance * rates['USDT']).toFixed(2)}`;
    if(withdrawableAmtEl) withdrawableAmtEl.textContent = `${sym} ${base.withdrawable.toFixed(2)}`;
  }

  function updateAll() {
    $('currencyBtn').textContent = currentCurrency + ' ▾';
    document.querySelectorAll('.currency-option').forEach(o => o.classList.toggle('selected', o.dataset.currency === currentCurrency));

    if(balanceHidden) {
      const ids = ['homeBalance','homeFx','walletTotalBalance','walletTotalFx','availableBalance','lockedBalance','nairaWallet','withdrawBalance','withdrawFx','withdrawableAmount','totalInvested','totalProfit','totalWithdrawn'];
      ids.forEach(id => { const el = $(id); if(el) el.textContent = '****'; });
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

    const sym = symbols[currentCurrency];
    const elHomeBalance = $('homeBalance'); if(elHomeBalance) elHomeBalance.textContent = `${sym} ${base.homeBalance.toFixed(2)}`;
    const elHomeFx = $('homeFx'); if(elHomeFx) elHomeFx.textContent = `≈ $ ${(base.homeBalance * rates['USDT']).toFixed(2)}`;
    const elTotalInvested = $('totalInvested'); if(elTotalInvested) elTotalInvested.textContent = `${sym} ${base.totalInvested.toFixed(2)}`;
    const elTotalProfit = $('totalProfit'); if(elTotalProfit) elTotalProfit.textContent = `${sym} ${Math.max(0, base.totalProfit).toFixed(2)}`;
    const elTotalWithdrawn = $('totalWithdrawn'); if(elTotalWithdrawn) elTotalWithdrawn.textContent = `${sym} ${base.totalWithdrawn.toFixed(2)}`;
    const elActivePlansCount = $('activePlansCount'); if(elActivePlansCount) elActivePlansCount.textContent = base.activePlans;
    const elWalletTotalBalance = $('walletTotalBalance'); if(elWalletTotalBalance) elWalletTotalBalance.textContent = `${sym} ${base.walletTotal.toFixed(2)}`;
    const elWalletTotalFx = $('walletTotalFx'); if(elWalletTotalFx) elWalletTotalFx.textContent = `≈ $ ${(base.walletTotal * rates['USDT']).toFixed(2)}`;
    const elAvailableBalance = $('availableBalance'); if(elAvailableBalance) elAvailableBalance.textContent = `${sym} ${base.walletAvailable.toFixed(2)}`;
    const elLockedBalance = $('lockedBalance'); if(elLockedBalance) elLockedBalance.textContent = `${sym} ${base.walletLocked.toFixed(2)}`;
    const elNairaWallet = $('nairaWallet'); if(elNairaWallet) elNairaWallet.textContent = `${sym} ${base.nairaWallet.toFixed(2)}`;

    forceUpdateWithdrawHero();
    renderRecentTx();
    renderRecentWithdrawals();
    renderWalletTx();
    renderOverviewCards();
    buildChart();
    renderWalletAccounts();

    const withdrawBtn = $('withdrawNavBtn');
    if(withdrawBtn) {
      if(base.homeBalance <= 0) {
        withdrawBtn.classList.add('btn-disabled');
        withdrawBtn.disabled = true;
      } else {
        withdrawBtn.classList.remove('btn-disabled');
        withdrawBtn.disabled = false;
      }
    }
  }

  function buildChart() {
    const container = $('chartContainer');
    if(!container) return;
    if(chartData.length === 0) { container.innerHTML = '<div style="height:250px; display:flex; align-items:center; justify-content:center; color:#6b7280;">No data yet. Start trading!</div>'; return; }
    let maxV = Math.max(...chartData.map(d => d.value)) * 1.1 || 1000;
    let W = 400, H = 250, pl = 60, pr = 20, pt = 26, pb = 30;
    let gw = W - pl - pr, gh = H - pt - pb;
    let xs = i => pl + (i / (chartData.length - 1)) * gw;
    let ys = v => pt + gh - (v / maxV) * gh;
    let lp = '', ap = '';
    chartData.forEach((p, i) => {
      let x = xs(i), y = ys(p.value);
      if(i === 0) { lp += `M ${x} ${y}`; ap += `M ${x} ${H-pb} L ${x} ${y}`; }
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
    if(!c) return;
    if(allTransactions.length === 0) { c.innerHTML = '<div class="tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No transactions yet</div><div class="tx-sub">Deposit funds to get started</div></div></div>'; return; }
    c.innerHTML = allTransactions.slice(-4).reverse().map(tx => {
      let s = tx.currency === 'USD' ? `${tx.amount>=0?'+':'-'}$${Math.abs(tx.amount).toFixed(2)}` : `${tx.amount>=0?'+':''}${fmt(Math.abs(tx.amount))}`;
      return `<div class="tx-row" data-tx-id="${tx.id}">${getTxIconHTML(tx)}<div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div></div>`;
    }).join('');
  }

  function renderRecentWithdrawals() {
    const c = $('recentWithdrawals');
    if(!c) return;
    if(withdrawalsOnly.length === 0) { c.innerHTML = '<div class="tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No withdrawals yet</div><div class="tx-sub">Your withdrawals will appear here</div></div></div>'; return; }
    c.innerHTML = withdrawalsOnly.slice(-14).reverse().map(tx => {
      let s = tx.currency === 'USD' ? `-$${Math.abs(tx.amount).toFixed(2)}` : `-${fmt(Math.abs(tx.amount))}`;
      return `<div class="tx-row" data-tx-id="${tx.id}">${getTxIconHTML(tx)}<div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div></div>`;
    }).join('');
  }

  function renderWalletTx() {
    const c = $('walletRecentTx');
    if(!c) return;
    if(allTransactions.length === 0) { c.innerHTML = '<div class="wallet-tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No transactions</div></div></div>'; return; }
    c.innerHTML = allTransactions.slice(-4).reverse().map(tx => {
      let s = tx.currency === 'USD' ? `${tx.amount>=0?'+':'-'}$${Math.abs(tx.amount).toFixed(2)}` : `${tx.amount>=0?'+':''}${fmt(Math.abs(tx.amount))}`;
      return `<div class="wallet-tx-row">${getTxIconHTML(tx)}<div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div></div>`;
    }).join('');
  }

  function renderOverviewCards() {
    const c = $('overviewCards');
    if(!c) return;
    let totalProfitValue = base.totalProfit;
    let investedValue = base.totalInvested;
    let referralValue = currentUser ? (currentUser.commission || 0) : 0;
    let withdrawnValue = base.totalWithdrawn;
    if(overviewPeriod === 'week') {
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
    if(!opt) return;
    currentCurrency = opt.dataset.currency;
    $('currencyDropdown').classList.remove('open');
    closeModal('depositModal');
    closeModal('paymentModal');

    // Update the button icon
    const iconSpan = document.getElementById('currencyIconBtn');
    if (iconSpan) {
      const svg = opt.querySelector('svg');
      if (svg) {
        iconSpan.innerHTML = svg.outerHTML;
      } else {
        iconSpan.innerHTML = ''; // fallback
      }
    }

    updateAll();
    forceUpdateWithdrawHero();
    updateDepositModalCurrency();
    renderWalletAccounts();
    renderWithdrawForm(activeWithdrawMethod);
    if($('referModal')?.classList.contains('open')) {
      updateReferModal();
    }
  });
  document.addEventListener('click', e => { if(!e.target.closest('#currencySelector')) $('currencyDropdown').classList.remove('open'); });

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

  // ========== WITHDRAW METHOD SWITCHING (USDT only) ==========
  let activeWithdrawMethod = 'usdt_trc20';
  const withdrawFormContainer = $('withdrawDetailsForm');

  function setWithdrawMethod(method) {
    if(!withdrawFormContainer || method === activeWithdrawMethod) return;
    activeWithdrawMethod = method;
    document.querySelectorAll('.method-card').forEach(card => card.classList.toggle('active', card.dataset.method === method));
    renderWithdrawForm(method);
  }

  document.querySelectorAll('.method-card').forEach(card => card.addEventListener('click', () => setWithdrawMethod(card.dataset.method)));

  function renderWithdrawForm(method) {
    if(!withdrawFormContainer) return;
    let html = '';

    if(method === 'usdt_trc20' || method === 'usdt_bep20') {
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
    } else if(method === 'ewallet') {
      html = `
        <div class="field-label">E-Wallet ID / Email</div>
        <div class="amount-input"><input type="text" id="withdrawAccountInput" placeholder="Enter e-wallet ID or email" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"></div>
        <div class="field-label">Amount</div>
        <div class="amount-input"><input type="number" id="withdrawInput" placeholder="Enter amount" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"><span class="currency">USDT</span></div>
        <div class="amount-presets"><button type="button" class="preset" data-amount="10">10 USDT</button><button type="button" class="preset" data-amount="50">50 USDT</button><button type="button" class="preset" data-amount="100">100 USDT</button><button type="button" class="preset" data-amount="500">500 USDT</button><button type="button" class="preset preset-max" id="maxBtn">Max</button></div>
        <div class="fee-row"><span>Transaction Fee</span><span id="withdrawFee">1 USDT</span></div>
        <div class="receive-row"><span>You Will Receive</span><span id="receiveAmount">0.00 USDT</span></div>
        <span class="field-error" id="withdrawError"></span>
        <button class="withdraw-btn" id="requestWithdrawalBtn">Request Withdrawal</button>
        <div class="notice-box"><div class="notice-title">Withdrawal Notice:</div><div class="notice-text">Ensure your e-wallet details are correct. Instant processing.</div></div>
      `;
    }

    withdrawFormContainer.innerHTML = html;
    bindWithdrawFormEvents();
  }

  function generateWithdrawPresets() {
    const presets = withdrawPresets.USDT;
    return presets.map(amount => {
      if(amount === 'max') return `<button type="button" class="preset preset-max" id="maxBtn">Max</button>`;
      return `<button type="button" class="preset" data-amount="${amount}">${amount} USDT</button>`;
    }).join('');
  }

  function bindWithdrawFormEvents() {
    const withdrawInput = $('withdrawInput');
    const requestBtn = $('requestWithdrawalBtn');
    const errorEl = $('withdrawError');
    if(withdrawInput) {
      withdrawInput.addEventListener('input', () => {
        const amt = parseFloat(withdrawInput.value) || 0;
        if(activeWithdrawMethod.startsWith('usdt') || activeWithdrawMethod === 'ewallet') {
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
        if(!input) return;
        if(btn.id === 'maxBtn') {
          input.value = 1000;
        } else {
          input.value = btn.dataset.amount;
        }
        input.dispatchEvent(new Event('input'));
      });
    });

    const selectEl = document.getElementById('walletSelect');
    if(selectEl) {
      const logoEl = document.getElementById('walletLogoImage');
      const sourceList = withdrawalBanks.USDT;
      selectEl.addEventListener('change', () => {
        const selected = sourceList.find(i => i.name === selectEl.value);
        if(selected && logoEl) {
          logoEl.src = selected.icon;
          logoEl.style.display = 'block';
          if(shouldUseWhiteBackground(selected.name)) { logoEl.style.background = '#ffffff'; logoEl.style.padding = '2px'; }
          else { logoEl.style.background = 'transparent'; logoEl.style.padding = '0'; }
        }
      });
    }

    if(requestBtn) {
      requestBtn.addEventListener('click', () => {
        if(base.homeBalance <= 0) { showInsufficientBalanceModal(); return; }
        const amount = parseFloat($('withdrawInput').value);
        const accountNumber = $('withdrawAccountInput').value.trim();
        const bankName = document.getElementById('walletSelect')?.value || activeWithdrawMethod;

        if(errorEl) { errorEl.textContent = ''; errorEl.style.display = 'none'; }
        if(isNaN(amount) || amount <= 0) { errorEl.textContent = 'Please enter a valid amount.'; errorEl.style.display = 'block'; return; }
        if(!accountNumber) { errorEl.textContent = 'Please enter a wallet address.'; errorEl.style.display = 'block'; return; }
        if(amount > base.homeBalance) { errorEl.textContent = 'Insufficient balance.'; errorEl.style.display = 'block'; return; }

        if(currentUser && currentUser.twoFaEnabled) {
          const pin = prompt('Enter your 6-digit 2FA PIN to confirm withdrawal:');
          if(pin !== currentUser.twoFaPin) { alert('Invalid PIN. Withdrawal cancelled.'); return; }
        }

        const fee = 1;
        const receive = Math.max(0, amount - fee);
        $('confirmBank').textContent = `${bankName} - ${accountNumber}`;
        $('confirmAmount').textContent = amount + ' USDT';
        $('confirmFee').textContent = '1 USDT';
        $('confirmReceive').textContent = receive + ' USDT';
        $('confirmDate').textContent = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
        openModal('withdrawConfirmModal');
      });
    }
  }

  // 2FA
  function refresh2faUI() {
    const user = currentUser || getStoredUser();
    if(!$('enable2faBtn')) return;
    if(user?.twoFaEnabled) { $('enable2faBtn').style.display = 'none'; $('changePinBtn').style.display = 'block'; }
    else { $('enable2faBtn').style.display = 'block'; $('changePinBtn').style.display = 'none'; }
  }
  $('enable2faBtn')?.addEventListener('click', () => {
    const pin = $('twoFaPin').value.trim();
    const confirm = $('twoFaPinConfirm').value.trim();
    const pinError = $('pinError');
    if(!/^\d{6}$/.test(pin) || !/^\d{6}$/.test(confirm)) { pinError.textContent = 'Enter a valid 6-digit PIN.'; pinError.style.display = 'block'; return; }
    if(pin !== confirm) { pinError.textContent = 'PINs do not match.'; pinError.style.display = 'block'; return; }
    if(currentUser) {
      currentUser.twoFaEnabled = true; currentUser.twoFaPin = pin; saveUser(currentUser);
      pinError.style.display = 'none';
      addNotification('2FA Updated', 'Your transaction PIN has been saved.', 'success');
      showSuccess('2FA Saved', 'Your 6-digit PIN has been updated successfully.');
      refresh2faUI(); closeModal('securityModal');
      playSuccessSound();
    }
  });
  $('changePinBtn')?.addEventListener('click', () => openModal('securityModal'));
  $('secureNowBtn')?.addEventListener('click', () => openModal('securityModal'));

  // Deposit Modal
  function updateDepositModalCurrency() {
    const presets = depositPresets[currentCurrency] || depositPresets.USDT;
    const presetsContainer = document.querySelector('#depositModal .amount-presets');
    if(presetsContainer) {
      presetsContainer.innerHTML = presets.map(amount => `<button type="button" class="preset" data-amount="${amount}">${symbols[currentCurrency]}${amount}</button>`).join('');
      document.querySelectorAll('#depositModal .preset').forEach(b => b.addEventListener('click', () => { $('depositAmountInput').value = b.dataset.amount; }));
    }
    const currencySpan = document.querySelector('#depositModal .currency');
    if(currencySpan) currencySpan.textContent = currentCurrency;
  }

  function openDepositModal() {
    updateDepositModalCurrency();
    $('depositModal').classList.add('open');
  }

  $('drawerDepositBtn')?.addEventListener('click', () => openDepositModal());
  document.querySelectorAll('.deposit-purple, .deposit-green, .deposit-amber').forEach(btn => btn.addEventListener('click', () => openDepositModal()));

  function openPaymentModal(amount, isInvestment = false) {
    const sym = symbols[currentCurrency];
    $('paymentAmount').textContent = `${sym} ${amount.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    const currencyLabel = document.getElementById('paymentCurrencyLabel');
    if(currencyLabel) currencyLabel.textContent = currentCurrency;

    const address = walletAddresses[currentCurrency] || walletAddresses.USDT;
    const svg = coinSVGs[currentCurrency];
    const accountNumberDisplay = document.getElementById('accountNumberDisplay');
    if(accountNumberDisplay) accountNumberDisplay.textContent = address;
    const paymentCoinIcon = document.getElementById('paymentCoinIcon');
    if(paymentCoinIcon) paymentCoinIcon.innerHTML = svg;

    $('paymentModalTitle').textContent = isInvestment ? 'Trade Payment' : 'Deposit Payment';
    openModal('paymentModal');
  }

  $('confirmDepositBtn')?.addEventListener('click', () => {
    const amount = parseFloat($('depositAmountInput').value);
    const err = $('depositError');
    if(isNaN(amount) || amount <= 0) { err.textContent = 'Enter a valid deposit amount'; err.style.display = 'block'; setTimeout(() => err.style.display = 'none', 3000); return; }
    // Minimum deposit check
    let minDeposit = 10;
    if(currentCurrency === 'BTC') minDeposit = 0.001;
    if(amount < minDeposit) {
      err.textContent = `Minimum deposit is ${symbols[currentCurrency]}${minDeposit}`;
      err.style.display = 'block';
      setTimeout(() => err.style.display = 'none', 3000);
      return;
    }

    closeModal('depositModal');
    showProcessing('Processing deposit...');
    setTimeout(() => {
      hideProcessing();
      openPaymentModal(amount);
    }, 2000);
  });

  $('confirmPaymentBtn')?.addEventListener('click', () => { closeModal('paymentModal'); showProcessing('Verifying payment...'); setTimeout(() => { hideProcessing(); showPaymentNotDetected(); }, 2000); });
  $('copyAccountBtn')?.addEventListener('click', async () => {
    const account = $('accountNumberDisplay')?.textContent.trim() || walletAddresses[currentCurrency];
    try {
      await navigator.clipboard.writeText(account);
      const btn = $('copyAccountBtn');
      btn.classList.add('copied');
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 13 4 4L19 7"/></svg>Copied!';
      setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy'; }, 2000);
    } catch(err) { alert('Failed to copy'); }
  });

  // Trade Flow (formerly Invest)
  function openInvestModal(planName, minNgn, planKey) {
    const minInCurrency = minNgn * rates[currentCurrency];
    currentInvestMinInCurrency = minInCurrency;
    $('investPlanName').textContent = planName;
    $('investMin').textContent = `${symbols[currentCurrency]} ${minInCurrency.toFixed(2)}`;
    const rateInfo = planRates[planKey];
    if(rateInfo) { $('investDailyRate').textContent = rateInfo.range; currentPlanAvg = rateInfo.avg; }
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
    if(isNaN(amount) || amount <= 0) { if(investErr) { investErr.textContent = 'Enter a valid amount.'; investErr.style.display = 'block'; setTimeout(() => investErr.style.display = 'none', 3000); } return; }
    if(amount < currentInvestMinInCurrency) {
      if(investErr) {
        investErr.textContent = `Minimum investment is ${symbols[currentCurrency]}${currentInvestMinInCurrency.toFixed(2)}`;
        investErr.style.display = 'block'; setTimeout(() => investErr.style.display = 'none', 3000);
      }
      return;
    }
    closeModal('investModal');
    showProcessing('Processing trade...');
    setTimeout(() => {
      hideProcessing();
      openPaymentModal(amount, true);
    }, 2000);
  });

  document.querySelectorAll('.invest-now-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.plan-card');
      const plan = card.dataset.plan;
      const minNgn = plan === 'beginner' ? 10 : plan === 'standard' ? 50000 : plan === 'premium' ? 200000 : 500000;
      openInvestModal(card.querySelector('.plan-title').textContent, minNgn, plan);
    });
  });

  // Transfer (kept as is but limited to USDT)
  $('confirmTransferBtn')?.addEventListener('click', () => {
    if(base.homeBalance <= 0) { showDepositFirstModal(); return; }
    const amount = parseFloat($('transferAmountInput').value);
    const recipient = $('transferRecipient').value.trim();
    if(isNaN(amount) || amount <= 0) return alert('Enter valid amount.');
    if(!recipient) return alert('Enter recipient username.');
    if(amount > base.walletAvailable) return alert('Insufficient balance.');
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
      playSuccessSound();
      $('transferAmountInput').value = ''; $('transferRecipient').value = '';
    }, 1500);
  });

  // Cards (kept)
  $('saveCardBtn')?.addEventListener('click', () => {
    if(base.homeBalance <= 0) { showDepositFirstModal(); return; }
    const cardNumber = $('cardNumber').value.replace(/\s/g, ''), expiry = $('cardExpiry').value, cvv = $('cardCvv').value;
    if(!cardNumber || cardNumber.length < 15 || !expiry || !cvv) return alert('Please fill all card details');
    const last4 = cardNumber.slice(-4);
    if(currentUser) {
      currentUser.savedCard = { last4, expiry, cardNumber, cvv };
      saveUser(currentUser);
      addNotification('Card Added', `Card ending in ${last4} has been linked.`, 'success');
      closeModal('cardModal'); $('cardNumber').value = ''; $('cardExpiry').value = ''; $('cardCvv').value = '';
      updateCardDisplay();
      playSuccessSound();
    }
  });

  // History Modals
  function showModalWithGuard(title, arr) {
    if(base.homeBalance <= 0) { showDepositFirstModal(); return; }
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
    let bankName = document.getElementById('walletSelect')?.value || activeWithdrawMethod;
    const fee = 1;
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
      addNotification('Withdrawal Processed', `${amount} USDT sent to ${bankName}`, 'success');
      updateAll();
      showSuccess('Withdrawal Successful', `${receive} USDT will be sent to your ${bankName}. Reference: ${ref}`);
      playSuccessSound();
      $('withdrawInput').value = ''; $('withdrawAccountInput').value = '';
    }, 2500);
  });

  // Community plan prompt (kept)
  function setCommunityPlanPrompt() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay open';
    modal.innerHTML = `<div class="modal-panel" style="text-align:center;"><div class="modal-header"><div class="modal-title">Community Chat</div><button class="modal-close-btn" id="closeCommunityPlanPrompt">✕</button></div><div class="notice-box"><div class="notice-text">Please select an investment plan first to participate in the community chat.</div></div><div style="display:flex; gap:12px; margin-top:20px;"><button id="communityPlanPromptGo" class="withdraw-btn" style="flex:1;">Go to Trade</button><button id="communityPlanPromptCancel" class="btn btn-outline" style="flex:1;">Cancel</button></div></div>`;
    document.body.appendChild(modal);
    document.getElementById('closeCommunityPlanPrompt').addEventListener('click', () => modal.remove());
    document.getElementById('communityPlanPromptCancel').addEventListener('click', () => modal.remove());
    document.getElementById('communityPlanPromptGo').addEventListener('click', () => { modal.remove(); setView('trade'); });
    modal.addEventListener('click', (e) => { if(e.target === modal) modal.remove(); });
  }
  const communitySendBtn = document.querySelector('.community-send-btn');
  const communityInputField = document.querySelector('.community-chat-input-field');
  if(communitySendBtn) communitySendBtn.addEventListener('click', () => setCommunityPlanPrompt());
  if(communityInputField) communityInputField.addEventListener('keypress', (e) => { if(e.key === 'Enter') { e.preventDefault(); setCommunityPlanPrompt(); } });

  // Typing sound (throttled)
  let typingSoundTimer = null;
  if(communityInputField) {
    communityInputField.addEventListener('keydown', () => {
      if(!typingSoundTimer) {
        playSound('soundTyping');
        typingSoundTimer = setTimeout(() => { typingSoundTimer = null; }, 300);
      }
    });
  }

  // VIP Upgrade Scroll
  $('upgradeVipBtn')?.addEventListener('click', () => { setView('trade'); setTimeout(() => { const vipCard = $('vipPlanCard'); if(vipCard) vipCard.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300); });

  // View Switching (with trade renaming)
  function setView(v) {
    ['homeView','tradeView','withdrawView','walletView','communityView'].forEach(id => $(id).classList.remove('active'));
    $(v+'View').classList.add('active');
    $('pageTitle').textContent = { home:'Home', trade:'Trade', withdraw:'Withdrawal', wallet:'Wallet', community:'Community' }[v] || 'Home';
    document.querySelectorAll('.nav-item[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === v));
    updateAll();

    if(v === 'withdraw') {
      forceUpdateWithdrawHero();
      renderWithdrawForm(activeWithdrawMethod);
    }
    if(v === 'wallet') {
      renderWalletAccounts();
      setTimeout(() => renderWalletAccounts(), 10);
    }

    toggleBanner(v === 'home');

    if(v === 'community') {
      clearTimeout(referralBannerTimeout);
      referralBannerTimeout = setTimeout(showReferralBanner, 7000);
    }
  }
  window.setView = setView;

  // Bottom nav – trade view
  document.querySelectorAll('.nav-item[data-view]').forEach(b => {
    b.addEventListener('click', function(e) {
      const view = this.dataset.view;
      setView(view);
    });
  });

  // Drawer / data-nav clicks – trade view
  document.addEventListener('click', function(e) {
    const nav = e.target.closest('[data-nav]');
    if(nav && nav.dataset.nav) {
      setView(nav.dataset.nav);
    }
  });

  // Wallet Actions
  const walletActions = document.querySelectorAll('.wallet-actions .wallet-action');
  if(walletActions[0]) walletActions[0].addEventListener('click', () => openDepositModal());
  if(walletActions[1]) walletActions[1].addEventListener('click', () => setView('withdraw'));
  if(walletActions[2]) walletActions[2].addEventListener('click', () => openModal('transferModal'));
  if(walletActions[3]) walletActions[3].addEventListener('click', () => showModalWithGuard('All Transactions', allTransactions));
  if(walletActions[4]) walletActions[4].addEventListener('click', () => openModal('cardModal'));

  // Drawer
  function openDrawer() { $('drawerOverlay')?.classList.add('open'); $('drawerPanel')?.classList.add('open'); const badge = $('notificationBadge'); if(badge) badge.style.display = 'none'; }
  function closeDrawer() { $('drawerOverlay')?.classList.remove('open'); $('drawerPanel')?.classList.remove('open'); updateNotificationBadge(); }
  $('menuBtn')?.addEventListener('click', openDrawer);
  $('drawerCloseBtn')?.addEventListener('click', closeDrawer);
  $('drawerOverlay')?.addEventListener('click', closeDrawer);

  // Quick Actions (with trade renamed)
  (function initQuickActions(){
    const actions = [
      { label:"Trade", color:"linear-gradient(135deg,#6d28d9,#8b5cf6)", nav:'trade', icon:'<path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-6"/><path d="M12 16V8"/><path d="M16 16v-3"/>' },
      { label:"Deposit", color:"linear-gradient(135deg,#16a34a,#4ade80)", nav:'wallet', icon:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>' },
      { label:"Withdraw", color:"linear-gradient(135deg,#d97706,#f59e0b)", nav:'withdraw', icon:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>' },
      { label:"Transfer", color:"linear-gradient(135deg,#2563eb,#60a5fa)", nav:'wallet', icon:'<path d="M7 7h14"/><path d="m18 4 3 3-3 3"/><path d="M17 17H3"/><path d="m6 14-3 3 3 3"/>' },
      { label:"Wallet", color:"linear-gradient(135deg,#db2777,#f472b6)", nav:'wallet', icon:'<path d="M3 7h18v10H3z"/><path d="M16 12h4"/><circle cx="16.5" cy="12" r="1.2" fill="white" stroke="none"/>' },
      { label:"Community", color:"linear-gradient(135deg,#5b21b6,#8b5cf6)", nav:'community', icon:'<path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"/><path d="M8 13c1.7 0 3-1.3 3-3S9.7 7 8 7 5 8.3 5 10s1.3 3 3 3Z"/><path d="M3 19c.7-2.7 3-4 5-4s4.3 1.3 5 4"/>' }
    ];
    $('quickActions').innerHTML = actions.map(a => `<div class="action" data-nav="${a.nav}"><div class="circle" style="background:${a.color}"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">${a.icon}</svg></div><div class="label">${a.label}</div></div>`).join('');
  })();

  // Other Buttons (kept)
  $('promoUpgradeBtn')?.addEventListener('click', () => $('vipPlanCard')?.scrollIntoView({behavior:'smooth'}));
  $('drawerTxHistoryBtn')?.addEventListener('click', () => showModalWithGuard('All Transactions', allTransactions));
  $('drawerHelpBtn')?.addEventListener('click', () => openModal('helpModal'));
  $('drawerNotificationsBtn')?.addEventListener('click', () => openModal('notificationsModal'));
  $('drawerSecurityBtn')?.addEventListener('click', () => openModal('securityModal'));
  $('drawerSettingsBtn')?.addEventListener('click', () => openModal('settingsModal'));
  $('comparePlansBtn')?.addEventListener('click', () => openModal('comparePlansModal'));

  // Referral modal (kept)
  function updateReferModal() {
    if(!$('referModal')) return;
    const user = currentUser || getStoredUser();
    if(!user) return;
    const codeDisplay = $('referralCodeDisplay');
    if(codeDisplay) codeDisplay.textContent = user.referralCode || '--------';
    const countEl = $('referralCount');
    if(countEl) countEl.textContent = user.referrals || 0;
    const commEl = $('commissionEarned');
    if(commEl) {
      const comm = (user.commission || 0) * rates[currentCurrency];
      const sym = symbols[currentCurrency];
      commEl.textContent = `${sym} ${comm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }

  $('drawerReferBtn')?.addEventListener('click', () => {
    updateReferModal();
    openModal('referModal');
    const howTitle = document.getElementById('referHowTitle');
    const instructions = document.getElementById('referInstructions');
    if(howTitle && instructions) {
      howTitle.onclick = () => {
        const expanded = howTitle.classList.toggle('expanded');
        instructions.classList.toggle('show', expanded);
      };
    }
  });

  $('copyReferBtn')?.addEventListener('click', () => {
    const user = currentUser || getStoredUser();
    if(user && user.referralCode) {
      navigator.clipboard.writeText(user.referralCode).then(() => {
        const btn = $('copyReferBtn'); if(btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy Referral Code'; }, 2000); }
      }).catch(() => alert('Failed to copy'));
    }
  });

  // Modal Close buttons (kept)
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

  // Logout (kept)
  const logoutBtn = $('drawerLogoutBtn');
  if(logoutBtn) { const newLogoutBtn = logoutBtn.cloneNode(true); logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn); newLogoutBtn.addEventListener('click', () => openModal('logoutConfirmModal')); }
  $('confirmLogoutBtn')?.addEventListener('click', () => { sessionStorage.removeItem('tradePulseLoggedIn'); sessionStorage.removeItem('tradePulseCurrentUser'); location.reload(); });
  $('cancelLogoutBtn')?.addEventListener('click', () => closeModal('logoutConfirmModal'));

  // Modal overlay click to close
  ['investModal','depositModal','paymentModal','withdrawConfirmModal','cardModal','transferModal','successModal',
   'withdrawalSuccessModal','withdrawalReceiptModal','transactionModal','securityModal','notificationsModal',
   'helpModal','settingsModal','referModal','comparePlansModal','overviewDetailModal','transferSuccessModal',
   'logoutConfirmModal','forgotPasswordModal','notificationPreviewModal'].forEach(id => { const el = $(id); if(el) el.addEventListener('click', e => { if(e.target === el) closeModal(id); }); });

  // Notification Preview Modal close fix
  $('closeNotifPreviewBtn')?.addEventListener('click', () => closeModal('notificationPreviewModal'));
  $('notificationPreviewModal')?.addEventListener('click', (e) => {
    if(e.target === $('notificationPreviewModal')) closeModal('notificationPreviewModal');
  });

  // ========== CHART AUTO-GROWTH (normal only, no forced demo) ==========
  setInterval(() => {
    if(!$('homeView')?.classList.contains('active')) return;
    if(base.homeBalance <= 0) return;
    let last = chartData[chartData.length - 1];
    if(!last) return;
    let newValue = last.value + Math.floor(Math.random() * 1500) + 500;
    chartData.push({
      label: new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2, '0'),
      value: newValue
    });
    if(chartData.length > 20) chartData.shift();
    base.homeBalance = newValue;
    updateAll();
  }, 60000);

  // Banner Carousel (kept)
  let currentBannerIndex = 0;
  const totalBanners = 3;
  let bannerInterval;
  function showBanner(index) {
    const slides = document.getElementById('bannerSlides');
    if(!slides) return;
    slides.style.transform = `translateX(-${index * 100}%)`;
    document.querySelectorAll('.banner-dots .dot').forEach(d => d.classList.remove('active'));
    const activeDot = document.querySelector(`.banner-dots .dot[data-index="${index}"]`);
    if(activeDot) activeDot.classList.add('active');
    currentBannerIndex = index;
  }
  function nextBanner() { showBanner((currentBannerIndex + 1) % totalBanners); }
  function startBannerAutoPlay() { stopBannerAutoPlay(); bannerInterval = setInterval(nextBanner, 4000); }
  function stopBannerAutoPlay() { clearInterval(bannerInterval); }
  const bannerDotsEl = document.getElementById('bannerDots');
  if(bannerDotsEl) {
    bannerDotsEl.addEventListener('click', (e) => {
      const dot = e.target.closest('.dot');
      if(!dot) return;
      showBanner(parseInt(dot.dataset.index));
      stopBannerAutoPlay(); startBannerAutoPlay();
    });
  }
  let touchStartX = 0;
  const bannerEl = document.querySelector('.banner-carousel');
  if(bannerEl) {
    bannerEl.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; stopBannerAutoPlay(); });
    bannerEl.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if(Math.abs(diff) > 40) {
        if(diff > 0) showBanner((currentBannerIndex + 1) % totalBanners);
        else showBanner((currentBannerIndex - 1 + totalBanners) % totalBanners);
      }
      startBannerAutoPlay();
    });
  }
  function toggleBanner(active) {
    if(active) { showBanner(0); startBannerAutoPlay(); }
    else stopBannerAutoPlay();
  }

  // Withdrawal Receipt (kept)
  function openWithdrawalReceipt(tx) {
    const bankName = tx.subtitle.replace('To ','');
    const isUSDT = bankName.includes('USDT');
    const fee = 1;
    const absAmount = Math.abs(tx.amount);
    const received = Math.max(0, absAmount - fee);
    const receiptBankSpan = document.getElementById('receiptBank');
    const iconPath = getBankIconPath(bankName);
    const bg = shouldUseWhiteBackground(bankName) ? 'background:#ffffff; padding:2px;' : '';
    if(iconPath) {
      receiptBankSpan.innerHTML = `<img src="${iconPath}" style="width:24px; height:24px; border-radius:4px; vertical-align:middle; margin-right:6px; ${bg} object-fit:contain;" onerror="this.style.display='none';"> ${bankName}`;
    } else receiptBankSpan.textContent = bankName;
    document.getElementById('receiptAmount').textContent = `${absAmount} USDT`;
    document.getElementById('receiptFee').textContent = `- 1 USDT`;
    document.getElementById('receiptReceive').textContent = `${received} USDT`;
    document.getElementById('receiptDateTime').textContent = tx.meta;
    document.getElementById('receiptStatus').textContent = tx.status;
    const datePart = tx.meta ? tx.meta.replace(/[^0-9]/g, '').substring(0,8) : '00000000';
    document.getElementById('receiptRef').textContent = 'WD' + tx.id.toString().padStart(6,'0') + datePart;
    document.getElementById('withdrawalReceiptModal').classList.add('open');
  }
  function handleWithdrawalRowClick(e) {
    const row = e.target.closest('.tx-row[data-tx-id]');
    if(!row) return;
    const txId = parseInt(row.dataset.txId);
    const tx = allTransactions.find(t => t.id === txId);
    if(tx) openWithdrawalReceipt(tx);
  }
  document.getElementById('recentWithdrawals').addEventListener('click', handleWithdrawalRowClick);
  document.getElementById('modalTransactionsList').addEventListener('click', handleWithdrawalRowClick);
  document.getElementById('closeWithdrawalReceiptBtn').addEventListener('click', () => document.getElementById('withdrawalReceiptModal').classList.remove('open'));
  document.getElementById('closeReceiptBtn').addEventListener('click', () => document.getElementById('withdrawalReceiptModal').classList.remove('open'));
  document.getElementById('withdrawalReceiptModal').addEventListener('click', (e) => { if(e.target === document.getElementById('withdrawalReceiptModal')) document.getElementById('withdrawalReceiptModal').classList.remove('open'); });

  // ========== TRADING REGULATIONS MODAL (PER‑USER FLAG) ==========
  function showTermsModal() {
    const user = getStoredUser();
    const uid = user ? (user.userId || user.username) : '';
    if(!uid || localStorage.getItem('acceptedTerms_' + uid)) return;
    $('termsModal').classList.add('open');
  }
  window.showTermsModal = showTermsModal;

  $('acceptTermsCheckbox')?.addEventListener('change', function() {
    $('acceptTermsBtn').disabled = !this.checked;
  });
  $('acceptTermsBtn')?.addEventListener('click', () => {
    const user = getStoredUser();
    const uid = user ? (user.userId || user.username) : '';
    if(uid) localStorage.setItem('acceptedTerms_' + uid, 'true');
    $('termsModal').classList.remove('open');
    playSuccessSound();
    if(sessionStorage.getItem('justSignedUp')) {
      sessionStorage.removeItem('justSignedUp');
      if(!localStorage.getItem('onboardingComplete_' + uid)) {
        setTimeout(() => startOnboarding(), 1500);
      }
    }
  });

  // ========== COMMUNITY REFERRAL BANNER ==========
  let referralBannerTimeout;
  function showReferralBanner() {
    const banner = document.getElementById('communityReferralBanner');
    if(!banner || sessionStorage.getItem('referralBannerShown')) return;
    banner.style.display = 'block';
    banner.style.zIndex = '100';
    sessionStorage.setItem('referralBannerShown', 'true');
  }
  document.getElementById('closeReferralBanner')?.addEventListener('click', () => {
    document.getElementById('communityReferralBanner').style.display = 'none';
  });

  // ========== ONBOARDING TOUR (kept) ==========
  const onboardingSteps = [
    { target: null, title: 'Welcome to ArbiFlex AI!', text: 'Your AI‑powered arbitrage dashboard. Let\'s take a quick tour.', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" width="48" height="48"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>', position: 'center' },
    { target: '#homeBalance', title: 'Your Balance', text: 'Your total account balance updates as you trade and earn.', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" width="36" height="36"><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6Z"/><path d="M16 14h4"/></svg>', position: 'bottom' },
    { target: '.nav-item[data-view="trade"]', title: 'Trade', text: 'Explore trade plans. Choose one, deposit, and let the AI work.', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" width="36" height="36"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-6"/><path d="M12 16V8"/><path d="M16 16v-3"/></svg>', position: 'top' },
    { target: '.nav-item[data-view="withdraw"]', title: 'Withdraw', text: 'Cash out your profits easily via USDT or e‑wallet.', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" width="36" height="36"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>', position: 'top' },
    { target: '.nav-item[data-view="community"]', title: 'Community', text: 'Chat with fellow traders, see live wins, and learn.', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" width="36" height="36"><path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"/><path d="M8 13c1.7 0 3-1.3 3-3S9.7 7 8 7 5 8.3 5 10s1.3 3 3 3Z"/><path d="M3 19c.7-2.7 3-4 5-4s4.3 1.3 5 4"/></svg>', position: 'top' },
    { target: '#menuBtn', title: 'Menu', text: 'Open the drawer for your profile, security, and settings.', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" width="36" height="36"><path d="M3 6h18M3 12h18M3 18h18"/></svg>', position: 'top' }
  ];
  let currentOnboardingStep = 0;

  function startOnboarding() {
    const user = getStoredUser();
    const uid = user ? (user.userId || user.username) : '';
    if(!uid || localStorage.getItem('onboardingComplete_' + uid)) return;
    $('onboardingOverlay').style.display = 'flex';
    showOnboardingStep(0);
  }
  window.startOnboarding = startOnboarding;

  function showOnboardingStep(index, retryCount = 0) {
    const step = onboardingSteps[index];
    let targetEl = null;
    if(step.target) {
      targetEl = document.querySelector(step.target);
      if(!targetEl && retryCount < 15) { setTimeout(() => showOnboardingStep(index, retryCount + 1), 300); return; }
      if(!targetEl) { nextOnboardingStep(); return; }
    }
    const tooltip = $('onboardingTooltip');
    const arrow = $('onboardingArrow');
    const textEl = $('onboardingText');
    const indicatorEl = $('onboardingStepIndicator');
    if(textEl) textEl.innerHTML = `<div style="margin-bottom:12px;">${step.icon}</div><h3 style="margin:0 0 8px;font-size:20px;">${step.title}</h3><p style="margin:0;font-size:14px;color:#cbd5e1;">${step.text}</p>`;
    if(indicatorEl) indicatorEl.innerHTML = onboardingSteps.map((_, i) => `<span style="width:8px;height:8px;border-radius:50%;display:inline-block;background:${i===index?'#a855f7':'rgba(255,255,255,0.3)'};margin-right:6px;"></span>`).join('');
    const nextBtn = $('onboardingNextBtn');
    if(nextBtn) nextBtn.textContent = index === onboardingSteps.length - 1 ? 'Got it!' : 'Next';

    if(step.position === 'center') {
      arrow.style.display = 'none';
      tooltip.style.opacity = '0';
      tooltip.style.position = 'fixed';
      tooltip.style.top = '50%';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translate(-50%, -50%)';
      tooltip.style.margin = '0';
      requestAnimationFrame(() => { tooltip.style.transition = 'opacity 0.35s ease'; tooltip.style.opacity = '1'; });
      onboardingSteps.forEach(s => { if(s.target) { const el = document.querySelector(s.target); if(el) { el.style.boxShadow = ''; el.style.outline = ''; el.style.outlineOffset = ''; el.style.zIndex = ''; el.style.position = ''; } } });
      return;
    }

    const bottomNavHeight = 80;
    const rect = targetEl.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetCenterY = rect.top + scrollTop + rect.height / 2;
    const viewportCenterY = window.innerHeight / 2;
    const targetScrollY = targetCenterY - viewportCenterY + bottomNavHeight / 2;
    window.scrollTo({ top: Math.max(0, targetScrollY), behavior: 'smooth' });
    clearTimeout(__onboardingScrollTimer);
    __onboardingScrollTimer = setTimeout(() => {
      const finalRect = targetEl.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      tooltip.style.margin = '0';
      tooltip.style.transform = 'none';
      tooltip.style.opacity = '0';
      tooltip.style.position = 'fixed';
      tooltip.style.width = '300px';
      tooltip.style.maxWidth = '300px';
      let top, left;
      const gap = 12;
      if(step.position === 'bottom') {
        top = finalRect.bottom + gap;
        left = finalRect.left + finalRect.width / 2 - tooltipRect.width / 2;
      } else {
        top = finalRect.top - tooltipRect.height - gap;
        left = finalRect.left + finalRect.width / 2 - tooltipRect.width / 2;
      }
      const minLeft = 10, maxLeft = window.innerWidth - tooltipRect.width - 10;
      left = Math.max(minLeft, Math.min(left, maxLeft));
      const minTop = 10, maxTop = window.innerHeight - tooltipRect.height - 10;
      top = Math.max(minTop, Math.min(top, maxTop));
      tooltip.style.top = top + 'px';
      tooltip.style.left = left + 'px';
      const arrowSize = 12;
      let arrowLeft = finalRect.left + finalRect.width / 2 - left - arrowSize;
      arrowLeft = Math.max(8, Math.min(arrowLeft, tooltipRect.width - 24));
      arrow.style.left = arrowLeft + 'px';
      arrow.style.display = 'block';
      if(step.position === 'bottom') {
        arrow.style.top = '-10px'; arrow.style.bottom = 'auto'; arrow.style.transform = 'rotate(180deg)';
      } else {
        arrow.style.bottom = '-10px'; arrow.style.top = 'auto'; arrow.style.transform = 'rotate(0deg)';
      }
      targetEl.style.position = 'relative';
      targetEl.style.zIndex = '1001';
      targetEl.style.boxShadow = '0 0 0 4px #a855f7';
      targetEl.style.outline = '3px solid #a855f7';
      targetEl.style.outlineOffset = '2px';
      requestAnimationFrame(() => { tooltip.style.transition = 'opacity 0.35s ease'; tooltip.style.opacity = '1'; });
    }, 450);
  }

  function nextOnboardingStep() {
    const prevTarget = document.querySelector(onboardingSteps[currentOnboardingStep]?.target);
    if(prevTarget) { prevTarget.style.boxShadow = ''; prevTarget.style.outline = ''; prevTarget.style.outlineOffset = ''; prevTarget.style.zIndex = ''; prevTarget.style.position = ''; }
    currentOnboardingStep++;
    if(currentOnboardingStep < onboardingSteps.length) showOnboardingStep(currentOnboardingStep);
    else finishOnboarding();
  }

  function finishOnboarding() {
    $('onboardingOverlay').style.display = 'none';
    const user = getStoredUser();
    const uid = user ? (user.userId || user.username) : '';
    if(uid) localStorage.setItem('onboardingComplete_' + uid, 'true');
    onboardingSteps.forEach(s => {
      const el = document.querySelector(s.target);
      if(el) { el.style.boxShadow = ''; el.style.outline = ''; el.style.outlineOffset = ''; el.style.zIndex = ''; el.style.position = ''; }
    });
  }

  $('onboardingNextBtn')?.addEventListener('click', nextOnboardingStep);
  $('onboardingSkipBtn')?.addEventListener('click', finishOnboarding);
  $('onboardingOverlay')?.addEventListener('click', (e) => { if(e.target === $('onboardingOverlay')) finishOnboarding(); });

  // ========== GLOBAL WELCOME NOTIFICATIONS ==========
  window.addWelcomeNotifications = function() {
    addNotification('Welcome to ArbiFlex AI!', 'Your AI arbitrage dashboard is ready. Explore plans, join the community, and start growing your portfolio.', 'promo', 'assets/notifications/welcome.jpg');
    addNotification('Referral Program – Earn 5% Commission', 'Invite friends and earn 5% of their deposit. Share your code now!', 'promo', 'assets/notifications/referral.jpg');
    addNotification('⏳ Limited Offer – 43 Spots Left!', 'VIP Signal Group spots are filling fast. Join now for premium arbitrage signals.', 'promo', 'assets/notifications/limited_offer.jpg');
  };

  // ========== APP INITIALISATION ==========
  function initializeApp() {
    if(window.__appInitialized) return;
    const stored = getStoredUser();
    if(!stored) return;

    currentUser = stored;
    base.homeBalance = stored.homeBalance || 0;
    base.totalInvested = stored.totalInvested || 0;
    base.totalWithdrawn = stored.totalWithdrawn || 0;
    base.activePlans = stored.activePlans || 0;

    // Always USDT withdrawal
    setWithdrawMethod('usdt_trc20');

    updateAll();
    updateDrawerUserInfo();
    refresh2faUI();
    updateCardDisplay();

    document.addEventListener('click', (e) => {
      if(e.target.closest('button, .btn, .nav-item, .action, .drawer-menu-item, .invest-now-btn, .small-action')) {
        playClickSound();
      }
    });

    const uid = stored.userId || stored.username;
    if(sessionStorage.getItem('justSignedUp')) {
      if(!localStorage.getItem('hasSeenWelcomeNotifs_' + uid)) {
        window.addWelcomeNotifications();
        localStorage.setItem('hasSeenWelcomeNotifs_' + uid, 'true');
      }
      if(!localStorage.getItem('acceptedTerms_' + uid)) {
        showTermsModal();
      }
      sessionStorage.removeItem('referralBannerShown');
    } else {
      if(!localStorage.getItem('hasSeenWelcomeNotifs_' + uid)) {
        window.addWelcomeNotifications();
        localStorage.setItem('hasSeenWelcomeNotifs_' + uid, 'true');
      }
      if(!localStorage.getItem('acceptedTerms_' + uid)) {
        showTermsModal();
      }
    }

    setTimeout(() => {
      renderWalletAccounts();
      forceUpdateWithdrawHero();
      if(activeWithdrawMethod) renderWithdrawForm(activeWithdrawMethod);
    }, 10);

    window.__appInitialized = true;
    setView('home');
  }

  window.initializeApp = initializeApp;

  // === Unlock audio for autoplay policy ===
  let audioUnlocked = false;
  function unlockAudio() {
    if(audioUnlocked) return;
    const sounds = ['soundClick','soundNotification','soundSuccess','soundAlert','soundChat'];
    sounds.forEach(id => {
      const audio = document.getElementById(id);
      if(audio) {
        audio.volume = 0;
        audio.play().then(() => { audio.pause(); audio.currentTime = 0; audio.volume = 1; }).catch(() => {});
      }
    });
    audioUnlocked = true;
  }
  document.addEventListener('click', function firstClick() { unlockAudio(); document.removeEventListener('click', firstClick); }, { once: true });
  document.addEventListener('touchend', function firstTouch() { unlockAudio(); document.removeEventListener('touchend', firstTouch); }, { once: true });

})();
