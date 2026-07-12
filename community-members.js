// ===== Trade Pulse AI – Community Members Panel (FINAL) =====
(function() {
  // Moderator names – confirmed
  const MODERATOR_NAMES = [
    'Jeraldine Blackwell',
    'Philippe Obladen',
    'Samantha Kelly',
    'Tajuanza S.'
  ];

  const MODERATOR_AVATARS = {
    'Jeraldine Blackwell': 'assets/avatars/jeraldine_blackwell.jpg',
    'Philippe Obladen': 'assets/avatars/philippe_obladen.jpg',
    'Samantha Kelly': 'assets/avatars/samantha_kelly.jpg',
    'Tajuanza S.': 'assets/avatars/tajuanza_s_.jpg'
  };

  // Admin data (hardcoded – matches your admin persona)
  const ADMIN = {
    name: 'Aditya Renash',
    avatar: 'assets/avatars/aditya_renash.jpg',
    initials: 'AR'
  };

  /* ---------- HELPERS ---------- */
  function cleanName(name) {
    return name.replace(/[^a-zA-Z\s]/g, '').trim();
  }

  function getModerators() {
    return MODERATOR_NAMES.map(name => {
      const avatar = MODERATOR_AVATARS[name] || '';
      const initials = cleanName(name).split(' ').map(n => n[0]).join('').toUpperCase();
      return { name, avatar, initials, isFallback: false };
    });
  }

  function getRandomJoinDate() {
    const days = Math.floor(Math.random() * 30) + 1;
    if (days === 1) return 'Joined 1 day ago';
    if (days === 7) return 'Joined 1 week ago';
    if (days === 14) return 'Joined 2 weeks ago';
    if (days === 21) return 'Joined 3 weeks ago';
    return `Joined ${days} days ago`;
  }

  function getRandomStatus() {
    const r = Math.random();
    if (r < 0.35) return { text: 'Online',  color: '#22c55e' };
    if (r < 0.65) return { text: 'Away',    color: '#f59e0b' };
    return { text: 'Offline', color: '#6b7280' };
  }

  function buildMemberRow(persona, joinDate, status, isNewMember, extraBadge = '') {
    const initials = persona.initials || cleanName(persona.name).split(' ').map(n => n[0]).join('').toUpperCase();
    let avatarHtml;
    if (persona.isFallback || !persona.avatar) {
      avatarHtml = `<div class="sidebar-member-avatar" style="background:rgba(168,85,247,.18)">${initials}</div>`;
    } else {
      avatarHtml = `<img src="${persona.avatar}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><div class="sidebar-member-avatar" style="display:none;background:rgba(168,85,247,.18)">${initials}</div>`;
    }

    const newBadge = isNewMember ? ' <span style="font-size:10px;background:rgba(34,197,94,.15);color:#4ade80;padding:1px 6px;border-radius:999px;">New</span>' : '';

    return `
      <div class="sidebar-member-row" style="padding:12px 14px;" data-member-name="${persona.name}">
        ${avatarHtml}
        <div style="flex:1;min-width:0;">
          <div class="sidebar-member-name">${persona.name}${newBadge}${extraBadge}</div>
          <div style="font-size:11px;color:#6b7280;">${joinDate}</div>
        </div>
        <span class="member-status" style="font-size:11px;display:flex;align-items:center;gap:4px;color:${status.color};">
          <span class="status-dot" style="width:8px;height:8px;border-radius:50%;background:${status.color};display:inline-block;"></span> ${status.text}
        </span>
      </div>`;
  }

  /* ---------- PANEL BUILD ---------- */
  function buildMembersContent() {
    const personas = window.personaNames || [];
    // Exclude admin and moderators from recent joiners
    const excludeNames = ['Aditya Renash', ...MODERATOR_NAMES];
    const nonAdmin = personas.filter(p => !p.admin && !excludeNames.includes(p.name));
    const shuffled = [...nonAdmin].sort(() => Math.random() - 0.5);
    const recentJoiners = shuffled.slice(0, 60);
    const moderators = getModerators();

    let html = `
      <div class="section" style="margin-top:0; padding-bottom:120px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
          <button id="membersBackBtn" style="background:none; border:none; color:#c084fc; cursor:pointer; padding:4px; display:flex; align-items:center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
          </button>
          <div style="font-size:18px; font-weight:700; color:#fff;">Community Members</div>
          <div style="width:20px;"></div>
        </div>
        <div style="font-size:13px; color:#9ca3af; margin-bottom:12px;">12,586+ members · 4 moderators</div>

        <!-- Admin -->
        <div class="section-header"><div class="section-title">Admin</div></div>
        <div class="panel" style="padding:0; overflow:hidden;">
          ${buildMemberRow(
            { name: ADMIN.name, avatar: ADMIN.avatar, initials: ADMIN.initials, isFallback: false },
            'Founder · Since 2024',
            { text: 'Online', color: '#22c55e' },
            false,
            ' <span style="font-size:10px;background:rgba(245,158,11,.15);color:#f59e0b;padding:1px 6px;border-radius:999px;">Admin</span>'
          )}
        </div>

        <!-- Moderators -->
        <div class="section-header" style="margin-top:20px;"><div class="section-title">Moderators</div></div>
        <div class="panel" style="padding:0; overflow:hidden;">
          ${moderators.map(m => {
            const initials = m.initials;
            const avatarHtml = `<img src="${m.avatar}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><div class="sidebar-member-avatar" style="display:none;background:rgba(245,158,11,.18)">${initials}</div>`;
            return `
              <div class="sidebar-member-row" style="padding:12px 14px;">
                ${avatarHtml}
                <span class="sidebar-member-name" style="font-weight:600;">${m.name}</span>
                <span style="margin-left:auto; font-size:11px; display:flex; align-items:center; gap:4px; color:#22c55e;">
                  <span style="width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block;"></span> Online
                </span>
              </div>`;
          }).join('')}
        </div>

        <!-- Recent Joiners -->
        <div class="section-header" style="margin-top:20px;"><div class="section-title">Recent Joiners</div></div>
        <div class="panel" style="padding:0; overflow-y:auto; max-height:500px;" id="recentJoinersList">
          ${recentJoiners.map(p => {
            const status = getRandomStatus();
            const joinDate = getRandomJoinDate();
            const isNew = Math.random() < 0.2;
            return buildMemberRow(p, joinDate, status, isNew);
          }).join('')}
        </div>

        <!-- Locked older members -->
        <div style="text-align:center; padding:20px 0; margin-top:12px; border-top:1px solid rgba(255,255,255,.06);">
          <div style="display:inline-flex; align-items:center; gap:6px; color:#6b7280; font-size:13px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><circle cx="12" cy="8" r="4"/></svg>
            12,586+ older members
          </div>
          <div style="font-size:11px; color:#4b5563; margin-top:4px;">Scroll to see more</div>
        </div>
      </div>
    `;

    const panel = document.getElementById('communityMembersPanel');
    if (panel) panel.innerHTML = html;

    document.getElementById('membersBackBtn')?.addEventListener('click', hideMembersPanel);
  }

  /* ---------- SHOW / HIDE ---------- */
  function showMembersPanel() {
    const chatLayout = document.getElementById('communityChatLayout');
    const winsContent = document.getElementById('winsProofsContent');
    const announcements = document.getElementById('announcementsContent');
    const helpDesk = document.getElementById('helpDeskContent');
    const pinned = document.querySelector('.community-pinned');
    const inputBar = document.getElementById('communityInputBar');

    if (chatLayout) chatLayout.style.display = 'none';
    if (winsContent) winsContent.style.display = 'none';
    if (announcements) announcements.style.display = 'none';
    if (helpDesk) helpDesk.style.display = 'none';
    if (pinned) pinned.style.display = 'none';
    if (inputBar) inputBar.style.display = 'none';

    const panel = document.getElementById('communityMembersPanel');
    if (panel) panel.style.display = 'block';
  }

  function hideMembersPanel() {
    const panel = document.getElementById('communityMembersPanel');
    if (panel) panel.style.display = 'none';

    if (typeof window.switchToGeneralChat === 'function') {
      window.switchToGeneralChat();
    }
  }

  /* ---------- LIVE STATUS UPDATES ---------- */
  function startStatusUpdates() {
    setInterval(() => {
      const panel = document.getElementById('communityMembersPanel');
      if (!panel || panel.style.display === 'none') return;

      const rows = panel.querySelectorAll('.sidebar-member-row[data-member-name]');
      rows.forEach(row => {
        const statusSpan = row.querySelector('.member-status');
        if (!statusSpan) return;
        const newStatus = getRandomStatus();
        const dot = statusSpan.querySelector('.status-dot');
        if (dot) dot.style.background = newStatus.color;
        statusSpan.style.color = newStatus.color;
        statusSpan.innerHTML = `<span class="status-dot" style="width:8px;height:8px;border-radius:50%;background:${newStatus.color};display:inline-block;"></span> ${newStatus.text}`;
      });
    }, 15000);
  }

  /* ---------- INIT ---------- */
  function createPanel() {
    if (document.getElementById('communityMembersPanel')) return;

    const panel = document.createElement('div');
    panel.id = 'communityMembersPanel';
    panel.style.display = 'none';
    const communityView = document.getElementById('communityView');
    if (communityView) {
      communityView.appendChild(panel);
      buildMembersContent();
    }
  }

  function init() {
    createPanel();
    startStatusUpdates();

    const membersCard = document.querySelector('.community-quick-ico.amber')?.closest('.community-quick-card');
    if (membersCard) {
      membersCard.addEventListener('click', showMembersPanel);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
