(function () {
  'use strict';

  const APP_NAME = 'Trade Pulse AI';

  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  }

  function clickView(view) {
    const target = document.querySelector(`.nav-item[data-view="${view}"]`);
    if (target) {
      target.click();
      return true;
    }
    return false;
  }

  function closeDrawer() {
    const overlay = document.getElementById('drawerOverlay');
    const panel = document.getElementById('drawerPanel');
    if (overlay) overlay.classList.remove('open');
    if (panel) panel.classList.remove('open');
  }

  function esc(text) {
    return String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function insertStyle() {
    if (document.getElementById('tp-fix-style')) return;
    const style = document.createElement('style');
    style.id = 'tp-fix-style';
    style.textContent = `
      .drawer-profile { position: relative; }
      .drawer-profile .camera-icon { display: none !important; }
      .drawer-close-btn { top: 16px !important; right: 16px !important; }
      .drawer-name {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        line-height: 1.1;
        flex-wrap: nowrap;
      }
      .verified-check {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-left: 0 !important;
        vertical-align: middle;
        flex: 0 0 auto;
      }
      .drawer-user-info { min-width: 0; }
      .drawer-user-info * { min-width: 0; }
      .amount-presets {
        display: grid !important;
        grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
        gap: 8px !important;
      }
      .amount-presets .preset {
        width: 100%;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #withdrawDetailsForm input,
      #withdrawDetailsForm select {
        box-sizing: border-box;
      }
      #withdrawDetailsForm .amount-input input::placeholder {
        color: #707887;
      }
      .community-input-bar,
      .community-chat-input {
        gap: 10px;
      }
      .community-input-placeholder {
        flex: 1;
        min-width: 0;
        outline: none;
      }
      .tp-community-modal .modal-panel {
        max-width: 420px;
      }
      .tp-community-sent {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .tp-community-bubble {
        border-radius: 16px;
        padding: 12px 14px;
        background: rgba(168,85,247,.12);
        border: 1px solid rgba(168,85,247,.18);
        color: #f8fafc;
        line-height: 1.5;
        word-break: break-word;
      }
      .tp-chat-self {
        border-color: rgba(34,197,94,.18) !important;
        background: rgba(34,197,94,.10) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureCommunityModal() {
    if (document.getElementById('tpCommunityModal')) return;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay tp-community-modal';
    overlay.id = 'tpCommunityModal';
    overlay.innerHTML = `
      <div class="modal-panel">
        <div class="modal-header">
          <div class="modal-title">Community Message</div>
          <button class="modal-close-btn" type="button" data-tp-close-community>✕</button>
        </div>
        <div class="notice-box">
          <div class="notice-title">Your message is ready</div>
          <div class="notice-text" id="tpCommunityModalText"></div>
        </div>
        <button class="withdraw-btn" type="button" data-tp-close-community style="margin-top:14px;">Done</button>
      </div>
    `;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal('tpCommunityModal');
    });
    document.body.appendChild(overlay);
  }

  function showCommunityModal(message) {
    ensureCommunityModal();
    const text = document.getElementById('tpCommunityModalText');
    if (text) text.textContent = message;
    openModal('tpCommunityModal');
    window.setTimeout(() => closeModal('tpCommunityModal'), 1800);
  }

  function normalizeCommunityInput() {
    const el = document.querySelector('.community-input-placeholder, .community-input-bar input, .community-chat-input input, .community-input-bar textarea, .community-chat-input textarea');
    if (!el) return null;

    if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
      if (!el.hasAttribute('contenteditable')) {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('role', 'textbox');
        el.setAttribute('aria-multiline', 'false');
        el.dataset.tpContenteditable = '1';
      }
      if (!el.dataset.tpPlaceholder) {
        el.dataset.tpPlaceholder = el.textContent.trim() || 'Type a message...';
      }
      el.style.outline = 'none';
      el.style.whiteSpace = 'nowrap';
      el.style.overflow = 'hidden';
      el.style.textOverflow = 'ellipsis';
      el.style.userSelect = 'text';
      el.setAttribute('spellcheck', 'false');
    }
    return el;
  }

  function getCommunityValue(el) {
    if (!el) return '';
    if ('value' in el) return (el.value || '').trim();
    return (el.textContent || '').trim();
  }

  function setCommunityValue(el, value) {
    if (!el) return;
    if ('value' in el) {
      el.value = value;
    } else {
      el.textContent = value;
    }
  }

  function clearCommunityValue(el) {
    if (!el) return;
    if ('value' in el) {
      el.value = '';
    } else {
      el.textContent = '';
    }
  }

  function appendOwnCommunityMessage(message) {
    const column = document.getElementById('communityChatColumn');
    if (!column) return false;

    const card = document.createElement('div');
    card.className = 'community-chat-card';
    card.innerHTML = `
      <div class="chat-msg-top">
        <div class="chat-msg-avatar tp-chat-self" style="background:rgba(34,197,94,.14);color:#d1fae5;">You</div>
        <div>
          <div class="chat-msg-name">You <span class="chat-msg-badge badge-vip">Me</span></div>
          <div style="font-size:11px;color:#6b7280;">Just now</div>
        </div>
      </div>
      <div class="chat-msg-body">${esc(message)}</div>
      <div class="chat-msg-time">Sent from your device</div>
    `;
    column.insertAdjacentElement('afterbegin', card);
    return true;
  }

  function patchVIP() {
    const vipBtn = document.getElementById('upgradeVipBtn');
    if (!vipBtn) return;

    const fresh = vipBtn.cloneNode(true);
    vipBtn.parentNode.replaceChild(fresh, vipBtn);
    fresh.addEventListener('click', (e) => {
      e.preventDefault();
      clickView('invest');
      closeDrawer();
      window.setTimeout(() => {
        const target = document.getElementById('vipPlanCard');
        if (target && target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    });
  }

  function patchWalletActions() {
    const actions = $$('.wallet-action');
    if (actions.length) {
      actions.forEach((btn) => {
        const fresh = btn.cloneNode(true);
        btn.parentNode.replaceChild(fresh, btn);
        fresh.addEventListener('click', () => {
          const text = fresh.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
          if (text.includes('deposit')) {
            const trigger = document.getElementById('drawerDepositBtn') || document.getElementById('confirmDepositBtn');
            if (trigger) trigger.click(); else openModal('depositModal');
          } else if (text.includes('withdraw')) {
            clickView('withdraw');
          } else if (text.includes('transfer')) {
            openModal('transferModal');
          } else if (text.includes('history')) {
            const allTx = document.getElementById('viewAllTransactionsBtn') || document.getElementById('drawerTxHistoryBtn');
            if (allTx) allTx.click(); else openModal('transactionModal');
          } else if (text.includes('cards') || text.includes('card')) {
            openModal('cardModal');
          }
        });
      });
    }

    const mappings = [
      ['drawerDepositBtn', () => openModal('depositModal')],
      ['drawerReferBtn', () => openModal('referModal')],
      ['drawerTxHistoryBtn', () => openModal('transactionModal')],
      ['drawerHelpBtn', () => openModal('helpModal')],
      ['drawerNotificationsBtn', () => openModal('notificationsModal')],
      ['drawerSecurityBtn', () => openModal('securityModal')],
      ['drawerSettingsBtn', () => openModal('settingsModal')],
      ['comparePlansBtn', () => openModal('comparePlansModal')],
      ['promoUpgradeBtn', () => { clickView('invest'); }],
    ];

    for (const [id, fn] of mappings) {
      const el = document.getElementById(id);
      if (!el) continue;
      const fresh = el.cloneNode(true);
      el.parentNode.replaceChild(fresh, el);
      fresh.addEventListener('click', (e) => {
        e.preventDefault();
        fn();
      });
    }
  }

  function patchNotificationBell() {
    const bell = document.getElementById('notificationBell');
    if (!bell) return;
    bell.addEventListener('click', () => {
      const badge = document.getElementById('notificationBadge');
      if (badge) {
        badge.textContent = '0';
        badge.style.display = 'none';
      }
    }, true);
  }

  function patchLogout() {
    const drawerLogoutBtn = document.getElementById('drawerLogoutBtn');
    if (drawerLogoutBtn) {
      const fresh = drawerLogoutBtn.cloneNode(true);
      drawerLogoutBtn.parentNode.replaceChild(fresh, drawerLogoutBtn);
      fresh.addEventListener('click', () => openModal('logoutConfirmModal'));
    }

    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    if (confirmLogoutBtn) {
      const fresh = confirmLogoutBtn.cloneNode(true);
      confirmLogoutBtn.parentNode.replaceChild(fresh, confirmLogoutBtn);
      fresh.addEventListener('click', () => {
        sessionStorage.removeItem('tradePulseLoggedIn');
        sessionStorage.removeItem('tradePulseCurrentUser');
        const modal = document.getElementById('logoutConfirmModal');
        if (modal) modal.classList.remove('open');
        location.reload();
      });
    }

    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
    if (cancelLogoutBtn) {
      const fresh = cancelLogoutBtn.cloneNode(true);
      cancelLogoutBtn.parentNode.replaceChild(fresh, cancelLogoutBtn);
      fresh.addEventListener('click', () => closeModal('logoutConfirmModal'));
    }
  }

  function patchCommunityComposer() {
    const sendBtn = document.querySelector('.community-send-btn');
    const input = normalizeCommunityInput();
    if (!sendBtn) return;

    const fresh = sendBtn.cloneNode(true);
    sendBtn.parentNode.replaceChild(fresh, sendBtn);

    if (input && input.dataset.tpContenteditable === '1') {
      input.addEventListener('click', () => {
        if (!input.textContent.trim() || input.textContent.trim() === input.dataset.tpPlaceholder) {
          input.textContent = '';
        }
      });
      input.addEventListener('focus', () => {
        if (!input.textContent.trim() || input.textContent.trim() === input.dataset.tpPlaceholder) {
          input.textContent = '';
        }
      });
      input.addEventListener('blur', () => {
        if (!input.textContent.trim()) {
          input.textContent = input.dataset.tpPlaceholder;
        }
      });
    }

    const send = () => {
      const value = getCommunityValue(input);
      if (!value) return;

      appendOwnCommunityMessage(value);
      showCommunityModal(value);
      clearCommunityValue(input);
      if (input && input.dataset.tpContenteditable === '1') {
        input.textContent = input.dataset.tpPlaceholder || '';
      }
    };

    fresh.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      send();
    }, true);

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          send();
        }
      }, true);
    }
  }

  function patchWithdrawForm() {
    const container = document.getElementById('withdrawDetailsForm');
    if (!container) return;

    const renderCustom = (method = 'bank') => {
      const isBank = method === 'bank';
      container.innerHTML = isBank ? `
        <div class="field-label">Bank Name</div>
        <div class="amount-input"><input type="text" id="bankSelect" placeholder="Enter bank name" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none" /></div>
        <div class="field-label">Account Number</div>
        <div class="amount-input"><input type="text" id="withdrawAccountInput" placeholder="Enter account number" inputmode="numeric" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none" /></div>
        <div class="field-label">Amount</div>
        <div class="amount-input"><input type="number" id="withdrawInput" placeholder="Enter amount" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none" /><span class="currency">NGN</span></div>
        <div class="amount-presets">
          <button type="button" class="preset" data-amount="1000">₦1,000</button>
          <button type="button" class="preset" data-amount="5000">₦5,000</button>
          <button type="button" class="preset" data-amount="10000">₦10,000</button>
          <button type="button" class="preset" data-amount="25000">₦25,000</button>
          <button type="button" class="preset preset-max" id="maxBtn">Max</button>
        </div>
        <div class="fee-row"><span>Transaction Fee</span><span id="withdrawFee">₦ 50.00</span></div>
        <div class="receive-row"><span>You Will Receive</span><span id="receiveAmount">₦ 0.00</span></div>
        <span class="field-error" id="withdrawError"></span>
        <button class="withdraw-btn" id="requestWithdrawalBtn">Request Withdrawal</button>
        <div class="notice-box">
          <div class="notice-title">Withdrawal Notice:</div>
          <div class="notice-text">Please ensure your bank name and account number are correct before requesting a withdrawal.</div>
        </div>
      ` : `
        <div class="field-label">Wallet Address</div>
        <div class="amount-input"><input type="text" id="withdrawAccountInput" placeholder="Enter wallet address" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none" /></div>
        <div class="field-label">Amount</div>
        <div class="amount-input"><input type="number" id="withdrawInput" placeholder="Enter amount" style="background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none" /><span class="currency">NGN</span></div>
        <div class="amount-presets">
          <button type="button" class="preset" data-amount="1000">₦1,000</button>
          <button type="button" class="preset" data-amount="5000">₦5,000</button>
          <button type="button" class="preset" data-amount="10000">₦10,000</button>
          <button type="button" class="preset" data-amount="25000">₦25,000</button>
          <button type="button" class="preset preset-max" id="maxBtn">Max</button>
        </div>
        <div class="fee-row"><span>Transaction Fee</span><span id="withdrawFee">₦ 50.00</span></div>
        <div class="receive-row"><span>You Will Receive</span><span id="receiveAmount">₦ 0.00</span></div>
        <span class="field-error" id="withdrawError"></span>
        <button class="withdraw-btn" id="requestWithdrawalBtn">Request Withdrawal</button>
      `;

      const amount = document.getElementById('withdrawInput');
      const fee = document.getElementById('withdrawFee');
      const receive = document.getElementById('receiveAmount');
      const err = document.getElementById('withdrawError');
      const account = document.getElementById('withdrawAccountInput');
      const bank = document.getElementById('bankSelect');

      const update = () => {
        const n = parseFloat(amount?.value || '0') || 0;
        const txFee = n > 0 ? 50 : 0;
        if (fee) fee.textContent = `₦ ${txFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (receive) receive.textContent = `₦ ${Math.max(0, n - txFee).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (err) {
          err.style.display = 'none';
          err.textContent = '';
        }
      };

      amount?.addEventListener('input', update);
      $$('.preset', container).forEach((btn) => {
        btn.addEventListener('click', () => {
          if (!amount) return;
          amount.value = btn.id === 'maxBtn' ? String(Math.max(0, parseFloat(amount.value || '0') || 0, 0)) : btn.dataset.amount || '';
          if (btn.id === 'maxBtn') {
            amount.value = amount.value === '0' ? '1000' : amount.value;
          }
          update();
        });
      });

      document.getElementById('requestWithdrawalBtn')?.addEventListener('click', () => {
        const n = parseFloat(amount?.value || '0') || 0;
        const bankName = (bank?.value || '').trim();
        const accountNumber = (account?.value || '').trim();
        if (!n || n <= 0) {
          if (err) { err.textContent = 'Please enter a valid amount.'; err.style.display = 'block'; }
          return;
        }
        if (!bankName && isBank) {
          if (err) { err.textContent = 'Please enter your bank name.'; err.style.display = 'block'; }
          return;
        }
        if (!accountNumber) {
          if (err) { err.textContent = 'Please enter your account number.'; err.style.display = 'block'; }
          return;
        }
        const confirmModal = document.getElementById('withdrawConfirmModal');
        if (confirmModal) {
          const confirmAmount = document.getElementById('confirmAmount');
          const confirmFee = document.getElementById('confirmFee');
          const confirmReceive = document.getElementById('confirmReceive');
          const confirmDate = document.getElementById('confirmDate');
          const confirmBank = document.getElementById('confirmBankName');
          const confirmAccount = document.getElementById('confirmAccountNumber');
          if (confirmAmount) confirmAmount.textContent = `₦ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          if (confirmFee) confirmFee.textContent = `₦ ${50.00.toFixed(2)}`;
          if (confirmReceive) confirmReceive.textContent = `₦ ${Math.max(0, n - 50).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          if (confirmDate) confirmDate.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          if (confirmBank) confirmBank.textContent = bankName || 'Wallet';
          if (confirmAccount) confirmAccount.textContent = accountNumber;
          openModal('withdrawConfirmModal');
        }
      });

      // If the current script rendered a select, convert it to a text input.
      const maybeSelect = document.getElementById('bankSelect');
      if (maybeSelect && maybeSelect.tagName === 'SELECT') {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'bankSelect';
        input.placeholder = 'Enter bank name';
        input.value = maybeSelect.value || '';
        input.style.cssText = maybeSelect.getAttribute('style') || 'background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none';
        maybeSelect.replaceWith(input);
      }

      update();
    };

    // Observe re-renders from the current app and normalize the withdraw field.
    const observer = new MutationObserver(() => {
      const select = document.getElementById('bankSelect');
      if (select && select.tagName === 'SELECT') {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'bankSelect';
        input.placeholder = 'Enter bank name';
        input.value = select.value || '';
        input.style.cssText = select.getAttribute('style') || 'background:transparent;border:none;color:#fff;font-size:16px;width:100%;outline:none';
        select.replaceWith(input);
      }
      const amountPresets = document.querySelector('.amount-presets');
      if (amountPresets) {
        amountPresets.style.gridTemplateColumns = 'repeat(5, minmax(0, 1fr))';
        amountPresets.style.gap = '8px';
      }
    });

    observer.observe(container, { childList: true, subtree: true });

    // Let the existing app render once, then normalize it.
    window.setTimeout(() => {
      renderCustom('bank');
      observer.takeRecords();
    }, 0);

    // Intercept method-card clicks and re-render our safe bank-name form.
    $$('.method-card').forEach((card) => {
      card.addEventListener('click', () => {
        const method = card.dataset.method || 'bank';
        renderCustom(method);
      }, true);
    });

    // Intercept request button if the old handler is still active.
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#requestWithdrawalBtn');
      if (!btn) return;
      // Keep the browser from falling through to the broken implementation.
      // The existing modal/flow can still be reached after our sanitized form is in place.
    }, true);
  }

  function patchViewTriggers() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('button, a, .wallet-action, .drawer-menu-item, .chip, .action');
      if (!trigger) return;

      const text = (trigger.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();

      if (text === 'vip' || text.includes('upgrade to vip')) {
        e.preventDefault();
        e.stopPropagation();
        clickView('invest');
        closeDrawer();
        window.setTimeout(() => {
          const vipPlan = document.getElementById('vipPlanCard');
          if (vipPlan && vipPlan.scrollIntoView) vipPlan.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
        return;
      }

      if (text.includes('my investments') || text.includes('investment history')) {
        e.preventDefault();
        e.stopPropagation();
        clickView('invest');
        return;
      }

      if (text === 'deposit' || text.includes('deposit funds') || text.includes('add funds')) {
        e.preventDefault();
        e.stopPropagation();
        openModal('depositModal');
        return;
      }

      if (text === 'withdraw' || text.includes('cash out')) {
        e.preventDefault();
        e.stopPropagation();
        clickView('withdraw');
        return;
      }

      if (text === 'transfer' || text.includes('send money')) {
        e.preventDefault();
        e.stopPropagation();
        openModal('transferModal');
        return;
      }

      if (text === 'history' || text.includes('view all')) {
        if (text.includes('view all') || text === 'history') {
          e.preventDefault();
          e.stopPropagation();
          openModal('transactionModal');
          return;
        }
      }

      if (text === 'cards' || text.includes('manage cards') || text.includes('card management')) {
        e.preventDefault();
        e.stopPropagation();
        openModal('cardModal');
        return;
      }

      if (text === 'community') {
        e.preventDefault();
        e.stopPropagation();
        clickView('community');
        return;
      }
    }, true);
  }

  function patchNotificationsVisuals() {
    const closeBtn = document.getElementById('closeNotificationsModalBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
          badge.textContent = '0';
          badge.style.display = 'none';
        }
      }, true);
    }
  }

  function patchDrawerProfileCleanup() {
    const closeBtn = document.getElementById('drawerCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeDrawer, true);
    }
    const overlay = document.getElementById('drawerOverlay');
    if (overlay) {
      overlay.addEventListener('click', closeDrawer, true);
    }
  }

  ready(() => {
    insertStyle();
    ensureCommunityModal();
    patchVIP();
    patchWalletActions();
    patchNotificationBell();
    patchLogout();
    patchCommunityComposer();
    patchWithdrawForm();
    patchViewTriggers();
    patchNotificationsVisuals();
    patchDrawerProfileCleanup();

    // Make sure community input is usable even if the current build left it as plain text.
    normalizeCommunityInput();

    // Keep the badge visually sane on load if the app starts with stale state.
    const badge = document.getElementById('notificationBadge');
    if (badge && badge.textContent.trim() === '') {
      badge.textContent = '0';
    }
  });

  window.TradePulseFixes = {
    version: '1.0.0',
    app: APP_NAME
  };
})();
