(function() {
  const VALID_INVITE_CODE = 'INVITE2024';
  const $ = (id) => document.getElementById(id);
  const rates = { NGN:1, USD:0.00067, EUR:0.00061, GBP:0.00052 };
  const symbols = { NGN:'₦', USD:'$', EUR:'€', GBP:'£' };
  let currentCurrency = 'NGN';
  const FEE = 50;
  let balanceHidden = false;
  let overviewPeriod = 'today';
  let currentUser = null;
  let pendingDepositTimeout = null;

  // ========== Helper functions ==========
  function openModal(id) { const el = $(id); if (el) el.classList.add('open'); }
  function closeModal(id) { const el = $(id); if (el) el.classList.remove('open'); }

  function getStoredUser() {
    try { return JSON.parse(localStorage.getItem('tradePulseUser') || 'null'); } catch { return null; }
  }

  function saveUser(user) {
    localStorage.setItem('tradePulseUser', JSON.stringify(user));
    sessionStorage.setItem('tradePulseLoggedIn', 'true');
    sessionStorage.setItem('tradePulseCurrentUser', JSON.stringify(user));
    currentUser = user;
    updateDrawerUserInfo();
    updateAll();
  }

  function showProcessing(text) {
    const overlay = $('processingOverlay');
    const label = $('processingText');
    if (label) label.textContent = text || 'Processing...';
    if (overlay) overlay.classList.add('open');
  }

  function hideProcessing() {
    const overlay = $('processingOverlay');
    if (overlay) overlay.classList.remove('open');
  }

  function showSuccess(title, message) {
    const modalTitle = $('successModalTitle');
    const modalText = $('successModalText');
    if (modalTitle) modalTitle.textContent = title || 'Success';
    if (modalText) modalText.textContent = message || 'Done.';
    openModal('successModal');
  }

  function convert(amount) { return (amount * rates[currentCurrency]).toFixed(2); }
  function fmt(amount, isUSDT = false) {
    if (isUSDT) return amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDT';
    const symbol = symbols[currentCurrency];
    const converted = amount * rates[currentCurrency];
    return `${symbol} ${converted.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // ========== Base data (all zero for new user) ==========
  let base = {
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

  // ========== Notifications ==========
  let notifications = [];
  function updateNotificationBadge() {
    const badge = $('notificationBadge');
    if (!badge) return;
    const unread = notifications.filter(n => !n.read).length;
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'flex' : 'none';
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

  // ========== Drawer & avatar ==========
  function updateDrawerUserInfo() {
    const user = currentUser || getStoredUser();
    if (!user) return;

    const fullName = user.fullName || user.username || 'User';
    const firstLetter = String(fullName).trim().charAt(0).toUpperCase() || 'U';

    const drawerFullName = $('drawerFullName');
    const drawerMembership = $('drawerMembership');
    const drawerUserId = $('drawerUserId');
    const referralCodeDisplay = $('referralCodeDisplay');

    if (drawerFullName) drawerFullName.textContent = fullName;
    if (drawerMembership) drawerMembership.textContent = user.membership || 'Standard Member';
    if (drawerUserId) drawerUserId.textContent = user.userId || '------';
    if (referralCodeDisplay) referralCodeDisplay.textContent = user.referralCode || '--------';

    const avatar = $('drawerAvatar');
    if (avatar) {
      let img = avatar.querySelector('img');
      let initial = avatar.querySelector('.avatar-initial');
      if (user.avatar) {
        if (!img) { img = document.createElement('img'); avatar.prepend(img); }
        img.src = user.avatar;
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
  }

  // ========== Transactions ==========
  function addTransaction(type, amount, subtitle, meta, currency = null, iconType = null) {
    const tx = { title: type, subtitle, meta, amount, amountColor: amount > 0 ? '#4ade80' : '#f87171', iconType: iconType || (amount > 0 ? 'bank' : 'opay'), status: 'Completed', currency, id: allTransactions.length + 1 };
    allTransactions.push(tx);
    if (type === 'Withdrawal') withdrawalsOnly.push(tx);
  }

  function getIconSVG(type) {
    if (type === 'bank') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>';
    if (type === 'opay') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M22 8h-6a2 2 0 0 0 0 4h6"/></svg>';
    if (type === 'usdt') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="17" text-anchor="middle" fill="currentColor" font-size="10" font-weight="bold">₮</text></svg>';
    if (type === 'deposit') return '<svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>';
    if (type === 'withdraw') return '<svg viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
  }

  // ========== UI Updates ==========
  function updateEyeIcons() {
    const homeEye = $('homeBalanceEye');
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
    const toggleEl = $('hideBalanceToggle');
    if (toggleEl) toggleEl.querySelector('span').textContent = balanceHidden ? 'Show Balance' : 'Hide Balance';
  }

  function updateAll() {
    if (balanceHidden) {
      ['homeBalance','homeFx','walletTotalBalance','walletTotalFx','availableBalance','lockedBalance','nairaWallet','withdrawBalance','withdrawFx','withdrawableAmount','totalInvested','totalProfit','totalWithdrawn'].forEach(id => { const el = $(id); if (el) el.textContent = '****'; });
      document.querySelectorAll('.value').forEach(el => el.textContent = '****');
      $('profitPercent').textContent = '0%';
      updateEyeIcons();
      return;
    }

    base.walletTotal = base.homeBalance;
    base.walletAvailable = base.homeBalance;
    base.nairaWallet = base.homeBalance;
    base.withdrawable = base.homeBalance;
    base.totalProfit = base.homeBalance - base.totalInvested - base.totalWithdrawn;

    $('homeBalance').textContent = fmt(base.homeBalance);
    $('homeFx').textContent = `≈ $ ${(base.homeBalance * rates['USD']).toFixed(2)}`;
    $('totalInvested').textContent = fmt(base.totalInvested);
    $('totalProfit').textContent = fmt(Math.max(0, base.totalProfit));
    $('totalWithdrawn').textContent = fmt(base.totalWithdrawn);
    $('activePlansCount').textContent = base.activePlans;
    $('walletTotalBalance').textContent = fmt(base.walletTotal);
    $('walletTotalFx').textContent = `≈ $ ${(base.walletTotal * rates['USD']).toFixed(2)}`;
    $('availableBalance').textContent = fmt(base.walletAvailable);
    $('lockedBalance').textContent = fmt(base.walletLocked);
    $('nairaWallet').textContent = fmt(base.nairaWallet);
    $('withdrawBalance').textContent = fmt(base.homeBalance);
    $('withdrawFx').textContent = `≈ $ ${(base.homeBalance * rates['USD']).toFixed(2)}`;
    $('withdrawableAmount').textContent = fmt(base.withdrawable);
    $('planMin1').textContent = fmt(base.planMin1);
    $('planMax1').textContent = fmt(base.planMax1);
    $('planMin2').textContent = fmt(base.planMin2);
    $('planMax2').textContent = fmt(base.planMax2);
    $('planMin3').textContent = fmt(base.planMin3);
    $('planMax3').textContent = fmt(base.planMax3);
    $('planMin4').textContent = fmt(base.planMin4);
    $('currencyBtn').textContent = currentCurrency + ' ▾';
    document.querySelectorAll('.currency-option').forEach(o => o.classList.toggle('selected', o.dataset.currency === currentCurrency));

    renderRecentTx();
    renderRecentWithdrawals();
    renderWalletTx();
    renderOverviewCards();
    buildChart();

    const withdrawBtn = $('withdrawNavBtn');
    if (withdrawBtn) {
      if (base.homeBalance <= 0) { withdrawBtn.classList.add('btn-disabled'); withdrawBtn.disabled = true; }
      else { withdrawBtn.classList.remove('btn-disabled'); withdrawBtn.disabled = false; }
    }
  }

  // ========== Chart ==========
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

  // ========== Render Lists ==========
  function renderRecentTx() {
    const c = $('recentTransactions');
    if (!c) return;
    if (allTransactions.length === 0) { c.innerHTML = '<div class="tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No transactions yet</div><div class="tx-sub">Deposit funds to get started</div></div></div>'; return; }
    c.innerHTML = allTransactions.slice(-4).reverse().map(tx => {
      let s = tx.currency === 'USD' ? `${tx.amount>=0?'+':'-'}$${Math.abs(tx.amount).toFixed(2)}` : `${tx.amount>=0?'+':''}${fmt(Math.abs(tx.amount))}`;
      return `<div class="tx-row" data-tx-id="${tx.id}"><div class="tx-ico" style="background:${tx.amount>0?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div><div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div></div>`;
    }).join('');
  }

  function renderRecentWithdrawals() {
    const c = $('recentWithdrawals');
    if (!c) return;
    if (withdrawalsOnly.length === 0) { c.innerHTML = '<div class="tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No withdrawals yet</div><div class="tx-sub">Your withdrawals will appear here</div></div></div>'; return; }
    c.innerHTML = withdrawalsOnly.slice(-14).reverse().map(tx => {
      let s = tx.currency === 'USD' ? `-$${Math.abs(tx.amount).toFixed(2)}` : `-${fmt(Math.abs(tx.amount))}`;
      return `<div class="tx-row" data-tx-id="${tx.id}"><div class="tx-ico" style="background:${tx.amount>0?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div><div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div></div>`;
    }).join('');
  }

  function renderWalletTx() {
    const c = $('walletRecentTx');
    if (!c) return;
    if (allTransactions.length === 0) { c.innerHTML = '<div class="wallet-tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No transactions</div></div></div>'; return; }
    c.innerHTML = allTransactions.slice(-4).reverse().map(tx => {
      let s = tx.currency === 'USD' ? `${tx.amount>=0?'+':'-'}$${Math.abs(tx.amount).toFixed(2)}` : `${tx.amount>=0?'+':''}${fmt(Math.abs(tx.amount))}`;
      return `<div class="wallet-tx-row"><div class="tx-ico" style="background:${tx.amount>0?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div><div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div></div>`;
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

  // ========== Currency Switcher ==========
  $('currencyBtn').addEventListener('click', () => $('currencyDropdown').classList.toggle('open'));
  $('currencyDropdown').addEventListener('click', e => {
    const opt = e.target.closest('.currency-option');
    if (!opt) return;
    currentCurrency = opt.dataset.currency;
    $('currencyDropdown').classList.remove('open');
    updateAll();
  });
  document.addEventListener('click', e => { if (!e.target.closest('#currencySelector')) $('currencyDropdown').classList.remove('open'); });

  // ========== Balance Hide Toggles ==========
  $('homeBalanceEye')?.addEventListener('click', () => { balanceHidden = !balanceHidden; updateAll(); });
  $('hideBalanceToggle')?.addEventListener('click', () => { balanceHidden = !balanceHidden; updateAll(); });
  document.querySelector('.withdraw-eye')?.addEventListener('click', () => { balanceHidden = !balanceHidden; updateAll(); });
  $('notificationBell')?.addEventListener('click', () => { markNotificationsRead(); openModal('notificationsModal'); });
  $('closeNotificationsModalBtn')?.addEventListener('click', () => closeModal('notificationsModal'));

  // ========== Overview Period Chip ==========
  const periodChip = $('overviewPeriodChip');
  const periods = ['Today','Week','Month'];
  let periodIndex = 0;
  periodChip.addEventListener('click', () => {
    periodIndex = (periodIndex + 1) % periods.length;
    overviewPeriod = periods[periodIndex].toLowerCase();
    periodChip.innerHTML = `${periods[periodIndex]}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6-6 6"/></svg>`;
    renderOverviewCards();
  });

  // ========== Withdraw Method Switching ==========
  let activeWithdrawMethod = 'bank';
  let withdrawRenderTimer = null;
  const withdrawFormContainer = $('withdrawDetailsForm');

  function setWithdrawMethod(method) {
    if (!withdrawFormContainer || method === activeWithdrawMethod) return;
    activeWithdrawMethod = method;
    document.querySelectorAll('.method-card').forEach(card => card.classList.toggle('active', card.dataset.method === method));
    clearTimeout(withdrawRenderTimer);
    withdrawFormContainer.classList.add('switching');
    withdrawRenderTimer = setTimeout(() => {
      renderWithdrawForm(method);
      requestAnimationFrame(() => withdrawFormContainer.classList.remove('switching'));
    }, 0);
  }

  document.querySelectorAll('.method-card').forEach(card => card.addEventListener('click', () => setWithdrawMethod(card.dataset.method)));

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
    const withdrawInput = $('withdrawInput');
    const requestBtn = $('requestWithdrawalBtn');
    const errorEl = $('withdrawError');
    if (withdrawInput) {
      withdrawInput.addEventListener('input', () => {
        const amt = parseFloat(withdrawInput.value) || 0;
        if (activeWithdrawMethod === 'usdt_trc20' || activeWithdrawMethod === 'usdt_bep20') {
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
          openModal('zeroBalanceWithdrawModal');
          return;
        }
        const amount = parseFloat($('withdrawInput').value);
        const accountNumber = $('withdrawAccountInput').value.trim();
        if (errorEl) { errorEl.textContent = ''; errorEl.style.display = 'none'; }
        if (isNaN(amount) || amount <= 0) { errorEl.textContent = 'Please enter a valid amount.'; errorEl.style.display = 'block'; return; }
        if (!accountNumber) { errorEl.textContent = 'Please fill in the required field.'; errorEl.style.display = 'block'; return; }
        if (amount > base.homeBalance) { errorEl.textContent = 'Insufficient balance.'; errorEl.style.display = 'block'; return; }
        if (currentUser && currentUser.twoFaEnabled) {
          const pin = prompt('Enter your 6-digit 2FA PIN to confirm withdrawal:');
          if (pin !== currentUser.twoFaPin) { alert('Invalid PIN. Withdrawal cancelled.'); return; }
        }
        const bankName = activeWithdrawMethod === 'bank' ? $('bankSelect').value : activeWithdrawMethod;
        const fee = activeWithdrawMethod.startsWith('usdt') ? 1 : FEE;
        const receive = Math.max(0, amount - fee);
        $('confirmBank').textContent = activeWithdrawMethod === 'bank' ? `${bankName} - ${accountNumber}` : `${activeWithdrawMethod} - ${accountNumber}`;
        $('confirmAmount').textContent = activeWithdrawMethod.startsWith('usdt') ? amount + ' USDT' : fmt(amount);
        $('confirmFee').textContent = activeWithdrawMethod.startsWith('usdt') ? '1 USDT' : fmt(fee);
        $('confirmReceive').textContent = activeWithdrawMethod.startsWith('usdt') ? receive + ' USDT' : fmt(receive);
        $('confirmDate').textContent = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
        openModal('withdrawConfirmModal');
      });
    }
  }
  renderWithdrawForm('bank');

  // ========== Zero Balance Withdraw Modal ==========
  $('depositNowBtn')?.addEventListener('click', () => { closeModal('zeroBalanceWithdrawModal'); openModal('depositModal'); });
  $('cancelZeroWithdrawBtn')?.addEventListener('click', () => closeModal('zeroBalanceWithdrawModal'));
  $('closeZeroWithdrawModalBtn')?.addEventListener('click', () => closeModal('zeroBalanceWithdrawModal'));

  // ========== Forgot Password ==========
  $('forgotPasswordBtn')?.addEventListener('click', () => openModal('forgotPasswordModal'));
  $('closeForgotPasswordModalBtn')?.addEventListener('click', () => closeModal('forgotPasswordModal'));
  $('confirmResetPasswordBtn')?.addEventListener('click', () => {
    const username = $('resetUsername').value.trim();
    const inviteCode = $('resetInviteCode').value.trim();
    const newPassword = $('resetNewPassword').value.trim();
    const confirmPassword = $('resetNewPasswordConfirm').value.trim();
    const errorBox = $('resetPasswordError');
    errorBox.style.display = 'none';
    if (!username || !inviteCode || !newPassword || !confirmPassword) {
      errorBox.textContent = 'Please fill in all fields.'; errorBox.style.display = 'block'; return;
    }
    if (inviteCode !== VALID_INVITE_CODE) {
      errorBox.textContent = 'Invalid invitation code.'; errorBox.style.display = 'block'; return;
    }
    if (newPassword !== confirmPassword) {
      errorBox.textContent = 'Passwords do not match.'; errorBox.style.display = 'block'; return;
    }
    const user = getStoredUser();
    if (!user || user.username !== username) {
      errorBox.textContent = 'No matching account found.'; errorBox.style.display = 'block'; return;
    }
    user.password = newPassword;
    saveUser(user);
    closeModal('forgotPasswordModal');
    addNotification('Password Reset', 'Your password was updated successfully.', 'success');
    showSuccess('Password Updated', 'You can now sign in with your new password.');
  });

  // ========== 2FA ==========
  function refresh2faUI() {
    const user = currentUser || getStoredUser();
    if (!$('enable2faBtn')) return;
    if (user?.twoFaEnabled) {
      $('enable2faBtn').style.display = 'none';
      $('changePinBtn').style.display = 'block';
    } else {
      $('enable2faBtn').style.display = 'block';
      $('changePinBtn').style.display = 'none';
    }
  }
  $('enable2faBtn')?.addEventListener('click', () => {
    const pin = $('twoFaPin').value.trim();
    const confirm = $('twoFaPinConfirm').value.trim();
    const pinError = $('pinError');
    if (!/^\d{6}$/.test(pin) || !/^\d{6}$/.test(confirm)) {
      pinError.textContent = 'Enter a valid 6-digit PIN.'; pinError.style.display = 'block'; return;
    }
    if (pin !== confirm) {
      pinError.textContent = 'PINs do not match.'; pinError.style.display = 'block'; return;
    }
    if (currentUser) {
      currentUser.twoFaEnabled = true;
      currentUser.twoFaPin = pin;
      saveUser(currentUser);
      pinError.style.display = 'none';
      addNotification('2FA Updated', 'Your transaction PIN has been saved.', 'success');
      showSuccess('2FA Saved', 'Your 6-digit PIN has been updated successfully.');
      refresh2faUI();
      closeModal('securityModal');
    }
  });
  $('changePinBtn')?.addEventListener('click', () => openModal('securityModal'));
  $('secureNowBtn')?.addEventListener('click', () => openModal('securityModal'));

  // ========== Investment Flow ==========
  function openInvestModal(planName, min, dailyRate, planKey) {
    $('investPlanName').textContent = planName;
    $('investMin').textContent = min.toLocaleString();
    $('investDailyRate').textContent = dailyRate + '%';
    $('investAmountInput').value = min;
    updateInvestExpected();
    openModal('investModal');
  }
  function updateInvestExpected() {
    const amount = parseFloat($('investAmountInput').value) || 0;
    const rate = parseFloat($('investDailyRate').textContent) / 100;
    const totalReturn = amount + (amount * rate * 30);
    $('investExpectedReturn').textContent = fmt(totalReturn);
  }
  $('investAmountInput')?.addEventListener('input', updateInvestExpected);
  $('confirmInvestBtn')?.addEventListener('click', () => {
    const amount = parseFloat($('investAmountInput').value);
    if (isNaN(amount) || amount <= 0) return alert('Enter valid amount.');
    closeModal('investModal');
    showProcessing('Processing your investment...');
    setTimeout(() => {
      hideProcessing();
      if (!currentUser) currentUser = getStoredUser();
      currentUser.totalInvested = (currentUser.totalInvested || 0) + amount;
      currentUser.activePlans = (currentUser.activePlans || 0) + 1;
      saveUser(currentUser);
      addTransaction('Investment', -amount, $('investPlanName').textContent, new Date().toLocaleString(), null, 'bank');
      addNotification('Investment Processing', `${fmt(amount)} was submitted for ${$('investPlanName').textContent}.`, 'success');
      showSuccess('Investment Submitted', `${$('investPlanName').textContent} is now processing. You will see the update shortly.`);
    }, 1800);
  });
  document.querySelectorAll('.invest-now-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.plan-card');
      const plan = card.dataset.plan;
      const min = plan === 'beginner' ? 1000 : plan === 'standard' ? 50000 : plan === 'premium' ? 200000 : 500000;
      const rate = plan === 'beginner' ? 3.0 : plan === 'standard' ? 3.5 : plan === 'premium' ? 4.5 : 6.0;
      openInvestModal(card.querySelector('.plan-title').textContent, min, rate, plan);
    });
  });

  // ========== Deposit ==========
  $('drawerDepositBtn')?.addEventListener('click', () => openModal('depositModal'));
  document.querySelectorAll('.deposit-purple, .deposit-green, .deposit-amber, .wallet-action .green').forEach(btn => btn.addEventListener('click', () => openModal('depositModal')));
  document.querySelectorAll('#depositModal .preset').forEach(b => b.addEventListener('click', () => { $('depositAmountInput').value = b.dataset.amount; }));
  $('confirmDepositBtn')?.addEventListener('click', () => {
    const amount = parseFloat($('depositAmountInput').value);
    if (isNaN(amount) || amount <= 0) {
      const err = $('depositError'); err.textContent = 'Enter a valid deposit amount'; err.style.display = 'block';
      setTimeout(() => err.style.display = 'none', 3000);
      return;
    }
    closeModal('depositModal');
    $('paymentAmount').textContent = fmt(amount);
    $('paymentModalTitle').textContent = 'Deposit Payment';
    openModal('paymentModal');
  });
  $('confirmPaymentBtn')?.addEventListener('click', () => {
    const amount = parseFloat($('paymentAmount').textContent.replace(/[^0-9.]/g, ''));
    if (pendingDepositTimeout) clearTimeout(pendingDepositTimeout);
    closeModal('paymentModal');
    showProcessing('Processing deposit...');
    pendingDepositTimeout = setTimeout(() => {
      hideProcessing();
      base.homeBalance += amount;
      base.walletTotal = base.homeBalance;
      base.walletAvailable += amount;
      base.nairaWallet = base.walletAvailable;
      base.withdrawable = base.walletAvailable;
      if (chartData.length === 0) chartData.push({ label: new Date().getHours()+':'+String(new Date().getMinutes()).padStart(2,'0'), value: base.homeBalance });
      else chartData.push({ label: new Date().getHours()+':'+String(new Date().getMinutes()).padStart(2,'0'), value: base.homeBalance });
      addTransaction('Deposit', amount, 'Palmpay Deposit', new Date().toLocaleString(), null, 'bank');
      addNotification('Deposit Successful', `${fmt(amount)} added to your wallet`, 'success');
      updateAll();
      showSuccess('Deposit Successful', `${fmt(amount)} has been added to your balance.`);
    }, 20000);
  });

  // ========== Transfer ==========
  $('confirmTransferBtn')?.addEventListener('click', () => {
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
      $('transferAmountInput').value = '';
      $('transferRecipient').value = '';
    }, 1500);
  });

  // ========== Withdraw Confirm ==========
  $('finalConfirmWithdrawBtn')?.addEventListener('click', () => {
    const amount = parseFloat($('withdrawInput').value);
    const accountNumber = $('withdrawAccountInput').value.trim();
    const bankName = activeWithdrawMethod === 'bank' ? $('bankSelect').value : activeWithdrawMethod;
    const fee = activeWithdrawMethod.startsWith('usdt') ? 1 : FEE;
    const receive = Math.max(0, amount - fee);
    const dateStr = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
    const ref = 'WD' + Math.floor(Math.random()*90000000+10000000);
    closeModal('withdrawConfirmModal');
    showProcessing('Processing withdrawal...');
    setTimeout(() => {
      hideProcessing();
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
      updateAll();
      showSuccess('Withdrawal Successful', `${activeWithdrawMethod.startsWith('usdt') ? receive + ' USDT' : fmt(receive)} will be sent to your ${bankName}. Reference: ${ref}`);
      $('withdrawInput').value = '';
      $('withdrawAccountInput').value = '';
    }, 2500);
  });

  // ========== Community View-Only Prompt ==========
  function setCommunityViewOnlyPrompt() {
    showSuccess('Community Chat', 'Community chat is view‑only right now. Select an investment plan first, then come back to chat.');
  }
  const communitySendBtn = document.querySelector('.community-send-btn');
  const communityInput = document.querySelector('.community-input-placeholder');
  if (communitySendBtn) communitySendBtn.addEventListener('click', setCommunityViewOnlyPrompt);
  if (communityInput) communityInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') setCommunityViewOnlyPrompt(); });

  // ========== View Switching ==========
  function setView(v) {
    ['homeView','investView','withdrawView','walletView','communityView'].forEach(id => $(id).classList.remove('active'));
    $(v+'View').classList.add('active');
    $('pageTitle').textContent = { home:'Home', invest:'Invest', withdraw:'Withdrawal', wallet:'Wallet', community:'Community' }[v] || 'Home';
    document.querySelectorAll('.nav-item[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === v));
    updateAll();
  }
  document.querySelectorAll('.nav-item[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  document.addEventListener('click', e => { let t = e.target.closest('[data-nav]'); if (t && t.dataset.nav) setView(t.dataset.nav); });

  // ========== Drawer ==========
  $('menuBtn')?.addEventListener('click', () => { $('drawerOverlay').classList.add('open'); $('drawerPanel').classList.add('open'); });
  $('drawerCloseBtn')?.addEventListener('click', () => { $('drawerOverlay').classList.remove('open'); $('drawerPanel').classList.remove('open'); });
  $('drawerOverlay')?.addEventListener('click', () => { $('drawerOverlay').classList.remove('open'); $('drawerPanel').classList.remove('open'); });

  // ========== Transaction Modal ==========
  function showModal(title, arr) {
    $('modalTitle').textContent = title;
    const list = $('modalTransactionsList');
    list.innerHTML = arr.map(tx => {
      let s = tx.currency === 'USD' ? `${tx.amount>=0?'+':'-'}$${Math.abs(tx.amount).toFixed(2)}` : `${tx.amount>=0?'+':''}${fmt(Math.abs(tx.amount))}`;
      return `<div class="tx-row" data-tx-id="${tx.id}"><div class="tx-ico" style="background:${tx.amount>0?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div><div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div></div>`;
    }).join('');
    openModal('transactionModal');
  }
  $('viewAllTransactionsBtn')?.addEventListener('click', () => showModal('All Transactions', allTransactions));
  $('viewAllWithdrawalsBtn')?.addEventListener('click', () => showModal('All Withdrawals', withdrawalsOnly));
  $('viewAllWalletTx')?.addEventListener('click', () => showModal('Wallet Transactions', allTransactions));
  $('modalCloseBtn')?.addEventListener('click', () => closeModal('transactionModal'));

  // ========== Quick Actions ==========
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

  // ========== Other Buttons ==========
  $('upgradeVipBtn')?.addEventListener('click', () => { setView('invest'); setTimeout(() => $('vipPlanCard')?.scrollIntoView({behavior:'smooth'}),200); closeDrawer(); });
  $('promoUpgradeBtn')?.addEventListener('click', () => $('vipPlanCard')?.scrollIntoView({behavior:'smooth'}));
  $('drawerReferBtn')?.addEventListener('click', () => openModal('referModal'));
  $('drawerTxHistoryBtn')?.addEventListener('click', () => showModal('All Transactions', allTransactions));
  $('drawerHelpBtn')?.addEventListener('click', () => openModal('helpModal'));
  $('drawerNotificationsBtn')?.addEventListener('click', () => openModal('notificationsModal'));
  $('drawerSecurityBtn')?.addEventListener('click', () => openModal('securityModal'));
  $('drawerSettingsBtn')?.addEventListener('click', () => openModal('settingsModal'));
  $('comparePlansBtn')?.addEventListener('click', () => openModal('comparePlansModal'));
  $('copyReferBtn')?.addEventListener('click', () => {
    if (currentUser && currentUser.referralCode) navigator.clipboard.writeText(currentUser.referralCode).then(() => addNotification('Copied!', 'Referral code copied to clipboard', 'success'));
  });
  $('copyAccountBtn')?.addEventListener('click', async () => {
    const account = $('accountNumberDisplay')?.textContent.trim() || '812345678901';
    try {
      await navigator.clipboard.writeText(account);
      const btn = $('copyAccountBtn');
      btn.classList.add('copied');
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 13 4 4L19 7"/></svg>Copied!';
      setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy'; }, 2000);
    } catch(err) { alert('Failed to copy'); }
  });
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

  // ========== Card Management ==========
  $('saveCardBtn')?.addEventListener('click', () => {
    const cardNumber = $('cardNumber').value.replace(/\s/g, '');
    const expiry = $('cardExpiry').value;
    const cvv = $('cardCvv').value;
    if (!cardNumber || cardNumber.length < 15 || !expiry || !cvv) { alert('Please fill all card details'); return; }
    const last4 = cardNumber.slice(-4);
    if (currentUser) {
      currentUser.savedCard = { last4, expiry, cardNumber, cvv };
      saveUser(currentUser);
      addNotification('Card Added', `Card ending in ${last4} has been linked.`, 'success');
      closeModal('cardModal');
      $('cardNumber').value = '';
      $('cardExpiry').value = '';
      $('cardCvv').value = '';
      const cardDisplay = $('cardDetailsDisplay');
      if (cardDisplay) cardDisplay.innerHTML = `<div class="payment-account-name">Linked Card</div><div class="payment-account-number">•••• ${last4}</div><div class="payment-account-bank">Expires ${expiry}</div>`;
    }
  });

  function closeDrawer() { $('drawerOverlay')?.classList.remove('open'); $('drawerPanel')?.classList.remove('open'); }

  // ========== Logout ==========
  const logoutBtn = $('drawerLogoutBtn');
  if (logoutBtn) {
    const newLogoutBtn = logoutBtn.cloneNode(true);
    logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
    newLogoutBtn.addEventListener('click', () => openModal('logoutConfirmModal'));
  }
  $('confirmLogoutBtn')?.addEventListener('click', () => { sessionStorage.clear(); localStorage.clear(); location.reload(); });
  $('cancelLogoutBtn')?.addEventListener('click', () => closeModal('logoutConfirmModal'));

  // ========== Auto-refresh chart simulation ==========
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

  // ========== Initial Load ==========
  const savedUser = getStoredUser();
  if (savedUser) {
    currentUser = savedUser;
    base.homeBalance = savedUser.homeBalance || 0;
    base.totalInvested = savedUser.totalInvested || 0;
    base.totalWithdrawn = savedUser.totalWithdrawn || 0;
    base.activePlans = savedUser.activePlans || 0;
  }
  updateAll();
  setView('home');
  updateDrawerUserInfo();
  refresh2faUI();
})();
