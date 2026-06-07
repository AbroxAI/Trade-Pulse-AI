(function() {
  // ======================= AUTHENTICATION =======================
  const VALID_INVITE_CODE = 'REFJ4HEHFXK';
  const USER_KEY = 'tradePulseUsers';
  const LEGACY_USER_KEY = 'tradePulseUser';
  const CURRENT_KEY = 'tradePulseCurrentUser';
  const LOGIN_KEY = 'tradePulseLoggedIn';

  function $(id) { return document.getElementById(id); }
  function openModal(id) { const el = $(id); if (el) el.classList.add('open'); }
  function closeModal(id) { const el = $(id); if (el) el.classList.remove('open'); }

  function safeParse(value, fallback) {
    try { return JSON.parse(value); } catch { return fallback; }
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

  function saveCurrentUser(user) {
    sessionStorage.setItem(LOGIN_KEY, 'true');
    sessionStorage.setItem(CURRENT_KEY, JSON.stringify(user));
    const users = loadUsers();
    const index = users.findIndex((u) => u.username === user.username);
    if (index >= 0) users[index] = user;
    else users.push(user);
    saveUsers(users);
    // Also set global variable for other parts
    window.currentUser = user;
  }

  function generateUserId() {
    return `TPA${Math.floor(10000000 + Math.random() * 90000000)}`;
  }

  function generateReferralCode() {
    return `REF${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
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

    if (isSignUp) {
      signUpToggle?.classList.add('active');
      signInToggle?.classList.remove('active');
      if (loginTitle) loginTitle.textContent = 'Create Account';
      if (loginSubtitle) loginSubtitle.textContent = 'Join the exclusive trading community';
      if (fullNameGroup) fullNameGroup.style.display = 'block';
      if (emailGroup) emailGroup.style.display = 'block';
      if (inviteCodeGroup) inviteCodeGroup.style.display = 'block';
      if (inviteNote) {
        inviteNote.style.display = 'block';
        inviteNote.textContent = 'Invitation code is required to sign up.';
      }
      if (submitBtn) submitBtn.textContent = 'Sign Up';
    } else {
      signInToggle?.classList.add('active');
      signUpToggle?.classList.remove('active');
      if (loginTitle) loginTitle.textContent = 'Sign In';
      if (loginSubtitle) loginSubtitle.textContent = 'Access your private trading dashboard';
      if (fullNameGroup) fullNameGroup.style.display = 'none';
      if (emailGroup) emailGroup.style.display = 'none';
      if (inviteCodeGroup) inviteCodeGroup.style.display = 'block';
      if (inviteNote) {
        inviteNote.style.display = 'block';
        inviteNote.textContent = 'Invitation code is required only for creating an account.';
      }
      if (submitBtn) submitBtn.textContent = 'Sign In';
    }

    if ($('errorMsg')) $('errorMsg').textContent = '';
    if ($('successMsg')) $('successMsg').textContent = '';
  }

  function openForgotPasswordModal() {
    const modal = $('forgotPasswordModal');
    if (modal) modal.classList.add('open');
  }

  function closeForgotPasswordModal() {
    const modal = $('forgotPasswordModal');
    if (modal) modal.classList.remove('open');
  }

  function setupAuth() {
    const authForm = $('authForm');
    const signInToggle = $('signInToggle');
    const signUpToggle = $('signUpToggle');
    const eyeBtn = $('eyeBtn');
    const passwordInput = $('password');
    const forgotPasswordBtn = $('forgotPasswordBtn');

    signInToggle?.addEventListener('click', () => setAuthMode(false));
    signUpToggle?.addEventListener('click', () => setAuthMode(true));

    eyeBtn?.addEventListener('click', () => {
      if (!passwordInput) return;
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      eyeBtn.textContent = isPassword ? '🙈' : '👁️';
    });

    forgotPasswordBtn?.addEventListener('click', openForgotPasswordModal);
    $('closeForgotPasswordBtn')?.addEventListener('click', closeForgotPasswordModal);

    $('forgotPasswordModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'forgotPasswordModal') closeForgotPasswordModal();
    });

    $('confirmResetPasswordBtn')?.addEventListener('click', () => {
      const username = ($('resetUsername')?.value || '').trim();
      const email = ($('resetEmail')?.value || '').trim();
      const invite = ($('resetInviteCode')?.value || '').trim();
      const pw1 = $('resetNewPassword')?.value || '';
      const pw2 = $('resetConfirmPassword')?.value || '';
      const err = $('resetError');
      const ok = $('resetSuccess');

      if (err) err.textContent = '';
      if (ok) ok.textContent = '';

      if (!username || !email || !invite || !pw1 || !pw2) {
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
      const index = users.findIndex((u) => u.username === username && u.email === email);
      if (index < 0) {
        if (err) err.textContent = 'User not found with that username and email.';
        return;
      }

      users[index].password = pw1;
      saveUsers(users);

      if (ok) ok.textContent = 'Password updated successfully.';
      setTimeout(closeForgotPasswordModal, 900);
    });

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

      if (!username || !password) {
        if (errorMsg) errorMsg.textContent = 'Please fill in all required fields.';
        return;
      }

      // For sign in, invitation code is optional (not checked)
      if (isSignUp && !inviteCode) {
        if (errorMsg) errorMsg.textContent = 'Invitation code is required to sign up.';
        return;
      }

      if (isSignUp && inviteCode !== VALID_INVITE_CODE) {
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
          userId: generateUserId(),
          referralCode: generateReferralCode(),
          membership: 'Beginner',
          referrals: 0,
          commission: 0,
          avatar: '',
          twoFaEnabled: false,
          savedCard: null,
          homeBalance: 0,
          totalInvested: 0,
          totalProfit: 0,
          totalWithdrawn: 0,
          activePlans: 0,
        };

        users.push(user);
        saveUsers(users);
        saveCurrentUser(user);

        if (successMsg) successMsg.textContent = 'Account created successfully.';

        const loginScreen = $('loginScreen');
        const mainApp = $('mainApp');
        if (loginScreen) loginScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
        if (typeof window.updateDrawerUserInfo === 'function') window.updateDrawerUserInfo();
        return;
      }

      // Sign in
      const user = users.find((u) => (u.username === username || u.email === username) && u.password === password);
      if (!user) {
        if (errorMsg) errorMsg.textContent = 'Invalid username or password.';
        return;
      }

      saveCurrentUser(user);
      if (successMsg) successMsg.textContent = 'Signing in...';

      const loginScreen = $('loginScreen');
      const mainApp = $('mainApp');
      if (loginScreen) loginScreen.style.display = 'none';
      if (mainApp) mainApp.style.display = 'block';
      if (typeof window.updateDrawerUserInfo === 'function') window.updateDrawerUserInfo();
    });
  }

  // ======================= DASHBOARD CORE =======================
  // All balances stay zero forever
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
    txFee: 50,
    activePlans: 0,
    planMin1: 1000, planMax1: 49999,
    planMin2: 50000, planMax2: 199999,
    planMin3: 200000, planMax3: 499999,
    planMin4: 500000
  };

  let chartData = [];
  let allTransactions = [];
  let withdrawalsOnly = [];
  let currentUser = null;

  // Helper functions
  function getCurrentUser() {
    return window.currentUser || getStoredCurrentUser();
  }

  function updateDrawerUserInfo() {
    const user = getCurrentUser();
    if (!user) return;
    const fullName = user.fullName || user.username || 'User';
    const firstLetter = String(fullName).trim().charAt(0).toUpperCase() || 'U';
    const drawerFullName = $('drawerFullName');
    const drawerMembership = $('drawerMembership');
    const drawerUserId = $('drawerUserId');
    const referralCodeDisplay = $('referralCodeDisplay');
    if (drawerFullName) drawerFullName.textContent = fullName;
    if (drawerMembership) drawerMembership.textContent = user.membership || 'Beginner';
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
    // Copy UID button
    const copyBtn = $('copyUidBtn');
    if (copyBtn && user.userId) {
      if (!copyBtn.classList.contains('copy-uid-btn')) copyBtn.classList.add('copy-uid-btn');
      const newBtn = copyBtn.cloneNode(true);
      copyBtn.parentNode.replaceChild(newBtn, copyBtn);
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(user.userId).then(() => {
          addNotification('Copied!', `User ID ${user.userId} copied to clipboard`, 'success');
        }).catch(() => alert('Failed to copy'));
      });
    }
  }

  // Notifications
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

  // Show/hide processing
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

  // Payment not detected modal
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

  // Deposit-first modal
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
      openModal('depositModal');
    });
    modalDiv.addEventListener('click', (e) => { if (e.target === modalDiv) modalDiv.remove(); });
  }

  // Insufficient balance modal (for withdraw)
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
      openModal('depositModal');
    });
    modalDiv.addEventListener('click', (e) => { if (e.target === modalDiv) modalDiv.remove(); });
  }

  // Community plan prompt
  function setCommunityPlanPrompt() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay open';
    modal.innerHTML = `
      <div class="modal-panel" style="text-align:center;">
        <div class="modal-header">
          <div class="modal-title">Community Chat</div>
          <button class="modal-close-btn" id="closeCommunityPlanPrompt">✕</button>
        </div>
        <div class="notice-box">
          <div class="notice-text">Please select an investment plan first to participate in the community chat.</div>
        </div>
        <div style="display:flex; gap:12px; margin-top:20px;">
          <button id="communityPlanPromptGo" class="withdraw-btn" style="flex:1;">Go to Invest</button>
          <button id="communityPlanPromptCancel" class="btn btn-outline" style="flex:1;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('closeCommunityPlanPrompt').addEventListener('click', () => modal.remove());
    document.getElementById('communityPlanPromptCancel').addEventListener('click', () => modal.remove());
    document.getElementById('communityPlanPromptGo').addEventListener('click', () => {
      modal.remove();
      setView('invest');
    });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }

  // Currency formatting (not used for balances, but for display)
  const rates = { NGN:1, USD:0.00067, EUR:0.00061, GBP:0.00052 };
  const symbols = { NGN:'₦', USD:'$', EUR:'€', GBP:'£' };
  let currentCurrency = 'NGN';
  function convert(amount) { return (amount * rates[currentCurrency]).toFixed(2); }
  function fmt(amount, isUSDT = false) {
    if (isUSDT) return amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDT';
    const symbol = symbols[currentCurrency];
    const converted = amount * rates[currentCurrency];
    return `${symbol} ${converted.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Dummy updateAll (no balances change)
  function updateAll() {
    // Just update UI with zero values
    const el = (id) => $(id);
    if (el('homeBalance')) el('homeBalance').textContent = fmt(0);
    if (el('homeFx')) el('homeFx').textContent = '≈ $ 0.00';
    if (el('totalInvested')) el('totalInvested').textContent = fmt(0);
    if (el('totalProfit')) el('totalProfit').textContent = fmt(0);
    if (el('totalWithdrawn')) el('totalWithdrawn').textContent = fmt(0);
    if (el('activePlansCount')) el('activePlansCount').textContent = '0';
    if (el('walletTotalBalance')) el('walletTotalBalance').textContent = fmt(0);
    if (el('walletTotalFx')) el('walletTotalFx').textContent = '≈ $ 0.00';
    if (el('availableBalance')) el('availableBalance').textContent = fmt(0);
    if (el('lockedBalance')) el('lockedBalance').textContent = fmt(0);
    if (el('nairaWallet')) el('nairaWallet').textContent = fmt(0);
    if (el('withdrawBalance')) el('withdrawBalance').textContent = fmt(0);
    if (el('withdrawFx')) el('withdrawFx').textContent = '≈ $ 0.00';
    if (el('withdrawableAmount')) el('withdrawableAmount').textContent = fmt(0);
    if (el('planMin1')) el('planMin1').textContent = fmt(1000);
    if (el('planMax1')) el('planMax1').textContent = fmt(49999);
    if (el('planMin2')) el('planMin2').textContent = fmt(50000);
    if (el('planMax2')) el('planMax2').textContent = fmt(199999);
    if (el('planMin3')) el('planMin3').textContent = fmt(200000);
    if (el('planMax3')) el('planMax3').textContent = fmt(499999);
    if (el('planMin4')) el('planMin4').textContent = fmt(500000);
    if (el('profitPercent')) el('profitPercent').textContent = '0%';
    // Disable withdraw button
    const withdrawBtn = $('withdrawNavBtn');
    if (withdrawBtn) { withdrawBtn.classList.add('btn-disabled'); withdrawBtn.disabled = true; }
    renderRecentTx();
    renderRecentWithdrawals();
    renderWalletTx();
    renderOverviewCards();
    buildChart();
  }

  // Chart (dummy data, no real changes)
  function buildChart() {
    const container = $('chartContainer');
    if (!container) return;
    if (chartData.length === 0) {
      container.innerHTML = '<div style="height:250px; display:flex; align-items:center; justify-content:center; color:#6b7280;">No data yet. Start investing!</div>';
      return;
    }
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

  // Dummy transaction lists (always empty)
  function renderRecentTx() {
    const c = $('recentTransactions');
    if (!c) return;
    c.innerHTML = '<div class="tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No transactions yet</div><div class="tx-sub">Deposit funds to get started</div></div></div>';
  }
  function renderRecentWithdrawals() {
    const c = $('recentWithdrawals');
    if (!c) return;
    c.innerHTML = '<div class="tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No withdrawals yet</div><div class="tx-sub">Your withdrawals will appear here</div></div></div>';
  }
  function renderWalletTx() {
    const c = $('walletRecentTx');
    if (!c) return;
    c.innerHTML = '<div class="wallet-tx-row"><div class="tx-main"><div class="tx-title" style="color:#9ca3af;">No transactions</div></div></div>';
  }
  function renderOverviewCards() {
    const c = $('overviewCards');
    if (!c) return;
    c.innerHTML = `
      <div class="stat" data-title="Total Profit" data-value="₦0.00" data-sub="+0%">
        <div class="ico" style="background:rgba(34,197,94,.12)"><svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/></svg></div>
        <div class="title">Total Profit</div><div class="value">₦ 0.00</div><div class="sub" style="color:#34d399">+0%</div>
      </div>
      <div class="stat" data-title="Active Investments" data-value="₦0.00" data-sub="0 Plans">
        <div class="ico" style="background:rgba(59,130,246,.12)"><svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"/><path d="M8 13c1.7 0 3-1.3 3-3S9.7 7 8 7 5 8.3 5 10s1.3 3 3 3Z"/></svg></div>
        <div class="title">Active Investments</div><div class="value">₦ 0.00</div><div class="sub" style="color:#94a3b8">0 Plans</div>
      </div>
      <div class="stat" data-title="Referral Earnings" data-value="₦0.00" data-sub="0 Referrals">
        <div class="ico" style="background:rgba(245,158,11,.12)"><svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"/><path d="M8 13c1.7 0 3-1.3 3-3S9.7 7 8 7 5 8.3 5 10s1.3 3 3 3Z"/></svg></div>
        <div class="title">Referral Earnings</div><div class="value">₦ 0.00</div><div class="sub" style="color:#94a3b8">0 Referrals</div>
      </div>
      <div class="stat" data-title="Withdrawn" data-value="₦0.00" data-sub="This Month">
        <div class="ico" style="background:rgba(168,85,247,.12)"><svg viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><path d="M3 7h18v10H3z"/><path d="M16 12h4"/><circle cx="16.5" cy="12" r="1.2" fill="#c084fc" stroke="none"/></svg></div>
        <div class="title">Withdrawn</div><div class="value">₦ 0.00</div><div class="sub" style="color:#94a3b8">This Month</div>
      </div>
    `;
    document.querySelectorAll('#overviewCards .stat').forEach(card => {
      card.addEventListener('click', () => {
        $('overviewDetailTitle').textContent = card.querySelector('.title').textContent;
        $('overviewDetailValue').textContent = card.querySelector('.value').textContent;
        $('overviewDetailDesc').textContent = card.querySelector('.sub').textContent;
        openModal('overviewDetailModal');
      });
    });
  }

  // Currency switcher
  $('currencyBtn')?.addEventListener('click', () => $('currencyDropdown')?.classList.toggle('open'));
  $('currencyDropdown')?.addEventListener('click', e => {
    const opt = e.target.closest('.currency-option');
    if (!opt) return;
    currentCurrency = opt.dataset.currency;
    $('currencyDropdown').classList.remove('open');
    updateAll();
  });
  document.addEventListener('click', e => { if (!e.target.closest('#currencySelector')) $('currencyDropdown')?.classList.remove('open'); });

  // Balance hide toggle (just UI)
  let balanceHidden = false;
  $('homeBalanceEye')?.addEventListener('click', () => { balanceHidden = !balanceHidden; updateAll(); });
  $('hideBalanceToggle')?.addEventListener('click', () => { balanceHidden = !balanceHidden; updateAll(); });
  document.querySelector('.withdraw-eye')?.addEventListener('click', () => { balanceHidden = !balanceHidden; updateAll(); });
  $('notificationBell')?.addEventListener('click', () => { markNotificationsRead(); openModal('notificationsModal'); });
  $('closeNotificationsModalBtn')?.addEventListener('click', () => closeModal('notificationsModal'));

  // Overview period chip (dummy)
  const periodChip = $('overviewPeriodChip');
  const periods = ['Today','Week','Month'];
  let periodIndex = 0;
  periodChip?.addEventListener('click', () => {
    periodIndex = (periodIndex + 1) % periods.length;
    periodChip.innerHTML = `${periods[periodIndex]}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6-6 6"/></svg>`;
    renderOverviewCards();
  });

  // ======================= DEPOSIT & INVESTMENT =======================
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
    showProcessing('Processing deposit...');
    setTimeout(() => {
      hideProcessing();
      $('paymentAmount').textContent = fmt(amount);
      $('paymentModalTitle').textContent = 'Deposit Payment';
      openModal('paymentModal');
    }, 2000);
  });

  // Investment
  function openInvestModal(planName, min, dailyRate) {
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
    showProcessing('Processing investment...');
    setTimeout(() => {
      hideProcessing();
      $('paymentAmount').textContent = fmt(amount);
      $('paymentModalTitle').textContent = 'Investment Payment';
      openModal('paymentModal');
    }, 2000);
  });
  document.querySelectorAll('.invest-now-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.plan-card');
      const plan = card.dataset.plan;
      const min = plan === 'beginner' ? 1000 : plan === 'standard' ? 50000 : plan === 'premium' ? 200000 : 500000;
      const rate = plan === 'beginner' ? 3.0 : plan === 'standard' ? 3.5 : plan === 'premium' ? 4.5 : 6.0;
      openInvestModal(card.querySelector('.plan-title').textContent, min, rate);
    });
  });

  // Shared payment modal handler (I've Made Payment)
  $('confirmPaymentBtn')?.addEventListener('click', () => {
    closeModal('paymentModal');
    showProcessing('Verifying payment...');
    setTimeout(() => {
      hideProcessing();
      showPaymentNotDetected();
    }, 2000);
  });

  // ======================= WITHDRAW =======================
  // Withdraw button anywhere: show insufficient balance modal
  function handleWithdrawClick(e) {
    e.preventDefault();
    showInsufficientBalanceModal();
  }
  document.querySelectorAll('[data-nav="withdraw"], #withdrawNavBtn, .btn-outline[data-nav="withdraw"]').forEach(btn => {
    btn.addEventListener('click', handleWithdrawClick, true);
  });
  // Withdraw form inside withdraw view – also block
  function bindWithdrawFormEvents() {
    const requestBtn = $('requestWithdrawalBtn');
    if (requestBtn) {
      requestBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showInsufficientBalanceModal();
      });
    }
  }
  // Override the withdraw form rendering to attach our handler
  const originalRender = window.renderWithdrawForm;
  if (typeof originalRender === 'function') {
    // preserve original but replace button handler
  } else {
    // simple: after DOM ready, if withdraw form exists, bind
    setTimeout(() => {
      const reqBtn = $('requestWithdrawalBtn');
      if (reqBtn) reqBtn.addEventListener('click', (e) => { e.preventDefault(); showInsufficientBalanceModal(); });
    }, 500);
  }

  // ======================= TRANSFER =======================
  $('confirmTransferBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    // Always show deposit-first modal because balance is 0
    showDepositFirstModal();
  });

  // ======================= HISTORY / CARD MANAGEMENT =======================
  function showModalWithGuard(title, arr) {
    showDepositFirstModal();
  }
  $('viewAllTransactionsBtn')?.addEventListener('click', () => showDepositFirstModal());
  $('viewAllWithdrawalsBtn')?.addEventListener('click', () => showDepositFirstModal());
  $('viewAllWalletTx')?.addEventListener('click', () => showDepositFirstModal());
  $('drawerTxHistoryBtn')?.addEventListener('click', () => showDepositFirstModal());
  $('saveCardBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    showDepositFirstModal();
  });
  // Card management button in wallet actions
  document.querySelectorAll('.wallet-action').forEach(action => {
    if (action.querySelector('.wallet-action-title')?.textContent.trim() === 'Cards') {
      action.addEventListener('click', (e) => {
        e.preventDefault();
        showDepositFirstModal();
      });
    }
  });
  // Also the "Manage" chip in wallet accounts
  $('closeCardModalBtn')?.addEventListener('click', () => closeModal('cardModal'));

  // ======================= COMMUNITY =======================
  const communitySendBtn = document.querySelector('.community-send-btn');
  const communityInput = document.querySelector('.community-input-placeholder');
  if (communitySendBtn) communitySendBtn.addEventListener('click', setCommunityPlanPrompt);
  if (communityInput) communityInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); setCommunityPlanPrompt(); } });

  // ======================= VIP UPGRADE =======================
  $('upgradeVipBtn')?.addEventListener('click', () => {
    setView('invest');
    setTimeout(() => {
      const vipCard = $('vipPlanCard');
      if (vipCard) vipCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  });
  $('promoUpgradeBtn')?.addEventListener('click', () => {
    const vipCard = $('vipPlanCard');
    if (vipCard) vipCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // ======================= VIEW SWITCHING =======================
  function setView(v) {
    ['homeView','investView','withdrawView','walletView','communityView'].forEach(id => $(id).classList.remove('active'));
    $(v+'View').classList.add('active');
    $('pageTitle').textContent = { home:'Home', invest:'Invest', withdraw:'Withdrawal', wallet:'Wallet', community:'Community' }[v] || 'Home';
    document.querySelectorAll('.nav-item[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === v));
    updateAll();
  }
  document.querySelectorAll('.nav-item[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  document.addEventListener('click', e => { let t = e.target.closest('[data-nav]'); if (t && t.dataset.nav) setView(t.dataset.nav); });

  // ======================= DRAWER =======================
  $('menuBtn')?.addEventListener('click', () => { $('drawerOverlay')?.classList.add('open'); $('drawerPanel')?.classList.add('open'); });
  $('drawerCloseBtn')?.addEventListener('click', () => { $('drawerOverlay')?.classList.remove('open'); $('drawerPanel')?.classList.remove('open'); });
  $('drawerOverlay')?.addEventListener('click', () => { $('drawerOverlay')?.classList.remove('open'); $('drawerPanel')?.classList.remove('open'); });

  // ======================= OTHER MODAL CLOSE BUTTONS =======================
  const modalCloseButtons = [
    'closeHelpModalBtn', 'closeSettingsModalBtn', 'closeSecurityModalBtn', 'closeReferModalBtn',
    'closeCompareModalBtn', 'closeOverviewDetailBtn', 'closeDepositModalBtn', 'closePaymentModalBtn',
    'closeTransferModalBtn', 'closeCardModalBtn', 'closeWithdrawConfirmBtn', 'closeTransferSuccessBtn',
    'closeSuccessModalBtn', 'successModalOkBtn'
  ];
  modalCloseButtons.forEach(id => {
    const btn = $(id);
    if (btn) btn.addEventListener('click', () => closeModal(id.replace('close', '').replace('Btn', 'Modal') || ''));
  });
  // Transaction modal close
  $('modalCloseBtn')?.addEventListener('click', () => closeModal('transactionModal'));
  // Forgot password close (already handled)
  // Withdrawal receipt close
  $('closeWithdrawalReceiptBtn')?.addEventListener('click', () => closeModal('withdrawalReceiptModal'));
  $('closeReceiptBtn')?.addEventListener('click', () => closeModal('withdrawalReceiptModal'));

  // ======================= LOGOUT =======================
  const logoutBtn = $('drawerLogoutBtn');
  if (logoutBtn) {
    const newLogoutBtn = logoutBtn.cloneNode(true);
    logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
    newLogoutBtn.addEventListener('click', () => openModal('logoutConfirmModal'));
  }
  $('confirmLogoutBtn')?.addEventListener('click', () => { sessionStorage.clear(); localStorage.clear(); location.reload(); });
  $('cancelLogoutBtn')?.addEventListener('click', () => closeModal('logoutConfirmModal'));

  // ======================= INITIAL LOAD =======================
  function init() {
    setupAuth();  // this will also show main app if already logged in
    // If already logged in, drawer info is updated
    if (sessionStorage.getItem(LOGIN_KEY) === 'true') {
      updateDrawerUserInfo();
      updateAll();
      setView('home');
    } else {
      // Show login screen
      const loginScreen = $('loginScreen');
      const mainApp = $('mainApp');
      if (loginScreen) loginScreen.style.display = 'flex';
      if (mainApp) mainApp.style.display = 'none';
      setAuthMode(false);
    }
    // Additional listeners for withdraw form after it's rendered
    setTimeout(() => {
      const reqBtn = $('requestWithdrawalBtn');
      if (reqBtn) reqBtn.addEventListener('click', (e) => { e.preventDefault(); showInsufficientBalanceModal(); });
    }, 1000);
  }

  // Expose some functions globally if needed
  window.updateDrawerUserInfo = updateDrawerUserInfo;
  window.addNotification = addNotification;
  window.fmt = fmt;
  window.showSuccess = showSuccess;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.setView = setView;

  init();
})();
