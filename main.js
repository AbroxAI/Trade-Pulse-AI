(function() {
  const $ = (id) => document.getElementById(id);
  const rates = { USDT:1, USD:0.00067, EUR:0.00061, GBP:0.00052, NGN:1 };
  const symbols = { USDT:'₮', USD:'$', EUR:'€', GBP:'£', NGN:'₦' };
  let currentCurrency = 'USDT';
  const FEE = 50;
  let balanceHidden = false;
  let overviewPeriod = 'today';
  let currentUser = null;

  function openModal(id) { const el = $(id); if (el) el.classList.add('open'); }
  function closeModal(id) { const el = $(id); if (el) el.classList.remove('open'); }

  function getStoredUser() { try { return JSON.parse(sessionStorage.getItem('tradePulseCurrentUser') || 'null'); } catch { return null; } }

  function saveUser(user) {
    sessionStorage.setItem('tradePulseLoggedIn', 'true');
    sessionStorage.setItem('tradePulseCurrentUser', JSON.stringify(user));
    currentUser = user;
    try {
      const users = JSON.parse(localStorage.getItem('tradePulseUsers') || '[]');
      const idx = users.findIndex(u => u.username === user.username);
      if (idx !== -1) users[idx] = user; else users.push(user);
      localStorage.setItem('tradePulseUsers', JSON.stringify(users));
      localStorage.setItem('tradePulseUser', JSON.stringify(user));
    } catch(e) {}
    updateDrawerUserInfo();
    updateAll();
  }

  function showProcessing(text) { const overlay = $('processingOverlay'); const label = $('processingText'); if (label) label.textContent = text || 'Processing...'; if (overlay) overlay.classList.add('open'); }
  function hideProcessing() { const overlay = $('processingOverlay'); if (overlay) overlay.classList.remove('open'); }

  function showSuccess(title, message) {
    const modalTitle = $('successModalTitle'), modalText = $('successModalText');
    if (modalTitle) modalTitle.textContent = title || 'Success';
    if (modalText) modalText.textContent = message || 'Done.';
    openModal('successModal');
  }

  function showPaymentNotDetected() { /* unchanged */ }

  function showDepositFirstModal() { /* unchanged */ }

  function showInsufficientBalanceModal() { /* unchanged */ }

  function convert(amount) { return (amount * rates[currentCurrency]).toFixed(2); }
  function fmt(amount, isUSDT = false) {
    if (isUSDT) return amount.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USDT';
    const symbol = symbols[currentCurrency];
    const converted = amount * rates[currentCurrency];
    return `${symbol} ${converted.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  let base = {
    homeBalance: 0, totalInvested: 0, totalProfit: 0, totalWithdrawn: 0,
    walletTotal: 0, walletAvailable: 0, walletLocked: 0, nairaWallet: 0, withdrawable: 0, txFee: FEE,
    activePlans: 0,
    planMin1: 10000, planMax1: 49999,
    planMin2: 50000, planMax2: 199999,
    planMin3: 200000, planMax3: 499999,
    planMin4: 500000
  };

  const planRates = {
    beginner: { range: '0.8% – 1.0%', avg: 0.9 },
    standard: { range: '1.0% – 1.2%', avg: 1.1 },
    premium:  { range: '1.2% – 1.5%', avg: 1.35 },
    vip:      { range: '1.5% – 2.0%', avg: 1.75 }
  };
  let currentPlanAvg = 0;
  let chartData = [], allTransactions = [], withdrawalsOnly = [];
  let notifications = [];

  function updateNotificationBadge() { /* unchanged, only topbar badge */ }
  function renderNotificationsModal() { /* unchanged */ }
  function addNotification(title, message, type = 'success') { /* unchanged */ }
  function markNotificationsRead() { /* unchanged */ }

  function updateDrawerUserInfo() { /* unchanged – shows username */ }
  window.updateDrawerUserInfo = updateDrawerUserInfo;

  function updateCardDisplay() { /* unchanged */ }
  function addTransaction(type, amount, subtitle, meta, currency = null, iconType = null) { /* unchanged */ }
  function getIconSVG(type) { /* unchanged */ }

  function updateEyeIcons() { /* unchanged */ }

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

    renderRecentTx(); renderRecentWithdrawals(); renderWalletTx(); renderOverviewCards(); buildChart();

    const withdrawBtn = $('withdrawNavBtn');
    if (withdrawBtn) {
      if (base.homeBalance <= 0) { withdrawBtn.classList.add('btn-disabled'); withdrawBtn.disabled = true; }
      else { withdrawBtn.classList.remove('btn-disabled'); withdrawBtn.disabled = false; }
    }
  }

  function buildChart() { /* unchanged */ }
  function renderRecentTx() { /* unchanged */ }
  function renderRecentWithdrawals() { /* unchanged */ }
  function renderWalletTx() { /* unchanged */ }
  function renderOverviewCards() { /* unchanged */ }

  // ----- Currency Switcher -----
  $('currencyBtn').addEventListener('click', () => $('currencyDropdown').classList.toggle('open'));
  $('currencyDropdown').addEventListener('click', e => {
    const opt = e.target.closest('.currency-option'); if (!opt) return;
    currentCurrency = opt.dataset.currency;
    $('currencyDropdown').classList.remove('open');
    updateAll();
    updateWithdrawMethods();  // ★ rebuild the withdraw method grid
    renderWithdrawForm(activeWithdrawMethod); // re-render the form for current method
  });
  document.addEventListener('click', e => { if (!e.target.closest('#currencySelector')) $('currencyDropdown').classList.remove('open'); });

  // ----- Balance Hide Toggles -----
  $('homeBalanceEye')?.addEventListener('click', () => { balanceHidden = !balanceHidden; updateAll(); });
  $('hideBalanceToggle')?.addEventListener('click', () => { balanceHidden = !balanceHidden; updateAll(); });
  document.querySelector('.withdraw-eye')?.addEventListener('click', () => { balanceHidden = !balanceHidden; updateAll(); });
  $('notificationBell')?.addEventListener('click', () => { markNotificationsRead(); openModal('notificationsModal'); });
  $('closeNotificationsModalBtn')?.addEventListener('click', () => closeModal('notificationsModal'));

  // ----- Overview Period Chip -----
  const periodChip = $('overviewPeriodChip'); const periods = ['Today','Week','Month']; let periodIndex = 0;
  periodChip.addEventListener('click', () => { periodIndex = (periodIndex + 1) % periods.length; overviewPeriod = periods[periodIndex].toLowerCase(); periodChip.innerHTML = `${periods[periodIndex]}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6-6 6"/></svg>`; renderOverviewCards(); });

  // ----- Withdraw Methods & Method Switching -----
  let activeWithdrawMethod = 'bank';
  let withdrawRenderTimer = null;
  const withdrawFormContainer = $('withdrawDetailsForm');

  function updateWithdrawMethods() {
    const grid = $('withdrawMethodGrid'); if (!grid) return;
    if (currentCurrency === 'USDT') {
      grid.innerHTML = `
        <button class="method-card active" data-method="usdt_trc20">
          <div class="method-icon method-green"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="17" text-anchor="middle" fill="white" font-size="10" font-weight="bold">₮</text></svg></div>
          <div class="method-name">USDT (TRC20)</div>
          <div class="method-time">5-30 Minutes</div>
          <span class="method-check">✓</span>
        </button>
        <button class="method-card" data-method="usdt_bep20">
          <div class="method-icon method-amber"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="17" text-anchor="middle" fill="white" font-size="10" font-weight="bold">₮</text></svg></div>
          <div class="method-name">USDT (BEP20)</div>
          <div class="method-time">5-30 Minutes</div>
        </button>
      `;
      activeWithdrawMethod = 'usdt_trc20';
    } else {
      // NGN or other fiat
      grid.innerHTML = `
        <button class="method-card active" data-method="bank">
          <div class="method-icon method-purple"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg></div>
          <div class="method-name">Bank Transfer</div>
          <div class="method-time">1-24 Hours</div>
          <span class="method-check">✓</span>
        </button>
        <button class="method-card" data-method="usdt_trc20">
          <div class="method-icon method-green"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="17" text-anchor="middle" fill="white" font-size="10" font-weight="bold">₮</text></svg></div>
          <div class="method-name">USDT (TRC20)</div>
          <div class="method-time">5-30 Minutes</div>
        </button>
        <button class="method-card" data-method="usdt_bep20">
          <div class="method-icon method-amber"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="17" text-anchor="middle" fill="white" font-size="10" font-weight="bold">₮</text></svg></div>
          <div class="method-name">USDT (BEP20)</div>
          <div class="method-time">5-30 Minutes</div>
        </button>
        <button class="method-card" data-method="ewallet">
          <div class="method-icon method-blue"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M22 8h-6a2 2 0 0 0 0 4h6"/></svg></div>
          <div class="method-name">E-Wallet</div>
          <div class="method-time">Instant</div>
        </button>
      `;
      activeWithdrawMethod = 'bank';
    }
    // Re-attach click handlers
    grid.querySelectorAll('.method-card').forEach(card => card.addEventListener('click', () => setWithdrawMethod(card.dataset.method)));
  }

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
        <div class="amount-input"><input type="number" id="withdrawInput" placeholder="Enter amount" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"><span class="currency">${currentCurrency}</span></div>
        <div class="amount-presets"><button type="button" class="preset" data-amount="1000">${symbols[currentCurrency]}1k</button><button type="button" class="preset" data-amount="5000">${symbols[currentCurrency]}5k</button><button type="button" class="preset" data-amount="10000">${symbols[currentCurrency]}10k</button><button type="button" class="preset preset-max" id="maxBtn">Max</button></div>
        <div class="fee-row"><span>Transaction Fee</span><span id="withdrawFee">${symbols[currentCurrency]} ${FEE}</span></div>
        <div class="receive-row"><span>You Will Receive</span><span id="receiveAmount">${symbols[currentCurrency]} 0.00</span></div>
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
        <div class="amount-input"><input type="number" id="withdrawInput" placeholder="Enter amount" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none"><span class="currency">${currentCurrency}</span></div>
        <div class="amount-presets"><button type="button" class="preset" data-amount="1000">${symbols[currentCurrency]}1k</button><button type="button" class="preset" data-amount="5000">${symbols[currentCurrency]}5k</button><button type="button" class="preset" data-amount="10000">${symbols[currentCurrency]}10k</button><button type="button" class="preset" data-amount="25000">${symbols[currentCurrency]}25k</button><button type="button" class="preset preset-max" id="maxBtn">Max</button></div>
        <div class="fee-row"><span>Transaction Fee</span><span id="withdrawFee">${symbols[currentCurrency]} ${FEE}</span></div>
        <div class="receive-row"><span>You Will Receive</span><span id="receiveAmount">${symbols[currentCurrency]} 0.00</span></div>
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
        const input = $('withdrawInput'); if (!input) return;
        if (btn.id === 'maxBtn') {
          input.value = (activeWithdrawMethod === 'usdt_trc20' || activeWithdrawMethod === 'usdt_bep20') ? 1000 : base.withdrawable;
        } else { input.value = btn.dataset.amount; }
        input.dispatchEvent(new Event('input'));
      });
    });
    if (requestBtn) {
      requestBtn.addEventListener('click', () => {
        if (base.homeBalance <= 0) { showInsufficientBalanceModal(); return; }
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

  // initialise withdraw methods on page load
  updateWithdrawMethods();
  renderWithdrawForm(activeWithdrawMethod);

  // ----- 2FA etc (unchanged) -----

  // ========== DEPOSIT FLOW (min 10k, currency-aware) ==========
  $('drawerDepositBtn')?.addEventListener('click', () => openModal('depositModal'));
  document.querySelectorAll('.deposit-purple, .deposit-green, .deposit-amber').forEach(btn => btn.addEventListener('click', () => openModal('depositModal')));
  document.querySelectorAll('#depositModal .preset').forEach(b => b.addEventListener('click', () => { $('depositAmountInput').value = b.dataset.amount; }));
  $('confirmDepositBtn')?.addEventListener('click', () => {
    const amount = parseFloat($('depositAmountInput').value);
    const err = $('depositError');
    if (isNaN(amount) || amount <= 0) { err.textContent = 'Enter a valid deposit amount'; err.style.display = 'block'; setTimeout(() => err.style.display = 'none', 3000); return; }
    if (amount < 10000) { err.textContent = `Minimum deposit is ${symbols[currentCurrency]}10,000`; err.style.display = 'block'; setTimeout(() => err.style.display = 'none', 3000); return; }
    closeModal('depositModal');
    showProcessing('Processing deposit...');
    setTimeout(() => { hideProcessing(); $('paymentAmount').textContent = fmt(amount); $('paymentModalTitle').textContent = 'Deposit Payment'; openModal('paymentModal'); }, 2000);
  });

  // ========== INVESTMENT FLOW (min 10k, red error) ==========
  function openInvestModal(planName, min, planKey) { /* unchanged */ }
  function updateInvestExpected() { /* unchanged */ }
  $('investAmountInput')?.addEventListener('input', updateInvestExpected);
  $('confirmInvestBtn')?.addEventListener('click', () => {
    const amount = parseFloat($('investAmountInput').value);
    const investErr = document.getElementById('investError');
    if (isNaN(amount) || amount <= 0) { if (investErr) { investErr.textContent = 'Enter a valid amount.'; investErr.style.display = 'block'; setTimeout(() => investErr.style.display = 'none', 3000); } return; }
    if (amount < 10000) { if (investErr) { investErr.textContent = `Minimum investment is ${symbols[currentCurrency]}10,000`; investErr.style.display = 'block'; setTimeout(() => investErr.style.display = 'none', 3000); } return; }
    closeModal('investModal');
    showProcessing('Processing investment...');
    setTimeout(() => { hideProcessing(); $('paymentAmount').textContent = fmt(amount); $('paymentModalTitle').textContent = 'Investment Payment'; openModal('paymentModal'); }, 2000);
  });
  document.querySelectorAll('.invest-now-btn').forEach(btn => { /* unchanged */ });

  // ========== Payment, Transfer, Card, History, Withdraw Confirm (unchanged) ==========

  // ========== Community (unchanged) ==========

  // ========== VIP, View switching, Wallet actions, Drawer, Quick Actions, Other Buttons, Logout (unchanged) ==========

  // ========== Close modals on overlay click ==========
  ['investModal','depositModal','paymentModal','withdrawConfirmModal','cardModal','transferModal','successModal',
   'withdrawalSuccessModal','withdrawalReceiptModal','transactionModal','securityModal','notificationsModal',
   'helpModal','settingsModal','referModal','comparePlansModal','overviewDetailModal','transferSuccessModal',
   'logoutConfirmModal','forgotPasswordModal'].forEach(id => {
    const el = $(id); if (el) el.addEventListener('click', e => { if (e.target === el) closeModal(id); });
  });

  // Make sure invest modal close button works
  $('closeInvestModalBtn')?.addEventListener('click', () => closeModal('investModal'));

  // ========== Auto-refresh chart ==========
  setInterval(() => { /* unchanged */ }, 30000);

  // ========== Initial Load ==========
  const storedUser = getStoredUser();
  if (storedUser) { currentUser = storedUser; base.homeBalance = storedUser.homeBalance || 0; base.totalInvested = storedUser.totalInvested || 0; base.totalWithdrawn = storedUser.totalWithdrawn || 0; base.activePlans = storedUser.activePlans || 0; }
  updateAll(); setView('home'); updateDrawerUserInfo(); refresh2faUI(); updateCardDisplay();
})();
