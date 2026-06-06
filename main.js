(function() {
  const rates = { NGN:1, USD:0.00067, EUR:0.00061, GBP:0.00052 };
  const symbols = { NGN:'₦', USD:'$', EUR:'€', GBP:'£' };
  let currentCurrency = 'NGN';
  const FEE = 50;
  let balanceHidden = false;
  let overviewPeriod = 'today';
  let currentUser = null;
  let pendingDepositTimeout = null;

  // ===== NEW USER: all balances start at zero =====
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
    planMin1: 1000,
    planMax1: 49999,
    planMin2: 50000,
    planMax2: 199999,
    planMin3: 200000,
    planMax3: 499999,
    planMin4: 500000
  };

  let chartData = [];
  let allTransactions = [];
  let withdrawalsOnly = [];

  // ===== NOTIFICATIONS SYSTEM =====
  let notifications = [];
  const notificationBadge = document.getElementById('notificationBadge');
  const notificationsList = document.getElementById('notificationsList');

  function updateNotificationBadge() {
    if (notificationBadge) {
      const count = notifications.length;
      notificationBadge.textContent = count;
      notificationBadge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  function renderNotificationsModal() {
    if (!notificationsList) return;
    if (notifications.length === 0) {
      notificationsList.innerHTML = '<div style="padding:20px; text-align:center; color:#9ca3af;">No notifications yet</div>';
      return;
    }
    notificationsList.innerHTML = notifications.map(n => `
      <div style="display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid rgba(255,255,255,.05);">
        <div class="tx-ico" style="background:${n.type === 'success' ? 'rgba(34,197,94,.12)' : 'rgba(168,85,247,.12)'}">
          ${n.type === 'success' ? '<svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>'}
        </div>
        <div>
          <div style="font-weight:600;">${n.title}</div>
          <div style="font-size:12px;color:#9ca3af;">${n.message}</div>
          <div style="font-size:10px;color:#6b7280; margin-top:4px;">${n.time}</div>
        </div>
      </div>
    `).join('');
  }

  function addNotification(title, message, type = 'success') {
    notifications.unshift({
      title,
      message,
      type,
      time: new Date().toLocaleString()
    });
    if (notifications.length > 20) notifications.pop();
    updateNotificationBadge();
    renderNotificationsModal();
  }
  window.addNotification = addNotification;

  function convert(a) { return (a * rates[currentCurrency]).toFixed(2); }
  function fmt(amount, isUSDT = false) {
    if (isUSDT) return amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDT';
    const symbol = symbols[currentCurrency];
    const convertedAmount = amount * rates[currentCurrency];
    return `${symbol} ${convertedAmount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function addTransaction(type, amount, subtitle, meta, currency=null, iconType=null) {
    const tx = {
      title: type,
      subtitle,
      meta,
      amount,
      amountColor: amount>0 ? '#4ade80' : '#f87171',
      iconType: iconType || (amount>0 ? 'bank' : 'opay'),
      status: 'Completed',
      currency
    };
    tx.id = allTransactions.length + 1;
    allTransactions.push(tx);
    if (type === 'Withdrawal') withdrawalsOnly.push(tx);
  }

  function getIconSVG(type) {
    if (type==='bank') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>';
    if (type==='opay') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M22 8h-6a2 2 0 0 0 0 4h6"/></svg>';
    if (type==='usdt') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="17" text-anchor="middle" fill="currentColor" font-size="10" font-weight="bold">₮</text></svg>';
    if (type==='deposit') return '<svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>';
    if (type==='withdraw') return '<svg viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/></svg>';
    if (type==='wallet' || type==='transfer') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7h14"/><path d="m18 4 3 3-3 3"/><path d="M17 17H3"/><path d="m6 14-3 3 3 3"/></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
  }

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

    let cv = base.homeBalance;
    document.getElementById('homeBalance').textContent = fmt(cv);
    document.getElementById('homeFx').textContent = `≈ $ ${(cv*rates['USD']).toFixed(2)}`;
    base.walletTotal = cv;
    base.walletAvailable = cv;
    base.nairaWallet = cv;
    base.withdrawable = cv;
    base.totalProfit = cv - base.totalInvested - base.totalWithdrawn;

    document.getElementById('totalInvested').textContent = fmt(base.totalInvested);
    document.getElementById('totalProfit').textContent = fmt(Math.max(0, base.totalProfit));
    document.getElementById('totalWithdrawn').textContent = fmt(base.totalWithdrawn);
    document.getElementById('activePlansCount').textContent = base.activePlans;

    document.getElementById('walletTotalBalance').textContent = fmt(base.walletTotal);
    document.getElementById('walletTotalFx').textContent = `≈ $ ${(base.walletTotal*rates['USD']).toFixed(2)}`;
    document.getElementById('availableBalance').textContent = fmt(base.walletAvailable);
    document.getElementById('lockedBalance').textContent = fmt(base.walletLocked);
    document.getElementById('nairaWallet').textContent = fmt(base.nairaWallet);
    document.getElementById('withdrawBalance').textContent = fmt(base.homeBalance);
    document.getElementById('withdrawFx').textContent = `≈ $ ${(base.homeBalance*rates['USD']).toFixed(2)}`;
    document.getElementById('withdrawableAmount').textContent = fmt(base.withdrawable);

    document.getElementById('planMin1').textContent = fmt(base.planMin1);
    document.getElementById('planMax1').textContent = fmt(base.planMax1);
    document.getElementById('planMin2').textContent = fmt(base.planMin2);
    document.getElementById('planMax2').textContent = fmt(base.planMax2);
    document.getElementById('planMin3').textContent = fmt(base.planMin3);
    document.getElementById('planMax3').textContent = fmt(base.planMax3);
    document.getElementById('planMin4').textContent = fmt(base.planMin4);

    document.getElementById('currencyBtn').textContent = currentCurrency + ' ▾';
    document.querySelectorAll('.currency-option').forEach(o => o.classList.toggle('selected', o.dataset.currency === currentCurrency));

    let amt = parseFloat(document.getElementById('withdrawInput')?.value)||0;
    if (document.getElementById('receiveAmount')) document.getElementById('receiveAmount').textContent = fmt(Math.max(0, amt - FEE));
    if (document.getElementById('withdrawFee')) document.getElementById('withdrawFee').textContent = fmt(amt>0 ? FEE : 0);

    updateEyeIcons();
    buildChart();
    renderRecentTx();
    renderRecentWithdrawals();
    renderWalletTx();
    renderOverviewCards();

    // Enable/disable withdraw buttons based on balance
    if (base.homeBalance <= 0) {
      document.querySelectorAll('.btn-outline[data-nav="withdraw"], .small-action button:contains("Withdraw"), #withdrawNavBtn').forEach(btn => {
        if (btn) { btn.classList.add('btn-disabled'); btn.disabled = true; }
      });
    } else {
      document.querySelectorAll('.btn-outline[data-nav="withdraw"], .small-action button:contains("Withdraw"), #withdrawNavBtn').forEach(btn => {
        if (btn) { btn.classList.remove('btn-disabled'); btn.disabled = false; }
      });
    }
  }

  // ===== CHART =====
  function buildChart() {
    const container = document.getElementById('chartContainer');
    if (!container) return;
    if (chartData.length === 0) {
      container.innerHTML = `<div style="height:250px; display:flex; align-items:center; justify-content:center; color:#6b7280;">No data yet. Start investing!</div>`;
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
    container.innerHTML = `<svg class="chart-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="fillGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#22c55e" stop-opacity="0.25"/><stop offset="70%" stop-color="#22c55e" stop-opacity="0.05"/><stop offset="100%" stop-color="#22c55e" stop-opacity="0"/></linearGradient></defs>${yl.map(v=>`<line x1="${pl}" y1="${ys(v)}" x2="${W-pr}" y2="${ys(v)}" stroke="rgba(255,255,255,.06)"/>`).join('')}${yle}${xle}<path d="${ap}" fill="url(#fillGreen)"/><path d="${lp}" fill="none" stroke="#22c55e" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${xs(chartData.length-1)}" cy="${ys(chartData[chartData.length-1].value)}" r="6" fill="#22c55e"/><circle cx="${xs(chartData.length-1)}" cy="${ys(chartData[chartData.length-1].value)}" r="2.5" fill="#fff"/></svg>`;
  }

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

  function renderRecentTx() {
    let c = document.getElementById('recentTransactions');
    if (!c) return;
    c.innerHTML = '';
    if (allTransactions.length === 0) {
      c.innerHTML = '<div class="tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No transactions yet</div><div class="tx-sub">Deposit funds to get started</div></div></div>';
      return;
    }
    allTransactions.slice(-4).reverse().forEach(tx => {
      let s = tx.currency==='USD' ? `${tx.amount>=0?'+':'-'}$${Math.abs(tx.amount).toFixed(2)}` : `${tx.amount>=0?'+':''}${fmt(Math.abs(tx.amount))}`;
      c.innerHTML += `<div class="tx-row" data-tx-id="${tx.id}"><div class="tx-ico" style="background:${tx.amount>0?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div><div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div></div>`;
    });
  }

  function renderRecentWithdrawals() {
    let c = document.getElementById('recentWithdrawals');
    if (!c) return;
    c.innerHTML = '';
    if (withdrawalsOnly.length === 0) {
      c.innerHTML = '<div class="tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No withdrawals yet</div><div class="tx-sub">Your withdrawals will appear here</div></div></div>';
      return;
    }
    withdrawalsOnly.slice(-14).reverse().forEach(tx => {
      let s = tx.currency==='USD' ? `-$${Math.abs(tx.amount).toFixed(2)}` : `-${fmt(Math.abs(tx.amount))}`;
      c.innerHTML += `<div class="tx-row" data-tx-id="${tx.id}"><div class="tx-ico" style="background:${tx.amount>0?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div><div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div></div>`;
    });
  }

  function renderWalletTx() {
    let c = document.getElementById('walletRecentTx');
    if (!c) return;
    c.innerHTML = '';
    if (allTransactions.length === 0) {
      c.innerHTML = '<div class="wallet-tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No transactions</div></div></div>';
      return;
    }
    allTransactions.slice(-4).reverse().forEach(tx => {
      let s = tx.currency==='USD' ? `${tx.amount>=0?'+':'-'}$${Math.abs(tx.amount).toFixed(2)}` : `${tx.amount>=0?'+':''}${fmt(Math.abs(tx.amount))}`;
      c.innerHTML += `<div class="wallet-tx-row"><div class="tx-ico" style="background:${tx.amount>0?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div><div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div></div>`;
    });
  }

  function renderOverviewCards() {
    let c = document.getElementById('overviewCards');
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
    let cards = [
      { title:"Total Profit", value:totalProfitValue, sub:"+0%", subColor:"#34d399", iconBg:"rgba(34,197,94,.12)", iconColor:"#4ade80", icon:'<path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/>' },
      { title:"Active Investments", value:investedValue, sub:"0 Plans", subColor:"#94a3b8", iconBg:"rgba(59,130,246,.12)", iconColor:"#60a5fa", icon:'<path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"/><path d="M8 13c1.7 0 3-1.3 3-3S9.7 7 8 7 5 8.3 5 10s1.3 3 3 3Z"/>' },
      { title:"Referral Earnings", value:referralValue, sub:"0 Referrals", subColor:"#94a3b8", iconBg:"rgba(245,158,11,.12)", iconColor:"#fbbf24", icon:'<path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"/><path d="M8 13c1.7 0 3-1.3 3-3S9.7 7 8 7 5 8.3 5 10s1.3 3 3 3Z"/>' },
      { title:"Withdrawn", value:withdrawnValue, sub:"This Month", subColor:"#94a3b8", iconBg:"rgba(168,85,247,.12)", iconColor:"#c084fc", icon:'<path d="M3 7h18v10H3z"/><path d="M16 12h4"/><circle cx="16.5" cy="12" r="1.2" fill="#c084fc" stroke="none"/>' }
    ];
    c.innerHTML = cards.map(ca => `<div class="stat" data-title="${ca.title}" data-value="${fmt(ca.value)}" data-sub="${ca.sub}"><div class="ico" style="background:${ca.iconBg}"><svg viewBox="0 0 24 24" fill="none" stroke="${ca.iconColor}" stroke-width="2">${ca.icon}</svg></div><div class="title">${ca.title}</div><div class="value">${balanceHidden?'****':fmt(ca.value)}</div><div class="sub" style="color:${ca.subColor}">${ca.sub}</div></div>`).join('');
    document.querySelectorAll('#overviewCards .stat').forEach(card => {
      card.addEventListener('click', () => {
        const title = card.querySelector('.title').textContent;
        const value = card.querySelector('.value').textContent;
        const sub = card.querySelector('.sub').textContent;
        document.getElementById('overviewDetailTitle').textContent = title;
        document.getElementById('overviewDetailValue').textContent = value;
        document.getElementById('overviewDetailDesc').textContent = sub;
        openModal('overviewDetailModal');
      });
    });
  }

  // ===== CURRENCY SWITCHER =====
  document.getElementById('currencyBtn').addEventListener('click', () => document.getElementById('currencyDropdown').classList.toggle('open'));
  document.getElementById('currencyDropdown').addEventListener('click', e => {
    let opt = e.target.closest('.currency-option'); if(!opt) return;
    currentCurrency = opt.dataset.currency;
    document.getElementById('currencyDropdown').classList.remove('open');
    updateAll();
  });
  document.addEventListener('click', e => { if(!e.target.closest('#currencySelector')) document.getElementById('currencyDropdown').classList.remove('open'); });

  document.getElementById('homeBalanceEye').addEventListener('click', () => {
    balanceHidden = !balanceHidden;
    updateAll();
  });
  document.getElementById('hideBalanceToggle').addEventListener('click', () => {
    balanceHidden = !balanceHidden;
    updateAll();
  });

  const withdrawEye = document.querySelector('.withdraw-eye');
  if (withdrawEye) {
    withdrawEye.addEventListener('click', () => {
      balanceHidden = !balanceHidden;
      updateAll();
    });
  }

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

  // ===== WITHDRAW METHOD SWITCHING (with flicker fix) =====
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
        <select id="bankSelect" style="width:100%;height:56px;border-radius:16px;border:1px solid rgba(255,255,255,.08);background:#0b1020;color:#fff;padding:0 16px;font-size:16px;margin-bottom:14px;appearance:none;cursor:pointer;">
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
        if (base.homeBalance <= 0) {
          alert('You have no funds to withdraw. Please deposit first.');
          return;
        }
        const amount = parseFloat(document.getElementById('withdrawInput').value);
        const accountNumber = document.getElementById('withdrawAccountInput').value.trim();
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.style.display = 'none';
        }
        if (isNaN(amount) || amount <= 0) {
          errorEl.textContent = 'Please enter a valid amount.';
          errorEl.style.display = 'block';
          return;
        }
        if (!accountNumber) {
          errorEl.textContent = 'Please fill in the required field.';
          errorEl.style.display = 'block';
          return;
        }
        if (amount > base.homeBalance) {
          errorEl.textContent = 'Insufficient balance.';
          errorEl.style.display = 'block';
          return;
        }
        // Check 2FA if enabled
        if (currentUser && currentUser.twoFaEnabled) {
          const pin = prompt('Enter your 6-digit 2FA PIN to confirm withdrawal:');
          if (pin !== currentUser.twoFaPin) {
            alert('Invalid PIN. Withdrawal cancelled.');
            return;
          }
        }
        const bankName = activeWithdrawMethod === 'bank' ? document.getElementById('bankSelect').value : activeWithdrawMethod;
        const fee = activeWithdrawMethod.startsWith('usdt') ? 1 : FEE;
        const receive = Math.max(0, amount - fee);
        document.getElementById('confirmBank').textContent = activeWithdrawMethod === 'bank' ? `${bankName} - ${accountNumber}` : `${activeWithdrawMethod} - ${accountNumber}`;
        document.getElementById('confirmAmount').textContent = activeWithdrawMethod.startsWith('usdt') ? amount + ' USDT' : fmt(amount);
        document.getElementById('confirmFee').textContent = activeWithdrawMethod.startsWith('usdt') ? '1 USDT' : fmt(fee);
        document.getElementById('confirmReceive').textContent = activeWithdrawMethod.startsWith('usdt') ? receive + ' USDT' : fmt(receive);
        document.getElementById('confirmDate').textContent = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
        document.getElementById('withdrawConfirmModal').classList.add('open');
      });
    }
  }
  renderWithdrawForm('bank');

  // ===== AVATAR UPLOAD (per user) =====
  const avatarContainer = document.getElementById('drawerAvatar');
  const avatarInput = document.getElementById('avatarInput');
  const AVATAR_KEY_PREFIX = 'userAvatar_';

  function getAvatarTextNode(container) {
    return Array.from(container.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length === 1
    );
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
      const textNode = getAvatarTextNode(avatarContainer);
      if (textNode) textNode.textContent = (currentUser.fullName || currentUser.username).charAt(0).toUpperCase();
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

  // ===== DYNAMIC DRAWER UPDATE (with copyable UID) =====
  function updateDrawerUserInfo() {
    const user = JSON.parse(sessionStorage.getItem('tradePulseCurrentUser'));
    if (!user) return;
    currentUser = user;
    const drawerNameSpan = document.getElementById('drawerFullName');
    const drawerMembershipSpan = document.getElementById('drawerMembership');
    const drawerUserIdSpan = document.getElementById('drawerUserId');
    if (drawerNameSpan) drawerNameSpan.textContent = user.fullName || user.username;
    if (drawerMembershipSpan) drawerMembershipSpan.textContent = user.membership || 'Standard Member';
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
    
    // Referral code display
    const referralDisplay = document.getElementById('referralCodeDisplay');
    if (referralDisplay && user.referralCode) referralDisplay.textContent = user.referralCode;
    const referralCountSpan = document.getElementById('referralCount');
    if (referralCountSpan) referralCountSpan.textContent = user.referrals || 0;
    const commissionSpan = document.getElementById('commissionEarned');
    if (commissionSpan && user.commission) commissionSpan.textContent = fmt(user.commission);
    
    // Card display
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

  // ===== 2FA SETUP =====
  const securityModal = document.getElementById('securityModal');
  const enable2faBtn = document.getElementById('enable2faBtn');
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
      }
    });
  }

  // ===== CARD MANAGEMENT =====
  const saveCardBtn = document.getElementById('saveCardBtn');
  if (saveCardBtn) {
    saveCardBtn.addEventListener('click', () => {
      const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
      const expiry = document.getElementById('cardExpiry').value;
      const cvv = document.getElementById('cardCvv').value;
      if (!cardNumber || cardNumber.length < 15 || !expiry || !cvv) {
        alert('Please fill all card details');
        return;
      }
      const last4 = cardNumber.slice(-4);
      if (currentUser) {
        currentUser.savedCard = { last4, expiry, cardNumber, cvv };
        localStorage.setItem('tradePulseUser', JSON.stringify(currentUser));
        sessionStorage.setItem('tradePulseCurrentUser', JSON.stringify(currentUser));
        addNotification('Card Added', `Card ending in ${last4} has been linked to your account.`, 'success');
        closeModal('cardModal');
        document.getElementById('cardNumber').value = '';
        document.getElementById('cardExpiry').value = '';
        document.getElementById('cardCvv').value = '';
        const cardDisplay = document.getElementById('cardDetailsDisplay');
        if (cardDisplay) {
          cardDisplay.innerHTML = `<div class="payment-account-name">Linked Card</div><div class="payment-account-number">•••• ${last4}</div><div class="payment-account-bank">Expires ${expiry}</div>`;
        }
      }
    });
  }

  // ===== DEPOSIT PROCESSING (with delay) =====
  const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
  if (confirmPaymentBtn) {
    confirmPaymentBtn.addEventListener('click', () => {
      if (pendingPaymentType === 'deposit') {
        closeModal('paymentModal');
        const processingOverlay = document.getElementById('processingOverlay');
        processingOverlay.classList.add('open');
        if (pendingDepositTimeout) clearTimeout(pendingDepositTimeout);
        pendingDepositTimeout = setTimeout(() => {
          processingOverlay.classList.remove('open');
          base.homeBalance += pendingPaymentAmount;
          base.walletTotal = base.homeBalance;
          base.walletAvailable += pendingPaymentAmount;
          base.nairaWallet = base.walletAvailable;
          base.withdrawable = base.walletAvailable;
          if (chartData.length === 0) {
            chartData.push({ label: new Date().getHours()+':'+String(new Date().getMinutes()).padStart(2,'0'), value: base.homeBalance });
          } else {
            chartData.push({ label: new Date().getHours()+':'+String(new Date().getMinutes()).padStart(2,'0'), value: base.homeBalance });
          }
          addTransaction('Deposit', pendingPaymentAmount, 'Palmpay Deposit', new Date().toLocaleString(), null, 'bank');
          addNotification('Deposit Successful', `₦${pendingPaymentAmount.toLocaleString()} added to your wallet`, 'success');
          updateAll();
          pendingPaymentAmount = null;
          pendingPaymentType = null;
        }, 20000);
      } else if (pendingPaymentType === 'invest') {
        if (pendingPaymentAmount > base.walletAvailable) {
          alert('Insufficient balance.');
          return;
        }
        base.homeBalance -= pendingPaymentAmount;
        base.walletTotal = base.homeBalance;
        base.walletAvailable -= pendingPaymentAmount;
        base.nairaWallet = base.walletAvailable;
        base.withdrawable = base.walletAvailable;
        base.totalInvested += pendingPaymentAmount;
        base.activePlans++;
        chartData.push({ label: new Date().getHours()+':'+String(new Date().getMinutes()).padStart(2,'0'), value: base.homeBalance });
        const planName = paymentModal.dataset.planName || 'Plan';
        addTransaction('Investment', pendingPaymentAmount, `Invested in ${planName}`, new Date().toLocaleString(), null, 'bank');
        addNotification('Investment Made', `₦${pendingPaymentAmount.toLocaleString()} invested in ${planName}`, 'success');
        closeModal('paymentModal');
        updateAll();
        pendingPaymentAmount = null;
        pendingPaymentType = null;
      }
    });
  }

  // ===== MODAL HELPERS =====
  function openModal(id) { document.getElementById(id).classList.add('open'); }
  function closeModal(id) { document.getElementById(id).classList.remove('open'); }

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  document.getElementById('closeHelpModalBtn')?.addEventListener('click', () => closeModal('helpModal'));
  document.getElementById('closeSettingsModalBtn')?.addEventListener('click', () => closeModal('settingsModal'));
  document.getElementById('closeSecurityModalBtn')?.addEventListener('click', () => closeModal('securityModal'));
  document.getElementById('closeNotificationsModalBtn')?.addEventListener('click', () => closeModal('notificationsModal'));
  document.getElementById('closeReferModalBtn')?.addEventListener('click', () => closeModal('referModal'));
  document.getElementById('closeCompareModalBtn')?.addEventListener('click', () => closeModal('comparePlansModal'));
  document.getElementById('closeOverviewDetailBtn')?.addEventListener('click', () => closeModal('overviewDetailModal'));
  document.getElementById('closeDepositModalBtn')?.addEventListener('click', () => closeModal('depositModal'));
  document.getElementById('closePaymentModalBtn')?.addEventListener('click', () => closeModal('paymentModal'));
  document.getElementById('closeTransferModalBtn')?.addEventListener('click', () => closeModal('transferModal'));
  document.getElementById('closeCardModalBtn')?.addEventListener('click', () => closeModal('cardModal'));
  document.getElementById('closeWithdrawConfirmBtn')?.addEventListener('click', () => closeModal('withdrawConfirmModal'));

  // ===== DEPOSIT MODAL =====
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
    openPaymentModal('deposit', amount);
    document.getElementById('depositAmountInput').value = '';
  });

  // ===== PAYMENT MODAL =====
  const paymentModal = document.getElementById('paymentModal');
  let pendingPaymentType = null;
  let pendingPaymentAmount = 0;
  function openPaymentModal(type, amount, extraData=null) {
    pendingPaymentType = type;
    pendingPaymentAmount = amount;
    document.getElementById('paymentAmount').textContent = fmt(amount);
    document.getElementById('paymentModalTitle').textContent = type==='deposit' ? 'Deposit Payment' : 'Investment Payment';
    paymentModal.classList.add('open');
    if (extraData) {
      paymentModal.dataset.planName = extraData.planName;
      paymentModal.dataset.planKey = extraData.planKey;
    } else {
      delete paymentModal.dataset.planName;
      delete paymentModal.dataset.planKey;
    }
  }

  // ===== INVEST MODAL =====
  const investModal = document.getElementById('investModal');
  document.getElementById('closeInvestModalBtn')?.addEventListener('click', () => closeModal('investModal'));
  investModal.addEventListener('click', e => { if(e.target===investModal) closeModal('investModal'); });
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
    openPaymentModal('invest', amount, { planName: document.getElementById('investPlanName').textContent, planKey: currentInvestPlan });
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

  // ===== TRANSFER MODAL =====
  const transferModal = document.getElementById('transferModal');
  const transferSuccessModal = document.getElementById('transferSuccessModal');
  document.getElementById('closeTransferModalBtn')?.addEventListener('click', () => closeModal('transferModal'));
  document.getElementById('closeTransferSuccessBtn')?.addEventListener('click', () => closeModal('transferSuccessModal'));
  document.getElementById('confirmTransferBtn')?.addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('transferAmountInput').value);
    const recipient = document.getElementById('transferRecipient').value.trim();
    if (isNaN(amount)||amount<=0) return alert('Enter valid amount.');
    if (!recipient) return alert('Enter recipient username.');
    if (amount > base.walletAvailable) return alert('Insufficient balance.');
    closeModal('transferModal');
    document.getElementById('processingOverlay').classList.add('open');
    setTimeout(() => {
      document.getElementById('processingOverlay').classList.remove('open');
      base.homeBalance -= amount;
      base.walletTotal = base.homeBalance;
      base.walletAvailable -= amount;
      base.nairaWallet = base.walletAvailable;
      base.withdrawable = base.walletAvailable;
      chartData.push({ label: new Date().getHours()+':'+String(new Date().getMinutes()).padStart(2,'0'), value: base.homeBalance });
      addTransaction('Transfer', -amount, `To ${recipient}`, new Date().toLocaleString(), null, 'wallet');
      addNotification('Transfer Sent', `₦${amount.toLocaleString()} sent to ${recipient}`, 'success');
      document.getElementById('transferAmountInput').value = '';
      document.getElementById('transferRecipient').value = '';
      const date = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
      const ref = 'TRF' + Math.floor(Math.random()*90000000+10000000);
      document.getElementById('transferSuccessRecipient').textContent = recipient;
      document.getElementById('transferSuccessAmount').textContent = fmt(amount);
      document.getElementById('transferSuccessDate').textContent = date;
      document.getElementById('transferSuccessRef').textContent = ref;
      openModal('transferSuccessModal');
      updateAll();
    }, 1500);
  });

  // ===== WALLET ACTIONS =====
  document.body.addEventListener('click', e => {
    const action = e.target.closest('.wallet-action');
    if(action && action.querySelector('.wallet-action-title')?.textContent.trim()==='Transfer') { openModal('transferModal'); }
    if(action && action.querySelector('.wallet-action-title')?.textContent.trim()==='Deposit') { openDepositModal(); }
    if(action && action.querySelector('.wallet-action-title')?.textContent.trim()==='Withdraw') { setView('withdraw'); }
    if(action && action.querySelector('.wallet-action-title')?.textContent.trim()==='History') { showModal('All Transactions', allTransactions); }
    if(action && action.querySelector('.wallet-action-title')?.textContent.trim()==='Cards') { openModal('cardModal'); }
  });
  document.getElementById('closeCardModalBtn')?.addEventListener('click', () => closeModal('cardModal'));

  // ===== INVEST TABS =====
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

  // ===== VIEW SWITCHING =====
  function setView(v) {
    ['homeView','investView','withdrawView','walletView','communityView'].forEach(id => document.getElementById(id).classList.remove('active'));
    document.getElementById(v+'View').classList.add('active');
    document.getElementById('pageTitle').textContent = { home:'Home', invest:'Invest', withdraw:'Withdrawal', wallet:'Wallet', community:'Community' }[v]||'Home';
    document.querySelectorAll('.nav-item[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view===v));
    updateAll();
  }
  document.querySelectorAll('.nav-item[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  document.addEventListener('click', e => { let t = e.target.closest('[data-nav]'); if(t && t.dataset.nav) setView(t.dataset.nav); });

  // ===== DRAWER =====
  let drawer = document.getElementById('drawerOverlay'), panel = document.getElementById('drawerPanel');
  document.getElementById('menuBtn')?.addEventListener('click', () => { drawer.classList.add('open'); panel.classList.add('open'); });
  document.getElementById('drawerCloseBtn')?.addEventListener('click', () => { drawer.classList.remove('open'); panel.classList.remove('open'); });
  drawer?.addEventListener('click', () => { drawer.classList.remove('open'); panel.classList.remove('open'); });

  // ===== TRANSACTION MODAL =====
  let modal = document.getElementById('transactionModal');
  document.getElementById('modalCloseBtn')?.addEventListener('click', () => closeModal('transactionModal'));
  modal?.addEventListener('click', e => { if(e.target===modal) closeModal('transactionModal'); });
  function showModal(t, arr) {
    document.getElementById('modalTitle').textContent = t;
    let list = document.getElementById('modalTransactionsList');
    list.innerHTML = '';
    arr.forEach(tx => {
      let s = tx.currency==='USD' ? `${tx.amount>=0?'+':'-'}$${Math.abs(tx.amount).toFixed(2)}` : `${tx.amount>=0?'+':''}${fmt(Math.abs(tx.amount))}`;
      let row = document.createElement('div');
      row.className = 'tx-row';
      row.setAttribute('data-tx-id', tx.id);
      row.innerHTML = `<div class="tx-ico" style="background:${tx.amount>0?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div><div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div>`;
      list.appendChild(row);
    });
    openModal('transactionModal');
  }
  document.getElementById('viewAllTransactionsBtn')?.addEventListener('click', () => showModal('All Transactions', allTransactions));
  document.getElementById('viewAllWithdrawalsBtn')?.addEventListener('click', () => showModal('All Withdrawals', withdrawalsOnly));
  document.getElementById('viewAllWalletTx')?.addEventListener('click', () => showModal('Wallet Transactions', allTransactions));

  // ===== QUICK ACTIONS =====
  (function initQuickActions(){
    let actions = [
      { label:"Invest", color:"linear-gradient(135deg,#6d28d9,#8b5cf6)", nav:'invest', icon:'<path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-6"/><path d="M12 16V8"/><path d="M16 16v-3"/>' },
      { label:"Deposit", color:"linear-gradient(135deg,#16a34a,#4ade80)", nav:'wallet', icon:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>' },
      { label:"Withdraw", color:"linear-gradient(135deg,#d97706,#f59e0b)", nav:'withdraw', icon:'<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>' },
      { label:"Transfer", color:"linear-gradient(135deg,#2563eb,#60a5fa)", nav:'wallet', icon:'<path d="M7 7h14"/><path d="m18 4 3 3-3 3"/><path d="M17 17H3"/><path d="m6 14-3 3 3 3"/>' },
      { label:"Wallet", color:"linear-gradient(135deg,#db2777,#f472b6)", nav:'wallet', icon:'<path d="M3 7h18v10H3z"/><path d="M16 12h4"/><circle cx="16.5" cy="12" r="1.2" fill="white" stroke="none"/>' },
      { label:"Community", color:"linear-gradient(135deg,#5b21b6,#8b5cf6)", nav:'community', icon:'<path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"/><path d="M8 13c1.7 0 3-1.3 3-3S9.7 7 8 7 5 8.3 5 10s1.3 3 3 3Z"/><path d="M3 19c.7-2.7 3-4 5-4s4.3 1.3 5 4"/>' }
    ];
    document.getElementById('quickActions').innerHTML = actions.map(a => `<div class="action" data-nav="${a.nav}"><div class="circle" style="background:${a.color}"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">${a.icon}</svg></div><div class="label">${a.label}</div></div>`).join('');
  })();

  // ===== WITHDRAWAL RECEIPT =====
  function openWithdrawalReceipt(tx) {
    const isUSDT = tx.subtitle && tx.subtitle.includes('USDT');
    const fee = isUSDT ? 1 : FEE;
    const absAmount = Math.abs(tx.amount);
    const received = Math.max(0, absAmount - fee);
    document.getElementById('receiptBank').textContent = tx.subtitle.replace('To ','');
    document.getElementById('receiptAmount').textContent = isUSDT ? `${absAmount} USDT` : fmt(absAmount);
    document.getElementById('receiptFee').textContent = isUSDT ? `- ${fee} USDT` : `- ${fmt(fee)}`;
    document.getElementById('receiptReceive').textContent = isUSDT ? `${received} USDT` : fmt(received);
    document.getElementById('receiptDateTime').textContent = tx.meta;
    document.getElementById('receiptStatus').textContent = tx.status;
    const datePart = tx.meta ? tx.meta.replace(/[^0-9]/g, '').substring(0,8) : '00000000';
    const ref = 'WD' + tx.id.toString().padStart(6,'0') + datePart;
    document.getElementById('receiptRef').textContent = ref;
    openModal('withdrawalReceiptModal');
  }

  function handleWithdrawalRowClick(e) {
    const row = e.target.closest('.tx-row[data-tx-id]');
    if (!row) return;
    const txId = parseInt(row.dataset.txId);
    const tx = allTransactions.find(t => t.id === txId);
    if (tx) openWithdrawalReceipt(tx);
  }
  document.getElementById('recentWithdrawals')?.addEventListener('click', handleWithdrawalRowClick);
  document.getElementById('modalTransactionsList')?.addEventListener('click', handleWithdrawalRowClick);
  document.getElementById('closeWithdrawalReceiptBtn')?.addEventListener('click', () => closeModal('withdrawalReceiptModal'));
  document.getElementById('closeReceiptBtn')?.addEventListener('click', () => closeModal('withdrawalReceiptModal'));

  // ===== FINAL WITHDRAW CONFIRM =====
  const withdrawConfirmModal = document.getElementById('withdrawConfirmModal');
  document.getElementById('finalConfirmWithdrawBtn')?.addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('withdrawInput').value);
    const accountNumber = document.getElementById('withdrawAccountInput').value.trim();
    const bankName = activeWithdrawMethod === 'bank' ? document.getElementById('bankSelect').value : activeWithdrawMethod;
    const fee = activeWithdrawMethod.startsWith('usdt') ? 1 : FEE;
    const receive = Math.max(0, amount - fee);
    const dateStr = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
    const ref = 'WD' + Math.floor(Math.random()*90000000+10000000);
    closeModal('withdrawConfirmModal');
    document.getElementById('processingOverlay').classList.add('open');
    setTimeout(() => {
      document.getElementById('processingOverlay').classList.remove('open');
      base.homeBalance -= amount;
      base.walletTotal = base.homeBalance;
      base.walletAvailable -= amount;
      base.nairaWallet = base.walletAvailable;
      base.withdrawable = base.walletAvailable;
      base.totalWithdrawn += amount;
      base.totalProfit = base.homeBalance - base.totalInvested - base.totalWithdrawn;
      chartData.push({ label: new Date().getHours()+':'+String(new Date().getMinutes()).padStart(2,'0'), value: base.homeBalance });
      addTransaction('Withdrawal', -amount, `To ${bankName}`, new Date().toLocaleString(), null, 'bank');
      addNotification('Withdrawal Processed', `${activeWithdrawMethod.startsWith('usdt') ? amount + ' USDT' : fmt(amount)} sent to ${bankName}`, 'success');
      document.getElementById('withdrawInput').value = '';
      document.getElementById('withdrawAccountInput').value = '';
      if (document.getElementById('receiveAmount')) document.getElementById('receiveAmount').textContent = activeWithdrawMethod.startsWith('usdt') ? '0 USDT' : fmt(0);
      if (document.getElementById('withdrawFee')) document.getElementById('withdrawFee').textContent = activeWithdrawMethod.startsWith('usdt') ? '1 USDT' : fmt(FEE);
      updateAll();
      document.getElementById('successBank').textContent = bankName;
      document.getElementById('successAmount').textContent = activeWithdrawMethod.startsWith('usdt') ? amount + ' USDT' : fmt(amount);
      document.getElementById('successFee').textContent = activeWithdrawMethod.startsWith('usdt') ? '1 USDT' : fmt(fee);
      document.getElementById('successReceive').textContent = activeWithdrawMethod.startsWith('usdt') ? receive + ' USDT' : fmt(receive);
      document.getElementById('successDate').textContent = dateStr;
      document.getElementById('successRef').textContent = ref;
      openModal('withdrawalSuccessModal');
    }, 2500);
  });

  document.getElementById('closeSuccessModalBtn')?.addEventListener('click', () => closeModal('withdrawalSuccessModal'));

  // ===== LOGOUT =====
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
  confirmLogoutBtn?.addEventListener('click', () => {
    sessionStorage.clear();
    localStorage.clear();
    location.reload();
  });
  cancelLogoutBtn?.addEventListener('click', () => closeModal('logoutConfirmModal'));

  // ===== OTHER BUTTONS =====
  document.getElementById('upgradeVipBtn')?.addEventListener('click', () => { setView('invest'); setTimeout(() => document.getElementById('vipPlanCard')?.scrollIntoView({behavior:'smooth'}),200); closeDrawer(); });
  document.getElementById('promoUpgradeBtn')?.addEventListener('click', () => document.getElementById('vipPlanCard')?.scrollIntoView({behavior:'smooth'}));
  document.getElementById('drawerReferBtn')?.addEventListener('click', () => openModal('referModal'));
  document.getElementById('drawerTxHistoryBtn')?.addEventListener('click', () => showModal('All Transactions', allTransactions));
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
    const account = document.getElementById('accountNumberDisplay')?.textContent.trim() || '812345678901';
    try {
      await navigator.clipboard.writeText(account);
      const btn = document.getElementById('copyAccountBtn');
      btn.classList.add('copied');
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 13 4 4L19 7"/></svg>Copied!';
      setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy'; }, 2000);
    } catch(err) { alert('Failed to copy'); }
  });

  function closeDrawer() {
    drawer?.classList.remove('open');
    panel?.classList.remove('open');
  }

  // ===== INIT =====
  updateAll();
  setView('home');
  updateDrawerUserInfo();
})();
