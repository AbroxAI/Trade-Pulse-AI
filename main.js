(function() {
  const rates = { NGN:1, USD:0.00067, EUR:0.00061, GBP:0.00052 };
  const symbols = { NGN:'₦', USD:'$', EUR:'€', GBP:'£' };
  let currentCurrency = 'NGN';
  const FEE = 50;
  let balanceHidden = false;
  let overviewPeriod = 'today';
  const base = { homeBalance:322000, totalInvested:100000, totalProfit:68000, totalWithdrawn:154000, walletTotal:322000, walletAvailable:318000, walletLocked:4000, nairaWallet:318000, withdrawable:318000, txFee:FEE, activePlans:2, planMin1:1000, planMax1:49999, planMin2:50000, planMax2:199999, planMin3:200000, planMax3:499999, planMin4:500000 };
  let chartData = [
    { label:'Feb 18', value:0 },{ label:'Feb 22', value:8000 },{ label:'Mar 01', value:15000 },
    { label:'Mar 10', value:22000 },{ label:'Mar 20', value:30000 },{ label:'Mar 30', value:45000 },
    { label:'Apr 05', value:60000 },{ label:'Apr 12', value:78000 },{ label:'Apr 20', value:95000 },
    { label:'Apr 28', value:120000 },{ label:'May 05', value:150000 },{ label:'May 10', value:190000 },
    { label:'May 15', value:230000 },{ label:'May 18', value:270000 },{ label:'May 22', value:322000 }
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

  function convert(a) { return (a * rates[currentCurrency]).toFixed(2); }
  function fmt(a) { return symbols[currentCurrency] + ' ' + Number(convert(a)).toLocaleString('en', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
  function addTransaction(type, amount, subtitle, meta, currency=null, iconType=null) {
    const tx = { title:type, subtitle, meta, amount, amountColor: amount>0?'#4ade80':'#f87171', iconType: iconType || (amount>0?'bank':'opay'), status:'Completed', currency };
    allTransactions.push(tx);
    if (type==='Withdrawal') withdrawalsOnly.push(tx);
  }
  function getIconSVG(type) {
    if (type==='bank') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>';
    if (type==='opay') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M22 8h-6a2 2 0 0 0 0 4h6"/></svg>';
    if (type==='usdt') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="17" text-anchor="middle" fill="currentColor" font-size="10" font-weight="bold">₮</text></svg>';
    if (type==='deposit') return '<svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>';
    if (type==='withdraw') return '<svg viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
  }

  function toggleEyeIcons() {
    document.querySelectorAll('.eye').forEach(eye => {
      eye.classList.toggle('balance-hidden', balanceHidden);
    });
  }

  function updateAll() {
    if (balanceHidden) {
      const hideFields = ['homeBalance','homeFx','walletTotalBalance','walletTotalFx','availableBalance','lockedBalance','nairaWallet','withdrawBalance','withdrawFx','withdrawableAmount','totalInvested','totalProfit','totalWithdrawn'];
      hideFields.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '****'; });
      document.querySelectorAll('.value').forEach(el => el.textContent = '****');
      document.getElementById('profitPercent').textContent = '220%';
    } else {
      let cv = chartData[chartData.length-1].value;
      document.getElementById('homeBalance').textContent = fmt(cv);
      document.getElementById('homeFx').textContent = `≈ $ ${(cv*rates['USD']).toFixed(2)}`;
      base.homeBalance = cv; base.walletTotal = cv; base.walletAvailable = cv - 4000; base.nairaWallet = base.walletAvailable; base.withdrawable = base.walletAvailable;
      base.totalProfit = cv - base.totalInvested - base.totalWithdrawn + 68000;
      document.getElementById('totalInvested').textContent = fmt(base.totalInvested);
      document.getElementById('totalProfit').textContent = fmt(Math.max(0,base.totalProfit));
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
      document.querySelectorAll('.currency-option').forEach(o => o.classList.toggle('selected', o.dataset.currency===currentCurrency));
      let amt = parseFloat(document.getElementById('withdrawInput')?.value)||0;
      if (document.getElementById('receiveAmount')) document.getElementById('receiveAmount').textContent = fmt(Math.max(0,amt-FEE));
      if (document.getElementById('withdrawFee')) document.getElementById('withdrawFee').textContent = fmt(amt>0?FEE:0);
    }
    buildChart();
    renderRecentTx(); renderRecentWithdrawals(); renderWalletTx(); renderOverviewCards();
    toggleEyeIcons();
  }

  // Currency
  document.getElementById('currencyBtn').addEventListener('click', () => document.getElementById('currencyDropdown').classList.toggle('open'));
  document.getElementById('currencyDropdown').addEventListener('click', e => {
    let opt = e.target.closest('.currency-option'); if(!opt) return;
    currentCurrency = opt.dataset.currency;
    document.getElementById('currencyDropdown').classList.remove('open');
    updateAll();
  });
  document.addEventListener('click', e => { if(!e.target.closest('#currencySelector')) document.getElementById('currencyDropdown').classList.remove('open'); });

  // Balance hide toggles
  document.getElementById('homeBalanceEye').addEventListener('click', () => {
    balanceHidden = !balanceHidden;
    const toggleEl = document.getElementById('hideBalanceToggle');
    if (toggleEl) toggleEl.querySelector('span').textContent = balanceHidden ? 'Show Balance' : 'Hide Balance';
    updateAll();
  });
  // Also allow clicking any eye icon (withdraw, wallet) to toggle
  document.querySelectorAll('.eye').forEach(eye => {
    eye.addEventListener('click', () => {
      balanceHidden = !balanceHidden;
      const toggleEl = document.getElementById('hideBalanceToggle');
      if (toggleEl) toggleEl.querySelector('span').textContent = balanceHidden ? 'Show Balance' : 'Hide Balance';
      updateAll();
    });
  });
  document.getElementById('hideBalanceToggle').addEventListener('click', () => {
    balanceHidden = !balanceHidden;
    const toggleEl = document.getElementById('hideBalanceToggle');
    toggleEl.querySelector('span').textContent = balanceHidden ? 'Show Balance' : 'Hide Balance';
    updateAll();
  });

  // Notification bell
  document.getElementById('notificationBell').addEventListener('click', () => openModal('notificationsModal'));

  // Overview period toggle
  const periodChip = document.getElementById('overviewPeriodChip');
  const periods = ['Today','Week','Month'];
  let periodIndex = 0;
  periodChip.addEventListener('click', () => {
    periodIndex = (periodIndex + 1) % periods.length;
    overviewPeriod = periods[periodIndex].toLowerCase();
    periodChip.innerHTML = `${periods[periodIndex]}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>`;
    renderOverviewCards();
  });

  // Withdraw form dynamic rendering
  let activeWithdrawMethod = 'bank';
  const withdrawFormContainer = document.getElementById('withdrawDetailsForm');
  function renderWithdrawForm(method) {
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
        <div class="amount-presets"><button type="button" class="preset" data-amount="1000">₦1,000</button><button type="button" class="preset" data-amount="5000">₦5,000</button><button type="button" class="preset" data-amount="10000">₦10,000</button><button type="button" class="preset" data-amount="25000">₦25,000</button><button type="button" class="preset preset-max" id="maxBtn">Max</button></div>
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
        <div class="receive-row"><span>You Will Receive</span><span id="receiveAmount">0 USDT</span></div>
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
    if (withdrawInput) {
      withdrawInput.addEventListener('input', () => {
        let amt = parseFloat(withdrawInput.value)||0;
        if (activeWithdrawMethod === 'usdt_trc20' || activeWithdrawMethod === 'usdt_bep20') {
          document.getElementById('receiveAmount').textContent = (Math.max(0, amt - 1)).toFixed(2) + ' USDT';
          document.getElementById('withdrawFee').textContent = '1 USDT';
        } else {
          document.getElementById('receiveAmount').textContent = fmt(Math.max(0, amt - FEE));
          document.getElementById('withdrawFee').textContent = fmt(amt > 0 ? FEE : 0);
        }
      });
    }
    document.querySelectorAll('.preset').forEach(b => {
      b.addEventListener('click', () => {
        if (b.id === 'maxBtn') {
          if (activeWithdrawMethod === 'usdt_trc20' || activeWithdrawMethod === 'usdt_bep20') {
            document.getElementById('withdrawInput').value = 1000;
          } else {
            document.getElementById('withdrawInput').value = base.withdrawable;
          }
        } else {
          document.getElementById('withdrawInput').value = b.dataset.amount;
        }
        document.getElementById('withdrawInput').dispatchEvent(new Event('input'));
      });
    });
    const requestBtn = document.getElementById('requestWithdrawalBtn');
    if (requestBtn) {
      requestBtn.addEventListener('click', () => {
        const amount = parseFloat(document.getElementById('withdrawInput').value);
        const accountNumber = document.getElementById('withdrawAccountInput').value.trim();
        const errorEl = document.getElementById('withdrawError');
        if (isNaN(amount)||amount<=0) {
          errorEl.textContent = 'Please enter a valid amount.'; errorEl.style.display = 'block';
          setTimeout(() => { errorEl.style.display = 'none'; }, 3000); return;
        }
        if (!accountNumber) {
          errorEl.textContent = 'Please fill in the required field.'; errorEl.style.display = 'block';
          setTimeout(() => { errorEl.style.display = 'none'; }, 3000); return;
        }
        let fee = activeWithdrawMethod.startsWith('usdt') ? 1 : FEE;
        let receive = Math.max(0, amount - fee);
        document.getElementById('confirmBank').textContent = activeWithdrawMethod === 'bank' ? `${document.getElementById('bankSelect').value} - ${accountNumber}` : `${activeWithdrawMethod} - ${accountNumber}`;
        document.getElementById('confirmAmount').textContent = activeWithdrawMethod.startsWith('usdt') ? amount + ' USDT' : fmt(amount);
        document.getElementById('confirmFee').textContent = activeWithdrawMethod.startsWith('usdt') ? '1 USDT' : fmt(fee);
        document.getElementById('confirmReceive').textContent = activeWithdrawMethod.startsWith('usdt') ? receive + ' USDT' : fmt(receive);
        document.getElementById('confirmDate').textContent = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
        document.getElementById('withdrawConfirmModal').classList.add('open');
      });
    }
  }

  document.querySelectorAll('.method-card').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('.method-card').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      activeWithdrawMethod = c.dataset.method;
      renderWithdrawForm(activeWithdrawMethod);
      if (activeWithdrawMethod === 'usdt_trc20' || activeWithdrawMethod === 'usdt_bep20') {
        document.getElementById('withdrawBalance').textContent = '1000.00 USDT';
        document.getElementById('withdrawFx').textContent = '≈ $ 1000.00';
        document.getElementById('withdrawableAmount').textContent = '1000.00 USDT';
      } else {
        updateAll();
      }
    });
  });
  renderWithdrawForm('bank');

  // Avatar upload
  document.getElementById('drawerAvatar').addEventListener('click', () => document.getElementById('avatarInput').click());
  document.getElementById('avatarInput').addEventListener('change', (e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = document.createElement('img'); img.src = ev.target.result;
      const avatar = document.getElementById('drawerAvatar'); avatar.innerHTML = ''; avatar.appendChild(img);
      const camera = document.createElement('div'); camera.className = 'camera-icon';
      camera.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
      avatar.appendChild(camera);
    };
    reader.readAsDataURL(file);
  });

  // Drawer actions
  document.getElementById('upgradeVipBtn').addEventListener('click', () => { setView('invest'); setTimeout(() => document.getElementById('vipPlanCard').scrollIntoView({behavior:'smooth'}),200); closeDrawer(); });
  document.getElementById('promoUpgradeBtn').addEventListener('click', () => document.getElementById('vipPlanCard').scrollIntoView({behavior:'smooth'}));
  document.getElementById('drawerDepositBtn').addEventListener('click', openDepositModal);
  document.getElementById('drawerReferBtn').addEventListener('click', () => openModal('referModal'));
  document.getElementById('drawerTxHistoryBtn').addEventListener('click', () => showModal('All Transactions', allTransactions));
  document.getElementById('drawerHelpBtn').addEventListener('click', () => openModal('helpModal'));
  document.getElementById('drawerNotificationsBtn').addEventListener('click', () => openModal('notificationsModal'));
  document.getElementById('drawerSecurityBtn').addEventListener('click', () => openModal('securityModal'));
  document.getElementById('drawerSettingsBtn').addEventListener('click', () => openModal('settingsModal'));
  document.getElementById('drawerLogoutBtn').addEventListener('click', () => { if(confirm('Are you sure you want to log out?')) alert('Logged out successfully.'); });
  document.getElementById('secureNowBtn').addEventListener('click', () => openModal('securityModal'));

  function closeDrawer() {
    document.getElementById('drawerOverlay').classList.remove('open');
    document.getElementById('drawerPanel').classList.remove('open');
  }
  function openModal(id) { document.getElementById(id).classList.add('open'); }
  function closeModal(id) { document.getElementById(id).classList.remove('open'); }

  // Modal close buttons
  document.getElementById('closeHelpModalBtn').addEventListener('click', () => closeModal('helpModal'));
  document.getElementById('closeSettingsModalBtn').addEventListener('click', () => closeModal('settingsModal'));
  document.getElementById('closeSecurityModalBtn').addEventListener('click', () => closeModal('securityModal'));
  document.getElementById('closeNotificationsModalBtn').addEventListener('click', () => closeModal('notificationsModal'));
  document.getElementById('closeReferModalBtn').addEventListener('click', () => closeModal('referModal'));
  document.getElementById('closeCompareModalBtn').addEventListener('click', () => closeModal('comparePlansModal'));
  document.getElementById('closeOverviewDetailBtn').addEventListener('click', () => closeModal('overviewDetailModal'));
  ['helpModal','settingsModal','securityModal','notificationsModal','referModal','comparePlansModal','overviewDetailModal'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => { if(e.target === document.getElementById(id)) closeModal(id); });
  });

  document.getElementById('comparePlansBtn').addEventListener('click', () => openModal('comparePlansModal'));
  document.getElementById('copyReferBtn').addEventListener('click', () => { navigator.clipboard.writeText('JOHN872').then(() => alert('Referral code copied!')); });

  // Deposit modal with processing overlay
  function openDepositModal() { document.getElementById('depositModal').classList.add('open'); }
  document.getElementById('closeDepositModalBtn').addEventListener('click', () => closeModal('depositModal'));
  document.getElementById('depositModal').addEventListener('click', e => { if(e.target===document.getElementById('depositModal')) closeModal('depositModal'); });
  document.querySelectorAll('#depositModal .preset').forEach(b => b.addEventListener('click', () => { document.getElementById('depositAmountInput').value = b.dataset.amount; }));
  document.getElementById('confirmDepositBtn').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('depositAmountInput').value);
    if (isNaN(amount) || amount <= 0) {
      const err = document.getElementById('depositError'); err.textContent = 'Enter a valid deposit amount'; err.style.display = 'block';
      setTimeout(() => { err.style.display = 'none'; }, 3000); return;
    }
    closeModal('depositModal');
    document.getElementById('processingOverlay').classList.add('open');
    setTimeout(() => {
      document.getElementById('processingOverlay').classList.remove('open');
      openPaymentModal('deposit', amount);
      document.getElementById('depositAmountInput').value = '';
    }, 1500);
  });

  // Payment modal
  const paymentModal = document.getElementById('paymentModal');
  const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
  const closePaymentModalBtn = document.getElementById('closePaymentModalBtn');
  let pendingPaymentType = null; let pendingPaymentAmount = 0;
  function openPaymentModal(type, amount, extraData=null) {
    pendingPaymentType = type; pendingPaymentAmount = amount;
    document.getElementById('paymentAmount').textContent = fmt(amount);
    document.getElementById('paymentModalTitle').textContent = type==='deposit'?'Deposit Payment':'Investment Payment';
    paymentModal.classList.add('open');
    if(extraData){ paymentModal.dataset.planName = extraData.planName; paymentModal.dataset.planKey = extraData.planKey; }
    else { delete paymentModal.dataset.planName; delete paymentModal.dataset.planKey; }
  }
  closePaymentModalBtn.addEventListener('click', () => paymentModal.classList.remove('open'));
  paymentModal.addEventListener('click', e => { if(e.target===paymentModal) paymentModal.classList.remove('open'); });
  confirmPaymentBtn.addEventListener('click', () => {
    if(pendingPaymentType==='deposit') {
      base.homeBalance += pendingPaymentAmount; base.walletTotal = base.homeBalance; base.walletAvailable += pendingPaymentAmount; base.nairaWallet = base.walletAvailable; base.withdrawable = base.walletAvailable;
      chartData.push({ label: new Date().getHours()+':'+String(new Date().getMinutes()).padStart(2,'0'), value: base.homeBalance });
      addTransaction('Deposit', pendingPaymentAmount, 'Palmpay Deposit', new Date().toLocaleString(), null, 'bank');
    } else if(pendingPaymentType==='invest') {
      if(pendingPaymentAmount > base.walletAvailable) return alert('Insufficient balance.');
      base.homeBalance -= pendingPaymentAmount; base.walletTotal = base.homeBalance; base.walletAvailable -= pendingPaymentAmount; base.nairaWallet = base.walletAvailable; base.withdrawable = base.walletAvailable;
      base.totalInvested += pendingPaymentAmount; base.activePlans++;
      chartData.push({ label: new Date().getHours()+':'+String(new Date().getMinutes()).padStart(2,'0'), value: base.homeBalance });
      const planName = paymentModal.dataset.planName || 'Plan';
      addTransaction('Investment', pendingPaymentAmount, `Invested in ${planName}`, new Date().toLocaleString(), null, 'bank');
    }
    paymentModal.classList.remove('open');
    updateAll();
  });
  document.getElementById('copyAccountBtn').addEventListener('click', async () => {
    const account = document.getElementById('accountNumberDisplay').textContent.trim();
    try {
      await navigator.clipboard.writeText(account);
      const btn = document.getElementById('copyAccountBtn');
      btn.classList.add('copied');
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 13 4 4L19 7"/></svg>Copied!';
      setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy'; }, 2000);
    } catch(err) { alert('Failed to copy'); }
  });

  // Invest modal with processing
  const investModal = document.getElementById('investModal');
  document.getElementById('closeInvestModalBtn').addEventListener('click', () => investModal.classList.remove('open'));
  investModal.addEventListener('click', e => { if(e.target===investModal) investModal.classList.remove('open'); });
  let currentInvestPlan = null;
  function openInvestModal(planName, min, dailyRate, planKey) {
    document.getElementById('investPlanName').textContent = planName;
    document.getElementById('investMin').textContent = min.toLocaleString();
    document.getElementById('investDailyRate').textContent = dailyRate + '%';
    document.getElementById('investAmountInput').value = min;
    updateInvestExpected();
    currentInvestPlan = planKey;
    investModal.classList.add('open');
  }
  function updateInvestExpected() {
    const amount = parseFloat(document.getElementById('investAmountInput').value)||0;
    const rate = parseFloat(document.getElementById('investDailyRate').textContent)/100;
    const totalReturn = amount + (amount * rate * 30);
    document.getElementById('investExpectedReturn').textContent = fmt(totalReturn);
  }
  document.getElementById('investAmountInput').addEventListener('input', updateInvestExpected);
  document.getElementById('confirmInvestBtn').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('investAmountInput').value);
    if(isNaN(amount)||amount<=0) return alert('Enter valid amount.');
    investModal.classList.remove('open');
    document.getElementById('processingOverlay').classList.add('open');
    setTimeout(() => {
      document.getElementById('processingOverlay').classList.remove('open');
      openPaymentModal('invest', amount, { planName: document.getElementById('investPlanName').textContent, planKey: currentInvestPlan });
    }, 1500);
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

  // Transfer modal
  const transferModal = document.getElementById('transferModal');
  const transferSuccessModal = document.getElementById('transferSuccessModal');
  document.getElementById('closeTransferModalBtn').addEventListener('click', () => transferModal.classList.remove('open'));
  transferModal.addEventListener('click', e => { if(e.target===transferModal) transferModal.classList.remove('open'); });
  document.getElementById('closeTransferSuccessBtn').addEventListener('click', () => transferSuccessModal.classList.remove('open'));
  transferSuccessModal.addEventListener('click', e => { if(e.target===transferSuccessModal) transferSuccessModal.classList.remove('open'); });
  document.getElementById('confirmTransferBtn').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('transferAmountInput').value);
    const recipient = document.getElementById('transferRecipient').value.trim();
    if (isNaN(amount)||amount<=0) return alert('Enter valid amount.');
    if (!recipient) return alert('Enter recipient username.');
    if (amount > base.walletAvailable) return alert('Insufficient balance.');
    transferModal.classList.remove('open');
    document.getElementById('processingOverlay').classList.add('open');
    setTimeout(() => {
      document.getElementById('processingOverlay').classList.remove('open');
      base.homeBalance -= amount; base.walletTotal = base.homeBalance; base.walletAvailable -= amount; base.nairaWallet = base.walletAvailable; base.withdrawable = base.walletAvailable;
      chartData.push({ label: new Date().getHours()+':'+String(new Date().getMinutes()).padStart(2,'0'), value: base.homeBalance });
      addTransaction('Transfer', -amount, `To ${recipient}`, new Date().toLocaleString(), null, 'wallet');
      document.getElementById('transferAmountInput').value = ''; document.getElementById('transferRecipient').value = '';
      const date = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
      const ref = 'TRF' + Math.floor(Math.random()*90000000+10000000);
      document.getElementById('transferSuccessRecipient').textContent = recipient;
      document.getElementById('transferSuccessAmount').textContent = fmt(amount);
      document.getElementById('transferSuccessDate').textContent = date;
      document.getElementById('transferSuccessRef').textContent = ref;
      transferSuccessModal.classList.add('open');
      updateAll();
    }, 1500);
  });

  // Wallet action clicks
  document.body.addEventListener('click', e => {
    const action = e.target.closest('.wallet-action');
    if(action && action.querySelector('.wallet-action-title')?.textContent.trim()==='Transfer') { transferModal.classList.add('open'); }
    if(action && action.querySelector('.wallet-action-title')?.textContent.trim()==='Deposit') { openDepositModal(); }
    if(action && action.querySelector('.wallet-action-title')?.textContent.trim()==='Withdraw') { setView('withdraw'); }
    if(action && action.querySelector('.wallet-action-title')?.textContent.trim()==='History') { showModal('All Transactions', allTransactions); }
    if(action && action.querySelector('.wallet-action-title')?.textContent.trim()==='Cards') { document.getElementById('cardModal').classList.add('open'); }
  });
  document.getElementById('closeCardModalBtn').addEventListener('click', () => document.getElementById('cardModal').classList.remove('open'));
  document.getElementById('cardModal').addEventListener('click', e => { if(e.target===document.getElementById('cardModal')) document.getElementById('cardModal').classList.remove('open'); });

  // Invest tabs
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

  // Navigation
  function setView(v) {
    ['homeView','investView','withdrawView','walletView','communityView'].forEach(id => document.getElementById(id).classList.remove('active'));
    document.getElementById(v+'View').classList.add('active');
    document.getElementById('pageTitle').textContent = { home:'Home', invest:'Invest', withdraw:'Withdrawal', wallet:'Wallet', community:'Community' }[v]||'Home';
    document.querySelectorAll('.nav-item[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view===v));
    updateAll();
  }
  document.querySelectorAll('.nav-item[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  document.addEventListener('click', e => { let t = e.target.closest('[data-nav]'); if(t && t.dataset.nav) setView(t.dataset.nav); });

  // Drawer
  let drawer = document.getElementById('drawerOverlay'), panel = document.getElementById('drawerPanel');
  document.getElementById('menuBtn').addEventListener('click', () => { drawer.classList.add('open'); panel.classList.add('open'); });
  document.getElementById('drawerCloseBtn').addEventListener('click', () => { drawer.classList.remove('open'); panel.classList.remove('open'); });
  drawer.addEventListener('click', () => { drawer.classList.remove('open'); panel.classList.remove('open'); });

  // Transaction modal
  let modal = document.getElementById('transactionModal');
  document.getElementById('modalCloseBtn').addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', e => { if(e.target===modal) modal.classList.remove('open'); });
  function showModal(t, arr) {
    document.getElementById('modalTitle').textContent = t;
    let list = document.getElementById('modalTransactionsList');
    list.innerHTML = '';
    arr.forEach(tx => {
      let s = tx.currency==='USD' ? `${tx.amount>=0?'+':'-'}$${Math.abs(tx.amount).toFixed(2)}` : `${tx.amount>=0?'+':''}${fmt(Math.abs(tx.amount))}`;
      let row = document.createElement('div');
      row.className = 'tx-row';
      row.innerHTML = `<div class="tx-ico" style="background:${tx.amount>0?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div><div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div>`;
      list.appendChild(row);
    });
    modal.classList.add('open');
  }
  document.getElementById('viewAllTransactionsBtn').addEventListener('click', () => showModal('All Transactions', allTransactions));
  document.getElementById('viewAllWithdrawalsBtn').addEventListener('click', () => showModal('All Withdrawals', withdrawalsOnly));
  document.getElementById('viewAllWalletTx').addEventListener('click', () => showModal('Wallet Transactions', allTransactions));

  // Chart – wider viewBox and bigger left padding to prevent label cut‑off
  function buildChart() {
    let maxV = Math.max(...chartData.map(d=>d.value))*1.1||340000;
    let W=380, H=250, pl=44, pr=20, pt=26, pb=30;
    let gw=W-pl-pr, gh=H-pt-pb;
    let xs=i=>pl+(i/(chartData.length-1))*gw;
    let ys=v=>pt+gh-(v/maxV)*gh;
    let lp='', ap='';
    chartData.forEach((p,i)=>{
      let x=xs(i), y=ys(p.value);
      if(i===0){ lp+=`M ${x} ${y}`; ap+=`M ${x} ${H-pb} L ${x} ${y}`; }
      else { lp+=` L ${x} ${y}`; ap+=` L ${x} ${y}`; }
    });
    ap+=` L ${xs(chartData.length-1)} ${H-pb} Z`;
    let yl=[0,Math.round(maxV/2),Math.round(maxV)];
    let yle=yl.map(v=>`<text class="ytext" x="${pl-6}" y="${ys(v)+4}" text-anchor="end">${symbols[currentCurrency]} ${convert(v)}</text>`).join('');
    let xle=chartData.filter((_,i)=>i%3===0||i===chartData.length-1).map(p=>`<text class="axis-text" x="${xs(chartData.indexOf(p))}" y="${H-8}" text-anchor="middle">${p.label}</text>`).join('');
    document.getElementById('chartContainer').innerHTML=`<svg class="chart-svg" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="fillGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#22c55e" stop-opacity="0.25"/><stop offset="70%" stop-color="#22c55e" stop-opacity="0.05"/><stop offset="100%" stop-color="#22c55e" stop-opacity="0"/></linearGradient></defs>${yl.map(v=>`<line x1="${pl}" y1="${ys(v)}" x2="${W-pr}" y2="${ys(v)}" stroke="rgba(255,255,255,.06)"/>`).join('')}${yle}${xle}<path d="${ap}" fill="url(#fillGreen)"/><path d="${lp}" fill="none" stroke="#22c55e" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${xs(chartData.length-1)}" cy="${ys(chartData[chartData.length-1].value)}" r="6" fill="#22c55e"/><circle cx="${xs(chartData.length-1)}" cy="${ys(chartData[chartData.length-1].value)}" r="2.5" fill="#fff"/></svg>`;
  }
  setInterval(()=>{
    let last=chartData[chartData.length-1];
    chartData.push({ label: new Date().getHours()+':'+String(new Date().getMinutes()).padStart(2,'0'), value: last.value+Math.floor(Math.random()*1500)+500 });
    if(chartData.length>20) chartData.shift();
    updateAll();
  },30000);

  function renderRecentTx() {
    let c=document.getElementById('recentTransactions'); c.innerHTML='';
    allTransactions.slice(-4).reverse().forEach(tx=>{
      let s=tx.currency==='USD'? `${tx.amount>=0?'+':'-'}$${Math.abs(tx.amount).toFixed(2)}`: `${tx.amount>=0?'+':''}${fmt(Math.abs(tx.amount))}`;
      c.innerHTML+=`<div class="tx-row"><div class="tx-ico" style="background:${tx.amount>0?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div><div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div><svg class="menu" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg></div>`;
    });
  }
  function renderRecentWithdrawals() {
    let c=document.getElementById('recentWithdrawals'); c.innerHTML='';
    withdrawalsOnly.slice(-4).reverse().forEach(tx=>{
      let s=tx.currency==='USD'? `-$${Math.abs(tx.amount).toFixed(2)}`: `-${fmt(Math.abs(tx.amount))}`;
      c.innerHTML+=`<div class="tx-row"><div class="tx-ico" style="background:${tx.amount>0?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div><div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div><svg class="menu" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg></div>`;
    });
  }
  function renderWalletTx() {
    let c=document.getElementById('walletRecentTx'); c.innerHTML='';
    allTransactions.slice(-4).reverse().forEach(tx=>{
      let s=tx.currency==='USD'? `${tx.amount>=0?'+':'-'}$${Math.abs(tx.amount).toFixed(2)}`: `${tx.amount>=0?'+':''}${fmt(Math.abs(tx.amount))}`;
      c.innerHTML+=`<div class="wallet-tx-row"><div class="tx-ico" style="background:${tx.amount>0?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'}">${getIconSVG(tx.iconType)}</div><div class="tx-main"><div class="tx-title">${tx.title}</div><div class="tx-sub">${tx.subtitle} • ${tx.meta}</div></div><div class="tx-right"><div class="tx-amt" style="color:${tx.amountColor}">${s}</div><div class="status">${tx.status}</div></div><svg class="menu row-chevron" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg></div>`;
    });
  }
  function renderOverviewCards() {
    let c = document.getElementById('overviewCards');
    let totalProfitValue = base.totalProfit, investedValue = base.totalInvested, referralValue = 12000, withdrawnValue = base.totalWithdrawn;
    if (overviewPeriod === 'week') {
      totalProfitValue = Math.round(base.totalProfit * 0.25); investedValue = Math.round(base.totalInvested * 0.25); referralValue = 3000; withdrawnValue = Math.round(base.totalWithdrawn * 0.2);
    } else if (overviewPeriod === 'month') {
      totalProfitValue = base.totalProfit; investedValue = base.totalInvested; referralValue = 12000; withdrawnValue = base.totalWithdrawn;
    }
    let cards = [
      { title:"Total Profit", value:totalProfitValue, sub:"+68%", subColor:"#34d399", iconBg:"rgba(34,197,94,.12)", iconColor:"#4ade80", icon:'<path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/>' },
      { title:"Active Investments", value:investedValue, sub:"2 Plans", subColor:"#94a3b8", iconBg:"rgba(59,130,246,.12)", iconColor:"#60a5fa", icon:'<path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"/><path d="M8 13c1.7 0 3-1.3 3-3S9.7 7 8 7 5 8.3 5 10s1.3 3 3 3Z"/>' },
      { title:"Referral Earnings", value:referralValue, sub:"8 Referrals", subColor:"#94a3b8", iconBg:"rgba(245,158,11,.12)", iconColor:"#fbbf24", icon:'<path d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3Z"/><path d="M8 13c1.7 0 3-1.3 3-3S9.7 7 8 7 5 8.3 5 10s1.3 3 3 3Z"/>' },
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

  // Init quick actions
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

  // Withdrawal final confirm -> success flow
  const withdrawConfirmModal = document.getElementById('withdrawConfirmModal');
  const closeWithdrawConfirmBtn = document.getElementById('closeWithdrawConfirmBtn');
  const processingOverlay = document.getElementById('processingOverlay');
  const withdrawalSuccessModal = document.getElementById('withdrawalSuccessModal');
  const closeSuccessModalBtn = document.getElementById('closeSuccessModalBtn');
  closeWithdrawConfirmBtn.addEventListener('click', () => withdrawConfirmModal.classList.remove('open'));
  withdrawConfirmModal.addEventListener('click', e => { if(e.target===withdrawConfirmModal) withdrawConfirmModal.classList.remove('open'); });
  closeSuccessModalBtn.addEventListener('click', () => withdrawalSuccessModal.classList.remove('open'));
  withdrawalSuccessModal.addEventListener('click', e => { if(e.target===withdrawalSuccessModal) withdrawalSuccessModal.classList.remove('open'); });

  document.getElementById('finalConfirmWithdrawBtn').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('withdrawInput').value);
    const accountNumber = document.getElementById('withdrawAccountInput').value.trim();
    const bankName = activeWithdrawMethod === 'bank' ? document.getElementById('bankSelect').value : activeWithdrawMethod;
    const fee = activeWithdrawMethod.startsWith('usdt') ? 1 : FEE;
    const receive = Math.max(0, amount - fee);
    const dateStr = new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
    const ref = 'WD' + Math.floor(Math.random()*90000000+10000000);
    withdrawConfirmModal.classList.remove('open');
    processingOverlay.classList.add('open');
    setTimeout(() => {
      processingOverlay.classList.remove('open');
      base.homeBalance -= amount; base.walletTotal = base.homeBalance; base.walletAvailable -= amount; base.nairaWallet = base.walletAvailable; base.withdrawable = base.walletAvailable; base.totalWithdrawn += amount;
      base.totalProfit = base.homeBalance - base.totalInvested - base.totalWithdrawn + 68000;
      chartData.push({ label: new Date().getHours()+':'+String(new Date().getMinutes()).padStart(2,'0'), value: base.homeBalance });
      addTransaction('Withdrawal', -amount, `To ${bankName}`, new Date().toLocaleString(), null, 'bank');
      document.getElementById('withdrawInput').value = ''; document.getElementById('withdrawAccountInput').value = '';
      if (document.getElementById('receiveAmount')) document.getElementById('receiveAmount').textContent = activeWithdrawMethod.startsWith('usdt') ? '0 USDT' : fmt(0);
      if (document.getElementById('withdrawFee')) document.getElementById('withdrawFee').textContent = activeWithdrawMethod.startsWith('usdt') ? '1 USDT' : fmt(FEE);
      updateAll();
      document.getElementById('successBank').textContent = bankName;
      document.getElementById('successAmount').textContent = activeWithdrawMethod.startsWith('usdt') ? amount + ' USDT' : fmt(amount);
      document.getElementById('successFee').textContent = activeWithdrawMethod.startsWith('usdt') ? '1 USDT' : fmt(fee);
      document.getElementById('successReceive').textContent = activeWithdrawMethod.startsWith('usdt') ? receive + ' USDT' : fmt(receive);
      document.getElementById('successDate').textContent = dateStr;
      document.getElementById('successRef').textContent = ref;
      withdrawalSuccessModal.classList.add('open');
    }, 2500);
  });

  updateAll(); setView('home');
})();
