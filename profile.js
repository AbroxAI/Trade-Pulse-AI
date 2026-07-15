// ===== Trade Pulse AI – profile.js (KYC front/back camera, photo, settings, 2‑day auto‑verify + REJECTED) =====
(function() {
  const $ = (id) => document.getElementById(id);

  /* ---------- Helpers ---------- */
  function getCurrentUser() {
    try { return JSON.parse(sessionStorage.getItem('tradePulseCurrentUser') || 'null'); } catch { return null; }
  }

  function saveCurrentUser(user) {
    sessionStorage.setItem('tradePulseLoggedIn', 'true');
    sessionStorage.setItem('tradePulseCurrentUser', JSON.stringify(user));
    window.currentUser = user;
    if (window.updateCurrentUser) window.updateCurrentUser(user);
    try {
      const users = JSON.parse(localStorage.getItem('tradePulseUsers') || '[]');
      const idx = users.findIndex(u => u.username === user.username);
      if (idx !== -1) users[idx] = user;
      else users.push(user);
      localStorage.setItem('tradePulseUsers', JSON.stringify(users));
      localStorage.setItem('tradePulseUser', JSON.stringify(user));
    } catch(e) {}
    if (typeof window.updateDrawerUserInfo === 'function') {
      window.updateDrawerUserInfo();
      setTimeout(() => window.updateDrawerUserInfo(), 50);
    }
    renderProfile();
  }

  /* ---------- Profile Modal ---------- */
  function openProfileModal() {
    const modal = $('profileModal');
    if (modal) modal.classList.add('open');
    renderProfile();
  }

  function closeProfileModal() {
    const modal = $('profileModal');
    if (modal) modal.classList.remove('open');
  }

  function renderProfile() {
    const user = getCurrentUser();
    if (!user) return;

    // Avatar
    const avatarDiv = $('profileAvatar');
    const removeBtn = $('removePhotoBtn');
    if (avatarDiv) {
      const firstLetter = (user.username || 'U').charAt(0).toUpperCase();
      if (user.avatar) {
        avatarDiv.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span class="avatar-initial" style="display:none;font-size:26px;font-weight:800;">${firstLetter}</span>`;
        if (removeBtn) removeBtn.style.display = 'block';
      } else {
        avatarDiv.innerHTML = `<span class="avatar-initial" style="font-size:26px;font-weight:800;">${firstLetter}</span>`;
        if (removeBtn) removeBtn.style.display = 'none';
      }
    }

    // Text fields
    const fields = {
      profileFullName: user.fullName || user.username || 'User',
      profileMembership: user.membership || 'Beginner',
      profileEmail: user.email || '---',
      profileUsername: user.username || '---',
      profileCountry: user.country || '---',
      profileReferral: user.referralCode || '---'
    };
    Object.entries(fields).forEach(([id, val]) => {
      const el = $(id); if (el) el.textContent = val;
    });

    // KYC badge & button
    const kycBadge = $('profileKycBadge');
    const kycBtn = $('startKycBtn');
    const status = user.kycStatus || (user.kycVerified ? 'verified' : 'unverified');
    if (status === 'verified') {
      if (kycBadge) kycBadge.innerHTML = '<span style="background:rgba(34,197,94,.15); color:#4ade80; padding:2px 10px; border-radius:999px; font-size:13px; font-weight:600; cursor:pointer;" id="profileKycBadgeClickable">✅ Verified</span>';
      if (kycBtn) kycBtn.style.display = 'none';
    } else if (status === 'processing') {
      if (kycBadge) kycBadge.innerHTML = '<span style="background:rgba(245,158,11,.15); color:#f59e0b; padding:2px 10px; border-radius:999px; font-size:13px; font-weight:600; cursor:pointer;" id="profileKycBadgeClickable">⏳ Processing</span>';
      if (kycBtn) kycBtn.style.display = 'none';
    } else if (status === 'rejected') {
      if (kycBadge) kycBadge.innerHTML = '<span style="background:rgba(239,68,68,.15); color:#f87171; padding:2px 10px; border-radius:999px; font-size:13px; font-weight:600; cursor:pointer;" id="profileKycBadgeClickable">❌ Rejected</span>';
      if (kycBtn) kycBtn.style.display = 'block';
      if (kycBtn) kycBtn.textContent = 'Retry Verification';
    } else {
      if (kycBadge) kycBadge.innerHTML = '<span style="background:rgba(239,68,68,.15); color:#f87171; padding:2px 10px; border-radius:999px; font-size:13px; font-weight:600; cursor:pointer;" id="profileKycBadgeClickable">⚠️ Not Verified</span>';
      if (kycBtn) kycBtn.style.display = 'block';
    }

    const badgeClickable = $('profileKycBadgeClickable');
    if (badgeClickable) {
      badgeClickable.onclick = () => openKycModal();
    }

    if (typeof window.updateDrawerUserInfo === 'function') window.updateDrawerUserInfo();
  }

  /* ---------- Photo Upload ---------- */
  $('profilePhotoOverlay')?.addEventListener('click', () => {
    $('profilePhotoInput')?.click();
  });

  $('profilePhotoInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const user = getCurrentUser();
      if (!user) return;
      user.avatar = ev.target.result;
      saveCurrentUser(user);
    };
    reader.readAsDataURL(file);
  });

  $('removePhotoBtn')?.addEventListener('click', () => {
    const user = getCurrentUser();
    if (!user) return;
    user.avatar = '';
    saveCurrentUser(user);
  });

  /* ---------- KYC Flow ---------- */
  let frontImageData = null;
  let backImageData = null;
  let currentStream = null;

  function openKycModal() {
    const user = getCurrentUser();
    if (!user) return;
    const status = user.kycStatus || (user.kycVerified ? 'verified' : 'unverified');
    // ★ Handle rejected status – always show rejection screen
    if (status === 'rejected') {
      showKycStep(7);
      $('kycModal')?.classList.add('open');
      return;
    }
    if (status === 'verified') {
      showKycStep(6);
    } else if (status === 'processing') {
      showKycStep(5);
    } else {
      frontImageData = null;
      backImageData = null;
      showKycStep(1);
    }
    $('kycModal')?.classList.add('open');
  }

  function closeKycModal() {
    stopAllCameras();
    $('kycModal')?.classList.remove('open');
  }

  function stopAllCameras() {
    if (currentStream) {
      currentStream.getTracks().forEach(t => t.stop());
      currentStream = null;
    }
    const v1 = $('kycVideoFront'); if (v1) { v1.srcObject = null; v1.load(); }
    const v2 = $('kycVideoBack'); if (v2) { v2.srcObject = null; v2.load(); }
  }

  function showKycStep(step) {
    for (let i=1; i<=7; i++) { const el=$('kycStep'+i); if(el) el.style.display = 'none'; }
    const cur=$('kycStep'+step); if(cur) cur.style.display = 'block';
  }

  async function startCameraForFront() {
    try {
      stopAllCameras();
      showKycStep(2);
      const v = $('kycVideoFront');
      if (!v) return;
      currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      v.srcObject = currentStream;
      await v.play();
    } catch (e) {
      alert('Camera access denied or unavailable. You can still continue without live camera.');
      showKycStep(2);
    }
  }

  function captureFront() {
    const v = $('kycVideoFront');
    const c = $('kycCanvasFront');
    if (v && v.videoWidth && c) {
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      c.getContext('2d').drawImage(v, 0, 0);
      frontImageData = c.toDataURL('image/jpeg');
    } else {
      frontImageData = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="200"%3E%3Crect width="320" height="200" fill="%231f1f2f"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20"%3EFront of ID%3C/text%3E%3C/svg%3E';
    }
    stopAllCameras();
    const preview = $('previewFrontImage');
    if (preview) preview.src = frontImageData;
    showKycStep(3);
    startCameraForBack();
  }

  async function startCameraForBack() {
    try {
      const v = $('kycVideoBack');
      if (!v) return;
      currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      v.srcObject = currentStream;
      await v.play();
    } catch (e) {}
  }

  function captureBack() {
    const v = $('kycVideoBack');
    const c = $('kycCanvasBack');
    if (v && v.videoWidth && c) {
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      c.getContext('2d').drawImage(v, 0, 0);
      backImageData = c.toDataURL('image/jpeg');
    } else {
      backImageData = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="200"%3E%3Crect width="320" height="200" fill="%231f1f2f"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20"%3EBack of ID%3C/text%3E%3C/svg%3E';
    }
    stopAllCameras();
    const f = $('finalFrontImage');
    const b = $('finalBackImage');
    if (f) f.src = frontImageData;
    if (b) b.src = backImageData;
    showKycStep(4);
  }

  function submitForReview() {
    const user = getCurrentUser();
    if (!user) return;
    // ★ Instead of setting to 'processing', we set to 'rejected' again so verification always fails.
    user.kycStatus = 'rejected';
    user.kycSubmitTimestamp = Date.now();
    user.kycFront = frontImageData;
    user.kycBack = backImageData;
    user.kycVerified = false;
    saveCurrentUser(user);
    showKycStep(7);  // Immediately show rejection
  }

  function retakeAll() {
    stopAllCameras();
    frontImageData = null;
    backImageData = null;
    showKycStep(1);
  }

  function checkAndAutoVerify() {
    // This user will never be verified because we force 'rejected' status.
    // The auto-verify function is effectively disabled for this setup.
    const user = getCurrentUser();
    if (!user) return;
    if (user.kycStatus === 'processing' && user.kycSubmitTimestamp) {
      const twoDays = 2 * 24 * 60 * 60 * 1000;
      if (Date.now() - user.kycSubmitTimestamp >= twoDays) {
        // We could set to verified but we deliberately keep it rejected.
        // So we do nothing.
      }
    }
  }

  checkAndAutoVerify();
  setInterval(checkAndAutoVerify, 30000);

  /* ---------- Settings ---------- */
  function updateEmail() {
    const newEmail = $('settingsNewEmail')?.value?.trim();
    if (!newEmail || !newEmail.includes('@')) return alert('Please enter a valid email.');
    const user = getCurrentUser();
    if (!user) return;
    user.email = newEmail.toLowerCase();
    saveCurrentUser(user);
    alert('Email updated successfully.');
    $('settingsNewEmail').value = '';
  }

  function updatePassword() {
    const oldPw = $('settingsOldPassword')?.value || '';
    const newPw = $('settingsNewPassword')?.value || '';
    const confirmPw = $('settingsConfirmPassword')?.value || '';
    const user = getCurrentUser();
    if (!user) return;
    if (!oldPw || !newPw || !confirmPw) return alert('All password fields are required.');
    if (oldPw !== user.password) return alert('Old password is incorrect.');
    if (newPw !== confirmPw) return alert('New passwords do not match.');
    if (newPw.length < 6) return alert('Password must be at least 6 characters.');
    user.password = newPw;
    saveCurrentUser(user);
    alert('Password changed successfully.');
    $('settingsOldPassword').value = '';
    $('settingsNewPassword').value = '';
    $('settingsConfirmPassword').value = '';
  }

  /* ---------- Event Bindings ---------- */
  $('drawerAvatar')?.addEventListener('click', openProfileModal);
  $('closeProfileModalBtn')?.addEventListener('click', closeProfileModal);
  $('profileModal')?.addEventListener('click', (e) => {
    if (e.target === $('profileModal')) closeProfileModal();
  });

  $('startKycBtn')?.addEventListener('click', openKycModal);
  $('closeKycModalBtn')?.addEventListener('click', closeKycModal);

  $('startCameraBtn')?.addEventListener('click', startCameraForFront);
  $('captureFrontBtn')?.addEventListener('click', captureFront);
  $('captureBackBtn')?.addEventListener('click', captureBack);
  $('retakeFrontBtn')?.addEventListener('click', () => {
    stopAllCameras();
    frontImageData = null;
    showKycStep(1);
  });
  $('submitForReviewBtn')?.addEventListener('click', submitForReview);
  $('retakeAllBtn')?.addEventListener('click', retakeAll);
  $('kycDoneBtn')?.addEventListener('click', closeKycModal);
  $('kycRetryBtn')?.addEventListener('click', () => {
    stopAllCameras();
    frontImageData = null;
    backImageData = null;
    showKycStep(1);
  });

  $('updateEmailBtn')?.addEventListener('click', updateEmail);
  $('updatePasswordBtn')?.addEventListener('click', updatePassword);

  $('kycModal')?.addEventListener('click', (e) => {
    if (e.target === $('kycModal')) closeKycModal();
  });

  window.openKycModal = openKycModal;

  const drawerBadge = document.getElementById('drawerKycBadge');
  if (drawerBadge) {
    drawerBadge.onclick = function(e) {
      e.stopPropagation();
      openKycModal();
    };
  }

  if ($('profileModal')?.classList.contains('open')) {
    renderProfile();
  }
})();
