// ==================== COMMUNITY.JS ====================
(function() {
  const personaNames = [
    { name: "CryptoQueen", vip: 2 }, { name: "TradeMaster", vip: 3 }, { name: "Ngozi Wealth", vip: 0, admin: true }, { name: "Ola Ade", vip: 0 },
    { name: "Bola King", vip: 1 }, { name: "Emeka Lagos", vip: 0 }, { name: "Amina Abuja", vip: 2 }, { name: "Fatima Kano", vip: 0 },
    { name: "David O", vip: 0 }, { name: "Grace B", vip: 1 }, { name: "Samuel T", vip: 0 }, { name: "Blessing C", vip: 2 },
    { name: "John Doe", vip: 0 }, { name: "Jane Smith", vip: 0 }, { name: "Michael P", vip: 1 }, { name: "Sandra J", vip: 0 },
    { name: "Kemi Afolabi", vip: 3 }, { name: "Yusuf Alabi", vip: 0 }, { name: "Chiamaka Okafor", vip: 0 }, { name: "Ibrahim Musa", vip: 1 },
    { name: "Nkechi Eze", vip: 0 }, { name: "Obinna Okonkwo", vip: 2 }, { name: "Zainab Usman", vip: 0 }, { name: "Chukwudi Obi", vip: 0 },
    { name: "Aisha Bello", vip: 0 }, { name: "Tunde Bakare", vip: 1 }, { name: "Bimbo Adeyemi", vip: 0 }, { name: "Lola Sholola", vip: 0 },
    { name: "Segun Arinze", vip: 2 }, { name: "Funke Akindele", vip: 0 }, { name: "Rita Dominic", vip: 1 }, { name: "Genevieve Nnaji", vip: 3 },
    { name: "Wale Adenuga", vip: 0 }, { name: "Adaobi Okeke", vip: 0 }, { name: "Chinedu Obi", vip: 1 }, { name: "Nnenna Eze", vip: 0 },
    { name: "Chuka Okafor", vip: 0 }, { name: "Yetunde Bakare", vip: 2 }, { name: "Musa Ibrahim", vip: 0 }, { name: "Adeola Adeyemi", vip: 0 },
    { name: "Tolu Adebayo", vip: 1 }, { name: "Bolanle Ogun", vip: 0 }, { name: "Seyi Makinde", vip: 0 }, { name: "Ronke Ojo", vip: 0 },
    { name: "Jide Kosoko", vip: 2 }, { name: "RMD", vip: 1 }, { name: "Patience Ozokwor", vip: 3 }, { name: "Pete Edochie", vip: 1 },
    { name: "Kanayo O. Kanayo", vip: 0 }, { name: "Ini Edo", vip: 0 }, { name: "Ruth Kadiri", vip: 2 }, { name: "Mercy Johnson", vip: 1 },
    { name: "Yul Edochie", vip: 0 }, { name: "Chika Ike", vip: 0 }, { name: "Mike Ezuruonye", vip: 0 }, { name: "Uche Jombo", vip: 1 },
    { name: "Omotola Jalade", vip: 3 }, { name: "Bimbo Thomas", vip: 0 }, { name: "Ireti Doyle", vip: 2 }, { name: "Dakore Egbuson", vip: 0 },
    { name: "Toni Tones", vip: 0 }, { name: "Sharon Ooja", vip: 1 }, { name: "Bisola Aiyeola", vip: 0 }, { name: "Efe Irele", vip: 0 },
    { name: "Timini Egbuson", vip: 2 }, { name: "Bella Shmurda", vip: 0 }, { name: "Rema", vip: 1 }, { name: "Fireboy DML", vip: 0 },
    { name: "Asake", vip: 0 }, { name: "Davido", vip: 3 }, { name: "Wizkid", vip: 2 }, { name: "Burna Boy", vip: 1 },
    { name: "Zlatan", vip: 0 }, { name: "Naira Marley", vip: 0 }, { name: "Seyi Vibez", vip: 0 }, { name: "Omah Lay", vip: 1 },
    { name: "Tems", vip: 0 }, { name: "Ayra Starr", vip: 2 }, { name: "Ckay", vip: 0 }, { name: "Ruger", vip: 0 },
    { name: "Joeboy", vip: 1 }, { name: "Buju", vip: 0 }, { name: "Pheelz", vip: 0 }, { name: "Olamide", vip: 3 },
    { name: "Phyno", vip: 0 }, { name: "Flavour", vip: 1 }, { name: "Kizz Daniel", vip: 2 }, { name: "Adekunle Gold", vip: 0 },
    { name: "Simi", vip: 0 }, { name: "Tiwa Savage", vip: 3 }, { name: "Yemi Alade", vip: 1 }, { name: "Falz", vip: 0 },
    { name: "Vector", vip: 0 }, { name: "MI Abaga", vip: 2 }, { name: "Ice Prince", vip: 0 }, { name: "Jesse Jagz", vip: 0 },
    { name: "Banky W", vip: 1 }, { name: "Waje", vip: 0 }, { name: "Chidinma", vip: 0 }, { name: "Praiz", vip: 0 },
    { name: "Iyanya", vip: 2 }, { name: "Tekno", vip: 0 }, { name: "Mr Eazi", vip: 1 }, { name: "Runtown", vip: 0 },
    { name: "Timaya", vip: 0 }, { name: "Patoranking", vip: 1 }, { name: "Duncan Mighty", vip: 0 }, { name: "R2Bees", vip: 0 },
    { name: "Sarkodie", vip: 2 }, { name: "Stonebwoy", vip: 0 }, { name: "Shatta Wale", vip: 1 }, { name: "Kuami Eugene", vip: 0 },
    { name: "KiDi", vip: 0 }, { name: "King Promise", vip: 0 }, { name: "M.anifest", vip: 1 }, { name: "Efya", vip: 0 },
    { name: "MzVee", vip: 0 }, { name: "Becca", vip: 2 }, { name: "Wendy Shay", vip: 0 }, { name: "Adina", vip: 0 },
    { name: "Cina Soul", vip: 1 }, { name: "Darkovibes", vip: 0 }, { name: "La Meme Gang", vip: 0 }, { name: "Ground Up", vip: 0 },
    { name: "Super Jazz Club", vip: 0 }, { name: "B4bonah", vip: 0 }, { name: "Akan", vip: 1 }, { name: "Kofi Mole", vip: 0 },
    { name: "Kwesi Arthur", vip: 0 }, { name: "Medikal", vip: 0 }, { name: "Strongman", vip: 0 }, { name: "Fameye", vip: 1 },
    { name: "Kweku Darlington", vip: 0 }, { name: "Yaw Tog", vip: 0 }, { name: "Kofi Jamar", vip: 0 }, { name: "Reggie Rockstone", vip: 3 },
    { name: "Obrafour", vip: 1 }, { name: "Tinny", vip: 0 }, { name: "VIP", vip: 2 }, { name: "4x4", vip: 0 },
    { name: "Buk Bak", vip: 0 }, { name: "Tic Tac", vip: 0 }, { name: "Joe Mettle", vip: 0 }, { name: "Diana Hamilton", vip: 2 },
    { name: "Ohemaa Mercy", vip: 0 }, { name: "Celestine Donkor", vip: 1 }, { name: "Akesse Brempong", vip: 0 },
    { name: "MOG Music", vip: 0 }, { name: "Eben", vip: 1 }, { name: "Frank Edwards", vip: 0 }, { name: "Sinach", vip: 3 }
  ];

  const chatColumn = document.getElementById('communityChatColumn');
  if(!chatColumn) return;

  function randomInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
  function getRandomPersona(){ return personaNames[randomInt(0,personaNames.length-1)]; }
  function formatTime(){ const now=new Date(); const hours=now.getHours(); const minutes=now.getMinutes().toString().padStart(2,'0'); return `${hours%12||12}:${minutes} ${hours>=12?'PM':'AM'}`; }

  function createChatCard(persona, message, isProof=false, proofAmount=0){
    const initials=persona.name.split(' ').map(n=>n[0]).join('').toUpperCase();
    const badgeHtml=persona.admin?'<span class="chat-msg-badge badge-admin">Admin</span>':(persona.vip>0?`<span class="chat-msg-badge badge-vip">VIP ${persona.vip}</span>`:'');
    let proofHtml='';
    if(isProof && proofAmount>0){
      const bank=['GTBank','Access Bank','First Bank','UBA','Zenith Bank'][randomInt(0,4)];
      proofHtml=`<div class="chat-proof-card"><div class="chat-proof-top"><div class="chat-proof-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 13 4 4L19 7"/></svg></div><div class="chat-proof-title">Withdrawal Successful</div></div><div class="chat-proof-amount">₦ ${proofAmount.toLocaleString()}.00</div><div class="chat-proof-sub">To ${bank} • ${new Date().toLocaleDateString()}</div></div>`;
    }
    return `<div class="community-chat-card"><div class="chat-msg-top"><div class="chat-msg-avatar" style="background:${persona.admin?'rgba(245,158,11,.22)':'rgba(168,85,247,.22)'}">${initials}</div><div><div class="chat-msg-name">${persona.name} ${badgeHtml}</div><div style="font-size:11px;color:#6b7280;">Just now</div></div></div><div class="chat-msg-body">${message}</div>${proofHtml}<div class="chat-reactions"><div class="chat-reaction">👍 ${randomInt(5,99)}</div><div class="chat-reaction">❤️ ${randomInt(2,50)}</div>${randomInt(0,1)?'<div class="chat-reaction">🔥 '+randomInt(1,30)+'</div>':''}${randomInt(0,1)?'<div class="chat-reaction">🚀 '+randomInt(1,20)+'</div>':''}</div><div class="chat-msg-time">${formatTime()}</div></div>`;
  }

  const messageTemplates=[
    (p) => `Just received another payout! This platform never disappoints. Keep investing and stay consistent! 🚀`,
    (p) => `I started with ₦5,000 and now look at my balance growing daily. Consistency is key!`,
    (p) => `Wow! Just got my withdrawal in minutes. This is the best investment platform ever! 💯`,
    (p) => `For new members: start with the Beginner Plan, reinvest profits, and scale up gradually.`,
    (p) => `Anyone else feeling bullish today? The market is looking great! 📈`,
    (p) => `Just upgraded to ${p.vip>=2?'VIP '+p.vip:'Standard Plan'} and the profits are amazing!`,
    (p) => `Happy Friday everyone! Keep pushing, keep earning. 💪`,
    (p) => `Thanks to the admin for the quick support. You guys rock! 🎉`,
    (p) => `Another day, another profit. Who else is cashing out today? 💸`,
    (p) => `I referred my cousin and got my bonus instantly. This referral program is lit! 🔥`,
    (p) => `Just hit ₦500,000 in total profits! Hard work and patience pays off. 🙏`,
    (p) => `Can't believe how fast the withdrawals are. Just received in under 5 minutes.`,
    (p) => `Best decision I made this year was joining this community. 💰`,
    (p) => `Good morning fam! May today bring us massive profits. 🌅`,
    (p) => `If you're still doubting, just take the first step. You won't regret it.`,
    (p) => `Who's ready for the weekend? Let's finish strong! 🚀`,
    (p) => `I see a lot of new members. Welcome aboard! Let's grow together.`,
    (p) => `Just reinvested ₦100,000. Watch me hit ₦1M soon! 😎`,
    (p) => `Consistency is the secret. Don't give up!`,
    (p) => `Can we get some fire emojis for the team? 🔥🔥🔥`,
    (p) => `My account just got upgraded automatically. VIP perks are awesome!`,
    (p) => `Friday payouts are the best! Who else got paid today?`,
    (p) => `Shoutout to the admin team. You guys are the real MVPs.`,
    (p) => `Never seen a platform this transparent. Every penny accounted for.`,
    (p) => `Just hit my first ₦50,000 profit. Feeling grateful! 🥳`,
    (p) => `To the newbies: stay consistent and you'll see results. Trust the process.`
  ];

  function getRandomMessage(persona){ return messageTemplates[randomInt(0,messageTemplates.length-1)](persona); }

  function addRandomChatMessage(){
    const persona=getRandomPersona();
    const isProof=Math.random()<0.3 && persona.vip>=1;
    const proofAmount=isProof?randomInt(10000,500000):0;
    const cardHtml=createChatCard(persona, getRandomMessage(persona), isProof, proofAmount);
    chatColumn.insertAdjacentHTML('afterbegin', cardHtml);
    while(chatColumn.children.length>50){ chatColumn.removeChild(chatColumn.lastChild); }
  }

  function updateOnlineMembers(){
    const onlineCount=randomInt(800,1800);
    const elOnline = document.getElementById('onlineCount');
    const elSidebar = document.getElementById('sidebarOnlineCount');
    const elStat = document.getElementById('onlineStatCount');
    if(elOnline) elOnline.textContent = `${onlineCount.toLocaleString()} Online`;
    if(elSidebar) elSidebar.textContent = onlineCount.toLocaleString();
    if(elStat) elStat.textContent = onlineCount.toLocaleString();
    const numVisible=randomInt(4,8);
    const shuffled=[...personaNames].sort(()=>0.5-Math.random());
    const onlinePersonas=shuffled.slice(0,numVisible);
    const sidebarEl = document.getElementById('sidebarOnlineMembers');
    if(sidebarEl) {
      sidebarEl.innerHTML = onlinePersonas.map(p=>{
        const initials=p.name.split(' ').map(n=>n[0]).join('').toUpperCase();
        const badgeHtml=p.admin?'<span class="chat-msg-badge badge-admin">Admin</span>':(p.vip>0?`<span class="chat-msg-badge badge-vip">VIP ${p.vip}</span>`:'');
        return `<div class="sidebar-member-row"><div class="sidebar-member-avatar" style="background:${p.admin?'rgba(245,158,11,.18)':'rgba(168,85,247,.18)'}">${initials}</div><span class="sidebar-member-name">${p.name} ${badgeHtml}</span></div>`;
      }).join('');
    }
  }

  function updateLiveWithdrawals(){
    const container = document.getElementById('liveWithdrawalsFeed');
    if(!container) return;
    const withdrawals=[];
    for(let i=0;i<3;i++){
      const persona=getRandomPersona();
      const amount=randomInt(5000,200000);
      const method=['Bank Transfer','USDT (TRC20)','Opay','E-Wallet'][randomInt(0,3)];
      const time=`${randomInt(1,59)} mins ago`;
      withdrawals.push({ persona, amount, method, time });
    }
    container.innerHTML = withdrawals.map(w=>`
      <div class="live-withdrawal-row"><div class="live-wd-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 13 4 4L19 7"/></svg></div><div class="live-wd-info"><div class="live-wd-name">${w.persona.name}</div><div class="live-wd-loc">${w.method}</div></div><div><div class="live-wd-amount">₦${w.amount.toLocaleString()}</div><div class="live-wd-time">${w.time}</div></div></div>`).join('');
  }

  function showTabContent(tab) {
    chatColumn.innerHTML = '';
    switch(tab) {
      case 'general':
        for(let i=0;i<5;i++) addRandomChatMessage();
        break;
      case 'announcements':
        chatColumn.innerHTML = `
          <div class="community-chat-card"><div class="chat-msg-top"><div class="chat-msg-avatar" style="background:rgba(245,158,11,.22)">AD</div><div><div class="chat-msg-name">Admin <span class="chat-msg-badge badge-admin">Admin</span></div><div style="font-size:11px;color:#6b7280;">Pinned</div></div></div><div class="chat-msg-body">🚀 New VIP Plan launched! Enjoy 6% daily profit for a limited time.</div></div>
          <div class="community-chat-card"><div class="chat-msg-top"><div class="chat-msg-avatar" style="background:rgba(245,158,11,.22)">AD</div><div><div class="chat-msg-name">Admin <span class="chat-msg-badge badge-admin">Admin</span></div><div style="font-size:11px;color:#6b7280;">Pinned</div></div></div><div class="chat-msg-body">📢 Referral bonus increased to 5%! Invite friends and earn more.</div></div>
          <div class="community-chat-card"><div class="chat-msg-top"><div class="chat-msg-avatar" style="background:rgba(245,158,11,.22)">AD</div><div><div class="chat-msg-name">Admin <span class="chat-msg-badge badge-admin">Admin</span></div><div style="font-size:11px;color:#6b7280;">Pinned</div></div></div><div class="chat-msg-body">⚠️ Please only use official payment methods. Stay safe!</div></div>
        `;
        break;
      case 'withdrawals':
        updateLiveWithdrawals();
        break;
      case 'members':
        chatColumn.innerHTML = '<div class="community-sidebar-card"><div class="sidebar-card-title">All Members</div>' + personaNames.map(p => {
          const initials = p.name.split(' ').map(n=>n[0]).join('').toUpperCase();
          const badge = p.admin?'<span class="chat-msg-badge badge-admin">Admin</span>':(p.vip>0?`<span class="chat-msg-badge badge-vip">VIP ${p.vip}</span>`:'');
          return `<div class="sidebar-member-row"><div class="sidebar-member-avatar" style="background:${p.admin?'rgba(245,158,11,.18)':'rgba(168,85,247,.18)'}">${initials}</div><span class="sidebar-member-name">${p.name} ${badge}</span></div>`;
        }).join('') + '</div>';
        break;
      case 'wins':
        for(let i=0;i<4;i++){
          const persona = getRandomPersona();
          const amount = randomInt(10000,500000);
          chatColumn.insertAdjacentHTML('afterbegin', createChatCard(persona, getRandomMessage(persona), true, amount));
        }
        break;
      case 'market':
        chatColumn.innerHTML = `
          <div class="community-chat-card"><div class="chat-msg-body">📈 BTC/USDT is up 3.2% today. Bullish momentum building.</div></div>
          <div class="community-chat-card"><div class="chat-msg-body">📊 Naira stable at ₦1,500/$ in parallel market.</div></div>
          <div class="community-chat-card"><div class="chat-msg-body">🔥 Ethereum gas fees at historic lows – great time to transact.</div></div>
        `;
        break;
      case 'help':
        chatColumn.innerHTML = `
          <div class="community-chat-card"><div class="chat-msg-body">🎧 24/7 Support: support@trading-platform.com</div></div>
          <div class="community-chat-card"><div class="chat-msg-body">📞 Call: +234 800 123 4567</div></div>
          <div class="community-chat-card"><div class="chat-msg-body">💬 Live chat available in the Help Desk section.</div></div>
        `;
        break;
    }
  }

  // Tab switching
  const tabs = document.querySelectorAll('.community-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabText = tab.textContent.trim().toLowerCase();
      if(tabText.includes('general')) showTabContent('general');
      else if(tabText.includes('announcement')) showTabContent('announcements');
      else if(tabText.includes('withdrawal')) showTabContent('withdrawals');
      else if(tabText.includes('member')) showTabContent('members');
      else if(tabText.includes('wins') || tabText.includes('proof')) showTabContent('wins');
      else if(tabText.includes('market')) showTabContent('market');
      else if(tabText.includes('help')) showTabContent('help');
    });
  });

  function startCommunitySimulation(){
    showTabContent('general');
    updateOnlineMembers();
    updateLiveWithdrawals();
    setInterval(()=>{
      if (!document.getElementById('communityView')?.classList.contains('active')) return;
      const activeTab = document.querySelector('.community-tab.active')?.textContent.trim().toLowerCase();
      if(activeTab && activeTab.includes('general')) {
        addRandomChatMessage();
      }
      if(Math.random()<0.3){
        updateOnlineMembers();
        updateLiveWithdrawals();
      }
    },8000);
    setInterval(()=>{
      if (!document.getElementById('communityView')?.classList.contains('active')) return;
      updateOnlineMembers();
      updateLiveWithdrawals();
    },45000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', startCommunitySimulation);
  else startCommunitySimulation();
})();
