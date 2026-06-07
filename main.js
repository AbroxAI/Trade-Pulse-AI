/* main.js – fixed & consolidated (no duplicate handlers) */
(function () {
  const VALID_INVITE_CODE = 'INVITE2024';
  const USER_KEY = 'tradePulseUsers';
  const LEGACY_USER_KEY = 'tradePulseUser';
  const CURRENT_KEY = 'tradePulseCurrentUser';
  const LOGIN_KEY = 'tradePulseLoggedIn';
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

  function saveCurrentUser(user) {
    state.currentUser = user;
    sessionStorage.setItem(LOGIN_KEY, 'true');
    sessionStorage.setItem(CURRENT_KEY, JSON.stringify(user));
    const users = loadUsers();
    const i = users.findIndex((u) => u.username === user.username);
    if (i >= 0) users[i] = user;
    else users.push(user);
    saveUsers(users);
    updateDrawerUserInfo();
    updateAll();
  }

  function getStoredCurrentUser() {
    return safeParse(sessionStorage.getItem(CURRENT_KEY), null);
  }

  function getActiveUser() {
    return state.currentUser || getStoredCurrentUser() || safeParse(localStorage.getItem(LEGACY_USER_KEY), null);
  }

  function generateUniqueUserId() {
    return `TPA${Math.floor(10000000 + Math.random() * 90000000)}`;
  }

  function generateReferralCode() {
    return `REF${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  }

  function fmt(amount, isUSDT = false) {
    if (isUSDT) return `${Number(amount).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
    const converted = Number(amount) * rates[state.currentCurrency];
    return `${symbols[state.currentCurrency]} ${converted.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function openModal(id) {
    const el = $(id);
    if (el) el.classList.add('open');
  }

  function closeModal(id) {
    const el = $(id);
    if (el) el.classList.remove('open');
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
    localStorage.setItem('tradePulseNotifications', JSON.stringify(state.notifications));
    renderNotificationsModal();
    updateNotificationBadge();
  }

  function loadNotifications() {
    const saved = safeParse(localStorage.getItem('tradePulseNotifications'), []);
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

  function markNotificationsRead() {
    state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
    localStorage.setItem('tradePulseNotifications', JSON.stringify(state.notifications));
    updateNotificationBadge();
    renderNotificationsModal();
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

    const drawerFullName = $('drawerFullName');
    const drawerMembership = $('drawerMembership');
    const drawerUserId = $('drawerUserId');
    const referralCodeDisplay = $('referralCodeDisplay');

    if (drawerFullName) drawerFullName.textContent = user.fullName || user.username || 'User';
    if (drawerMembership) drawerMembership.textContent = user.membership || 'Standard Member';
    if (drawerUserId) drawerUserId.textContent = user.userId || '------';
    if (referralCodeDisplay) referralCodeDisplay.textContent = user.referralCode || '--------';

    const avatar = $('drawerAvatar');
    if (avatar) {
      let img = avatar.querySelector('img');
      let initial = avatar.querySelector('.avatar-initial');
      const firstLetter = String(user.fullName || user.username || 'U').trim().charAt(0).toUpperCase();

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

    updateAll();
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
    const tabs = document.querySelectorAll('#investTabs .tab');
    tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === tabName));

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
    const top = $('investView');
    if (top) top.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showCommunityInfoModal() {
    const existing = $('communityInfoModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'communityInfoModal';
    modal.className = 'modal-overlay open';
    modal.innerHTML = `
      <div class="modal-panel" style="text-align:center; padding:30px 20px;">
        <div class="modal-title" style="margin-bottom:20px;">Community Chat</div>
        <div class="notice-text" style="margin-bottom:24px;">
          Community chat is currently in view-only mode. You can type in the bar,
          and sending will open this community modal.
        </div>
        <button type="button" id="communityInfoClose" class="withdraw-btn" style="margin-top:8px;">Got it</button>
      </div>
    `;
    document.body.appendChild(modal);
    $('communityInfoClose')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }

  function renderWithdrawForm(method = 'bank') {
    const container = $('withdrawDetailsForm');
    if (!container) return;

    const presets = [5000, 10000, 20000, 50000, 'max'];

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
          ${presets.map((p) => `
            <button type="button" class="preset ${p === 'max' ? 'preset-max' : ''}" data-amount="${p}">
              ${p === 'max' ? 'MAX' : `₦${Number(p).toLocaleString()}`}
            </button>
          `).join('')}
        </div>

        <div class="fee-row"><span>Fee</span><span id="withdrawFee">${fmt(0)}</span></div>
        <div class="receive-row"><span>You Receive</span><span id="receiveAmount">${fmt(0)}</span></div>
        <button type="button" id="confirmWithdrawBtn" class="withdraw-btn" style="margin-top:14px;">Withdraw</button>
      `;
    } else {
      container.innerHTML = `
        <div class="notice-box">
          <div class="notice-title">Choose another method</div>
          <div class="notice-text">Render your alternate method form here.</div>
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
        if (btn.dataset.amount === 'max') {
          withdrawInput.value = String(state.base.homeBalance || 0);
        } else {
          withdrawInput.value = btn.dataset.amount;
        }
        syncAmounts();
      });
    });

    $('confirmWithdrawBtn')?.addEventListener('click', () => {
      const user = getActiveUser();
      const bankName = ($('withdrawBankName')?.value || '').trim();
      const account = ($('withdrawAccountInput')?.value || '').trim();
      const amount = parseFloat(withdrawInput?.value || '0');

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
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

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

        const loginScreen = $('loginScreen');
        const mainApp = $('mainApp');
        setTimeout(() => {
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

      const loginScreen = $('loginScreen');
      const mainApp = $('mainApp');
      setTimeout(() => {
        if (loginScreen) loginScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
        updateDrawerUserInfo();
      }, 350);
    });
  }

  function setupNavigation() {
    document.querySelectorAll('.nav-item[data-view]').forEach((btn) => {
      btn.addEventListener('click', () => setView(btn.dataset.view));
    });

    document.addEventListener('click', (e) => {
      const nav = e.target.closest('[data-nav]');
      if (nav?.dataset?.nav) {
        setView(nav.dataset.nav);
      }

      const vip = e.target.closest('#upgradeVipBtn, .drawer-vip-card');
      if (vip) {
        openVip();
      }

      const walletAction = e.target.closest('.wallet-action');
      if (walletAction) {
        const title = walletAction.querySelector('.wallet-action-title')?.textContent?.trim();
        if (title === 'Deposit') {
          openModal('depositModal');
        } else if (title === 'Withdraw') {
          setView('withdraw');
        } else if (title === 'Transfer') {
          openModal('transferModal');
        } else if (title === 'History') {
          openModal('transactionModal');
        } else if (title === 'Cards') {
          openModal('cardModal');
        }
      }

      const investNow = e.target.closest('.invest-now');
      if (investNow) {
        setView('invest');
        showInvestTab('plans');
      }
    });

    const investTabs = document.querySelectorAll('#investTabs .tab');
    investTabs.forEach((tab) => {
      tab.addEventListener('click', () => showInvestTab(tab.dataset.tab));
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
  }

  function setupNotifications() {
    $('notificationBell')?.addEventListener('click', () => {
      markNotificationsRead();
      openModal('notificationsModal');
    });
  }

  function setupCommunity() {
    const input = $('communityInput') || document.querySelector('.community-input-placeholder');
    const send = document.querySelector('.community-send-btn');

    function triggerCommunityModal() {
      showCommunityInfoModal();
    }

    send?.addEventListener('click', triggerCommunityModal);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerCommunityModal();
      }
    });
  }

  function updateAll() {
    const user = getActiveUser();
    if (user && !state.currentUser) state.currentUser = user;

    if (state.balanceHidden) {
      ['homeBalance', 'homeFx', 'walletTotalBalance', 'walletTotalFx', 'availableBalance', 'lockedBalance', 'nairaWallet', 'withdrawBalance', 'withdrawFx', 'withdrawableAmount', 'totalInvested', 'totalProfit', 'totalWithdrawn'].forEach((id) => {
        const el = $(id);
        if (el) el.textContent = '****';
      });
      document.querySelectorAll('.value').forEach((el) => { el.textContent = '****'; });
      const profitPercent = $('profitPercent');
      if (profitPercent) profitPercent.textContent = '0%';
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

    renderNotificationsModal();
    updateNotificationBadge();
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

    window.updateDrawerUserInfo = updateDrawerUserInfo;
    window.addNotification = addNotification;
    window.setView = setView;
    window.renderWithdrawForm = renderWithdrawForm;

    updateDrawerUserInfo();
    updateAll();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
