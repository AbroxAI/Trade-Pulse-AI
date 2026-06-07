(function() {
  // ========== ORIGINAL CORE (from your working PDF, unchanged) ==========
  const rates = { NGN:1, USD:0.00067, EUR:0.00061, GBP:0.00052 };
  const symbols = { NGN:'₦', USD:'$', EUR:'€', GBP:'£' };
  let currentCurrency = 'NGN';
  const FEE = 50;
  let balanceHidden = false;
  let overviewPeriod = 'today';
  let currentUser = null;

  // Base data (all zero)
  const base = {
    homeBalance: 0,
    totalInvested: 0,
    totalProfit: 0,
    totalWithdrawn: 0,
    walletTotal: 0,
    walletAvailable: 0,
    walletLocked: 0,
    nairaWallet: 0,
    withdrawable: 0,
    txFee: FEE,
    activePlans: 0,
    planMin1: 1000, planMax1: 49999,
    planMin2: 50000, planMax2: 199999,
    planMin3: 200000, planMax3: 499999,
    planMin4: 500000
  };

  let chartData = [];
  let allTransactions = [];
  let withdrawalsOnly = [];

  // ========== NOTIFICATIONS (original) ==========
  let notifications = [];
  const notificationBadge = document.getElementById('notificationBadge');
  const notificationsList = document.getElementById('notificationsList');

  function updateNotificationBadge() {
    if (notificationBadge) {
      notificationBadge.textContent = notifications.length;
      notificationBadge.style.display = notifications.length > 0 ? 'flex' : 'none';
    }
  }

  function renderNotificationsModal() {
    if (!notificationsList) return;
    if (notifications.length === 0) {
      notificationsList.innerHTML = '<div style="padding:20px;text-align:center;color:#9ca3af;">No notifications yet</div>';
      return;
    }
    notificationsList.innerHTML = notifications.map(n => `
      <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05);">
        <div class="tx-ico" style="background:${n.type === 'success' ? 'rgba(34,197,94,.12)' : 'rgba(168,85,247,.12)'}">
          ${n.type === 'success'
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>'}
        </div>
        <div>
          <div style="font-weight:600;">${n.title}</div>
          <div style="font-size:12px;color:#9ca3af;">${n.message}</div>
          <div style="font-size:10px;color:#6b7280;margin-top:4px;">${n.time}</div>
        </div>
      </div>
    `).join('');
  }

  function addNotification(title, message, type = 'success') {
    notifications.unshift({ title, message, type, time: new Date().toLocaleString() });
    if (notifications.length > 20) notifications.pop();
    updateNotificationBadge();
    renderNotificationsModal();
  }
  window.addNotification = addNotification;

  // ========== HELPERS ==========
  function convert(a) { return (a * rates[currentCurrency]).toFixed(2); }
  function fmt(amount, isUSDT = false) {
    if (isUSDT) return amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDT';
    const symbol = symbols[currentCurrency];
    const convertedAmount = amount * rates[currentCurrency];
    return `${symbol} ${convertedAmount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function addTransaction(type, amount, subtitle, meta, currency=null, iconType=null) {
    const tx = {
      title: type, subtitle, meta, amount,
      amountColor: amount>0 ? '#4ade80' : '#f87171',
      iconType: iconType || (amount>0 ? 'bank' : 'opay'),
      status: 'Completed', currency,
      id: allTransactions.length + 1
    };
    allTransactions.push(tx);
    if (type === "Withdrawal") withdrawalsOnly.push(tx);
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

  // ========== UI UPDATE ==========
  function updateEyeIcons() {
    const homeEye = document.getElementById('homeBalanceEye');
    const withdrawEye = document.querySelector('.withdraw-eye');
    const normalEye = '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>';
    const slashedEye = '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path d="M3 21l18-18"/>';
    if (balanceHidden) {
      if (homeEye) homeEye.innerHTML = slashedEye;
      if (withdrawEye) withdrawEye.innerHTML = slashedEye;
    } else {
      if (homeEye) homeEye.innerHTML = normalEye;
      if (withdrawEye) withdrawEye.innerHTML = normalEye;
    }
    const toggleEl = document.getElementById('hideBalanceToggle');
    if (toggleEl) toggleEl.querySelector('span').textContent = balanceHidden ? 'Show Balance' : 'Hide Balance';
  }

  function updateAll() {
    if (balanceHidden) {
      const hideFields = ['homeBalance','homeFx','walletTotalBalance','walletTotalFx','availableBalance','lockedBalance','nairaWallet','withdrawBalance','withdrawFx','withdrawableAmount','totalInvested','totalProfit','totalWithdrawn'];
      hideFields.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '****'; });
      document.querySelectorAll('.value').forEach(el => el.textContent = '****');
      document.getElementById('profitPercent').textContent = '0%';
      updateEyeIcons();
      return;
    }
    // All balances are zero
    document.getElementById('homeBalance').textContent = fmt(0);
    document.getElementById('homeFx').textContent = `≈ $ ${(0*rates['USD']).toFixed(2)}`;
    document.getElementById('totalInvested').textContent = fmt(0);
    document.getElementById('totalProfit').textContent = fmt(0);
    document.getElementById('totalWithdrawn').textContent = fmt(0);
    document.getElementById('activePlansCount').textContent = 0;
    document.getElementById('walletTotalBalance').textContent = fmt(0);
    document.getElementById('walletTotalFx').textContent = `≈ $ ${(0*rates['USD']).toFixed(2)}`;
    document.getElementById('availableBalance').textContent = fmt(0);
    document.getElementById('lockedBalance').textContent = fmt(0);
    document.getElementById('nairaWallet').textContent = fmt(0);
    document.getElementById('withdrawBalance').textContent = fmt(0);
    document.getElementById('withdrawFx').textContent = `≈ $ ${(0*rates['USD']).toFixed(2)}`;
    document.getElementById('withdrawableAmount').textContent = fmt(0);
    document.getElementById('planMin1').textContent = fmt(1000);
    document.getElementById('planMax1').textContent = fmt(49999);
    document.getElementById('planMin2').textContent = fmt(50000);
    document.getElementById('planMax2').textContent = fmt(199999);
    document.getElementById('planMin3').textContent = fmt(200000);
    document.getElementById('planMax3').textContent = fmt(499999);
    document.getElementById('planMin4').textContent = fmt(500000);
    document.getElementById('currencyBtn').textContent = currentCurrency + ' ▾';
    document.querySelectorAll('.currency-option').forEach(o => o.classList.toggle('selected', o.dataset.currency === currentCurrency));
    updateEyeIcons();
    buildChart();
    renderRecentTx();
    renderRecentWithdrawals();
    renderWalletTx();
    renderOverviewCards();
    // Disable withdraw buttons (balance is 0)
    document.querySelectorAll('[data-nav="withdraw"], #withdrawNavBtn, .btn-outline[data-nav="withdraw"]').forEach(btn => {
      if (btn) { btn.classList.add('btn-disabled'); btn.disabled = true; }
    });
  }

  // ========== CHART (original) ==========
  function buildChart() {
    const container = document.getElementById('chartContainer');
    if (!container) return;
    if (chartData.length === 0) {
      container.innerHTML = '<div style="height:250px; display:flex; align-items:center; justify-content:center; color:#6b7280;">No data yet. Start investing!</div>';
      return;
    }
    let maxV = Math.max(...chartData.map(d=>d.value)) * 1.1 || 1000;
    let W = 400, H = 250, pl = 60, pr = 20, pt = 26, pb = 30;
    let gw = W - pl - pr, gh = H - pt - pb;
    let xs = i => pl + (i / (chartData.length - 1)) * gw;
    let ys = v => pt + gh - (v / maxV) * gh;
    let lp = '', ap = '';
    chartData.forEach((p,i)=>{
      let x = xs(i), y = ys(p.value);
      if (i === 0) { lp += `M ${x} ${y}`; ap += `M ${x} ${H-pb} L ${x} ${y}`; }
      else { lp += ` L ${x} ${y}`; ap += ` L ${x} ${y}`; }
    });
    ap += ` L ${xs(chartData.length-1)} ${H-pb} Z`;
    let yl = [0, Math.round(maxV/2), Math.round(maxV)];
    let yle = yl.map(v=>`<text class="ytext" x="${pl-8}" y="${ys(v)+4}" text-anchor="end">${symbols[currentCurrency]} ${convert(v)}</text>`).join('');
    let xle = chartData.filter((_,i)=>i%3===0||i===chartData.length-1).map(p=>`<text class="axis-text" x="${xs(chartData.indexOf(p))}" y="${H-8}" text-anchor="middle">${p.label}</text>`).join('');
    container.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="fillGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#22c55e" stop-opacity="0.25"/><stop offset="70%" stop-color="#22c55e" stop-opacity="0.05"/><stop offset="100%" stop-color="#22c55e" stop-opacity="0"/></linearGradient></defs>${yl.map(v=>`<line x1="${pl}" y1="${ys(v)}" x2="${W-pr}" y2="${ys(v)}" stroke="rgba(255,255,255,.06)"/>`).join('')}${yle}${xle}<path d="${ap}" fill="url(#fillGreen)"/><path d="${lp}" fill="none" stroke="#22c55e" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${xs(chartData.length-1)}" cy="${ys(chartData[chartData.length-1].value)}" r="6" fill="#22c55e"/><circle cx="${xs(chartData.length-1)}" cy="${ys(chartData[chartData.length-1].value)}" r="2.5" fill="#fff"/></svg>`;
  }

  // Chart auto‑refresh (original)
  setInterval(() => {
    if (!document.getElementById('homeView')?.classList.contains('active')) return;
    if (base.homeBalance <= 0) return;
    let last = chartData[chartData.length-1];
    if (!last) return;
    let newValue = last.value + Math.floor(Math.random() * 1500) + 500;
    chartData.push({ label: new Date().getHours()+':'+String(new Date().getMinutes()).padStart(2,'0'), value: newValue });
    if (chartData.length > 20) chartData.shift();
    base.homeBalance = newValue;
    updateAll();
  }, 30000);

  // ========== RENDER LISTS ==========
  function renderRecentTx() {
    let c = document.getElementById('recentTransactions');
    if (!c) return;
    if (allTransactions.length === 0) {
      c.innerHTML = '<div class="tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No transactions yet</div><div class="tx-sub">Deposit funds to get started</div></div></div>';
      return;
    }
    c.innerHTML = allTransactions.slice(-4).reverse().map(tx => {
      let s = tx.currency==='USD' ? `${tx.amount>=0?'+':'-'}$${Math.abs(tx.amount).toFixed(2)}` : `${tx.amount>=0?'+':''}${fmt(Math.abs(tx.amount))}`;
      return `<div class="tx-row" data-tx-id="${tx.id}"><div class="tx-ico" style="background:${tx.amount>0?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div><div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div></div>`;
    }).join('');
  }

  function renderRecentWithdrawals() {
    let c = document.getElementById('recentWithdrawals');
    if (!c) return;
    if (withdrawalsOnly.length === 0) {
      c.innerHTML = '<div class="tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No withdrawals yet</div><div class="tx-sub">Your withdrawals will appear here</div></div></div>';
      return;
    }
    c.innerHTML = withdrawalsOnly.slice(-14).reverse().map(tx => {
      let s = tx.currency==='USD' ? `-$${Math.abs(tx.amount).toFixed(2)}` : `-${fmt(Math.abs(tx.amount))}`;
      return `<div class="tx-row" data-tx-id="${tx.id}"><div class="tx-ico" style="background:${tx.amount>0?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div><div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div></div>`;
    }).join('');
  }

  function renderWalletTx() {
    let c = document.getElementById('walletRecentTx');
    if (!c) return;
    if (allTransactions.length === 0) {
      c.innerHTML = '<div class="wallet-tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No transactions</div></div></div>';
      return;
    }
    c.innerHTML = allTransactions.slice(-4).reverse().map(tx => {
      let s = tx.currency==='USD' ? `${tx.amount>=0?'+':'-'}$${Math.abs(tx.amount).toFixed(2)}` : `${tx.amount>=0?'+':''}${fmt(Math.abs(tx.amount))}`;
      return `<div class="wallet-tx-row"><div class="tx-ico" style="background:${tx.amount>0?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div><div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div></div>`;
    }).join('');
  }

  function renderOverviewCards() {
    let c = document.getElementById('overviewCards');
    if (!c) return;
    const cards = [
      { title:"Total Profit", value:0, sub:"+0%", subColor:"#34d399", iconBg:"rgba(34,197,94,.12)", iconColor:"#4ade80", icon:'<path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/>' },
      { title:"Active Investments", value:0, sub:"0 Plans", subColor:"#94a3b8", iconBg:"rgba(59,130,246,.12)", iconColor:"#60a5fa", icon:'<path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"/><path d="M8 13c1.7 0 3-1.3 3-3S9.7 7 8 7 5 8.3 5 10s1.3 3 3 3Z"/>' },
      { title:"Referral Earnings", value:0, sub:"0 Referrals", subColor:"#94a3b8", iconBg:"rgba(245,158,11,.12)", iconColor:"#fbbf24", icon:'<path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"/><path d="M8 13c1.7 0 3-1.3 3-3S9.7 7 8 7 5 8.3 5 10s1.3 3 3 3Z"/>' },
      { title:"Withdrawn", value:0, sub:"This Month", subColor:"#94a3b8", iconBg:"rgba(168,85,247,.12)", iconColor:"#c084fc", icon:'<path d="M3 7h18v10H3z"/><path d="M16 12h4"/><circle cx="16.5" cy="12" r="1.2" fill="#c084fc" stroke="none"/>' }
    ];
    c.innerHTML = cards.map(ca => `<div class="stat" data-title="${ca.title}" data-value="${fmt(ca.value)}" data-sub="${ca.sub}"><div class="ico" style="background:${ca.iconBg}"><svg viewBox="0 0 24 24" fill="none" stroke="${ca.iconColor}" stroke-width="2">${ca.icon}</svg></div><div class="title">${ca.title}</div><div class="value">${balanceHidden?'****':fmt(ca.value)}</div><div class="sub" style="color:${ca.subColor}">${ca.sub}</div></div>`).join('');
    document.querySelectorAll('#overviewCards .stat').forEach(card => {
      card.addEventListener('click', () => {
        document.getElementById('overviewDetailTitle').textContent = card.querySelector('.title').textContent;
        document.getElementById('overviewDetailValue').textContent = card.querySelector('.value').textContent;
        document.getElementById('overviewDetailDesc').textContent = card.querySelector('.sub').textContent;
        openModal('overviewDetailModal');
      });
    });
  }

  // ========== MODAL HELPERS ==========
  function openModal(id) { document.getElementById(id).classList.add('open'); }
  function closeModal(id) { document.getElementById(id).classList.remove('open'); }

  // ========== WITHDRAW METHOD SWITCHING (ORIGINAL) ==========
  const withdrawFormContainer = document.getElementById('withdrawDetailsForm');
  let activeWithdrawMethod = 'bank';
  let withdrawRenderTimer = null;

  function setWithdrawMethod(method) {
    if (!withdrawFormContainer || method === activeWithdrawMethod) return;
    activeWithdrawMethod = method;
    document.querySelectorAll('.method-card').forEach((card) => {
      card.classList.toggle('active', card.dataset.method === method);
    });
    clearTimeout(withdrawRenderTimer);
    withdrawFormContainer.classList.add('switching');
    withdrawRenderTimer = setTimeout(() => {
      renderWithdrawForm(method);
      requestAnimationFrame(() => {
        withdrawFormContainer.classList.remove('switching');
      });
    }, 0);
  }

  document.querySelectorAll('.method-card').forEach((card) => {
    card.addEventListener('click', () => setWithdrawMethod(card.dataset.method));
  });

  function renderWithdrawForm(method) {
    if (!withdrawFormContainer) return;
    let html = '';
    if (method === 'bank') {
      html = `
        <div class="field-label">Recipient Account Number</div>
        <div class="amount-input"><input type="text" id="withdrawAccountInput" placeholder="Enter account number" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"></div>
        <div class="field-label">Bank Name</div>
        <select id="bankSelect" style="width:100%;height:56px;border-radius:16px;border:1px solid rgba(255,255,255,.08);background:#0b1020;color:#fff;padding:0 16px;font-size:16px;margin-bottom:14px;">
          <option value="GTBank">GTBank</option><option value="Opay">Opay</option><option value="Access Bank">Access Bank</option><option value="First Bank">First Bank</option><option value="UBA">UBA</option><option value="Zenith Bank">Zenith Bank</option>
        </select>
        <div class="field-label">Amount</div>
        <div class="amount-input"><input type="number" id="withdrawInput" placeholder="Enter amount" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"><span class="currency">NGN</span></div>
        <div class="amount-presets"><button type="button" class="preset" data-amount="1000">₦1,000</button><button type="button" class="preset" data-amount="5000">₦5,000</button><button type="button" class="preset" data-amount="10000">₦10,000</button><button type="button" class="preset preset-max" id="maxBtn">Max</button></div>
        <div class="fee-row"><span>Transaction Fee</span><span id="withdrawFee">₦ 50.00</span></div>
        <div class="receive-row"><span>You Will Receive</span><span id="receiveAmount">₦ 0.00</span></div>
        <span class="field-error" id="withdrawError"></span>
        <button class="withdraw-btn" id="requestWithdrawalBtn">Request Withdrawal</button>
        <div class="notice-box"><div class="notice-title">Withdrawal Notice:</div><div class="notice-text">Please ensure your details are correct. Incorrect details may cause delay or failed transactions.</div></div>
      `;
    } else if (method === 'usdt_trc20' || method === 'usdt_bep20') {
      const network = method === 'usdt_trc20' ? 'TRC20' : 'BEP20';
      html = `
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
        <div class="amount-input"><input type="number" id="withdrawInput" placeholder="Enter amount" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"><span class="currency">NGN</span></div>
        <div class="amount-presets"><button type="button" class="preset" data-amount="1000">₦1,000</button><button type="button" class="preset" data-amount="5000">₦5,000</button><button type="button" class="preset" data-amount="10000">₦10,000</button><button type="button" class="preset" data-amount="25000">₦25,000</button><button type="button" class="preset preset-max" id="maxBtn">Max</button></div>
        <div class="fee-row"><span>Transaction Fee</span><span id="withdrawFee">₦ 50.00</span></div>
        <div class="receive-row"><span>You Will Receive</span><span id="receiveAmount">₦ 0.00</span></div>
        <span class="field-error" id="withdrawError"></span>
        <button class="withdraw-btn" id="requestWithdrawalBtn">Request Withdrawal</button>
        <div class="notice-box"><div class="notice-title">Withdrawal Notice:</div><div class="notice-text">Ensure your e-wallet details are correct. Instant processing.</div></div>
      `;
    }
    withdrawFormContainer.innerHTML = html;
    bindWithdrawFormEvents();
  }

  function bindWithdrawFormEvents() {
    const withdrawInput = document.getElementById('withdrawInput');
    const requestBtn = document.getElementById('requestWithdrawalBtn');
    const errorEl = document.getElementById('withdrawError');
    if (withdrawInput) {
      withdrawInput.addEventListener('input', () => {
        const amt = parseFloat(withdrawInput.value) || 0;
        if (activeWithdrawMethod === 'usdt_trc20' || activeWithdrawMethod === 'usdt_bep20') {
          document.getElementById('receiveAmount').textContent = (Math.max(0, amt - 1)).toFixed(2) + ' USDT';
          document.getElementById('withdrawFee').textContent = '1 USDT';
        } else {
          document.getElementById('receiveAmount').textContent = fmt(Math.max(0, amt - FEE));
          document.getElementById('withdrawFee').textContent = fmt(amt > 0 ? FEE : 0);
        }
      });
    }
    document.querySelectorAll('.preset').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = document.getElementById('withdrawInput');
        if (!input) return;
        if (btn.id === 'maxBtn') {
          input.value = (activeWithdrawMethod === 'usdt_trc20' || activeWithdrawMethod === 'usdt_bep20') ? 1000 : base.withdrawable;
        } else {
          input.value = btn.dataset.amount;
        }
        input.dispatchEvent(new Event('input'));
      });
    });
    if (requestBtn) {
      requestBtn.addEventListener('click', () => {
        // OVERRIDE: show insufficient balance modal instead of processing withdrawal
        showInsufficientBalanceModal();
      });
    }
  }
  renderWithdrawForm('bank');

  // ========== INSUFFICIENT BALANCE MODAL ==========
  function showInsufficientBalanceModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay open';
    modal.innerHTML = `
      <div class="modal-panel" style="text-align:center; padding:30px 20px;">
        <div class="modal-title" style="margin-bottom:20px;">Insufficient Balance</div>
        <div class="notice-text" style="margin-bottom:24px;">You have no funds to withdraw. Please deposit first.</div>
        <div style="display:flex; gap:12px;">
          <button id="insufficientGoDeposit" class="withdraw-btn" style="flex:1;">Deposit Now</button>
          <button id="insufficientClose" class="btn btn-outline" style="flex:1;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('insufficientGoDeposit').addEventListener('click', () => {
      modal.remove();
      openDepositModal();
    });
    document.getElementById('insufficientClose').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }

  // ========== DEPOSIT-FIRST MODAL ==========
  function showDepositFirstModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay open';
    modal.innerHTML = `
      <div class="modal-panel" style="text-align:center; padding:30px 20px;">
        <div class="modal-title" style="margin-bottom:20px;">Deposit First</div>
        <div class="notice-text" style="margin-bottom:24px;">You need to deposit funds before using this feature.</div>
        <div style="display:flex; gap:12px;">
          <button id="depositFirstGoBtn" class="withdraw-btn" style="flex:1;">Deposit Now</button>
          <button id="depositFirstCancelBtn" class="btn btn-outline" style="flex:1;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('depositFirstGoBtn').addEventListener('click', () => {
      modal.remove();
      openDepositModal();
    });
    document.getElementById('depositFirstCancelBtn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }

  // ========== PAYMENT NOT DETECTED MODAL ==========
  function showPaymentNotDetected() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay open';
    modal.innerHTML = `
      <div class="modal-panel" style="text-align:center; padding:30px 20px;">
        <div class="modal-title" style="margin-bottom:20px;">Payment Not Detected</div>
        <div class="notice-text" style="margin-bottom:24px;">Payment not detected. Please contact support or retry again.</div>
        <div style="display:flex; gap:12px;">
          <button id="paymentRetryBtn" class="withdraw-btn" style="flex:1;">Retry</button>
          <button id="paymentSupportBtn" class="btn btn-outline" style="flex:1;">Contact Support</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('paymentRetryBtn').addEventListener('click', () => modal.remove());
    document.getElementById('paymentSupportBtn').addEventListener('click', () => {
      window.open('https://t.me/trade_pulse_ai_support', '_blank');
      modal.remove();
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }

  // ========== DEPOSIT MODAL (original, but payment not detected) ==========
  function openDepositModal() { openModal('depositModal'); }
  document.getElementById('drawerDepositBtn')?.addEventListener('click', openDepositModal);
  document.querySelectorAll('.deposit-purple, .deposit-green, .deposit-amber, .wallet-action .green').forEach(btn => {
    btn.addEventListener('click', openDepositModal);
  });
  document.querySelectorAll('#depositModal .preset').forEach(b => b.addEventListener('click', () => { document.getElementById('depositAmountInput').value = b.dataset.amount; }));
  document.getElementById('confirmDepositBtn')?.addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('depositAmountInput').value);
    if (isNaN(amount) || amount <= 0) {
      const err = document.getElementById('depositError'); err.textContent = 'Enter a valid deposit amount'; err.style.display = 'block';
      setTimeout(() => { err.style.display = 'none'; }, 3000);
      return;
    }
    closeModal('depositModal');
    showProcessing('Processing deposit...');
    setTimeout(() => {
      hideProcessing();
      document.getElementById('paymentAmount').textContent = fmt(amount);
      document.getElementById('paymentModalTitle').textContent = 'Deposit Payment';
      openModal('paymentModal');
    }, 2000);
  });

  // ========== INVESTMENT FLOW (original, but payment not detected) ==========
  const investModal = document.getElementById('investModal');
  document.getElementById('closeInvestModalBtn')?.addEventListener('click', () => closeModal('investModal'));
  investModal?.addEventListener('click', e => { if(e.target === investModal) closeModal('investModal'); });
  let currentInvestPlan = null;
  function openInvestModal(planName, min, dailyRate, planKey) {
    document.getElementById('investPlanName').textContent = planName;
    document.getElementById('investMin').textContent = min.toLocaleString();
    document.getElementById('investDailyRate').textContent = dailyRate + '%';
    document.getElementById('investAmountInput').value = min;
    updateInvestExpected();
    currentInvestPlan = planKey;
    openModal('investModal');
  }
  function updateInvestExpected() {
    const amount = parseFloat(document.getElementById('investAmountInput').value)||0;
    const rate = parseFloat(document.getElementById('investDailyRate').textContent)/100;
    const totalReturn = amount + (amount * rate * 30);
    document.getElementById('investExpectedReturn').textContent = fmt(totalReturn);
  }
  document.getElementById('investAmountInput')?.addEventListener('input', updateInvestExpected);
  document.getElementById('confirmInvestBtn')?.addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('investAmountInput').value);
    if(isNaN(amount)||amount<=0) return alert('Enter valid amount.');
    closeModal('investModal');
    showProcessing('Processing investment...');
    setTimeout(() => {
      hideProcessing();
      document.getElementById('paymentAmount').textContent = fmt(amount);
      document.getElementById('paymentModalTitle').textContent = 'Investment Payment';
      openModal('paymentModal');
    }, 2000);
  });
  document.querySelectorAll('.invest-now-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.plan-card');
      const plan = card.dataset.plan;
      const min = plan==='beginner'?1000:plan==='standard'?50000:plan==='premium'?200000:500000;
      const rate = plan==='beginner'?3.0:plan==='standard'?3.5:plan==='premium'?4.5:6.0;
      openInvestModal(card.querySelector('.plan-title').textContent, min, rate, plan);
    });
  });

  // ========== SHARED PAYMENT MODAL HANDLER (I've Made Payment) ==========
  document.getElementById('confirmPaymentBtn')?.addEventListener('click', () => {
    closeModal('paymentModal');
    showProcessing('Verifying payment...');
    setTimeout(() => {
      hideProcessing();
      showPaymentNotDetected();
    }, 2000);
  });

  // ========== TRANSFER MODAL (original UI, but send shows deposit-first) ==========
  const transferModal = document.getElementById('transferModal');
  document.getElementById('closeTransferModalBtn')?.addEventListener('click', () => closeModal('transferModal'));
  document.getElementById('confirmTransferBtn')?.addEventListener('click', () => {
    // Show deposit-first modal instead of processing transfer
    showDepositFirstModal();
  });

  // ========== CARD MANAGEMENT (original UI, but save shows deposit-first) ==========
  const saveCardBtn = document.getElementById('saveCardBtn');
  if (saveCardBtn) {
    saveCardBtn.addEventListener('click', () => {
      showDepositFirstModal();
    });
  }

  // ========== HISTORY (deposit-first) ==========
  function showModalWithGuard(title, arr) {
    showDepositFirstModal();
  }
  document.getElementById('viewAllTransactionsBtn')?.addEventListener('click', () => showDepositFirstModal());
  document.getElementById('viewAllWithdrawalsBtn')?.addEventListener('click', () => showDepositFirstModal());
  document.getElementById('viewAllWalletTx')?.addEventListener('click', () => showDepositFirstModal());
  document.getElementById('drawerTxHistoryBtn')?.addEventListener('click', () => showDepositFirstModal());

  // ========== COMMUNITY INPUT BAR (view-only with plan prompt) ==========
  const communitySendBtn = document.querySelector('.community-send-btn');
  const communityInput = document.querySelector('.community-input-placeholder');
  function showCommunityInfoModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay open';
    modal.innerHTML = `
      <div class="modal-panel" style="text-align:center; padding:30px 20px;">
        <div class="modal-title" style="margin-bottom:20px;">Community Chat</div>
        <div class="notice-text" style="margin-bottom:24px;">Please select an investment plan first to participate in the community chat.</div>
        <div style="display:flex; gap:12px;">
          <button id="communityInfoGoInvest" class="withdraw-btn" style="flex:1;">Go to Invest</button>
          <button id="communityInfoClose" class="btn btn-outline" style="flex:1;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('communityInfoGoInvest').addEventListener('click', () => {
      modal.remove();
      setView('invest');
    });
    document.getElementById('communityInfoClose').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }
  if (communitySendBtn) communitySendBtn.addEventListener('click', showCommunityInfoModal);
  if (communityInput) communityInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') showCommunityInfoModal(); });

  // ========== VIEW SWITCHING ==========
  function setView(v) {
    ['homeView','investView','withdrawView','walletView','communityView'].forEach(id => document.getElementById(id).classList.remove('active'));
    document.getElementById(v+'View').classList.add('active');
    document.getElementById('pageTitle').textContent = { home:'Home', invest:'Invest', withdraw:'Withdrawal', wallet:'Wallet', community:'Community' }[v]||'Home';
    document.querySelectorAll('.nav-item[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view===v));
    updateAll();
  }
  document.querySelectorAll('.nav-item[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  document.addEventListener('click', e => { let t = e.target.closest('[data-nav]'); if(t && t.dataset.nav) setView(t.dataset.nav); });

  // ========== DRAWER ==========
  let drawer = document.getElementById('drawerOverlay'), panel = document.getElementById('drawerPanel');
  document.getElementById('menuBtn')?.addEventListener('click', () => { drawer.classList.add('open'); panel.classList.add('open'); });
  document.getElementById('drawerCloseBtn')?.addEventListener('click', () => { drawer.classList.remove('open'); panel.classList.remove('open'); });
  drawer?.addEventListener('click', () => { drawer.classList.remove('open'); panel.classList.remove('open'); });

  // ========== OTHER BUTTONS ==========
  document.getElementById('upgradeVipBtn')?.addEventListener('click', () => { setView('invest'); setTimeout(() => document.getElementById('vipPlanCard')?.scrollIntoView({behavior:'smooth'}),200); closeDrawer(); });
  document.getElementById('promoUpgradeBtn')?.addEventListener('click', () => document.getElementById('vipPlanCard')?.scrollIntoView({behavior:'smooth'}));
  document.getElementById('drawerReferBtn')?.addEventListener('click', () => openModal('referModal'));
  document.getElementById('drawerHelpBtn')?.addEventListener('click', () => openModal('helpModal'));
  document.getElementById('drawerNotificationsBtn')?.addEventListener('click', () => openModal('notificationsModal'));
  document.getElementById('drawerSecurityBtn')?.addEventListener('click', () => openModal('securityModal'));
  document.getElementById('drawerSettingsBtn')?.addEventListener('click', () => openModal('settingsModal'));
  document.getElementById('secureNowBtn')?.addEventListener('click', () => openModal('securityModal'));
  document.getElementById('comparePlansBtn')?.addEventListener('click', () => openModal('comparePlansModal'));
  document.getElementById('copyReferBtn')?.addEventListener('click', () => {
    if (currentUser && currentUser.referralCode) {
      navigator.clipboard.writeText(currentUser.referralCode).then(() => addNotification('Copied!', 'Referral code copied to clipboard', 'success'));
    }
  });
  document.getElementById('copyAccountBtn')?.addEventListener('click', async () => {
    const account = document.getElementById('accountNumberDisplay')?.textContent.trim() || '8034467998';
    try {
      await navigator.clipboard.writeText(account);
      const btn = document.getElementById('copyAccountBtn');
      btn.classList.add('copied');
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 13 4 4L19 7"/></svg>Copied!';
      setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy'; }, 2000);
    } catch(err) { alert('Failed to copy'); }
  });
  function closeDrawer() { drawer?.classList.remove('open'); panel?.classList.remove('open'); }

  // ========== PROCESSING OVERLAY HELPERS ==========
  function showProcessing(text) {
    const overlay = document.getElementById('processingOverlay');
    const label = document.getElementById('processingText');
    if (label) label.textContent = text || 'Processing...';
    if (overlay) overlay.classList.add('open');
  }
  function hideProcessing() {
    const overlay = document.getElementById('processingOverlay');
    if (overlay) overlay.classList.remove('open');
  }

  // ========== 2FA (original) ==========
  const securityModal = document.getElementById('securityModal');
  const enable2faBtn = document.getElementById('enable2faBtn');
  const changePinBtn = document.getElementById('changePinBtn');
  function setup2faButtons() {
    if (!currentUser) return;
    if (currentUser.twoFaEnabled) {
      if (enable2faBtn) enable2faBtn.style.display = 'none';
      if (changePinBtn) changePinBtn.style.display = 'block';
    } else {
      if (enable2faBtn) enable2faBtn.style.display = 'block';
      if (changePinBtn) changePinBtn.style.display = 'none';
    }
  }
  if (enable2faBtn) {
    enable2faBtn.addEventListener('click', () => {
      const pin = document.getElementById('twoFaPin').value;
      const confirm = document.getElementById('twoFaPinConfirm').value;
      const pinError = document.getElementById('pinError');
      if (!pin || !confirm) {
        pinError.textContent = 'Please enter PIN';
        pinError.style.display = 'block';
        return;
      }
      if (pin.length !== 6 || !/^\d+$/.test(pin)) {
        pinError.textContent = 'PIN must be 6 digits';
        pinError.style.display = 'block';
        return;
      }
      if (pin !== confirm) {
        pinError.textContent = 'PINs do not match';
        pinError.style.display = 'block';
        return;
      }
      if (currentUser) {
        currentUser.twoFaEnabled = true;
        currentUser.twoFaPin = pin;
        localStorage.setItem('tradePulseUser', JSON.stringify(currentUser));
        sessionStorage.setItem('tradePulseCurrentUser', JSON.stringify(currentUser));
        addNotification('2FA Enabled', 'Your account is now more secure with 2FA.', 'success');
        closeModal('securityModal');
        document.getElementById('twoFaPin').value = '';
        document.getElementById('twoFaPinConfirm').value = '';
        pinError.style.display = 'none';
        setup2faButtons();
      }
    });
  }
  if (changePinBtn) {
    changePinBtn.addEventListener('click', () => {
      const newPin = prompt('Enter new 6-digit PIN');
      if (newPin && newPin.length === 6 && /^\d+$/.test(newPin)) {
        if (currentUser) {
          currentUser.twoFaPin = newPin;
          localStorage.setItem('tradePulseUser', JSON.stringify(currentUser));
          sessionStorage.setItem('tradePulseCurrentUser', JSON.stringify(currentUser));
          addNotification('PIN Changed', 'Your 2FA PIN has been updated.', 'success');
          closeModal('securityModal');
        }
      } else {
        alert('PIN must be 6 digits.');
      }
    });
  }

  // ========== AVATAR UPLOAD (original) ==========
  const avatarContainer = document.getElementById('drawerAvatar');
  const avatarInput = document.getElementById('avatarInput');
  const AVATAR_KEY_PREFIX = 'userAvatar_';
  function getAvatarTextNode(container) {
    return Array.from(container.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length === 1
    );
  }
  function setAvatarTextNode(letter) {
    const existing = getAvatarTextNode(avatarContainer);
    if (existing) existing.textContent = '';
    const textNode = document.createTextNode(letter);
    avatarContainer.appendChild(textNode);
  }
  function renderAvatar(dataUrl) {
    if (!avatarContainer) return;
    avatarContainer.style.backgroundImage = `url("${dataUrl}")`;
    avatarContainer.style.backgroundSize = 'cover';
    avatarContainer.style.backgroundPosition = 'center';
    avatarContainer.style.backgroundRepeat = 'no-repeat';
    avatarContainer.style.color = 'transparent';
    const textNode = getAvatarTextNode(avatarContainer);
    if (textNode) textNode.textContent = '';
    if (currentUser) {
      localStorage.setItem(AVATAR_KEY_PREFIX + currentUser.username, dataUrl);
    }
  }
  function restoreAvatar() {
    if (!avatarContainer || !currentUser) return;
    const saved = localStorage.getItem(AVATAR_KEY_PREFIX + currentUser.username);
    if (saved) {
      renderAvatar(saved);
    } else {
      avatarContainer.style.backgroundImage = '';
      avatarContainer.style.color = '#fff';
      const letter = (currentUser.fullName || currentUser.username).charAt(0).toUpperCase();
      const existing = getAvatarTextNode(avatarContainer);
      if (existing) existing.textContent = letter;
      else setAvatarTextNode(letter);
    }
  }
  if (avatarContainer && avatarInput) {
    const cameraIcon = avatarContainer.querySelector('.camera-icon');
    const openPicker = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      avatarInput.click();
    };
    if (cameraIcon) cameraIcon.addEventListener('click', openPicker);
    avatarContainer.addEventListener('click', openPicker);
    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => renderAvatar(ev.target.result);
      reader.readAsDataURL(file);
      e.target.value = '';
    });
  }

  // ========== DRAWER USER INFO (original) ==========
  function updateDrawerUserInfo() {
    const user = JSON.parse(sessionStorage.getItem('tradePulseCurrentUser') || 'null');
    if (!user) return;
    currentUser = user;
    const drawerNameSpan = document.getElementById('drawerFullName');
    const drawerMembershipSpan = document.getElementById('drawerMembership');
    const drawerUserIdSpan = document.getElementById('drawerUserId');
    if (drawerNameSpan) drawerNameSpan.textContent = user.fullName || user.username;
    if (drawerMembershipSpan) drawerMembershipSpan.textContent = user.membership || 'Beginner';
    if (drawerUserIdSpan) drawerUserIdSpan.textContent = user.userId || '------';
    const copyUidBtn = document.getElementById('copyUidBtn');
    if (copyUidBtn && user.userId) {
      const newCopyBtn = copyUidBtn.cloneNode(true);
      copyUidBtn.parentNode.replaceChild(newCopyBtn, copyUidBtn);
      newCopyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(user.userId).then(() => {
          addNotification('Copied!', `User ID ${user.userId} copied to clipboard`, 'success');
        }).catch(() => alert('Failed to copy'));
      });
    }
    const referralDisplay = document.getElementById('referralCodeDisplay');
    if (referralDisplay && user.referralCode) referralDisplay.textContent = user.referralCode;
    const referralCountSpan = document.getElementById('referralCount');
    if (referralCountSpan) referralCountSpan.textContent = user.referrals || 0;
    const commissionSpan = document.getElementById('commissionEarned');
    if (commissionSpan && user.commission) commissionSpan.textContent = fmt(user.commission);
    if (user.savedCard) {
      const cardDisplay = document.getElementById('cardDetailsDisplay');
      if (cardDisplay) {
        cardDisplay.innerHTML = `<div class="payment-account-name">Linked Card</div><div class="payment-account-number">•••• ${user.savedCard.last4}</div><div class="payment-account-bank">Expires ${user.savedCard.expiry}</div>`;
      }
    }
    restoreAvatar();
    updateAll();
  }
  window.updateDrawerUserInfo = updateDrawerUserInfo;

  // ========== INVEST TABS ==========
  const investTabs = document.querySelectorAll('#investTabs .tab');
  investTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      investTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      document.getElementById('investPlansView').style.display = tabName==='plans'?'block':'none';
      document.getElementById('myInvestmentsView').style.display = tabName==='myinvestments'?'block':'none';
      document.getElementById('investHistoryView').style.display = tabName==='history'?'block':'none';
    });
  });

  // ========== CURRENCY SELECTOR & MISC ==========
  document.getElementById('currencyBtn').addEventListener('click', () => document.getElementById('currencyDropdown').classList.toggle('open'));
  document.getElementById('currencyDropdown').addEventListener('click', e => {
    let opt = e.target.closest('.currency-option'); if(!opt) return;
    currentCurrency = opt.dataset.currency;
    document.getElementById('currencyDropdown').classList.remove('open');
    updateAll();
  });
  document.addEventListener('click', e => { if(!e.target.closest('#currencySelector')) document.getElementById('currencyDropdown').classList.remove('open'); });
  document.getElementById('homeBalanceEye').addEventListener('click', () => { balanceHidden = !balanceHidden; updateAll(); });
  document.getElementById('hideBalanceToggle').addEventListener('click', () => { balanceHidden = !balanceHidden; updateAll(); });
  const withdrawEye = document.querySelector('.withdraw-eye');
  if (withdrawEye) withdrawEye.addEventListener('click', () => { balanceHidden = !balanceHidden; updateAll(); });
  document.getElementById('notificationBell').addEventListener('click', () => openModal('notificationsModal'));
  const periodChip = document.getElementById('overviewPeriodChip');
  const periods = ['Today','Week','Month'];
  let periodIndex = 0;
  periodChip.addEventListener('click', () => {
    periodIndex = (periodIndex + 1) % periods.length;
    overviewPeriod = periods[periodIndex].toLowerCase();
    periodChip.innerHTML = `${periods[periodIndex]}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6-6 6"/></svg>`;
    renderOverviewCards();
  });

  // ========== MODAL CLOSE BUTTONS ==========
  const closeButtons = [
    'closeHelpModalBtn', 'closeSettingsModalBtn', 'closeSecurityModalBtn', 'closeReferModalBtn',
    'closeCompareModalBtn', 'closeOverviewDetailBtn', 'closeDepositModalBtn', 'closePaymentModalBtn',
    'closeTransferModalBtn', 'closeCardModalBtn', 'closeWithdrawConfirmBtn', 'closeTransferSuccessBtn',
    'closeSuccessModalBtn', 'successModalOkBtn', 'modalCloseBtn', 'closeWithdrawalReceiptBtn', 'closeReceiptBtn'
  ];
  closeButtons.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => {
      const modalId = id.replace('close', '').replace('Btn', 'Modal').replace('successModalOkBtn', 'successModal');
      if (modalId === 'transactionModal') closeModal('transactionModal');
      else if (modalId === 'withdrawalReceiptModal') closeModal('withdrawalReceiptModal');
      else closeModal(modalId);
    });
  });

  // ========== LOGOUT ==========
  const logoutBtn = document.getElementById('drawerLogoutBtn');
  const logoutModal = document.getElementById('logoutConfirmModal');
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
  if (logoutBtn) {
    const newLogoutBtn = logoutBtn.cloneNode(true);
    logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
    newLogoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModal('logoutConfirmModal');
    });
  }
  confirmLogoutBtn?.addEventListener('click', () => { sessionStorage.clear(); localStorage.clear(); location.reload(); });
  cancelLogoutBtn?.addEventListener('click', () => closeModal('logoutConfirmModal'));

  // ========== INIT ==========
  function init() {
    if (sessionStorage.getItem('tradePulseLoggedIn') === 'true') {
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('mainApp').style.display = 'block';
      updateDrawerUserInfo();
    }
    updateAll();
    setView('home');
    updateDrawerUserInfo();
    setup2faButtons();
  }

  init();
})();
