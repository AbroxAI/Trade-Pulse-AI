(function () {
  'use strict';

  const VALID_INVITE_CODE = 'INVITE2024';
  const USER_KEY = 'tradePulseUsers';
  const LEGACY_USER_KEY = 'tradePulseUser';
  const CURRENT_KEY = 'tradePulseCurrentUser';
  const LOGIN_KEY = 'tradePulseLoggedIn';
  const NOTIFICATIONS_KEY = 'tradePulseNotifications';
  const FEE = 50;

  const rates = { NGN: 1, USD: 0.00067, EUR: 0.00061, GBP: 0.00052 };
  const symbols = { NGN: '₦', USD: '$', EUR: '€', GBP: '£' };

  const $ = (id) => document.getElementById(id);

  const state = {
    currentCurrency: 'NGN',
    balanceHidden: false,
    overviewPeriod: 'today',
    currentUser: null,
    notifications: [],
    allTransactions: [],
    withdrawalsOnly: [],
    base: {
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
      planMin4: 500000,
    },
  };

  function safeParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function loadUsers() {
    const users = safeParse(localStorage.getItem(USER_KEY), null);
    if (Array.isArray(users)) return users;
    const legacy = safeParse(localStorage.getItem(LEGACY_USER_KEY), null);
    return legacy ? [legacy] : [];
  }

  function saveUsers(users) {
    localStorage.setItem(USER_KEY, JSON.stringify(users));
    if (users[0]) localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(users[0]));
  }

  function getStoredCurrentUser() {
    return safeParse(sessionStorage.getItem(CURRENT_KEY), null);
  }

  function getActiveUser() {
    return state.currentUser || getStoredCurrentUser() || safeParse(localStorage.getItem(LEGACY_USER_KEY), null);
  }

  function saveCurrentUser(user) {
    state.currentUser = user;
    sessionStorage.setItem(LOGIN_KEY, 'true');
    sessionStorage.setItem(CURRENT_KEY, JSON.stringify(user));

    const users = loadUsers();
    const idx = users.findIndex((u) => u.username === user.username);
    if (idx >= 0) users[idx] = user;
    else users.push(user);
    saveUsers(users);

    updateDrawerUserInfo();
    updateAll();
  }

  function logout() {
    sessionStorage.removeItem(LOGIN_KEY);
    sessionStorage.removeItem(CURRENT_KEY);
    state.currentUser = null;

    const loginScreen = $('loginScreen');
    const mainApp = $('mainApp');
    if (mainApp) mainApp.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'flex';

    setAuthMode(false);
  }

  function generateUniqueUserId() {
    return `TPA${Math.floor(10000000 + Math.random() * 90000000)}`;
  }

  function generateReferralCode() {
    return `REF${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  }

  function openModal(id) {
    const el = $(id);
    if (el) el.classList.add('open');
  }

  function closeModal(id) {
    const el = $(id);
    if (el) el.classList.remove('open');
  }

  function closeAnyCommunityModal() {
    const existing = $('communityInfoModal');
    if (existing) existing.remove();
  }

  function fmt(amount, isUSDT = false) {
    const n = Number(amount) || 0;
    if (isUSDT) {
      return `${n.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
    }
    const converted = n * rates[state.currentCurrency];
    return `${symbols[state.currentCurrency]} ${converted.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function convert(amount) {
    return (Number(amount) * rates[state.currentCurrency]).toFixed(2);
  }

  function getIconSVG(type) {
    if (type === 'bank') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>';
    if (type === 'opay') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M22 8h-6a2 2 0 0 0 0 4h6"/></svg>';
    if (type === 'usdt') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="17" text-anchor="middle" fill="currentColor" font-size="10" font-weight="bold">₮</text></svg>';
    if (type === 'deposit') return '<svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>';
    if (type === 'withdraw') return '<svg viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/></svg>';
    if (type === 'transfer') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7h14"/><path d="m18 4 3 3-3 3"/><path d="M17 17H3"/><path d="m6 14-3 3 3 3"/></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
  }

  function addNotification(title, message, type = 'success') {
    state.notifications.unshift({
      id: Date.now(),
      title,
      message,
      type,
      time: new Date().toLocaleString(),
      read: false,
    });
    if (state.notifications.length > 20) state.notifications.pop();
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(state.notifications));
    renderNotificationsModal();
    updateNotificationBadge();
  }

  function loadNotifications() {
    const saved = safeParse(localStorage.getItem(NOTIFICATIONS_KEY), []);
    state.notifications = Array.isArray(saved) ? saved : [];
    updateNotificationBadge();
  }

  function updateNotificationBadge() {
    const badge = $('notificationBadge');
    if (!badge) return;
    const unread = state.notifications.filter((n) => !n.read).length;
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'flex' : 'none';
  }

  function renderNotificationsModal() {
    const list = $('notificationsList');
    if (!list) return;

    if (!state.notifications.length) {
      list.innerHTML = '<div style="padding:20px;text-align:center;color:#9ca3af;">No notifications yet</div>';
      return;
    }

    list.innerHTML = state.notifications.map((n) => `
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
  }

  function markNotificationsRead() {
    state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(state.notifications));
    updateNotificationBadge();
    renderNotificationsModal();
  }

  function addTransaction(type, amount, subtitle, meta, currency = null, iconType = null) {
    const tx = {
      id: state.allTransactions.length + 1,
      title: type,
      subtitle,
      meta,
      amount,
      amountColor: amount > 0 ? '#4ade80' : '#f87171',
      iconType: iconType || (amount > 0 ? 'bank' : 'opay'),
      status: 'Completed',
      currency,
    };
    state.allTransactions.push(tx);
    if (type === 'Withdrawal') state.withdrawalsOnly.push(tx);
  }

  function updateDrawerUserInfo() {
    const user = getActiveUser();
    if (!user) return;
    state.currentUser = user;

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
        if (!img) {
          img = document.createElement('img');
          avatar.prepend(img);
        }
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

    const copyBtn = $('copyUidBtn');
    if (copyBtn && user.userId) {
      const newBtn = copyBtn.cloneNode(true);
      copyBtn.parentNode.replaceChild(newBtn, copyBtn);
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(user.userId).then(() => {
          addNotification('Copied!', `User ID ${user.userId} copied to clipboard`, 'success');
        }).catch(() => alert('Failed to copy'));
      });
    }
  }

  function renderRecentTx() {
    const c = $('recentTransactions');
    if (!c) return;

    if (!state.allTransactions.length) {
      c.innerHTML = '<div class="tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No transactions yet</div><div class="tx-sub">Deposit funds to get started</div></div></div>';
      return;
    }

    c.innerHTML = state.allTransactions.slice(-4).reverse().map((tx) => {
      const s = tx.currency === 'USD'
        ? `${tx.amount >= 0 ? '+' : '-'}$${Math.abs(tx.amount).toFixed(2)}`
        : `${tx.amount >= 0 ? '+' : ''}${fmt(Math.abs(tx.amount))}`;
      return `
        <div class="tx-row" data-tx-id="${tx.id}">
          <div class="tx-ico" style="background:${tx.amount > 0 ? 'rgba(34,197,94,.12)' : 'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div>
          <div class="tx-main">
            <div class="tx-title">${tx.title}</div>
            <div class="tx-sub">${tx.subtitle} • ${tx.meta}</div>
          </div>
          <div class="tx-right">
            <div class="tx-amt" style="color:${tx.amountColor}">${s}</div>
            <div class="status">${tx.status}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderRecentWithdrawals() {
    const c = $('recentWithdrawals');
    if (!c) return;

    if (!state.withdrawalsOnly.length) {
      c.innerHTML = '<div class="tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No withdrawals yet</div><div class="tx-sub">Your withdrawals will appear here</div></div></div>';
      return;
    }

    c.innerHTML = state.withdrawalsOnly.slice(-14).reverse().map((tx) => {
      const s = tx.currency === 'USD'
        ? `-$${Math.abs(tx.amount).toFixed(2)}`
        : `-${fmt(Math.abs(tx.amount))}`;
      return `
        <div class="tx-row">
          <div class="tx-ico" style="background:${tx.amount > 0 ? 'rgba(34,197,94,.12)' : 'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div>
          <div class="tx-main">
            <div class="tx-title">${tx.title}</div>
            <div class="tx-sub">${tx.subtitle} • ${tx.meta}</div>
          </div>
          <div class="tx-right">
            <div class="tx-amt" style="color:${tx.amountColor}">${s}</div>
            <div class="status">${tx.status}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderWalletTx() {
    const c = $('walletRecentTx');
    if (!c) return;

    if (!state.allTransactions.length) {
      c.innerHTML = '<div class="wallet-tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No transactions</div></div></div>';
      return;
    }

    c.innerHTML = state.allTransactions.slice(-4).reverse().map((tx) => {
      const s = tx.currency === 'USD'
        ? `${tx.amount >= 0 ? '+' : '-'}$${Math.abs(tx.amount).toFixed(2)}`
        : `${tx.amount >= 0 ? '+' : ''}${fmt(Math.abs(tx.amount))}`;
      return `
        <div class="wallet-tx-row">
          <div class="tx-ico" style="background:${tx.amount > 0 ? 'rgba(34,197,94,.12)' : 'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div>
          <div class="tx-main">
            <div class="tx-title">${tx.title}</div>
            <div class="tx-sub">${tx.subtitle} • ${tx.meta}</div>
          </div>
          <div class="tx-right">
            <div class="tx-amt" style="color:${tx.amountColor}">${s}</div>
            <div class="status">${tx.status}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderOverviewCards() {
    const c = $('overviewCards');
    if (!c) return;

    let totalProfitValue = state.base.totalProfit;
    let investedValue = state.base.totalInvested;
    let referralValue = state.currentUser ? (state.currentUser.commission || 0) : 0;
    let withdrawnValue = state.base.totalWithdrawn;

    if (state.overviewPeriod === 'week') {
      totalProfitValue = Math.round(state.base.totalProfit * 0.25);
      investedValue = Math.round(state.base.totalInvested * 0.25);
      withdrawnValue = Math.round(state.base.totalWithdrawn * 0.2);
    }

    const cards = [
      {
        title: 'Total Profit',
        value: totalProfitValue,
        sub: '+0%',
        subColor: '#34d399',
        iconBg: 'rgba(34,197,94,.12)',
        iconColor: '#4ade80',
        icon: '<path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/>',
      },
      {
        title: 'Active Investments',
        value: investedValue,
        sub: `${state.base.activePlans} Plans`,
        subColor: '#94a3b8',
        iconBg: 'rgba(59,130,246,.12)',
        iconColor: '#60a5fa',
        icon: '<path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"/><path d="M8 13c1.7 0 3-1.3 3-3S9.7 7 8 7 5 8.3 5 10s1.3 3 3 3Z"/>',
      },
      {
        title: 'Referral Earnings',
        value: referralValue,
        sub: `${state.currentUser?.referrals || 0} Referrals`,
        subColor: '#94a3b8',
        iconBg: 'rgba(245,158,11,.12)',
        iconColor: '#fbbf24',
        icon: '<path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"/><path d="M8 13c1.7 0 3-1.3 3-3S9.7 7 8 7 5 8.3 5 10s1.3 3 3 3Z"/>',
      },
      {
        title: 'Withdrawn',
        value: withdrawnValue,
        sub: 'This Month',
        subColor: '#94a3b8',
        iconBg: 'rgba(168,85,247,.12)',
        iconColor: '#c084fc',
        icon: '<path d="M3 7h18v10H3z"/><path d="M16 12h4"/><circle cx="16.5" cy="12" r="1.2" fill="#c084fc" stroke="none"/>',
      },
    ];

    c.innerHTML = cards.map((ca) => `
      <div class="stat" data-title="${ca.title}" data-value="${fmt(ca.value)}" data-sub="${ca.sub}">
        <div class="ico" style="background:${ca.iconBg}">
          <svg viewBox="0 0 24 24" fill="none" stroke="${ca.iconColor}" stroke-width="2">${ca.icon}</svg>
        </div>
        <div class="title">${ca.title}</div>
        <div class="value">${state.balanceHidden ? '****' : fmt(ca.value)}</div>
        <div class="sub" style="color:${ca.subColor}">${ca.sub}</div>
      </div>
    `).join('');

    document.querySelectorAll('#overviewCards .stat').forEach((card) => {
      card.addEventListener('click', () => {
        const title = card.querySelector('.title')?.textContent || '';
        const value = card.querySelector('.value')?.textContent || '';
        const sub = card.querySelector('.sub')?.textContent || '';
        const t = $('overviewDetailTitle');
        const v = $('overviewDetailValue');
        const d = $('overviewDetailDesc');
        if (t) t.textContent = title;
        if (v) v.textContent = value;
        if (d) d.textContent = sub;
        openModal('overviewDetailModal');
      });
    });
  }

  function buildChart() {
    const container = $('chartContainer');
    if (!container) return;

    const chartData = window.chartData || [];
    if (!chartData.length) {
      container.innerHTML = '<div style="height:250px;display:flex;align-items:center;justify-content:center;color:#6b7280;">No data yet. Start investing!</div>';
      return;
    }

    let maxV = Math.max(...chartData.map((d) => d.value)) * 1.1 || 1000;
    const W = 400, H = 250, pl = 60, pr = 20, pt = 26, pb = 30;
    const gw = W - pl - pr, gh = H - pt - pb;
    const xs = (i) => pl + (i / (chartData.length - 1)) * gw;
    const ys = (v) => pt + gh - (v / maxV) * gh;

    let lp = '', ap = '';
    chartData.forEach((p, i) => {
      const x = xs(i), y = ys(p.value);
      if (i === 0) {
        lp += `M ${x} ${y}`;
        ap += `M ${x} ${H - pb} L ${x} ${y}`;
      } else {
        lp += ` L ${x} ${y}`;
        ap += ` L ${x} ${y}`;
      }
    });
    ap += ` L ${xs(chartData.length - 1)} ${H - pb} Z`;

    const yl = [0, Math.round(maxV / 2), Math.round(maxV)];
    const yle = yl.map((v) => `<text class="ytext" x="${pl - 8}" y="${ys(v) + 4}" text-anchor="end">${symbols[state.currentCurrency]} ${convert(v)}</text>`).join('');
    const xle = chartData.filter((_, i) => i % 3 === 0 || i === chartData.length - 1)
      .map((p) => `<text class="axis-text" x="${xs(chartData.indexOf(p))}" y="${H - 8}" text-anchor="middle">${p.label}</text>`).join('');

    container.innerHTML = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
        <defs>
          <linearGradient id="fillGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#22c55e" stop-opacity="0.25"/>
            <stop offset="70%" stop-color="#22c55e" stop-opacity="0.05"/>
            <stop offset="100%" stop-color="#22c55e" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${yl.map((v) => `<line x1="${pl}" y1="${ys(v)}" x2="${W - pr}" y2="${ys(v)}" stroke="rgba(255,255,255,.06)"/>`).join('')}
        ${yle}
        ${xle}
        <path d="${ap}" fill="url(#fillGreen)"/>
        <path d="${lp}" fill="none" stroke="#22c55e" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="${xs(chartData.length - 1)}" cy="${ys(chartData[chartData.length - 1].value)}" r="6" fill="#22c55e"/>
        <circle cx="${xs(chartData.length - 1)}" cy="${ys(chartData[chartData.length - 1].value)}" r="2.5" fill="#fff"/>
      </svg>
    `;
  }

  function updateEyeIcons() {
    const homeEye = $('homeBalanceEye');
    const withdrawEye = document.querySelector('.withdraw-eye');
    const normalEye = '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>';
    const slashedEye = '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path d="M3 21l18-18"/>';

    if (state.balanceHidden) {
      if (homeEye) homeEye.innerHTML = slashedEye;
      if (withdrawEye) withdrawEye.innerHTML = slashedEye;
    } else {
      if (homeEye) homeEye.innerHTML = normalEye;
      if (withdrawEye) withdrawEye.innerHTML = normalEye;
    }

    const toggleEl = $('hideBalanceToggle');
    if (toggleEl) {
      const span = toggleEl.querySelector('span');
      if (span) span.textContent = state.balanceHidden ? 'Show Balance' : 'Hide Balance';
    }
  }

  function updateAll() {
    const user = getActiveUser();
    if (user && !state.currentUser) state.currentUser = user;

    if (state.balanceHidden) {
      [
        'homeBalance', 'homeFx', 'walletTotalBalance', 'walletTotalFx', 'availableBalance',
        'lockedBalance', 'nairaWallet', 'withdrawBalance', 'withdrawFx', 'withdrawableAmount',
        'totalInvested', 'totalProfit', 'totalWithdrawn',
      ].forEach((id) => {
        const el = $(id);
        if (el) el.textContent = '****';
      });

      document.querySelectorAll('.value').forEach((el) => { el.textContent = '****'; });
      const profitPercent = $('profitPercent');
      if (profitPercent) profitPercent.textContent = '0%';
      updateEyeIcons();
      return;
    }

    state.base.walletTotal = state.base.homeBalance;
    state.base.walletAvailable = state.base.homeBalance;
    state.base.nairaWallet = state.base.homeBalance;
    state.base.withdrawable = state.base.homeBalance;
    state.base.totalProfit = state.base.homeBalance - state.base.totalInvested - state.base.totalWithdrawn;

    const setText = (id, value) => {
      const el = $(id);
      if (el) el.textContent = value;
    };

    setText('homeBalance', fmt(state.base.homeBalance));
    setText('homeFx', `≈ $ ${(state.base.homeBalance * rates.USD).toFixed(2)}`);
    setText('totalInvested', fmt(state.base.totalInvested));
    setText('totalProfit', fmt(Math.max(0, state.base.totalProfit)));
    setText('totalWithdrawn', fmt(state.base.totalWithdrawn));
    setText('activePlansCount', state.base.activePlans);
    setText('walletTotalBalance', fmt(state.base.walletTotal));
    setText('walletTotalFx', `≈ $ ${(state.base.walletTotal * rates.USD).toFixed(2)}`);
    setText('availableBalance', fmt(state.base.walletAvailable));
    setText('lockedBalance', fmt(state.base.walletLocked));
    setText('nairaWallet', fmt(state.base.nairaWallet));
    setText('withdrawBalance', fmt(state.base.homeBalance));
    setText('withdrawFx', `≈ $ ${(state.base.homeBalance * rates.USD).toFixed(2)}`);
    setText('withdrawableAmount', fmt(state.base.withdrawable));
    setText('planMin1', fmt(state.base.planMin1));
    setText('planMax1', fmt(state.base.planMax1));
    setText('planMin2', fmt(state.base.planMin2));
    setText('planMax2', fmt(state.base.planMax2));
    setText('planMin3', fmt(state.base.planMin3));
    setText('planMax3', fmt(state.base.planMax3));
    setText('planMin4', fmt(state.base.planMin4));
    setText('currencyBtn', `${state.currentCurrency} ▾`);

    document.querySelectorAll('.currency-option').forEach((o) => {
      o.classList.toggle('selected', o.dataset.currency === state.currentCurrency);
    });

    const withdrawBtn = $('withdrawNavBtn');
    if (withdrawBtn) {
      if (state.base.homeBalance <= 0) {
        withdrawBtn.classList.add('btn-disabled');
        withdrawBtn.disabled = true;
      } else {
        withdrawBtn.classList.remove('btn-disabled');
        withdrawBtn.disabled = false;
      }
    }

    renderRecentTx();
    renderRecentWithdrawals();
    renderWalletTx();
    renderOverviewCards();
    updateEyeIcons();
    buildChart();
    updateNotificationBadge();
  }

  function setView(view) {
    ['homeView', 'investView', 'withdrawView', 'walletView', 'communityView'].forEach((id) => {
      const el = $(id);
      if (el) el.classList.remove('active');
    });

    const target = $(view + 'View');
    if (target) target.classList.add('active');

    const pageTitle = $('pageTitle');
    if (pageTitle) {
      pageTitle.textContent = {
        home: 'Home',
        invest: 'Invest',
        withdraw: 'Withdrawal',
        wallet: 'Wallet',
        community: 'Community',
      }[view] || 'Home';
    }

    document.querySelectorAll('.nav-item[data-view]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    updateAll();
  }

  function showInvestTab(tabName) {
    document.querySelectorAll('#investTabs .tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    const plans = $('investPlansView');
    const mine = $('myInvestmentsView');
    const history = $('investHistoryView');

    if (plans) plans.style.display = tabName === 'plans' ? 'block' : 'none';
    if (mine) mine.style.display = tabName === 'myinvestments' ? 'block' : 'none';
    if (history) history.style.display = tabName === 'history' ? 'block' : 'none';
  }

  function openVip() {
    setView('invest');
    showInvestTab('plans');
    $('investView')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showCommunityInfoModal() {
    closeAnyCommunityModal();

    const modal = document.createElement('div');
    modal.id = 'communityInfoModal';
    modal.className = 'modal-overlay open';
    modal.innerHTML = `
      <div class="modal-panel" style="text-align:center; padding:30px 20px;">
        <div class="modal-title" style="margin-bottom:20px;">Community Chat</div>
        <div class="notice-text" style="margin-bottom:24px;">
          Message submitted successfully. Community modal opened.
        </div>
        <button type="button" id="communityInfoClose" class="withdraw-btn" style="margin-top:8px;">Close</button>
      </div>
    `;
    document.body.appendChild(modal);

    $('communityInfoClose')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  function renderWithdrawForm(method = 'bank') {
    const container = $('withdrawDetailsForm');
    if (!container) return;

    if (method === 'bank') {
      container.innerHTML = `
        <div class="field-label">Recipient Account Number</div>
        <div class="amount-input">
          <input type="text" id="withdrawAccountInput" placeholder="Enter account number"
                 style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none">
        </div>

        <div class="field-label">Bank Name</div>
        <div class="amount-input">
          <input type="text" id="withdrawBankName" placeholder="Enter bank name"
                 style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none">
        </div>

        <div class="field-label">Amount</div>
        <div class="amount-input">
          <input type="number" id="withdrawInput" placeholder="Enter amount"
                 style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none">
          <span class="currency">NGN</span>
        </div>

        <div class="amount-presets">
          <button type="button" class="preset" data-amount="5000">5,000</button>
          <button type="button" class="preset" data-amount="10000">10,000</button>
          <button type="button" class="preset" data-amount="20000">20,000</button>
          <button type="button" class="preset" data-amount="50000">50,000</button>
          <button type="button" class="preset preset-max" data-amount="max">MAX</button>
        </div>

        <div class="fee-row"><span>Fee</span><span id="withdrawFee">${fmt(0)}</span></div>
        <div class="receive-row"><span>You Receive</span><span id="receiveAmount">${fmt(0)}</span></div>
        <button type="button" id="confirmWithdrawBtn" class="withdraw-btn" style="margin-top:14px;">Withdraw</button>
      `;
    } else {
      container.innerHTML = `
        <div class="notice-box">
          <div class="notice-title">Choose another method</div>
          <div class="notice-text">Render your alternate withdrawal form here.</div>
        </div>
      `;
    }

    const withdrawInput = $('withdrawInput');
    const withdrawFee = $('withdrawFee');
    const receiveAmount = $('receiveAmount');

    function syncAmounts() {
      const amount = parseFloat(withdrawInput?.value || '0') || 0;
      if (withdrawFee) withdrawFee.textContent = fmt(amount > 0 ? FEE : 0);
      if (receiveAmount) receiveAmount.textContent = fmt(Math.max(0, amount - FEE));
    }

    withdrawInput?.addEventListener('input', syncAmounts);

    container.querySelectorAll('.preset').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!withdrawInput) return;
        if (btn.dataset.amount === 'max') withdrawInput.value = String(state.base.homeBalance || 0);
        else withdrawInput.value = btn.dataset.amount;
        syncAmounts();
      });
    });

    $('confirmWithdrawBtn')?.addEventListener('click', () => {
      const user = getActiveUser();
      const bankName = ($('withdrawBankName')?.value || '').trim();
      const account = ($('withdrawAccountInput')?.value || '').trim();
      const amount = parseFloat(withdrawInput?.value || '0') || 0;

      if (!user) return alert('Please sign in again.');
      if (!bankName) return alert('Enter your bank name.');
      if (!account || account.length < 8) return alert('Enter a valid account number.');
      if (!amount || amount <= 0) return alert('Enter a valid amount.');
      if (amount > state.base.homeBalance) return alert('Insufficient balance.');
      if (amount <= FEE) return alert('Amount must be greater than the fee.');

      addTransaction('Withdrawal', -amount, `${bankName} • ${account}`, new Date().toLocaleString(), null, 'withdraw');
      addNotification('Withdrawal submitted', `${fmt(amount)} withdrawal sent to ${bankName}`, 'success');

      state.base.homeBalance -= amount;
      state.base.walletTotal = state.base.homeBalance;
      state.base.walletAvailable = state.base.homeBalance;
      state.base.nairaWallet = state.base.homeBalance;
      state.base.withdrawable = state.base.homeBalance;

      updateAll();
      openModal('withdrawSuccessModal');
    });

    syncAmounts();
  }

  function setupWithdraw() {
    let activeMethod = 'bank';
    document.querySelectorAll('.method-card').forEach((card) => {
      card.addEventListener('click', () => {
        activeMethod = card.dataset.method || 'bank';
        document.querySelectorAll('.method-card').forEach((c) => c.classList.toggle('active', c === card));
        renderWithdrawForm(activeMethod);
      });
    });
    renderWithdrawForm(activeMethod);
  }

  function openForgotPasswordModal() {
    const existing = $('forgotPasswordModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'forgotPasswordModal';
    modal.className = 'modal-overlay open';
    modal.innerHTML = `
      <div class="modal-panel">
        <div class="modal-header">
          <div class="modal-title">Reset Password</div>
          <button type="button" class="modal-close-btn" id="closeForgotPasswordBtn">✕</button>
        </div>

        <div class="form-group">
          <label for="resetUsername">Username</label>
          <input id="resetUsername" type="text" placeholder="Enter username">
        </div>

        <div class="form-group">
          <label for="resetInviteCode">Invitation Code</label>
          <input id="resetInviteCode" type="text" placeholder="Enter invitation code">
        </div>

        <div class="form-group">
          <label for="resetNewPassword">New Password</label>
          <input id="resetNewPassword" type="password" placeholder="Enter new password">
        </div>

        <div class="form-group">
          <label for="resetConfirmPassword">Confirm New Password</label>
          <input id="resetConfirmPassword" type="password" placeholder="Confirm new password">
        </div>

        <button type="button" class="btn" id="confirmResetPasswordBtn">Update Password</button>
        <div class="error-msg" id="resetError"></div>
        <div class="success-msg" id="resetSuccess"></div>
      </div>
    `;
    document.body.appendChild(modal);

    $('closeForgotPasswordBtn')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    $('confirmResetPasswordBtn')?.addEventListener('click', () => {
      const username = ($('resetUsername')?.value || '').trim();
      const invite = ($('resetInviteCode')?.value || '').trim();
      const pw1 = $('resetNewPassword')?.value || '';
      const pw2 = $('resetConfirmPassword')?.value || '';
      const err = $('resetError');
      const ok = $('resetSuccess');

      if (err) err.textContent = '';
      if (ok) ok.textContent = '';

      if (!username || !invite || !pw1 || !pw2) {
        if (err) err.textContent = 'Fill in all fields.';
        return;
      }
      if (invite !== VALID_INVITE_CODE) {
        if (err) err.textContent = 'Invalid invitation code.';
        return;
      }
      if (pw1.length < 6) {
        if (err) err.textContent = 'Password must be at least 6 characters.';
        return;
      }
      if (pw1 !== pw2) {
        if (err) err.textContent = 'Passwords do not match.';
        return;
      }

      const users = loadUsers();
      const index = users.findIndex((u) => u.username === username);
      if (index < 0) {
        if (err) err.textContent = 'User not found.';
        return;
      }

      users[index].password = pw1;
      saveUsers(users);
      if (ok) ok.textContent = 'Password updated successfully.';
      addNotification('Password reset', 'Your password was updated successfully.', 'success');
      setTimeout(() => modal.remove(), 900);
    });
  }

  function setAuthMode(isSignUp) {
    const signInToggle = $('signInToggle');
    const signUpToggle = $('signUpToggle');
    const fullNameGroup = $('fullNameGroup');
    const emailGroup = $('emailGroup');
    const inviteCodeGroup = $('inviteCodeGroup');
    const inviteNote = $('inviteNote');
    const submitBtn = $('submitBtn');
    const loginTitle = $('loginTitle');
    const loginSubtitle = $('loginSubtitle');
    const fullNameInput = $('fullName');
    const emailInput = $('email');

    if (isSignUp) {
      signUpToggle?.classList.add('active');
      signInToggle?.classList.remove('active');
      if (loginTitle) loginTitle.textContent = 'Create Account';
      if (loginSubtitle) loginSubtitle.textContent = 'Join the exclusive trading community';
      if (fullNameGroup) fullNameGroup.style.display = 'block';
      if (emailGroup) emailGroup.style.display = 'block';
      if (inviteCodeGroup) inviteCodeGroup.style.display = 'block';
      if (inviteNote) inviteNote.style.display = 'block';
      if (submitBtn) submitBtn.textContent = 'Sign Up';
      if (fullNameInput) fullNameInput.required = true;
      if (emailInput) emailInput.required = true;
    } else {
      signInToggle?.classList.add('active');
      signUpToggle?.classList.remove('active');
      if (loginTitle) loginTitle.textContent = 'Sign In';
      if (loginSubtitle) loginSubtitle.textContent = 'Access your private trading dashboard';
      if (fullNameGroup) fullNameGroup.style.display = 'none';
      if (emailGroup) emailGroup.style.display = 'none';
      if (inviteCodeGroup) inviteCodeGroup.style.display = 'none';
      if (inviteNote) inviteNote.style.display = 'none';
      if (submitBtn) submitBtn.textContent = 'Sign In';
      if (fullNameInput) fullNameInput.required = false;
      if (emailInput) emailInput.required = false;
    }

    if ($('errorMsg')) $('errorMsg').textContent = '';
    if ($('successMsg')) $('successMsg').textContent = '';
  }

  function setupAuth() {
    const authForm = $('authForm');
    const signInToggle = $('signInToggle');
    const signUpToggle = $('signUpToggle');
    const eyeBtn = $('eyeBtn');
    const passwordInput = $('password');
    const forgotPasswordBtn = $('forgotPasswordBtn');

    if (signInToggle) signInToggle.addEventListener('click', () => setAuthMode(false));
    if (signUpToggle) signUpToggle.addEventListener('click', () => setAuthMode(true));

    if (eyeBtn && passwordInput) {
      eyeBtn.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        eyeBtn.textContent = isPassword ? '🙈' : '👁️';
      });
    }

    forgotPasswordBtn?.addEventListener('click', openForgotPasswordModal);

    authForm?.addEventListener('submit', (e) => {
      e.preventDefault();

      const errorMsg = $('errorMsg');
      const successMsg = $('successMsg');
      if (errorMsg) errorMsg.textContent = '';
      if (successMsg) successMsg.textContent = '';

      const username = ($('username')?.value || '').trim();
      const password = ($('password')?.value || '').trim();
      const inviteCode = ($('inviteCode')?.value || '').trim();
      const fullName = ($('fullName')?.value || '').trim();
      const email = ($('email')?.value || '').trim();
      const isSignUp = $('submitBtn')?.textContent?.trim() === 'Sign Up';

      if (!username || !password || !inviteCode) {
        if (errorMsg) errorMsg.textContent = 'Please fill in all required fields.';
        return;
      }
      if (inviteCode !== VALID_INVITE_CODE) {
        if (errorMsg) errorMsg.textContent = 'Invalid invitation code.';
        return;
      }

      const users = loadUsers();

      if (isSignUp) {
        if (!fullName || !email) {
          if (errorMsg) errorMsg.textContent = 'Please fill in all fields.';
          return;
        }
        if (users.some((u) => u.username === username)) {
          if (errorMsg) errorMsg.textContent = 'Username already exists.';
          return;
        }
        if (users.some((u) => u.email && u.email === email)) {
          if (errorMsg) errorMsg.textContent = 'Email already exists.';
          return;
        }

        const user = {
          fullName,
          username,
          email,
          password,
          userId: generateUniqueUserId(),
          membership: 'Standard Member',
          referralCode: generateReferralCode(),
          referrals: 0,
          commission: 0,
          twoFaEnabled: false,
          twoFaPin: null,
          savedCard: null,
          avatar: '',
          homeBalance: 0,
          totalInvested: 0,
          totalProfit: 0,
          totalWithdrawn: 0,
          activePlans: 0,
        };

        users.push(user);
        saveUsers(users);
        saveCurrentUser(user);

        if (successMsg) successMsg.textContent = 'Account created! Redirecting...';
        addNotification('Welcome!', `Account created successfully. Your referral code: ${user.referralCode}`, 'success');

        setTimeout(() => {
          const loginScreen = $('loginScreen');
          const mainApp = $('mainApp');
          if (loginScreen) loginScreen.style.display = 'none';
          if (mainApp) mainApp.style.display = 'block';
          updateDrawerUserInfo();
        }, 500);

        return;
      }

      const user = users.find((u) => (u.username === username || u.email === username) && u.password === password);
      if (!user) {
        if (errorMsg) errorMsg.textContent = 'Invalid username or password.';
        return;
      }

      saveCurrentUser(user);
      if (successMsg) successMsg.textContent = 'Signing in...';
      addNotification('Login', 'You logged in successfully.', 'success');

      setTimeout(() => {
        const loginScreen = $('loginScreen');
        const mainApp = $('mainApp');
        if (loginScreen) loginScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
        updateDrawerUserInfo();
      }, 350);
    });
  }

  function setupDrawer() {
    const drawer = $('drawerOverlay');
    const panel = $('drawerPanel');

    $('menuBtn')?.addEventListener('click', () => {
      drawer?.classList.add('open');
      panel?.classList.add('open');
    });

    $('drawerCloseBtn')?.addEventListener('click', () => {
      drawer?.classList.remove('open');
      panel?.classList.remove('open');
    });

    drawer?.addEventListener('click', () => {
      drawer.classList.remove('open');
      panel?.classList.remove('open');
    });

    document.querySelectorAll('[data-drawer-action="logout"]').forEach((btn) => {
      btn.addEventListener('click', logout);
    });
  }

  function setupNotifications() {
    $('notificationBell')?.addEventListener('click', () => {
      markNotificationsRead();
      openModal('notificationsModal');
    });
  }

  function setupNavigation() {
    document.querySelectorAll('.nav-item[data-view]').forEach((btn) => {
      btn.addEventListener('click', () => setView(btn.dataset.view));
    });

    document.addEventListener('click', (e) => {
      const nav = e.target.closest('[data-nav]');
      if (nav?.dataset?.nav) setView(nav.dataset.nav);

      if (e.target.closest('#upgradeVipBtn, .drawer-vip-card')) {
        openVip();
      }

      const walletAction = e.target.closest('.wallet-action');
      if (walletAction) {
        const title = walletAction.querySelector('.wallet-action-title')?.textContent?.trim();
        if (title === 'Deposit') openModal('depositModal');
        else if (title === 'Withdraw') setView('withdraw');
        else if (title === 'Transfer') openModal('transferModal');
        else if (title === 'History') openModal('transactionModal');
        else if (title === 'Cards') openModal('cardModal');
      }

      if (e.target.closest('.invest-now')) {
        setView('invest');
        showInvestTab('plans');
      }

      if (e.target.closest('.my-investments-btn')) {
        setView('invest');
        showInvestTab('myinvestments');
      }

      if (e.target.closest('.investment-history-btn')) {
        setView('invest');
        showInvestTab('history');
      }
    });

    document.querySelectorAll('#investTabs .tab').forEach((tab) => {
      tab.addEventListener('click', () => showInvestTab(tab.dataset.tab));
    });
  }

  function setupCommunity() {
    const input = $('communityInput') || document.querySelector('.community-input-placeholder');
    const sendBtn = document.querySelector('.community-send-btn');

    function sendCommunity() {
      showCommunityInfoModal();
    }

    sendBtn?.addEventListener('click', sendCommunity);

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendCommunity();
      }
    });
  }

  function setupExtraUI() {
    $('homeBalanceEye')?.addEventListener('click', () => {
      state.balanceHidden = !state.balanceHidden;
      updateAll();
    });

    $('hideBalanceToggle')?.addEventListener('click', () => {
      state.balanceHidden = !state.balanceHidden;
      updateAll();
    });

    document.querySelector('.withdraw-eye')?.addEventListener('click', () => {
      state.balanceHidden = !state.balanceHidden;
      updateAll();
    });

    $('currencyBtn')?.addEventListener('click', () => $('currencyDropdown')?.classList.toggle('open'));

    $('currencyDropdown')?.addEventListener('click', (e) => {
      const opt = e.target.closest('.currency-option');
      if (!opt) return;
      state.currentCurrency = opt.dataset.currency || 'NGN';
      $('currencyDropdown')?.classList.remove('open');
      updateAll();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#currencySelector')) $('currencyDropdown')?.classList.remove('open');
    });

    const periodChip = $('overviewPeriodChip');
    if (periodChip) {
      const periods = ['Today', 'Week', 'Month'];
      let index = 0;
      periodChip.addEventListener('click', () => {
        index = (index + 1) % periods.length;
        state.overviewPeriod = periods[index].toLowerCase();
        periodChip.innerHTML = `${periods[index]}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6-6 6"/></svg>`;
        renderOverviewCards();
      });
    }
  }

  function init() {
    loadNotifications();

    const loginScreen = $('loginScreen');
    const mainApp = $('mainApp');

    if (sessionStorage.getItem(LOGIN_KEY) === 'true') {
      if (loginScreen) loginScreen.style.display = 'none';
      if (mainApp) mainApp.style.display = 'block';
    } else {
      if (loginScreen) loginScreen.style.display = 'flex';
      if (mainApp) mainApp.style.display = 'none';
    }

    setupAuth();
    setupDrawer();
    setupNavigation();
    setupNotifications();
    setupCommunity();
    setupWithdraw();
    setupExtraUI();

    window.addNotification = addNotification;
    window.updateDrawerUserInfo = updateDrawerUserInfo;
    window.renderWithdrawForm = renderWithdrawForm;
    window.setView = setView;
    window.showInvestTab = showInvestTab;
    window.logout = logout;

    updateDrawerUserInfo();
    updateAll();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
