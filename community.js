(function() {
  // ========== 150 PERSONAS FROM THE AI ENGINE + ADMIN ==========
  const personaData = [
    { name: "oladapo ogunsakin", gender: "men", country: "Nigeria", isFallback: false },
    { name: "narciso panganiban", gender: "men", country: "Mexico", isFallback: false },
    { name: "Elmer nunez 📉", gender: "men", country: "Mexico", isFallback: false },
    { name: "Penwell leslie", gender: "men", country: "SouthAfrica", isFallback: false },
    { name: "G.a. Scott", gender: "men", country: "US", isFallback: false },
    { name: "Cherry Reichhart", gender: "women", country: "Germany", isFallback: false },
    { name: "Flash BE", gender: "men", country: "United Kingdom", isFallback: false },
    { name: "scott jung", gender: "men", country: "US", isFallback: false },
    { name: "Dottie Ragland", gender: "women", country: "US", isFallback: false },
    { name: "Andrew Funk", gender: "men", country: "US", isFallback: false },
    { name: "Amy Jasmine", gender: "women", country: "US", isFallback: false },
    { name: "Brian Kahle", gender: "men", country: "US", isFallback: false },
    { name: "Maureen joan jefferys", gender: "women", country: "United Kingdom", isFallback: false },
    { name: "Stanley willingham jr", gender: "men", country: "US", isFallback: false },
    { name: "Frank Lowry", gender: "men", country: "US", isFallback: false },
    { name: "Micheal Shaw", gender: "men", country: "US", isFallback: false },
    { name: "Arlene paz rodriguez", gender: "women", country: "Mexico", isFallback: false },
    { name: "louis wayne", gender: "men", country: "US", isFallback: false },
    { name: "Jennifer West", gender: "women", country: "US", isFallback: false },
    { name: "Connie H. Price", gender: "women", country: "US", isFallback: false },
    { name: "ashley muse", gender: "women", country: "US", isFallback: false },
    { name: "Trovis banks 🏦💰", gender: "men", country: "US", isFallback: false },
    { name: "Carmeal Smith", gender: "men", country: "US", isFallback: false },
    { name: "Jamie Terrell", gender: "men", country: "US", isFallback: false },
    { name: "Trovao Duchness 🦊", gender: "men", country: "Brazil", isFallback: false },
    { name: "Lessie Willhite", gender: "women", country: "US", isFallback: false },
    { name: "Chiquita Tate", gender: "women", country: "US", isFallback: false },
    { name: "Eric Harris", gender: "men", country: "US", isFallback: false },
    { name: "Mona Dent", gender: "women", country: "US", isFallback: false },
    { name: "Salman Rasheed", gender: "men", country: "UAE", isFallback: false },
    { name: "Syed Ali Zohaib", gender: "men", country: "India", isFallback: false },
    { name: "Moshin Ansari", gender: "men", country: "India", isFallback: false },
    { name: "Saqib Naveed", gender: "men", country: "India", isFallback: false },
    { name: "Sergio Vega munoz 🔥", gender: "men", country: "Mexico", isFallback: false },
    { name: "frankie elric", gender: "men", country: "US", isFallback: false },
    { name: "Chris Alexander", gender: "men", country: "US", isFallback: false },
    { name: "Angel Lopez", gender: "men", country: "Mexico", isFallback: false },
    { name: "Anthony Onyinkwa", gender: "men", country: "Nigeria", isFallback: false },
    { name: "victor e keyz 🎹🎺📉", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Dereje haile", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Sym Ple", gender: "men", country: "US", isFallback: false },
    { name: "Das Haruna Fearless", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Tomas Yende", gender: "men", country: "SouthAfrica", isFallback: false },
    { name: "Stanley Ezeorjika 💰", gender: "men", country: "Nigeria", isFallback: false },
    { name: "jen lee", gender: "women", country: "US", isFallback: false },
    { name: "Nieves yazita 🌹❣️", gender: "women", country: "Mexico", isFallback: false },
    { name: "Dominic Harley", gender: "men", country: "United Kingdom", isFallback: false },
    { name: "Abita Fong", gender: "women", country: "Indonesia", isFallback: false },
    { name: "Oskar Lopez", gender: "men", country: "Mexico", isFallback: false },
    { name: "Ricardo Antonio mex", gender: "men", country: "Mexico", isFallback: false },
    { name: "Sarahi Reynaga", gender: "women", country: "Mexico", isFallback: false },
    { name: "Ana Montes", gender: "women", country: "Mexico", isFallback: false },
    { name: "jacqueline alvarado", gender: "women", country: "Mexico", isFallback: false },
    { name: "Yadira Torres Rivera", gender: "women", country: "Mexico", isFallback: false },
    { name: "Valentina Orozco 😎", gender: "women", country: "Mexico", isFallback: false },
    { name: "Manuel ascota", gender: "men", country: "Mexico", isFallback: false },
    { name: "David Magana 💹📉", gender: "men", country: "Mexico", isFallback: false },
    { name: "Besty Claudio Lopez", gender: "women", country: "Mexico", isFallback: false },
    { name: "Yadira rodriguez", gender: "women", country: "Mexico", isFallback: false },
    { name: "Juan torres nunez", gender: "men", country: "Mexico", isFallback: false },
    { name: "Valerina Pedraza", gender: "women", country: "Mexico", isFallback: false },
    { name: "eric ortiz", gender: "men", country: "Mexico", isFallback: false },
    { name: "Edd Trulli", gender: "men", country: "US", isFallback: false },
    { name: "marcy saenz", gender: "women", country: "Mexico", isFallback: false },
    { name: "Andy Zensation 📊", gender: "men", country: "US", isFallback: false },
    { name: "Latex mt tozer", gender: "men", country: "US", isFallback: false },
    { name: "Kluta wangempella ll", gender: "men", country: "SouthAfrica", isFallback: false },
    { name: "Boaster Friday", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Philp Otive", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Akiiga Fabian", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Kelly TV", gender: "women", country: "US", isFallback: false },
    { name: "Esther Fidelis", gender: "women", country: "Nigeria", isFallback: false },
    { name: "Mates nsikak", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Friday Kelly", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Edeh Favour", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Lazy Dark 🌑💰💲", gender: "men", country: "US", isFallback: false },
    { name: "Kullest Kidd 🪐", gender: "men", country: "US", isFallback: false },
    { name: "Paul jande", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Bwalya Coxy", gender: "men", country: "SouthAfrica", isFallback: false },
    { name: "Boss  Mega ⚡⚡⚡", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Regard Nyakane", gender: "men", country: "SouthAfrica", isFallback: false },
    { name: "Tdk Mj", gender: "men", country: "US", isFallback: false },
    { name: "Mbg Mook 🍒", gender: "men", country: "US", isFallback: false },
    { name: "Larry Verb Washington", gender: "men", country: "US", isFallback: false },
    { name: "Md aldarondo", gender: "men", country: "Mexico", isFallback: false },
    { name: "jens kleinschmidt", gender: "men", country: "Germany", isFallback: false },
    { name: "Buchi Joseph", gender: "men", country: "Nigeria", isFallback: false },
    { name: "mitchell dufort", gender: "men", country: "US", isFallback: false },
    { name: "marvel Da' sauce", gender: "men", country: "US", isFallback: false },
    { name: "Red Barron", gender: "men", country: "US", isFallback: false },
    { name: "Oliver Meszaros", gender: "men", country: "Germany", isFallback: false },
    { name: "Ben Leary", gender: "men", country: "United Kingdom", isFallback: false },
    { name: "Ron  Thomson 🏍️", gender: "men", country: "US", isFallback: false },
    { name: "Nicholas Marchese", gender: "men", country: "US", isFallback: false },
    { name: "Joe Cottrell", gender: "men", country: "US", isFallback: false },
    { name: "Jovan Mircetic", gender: "men", country: "US", isFallback: false },
    { name: "Jordan A Ashcer", gender: "men", country: "US", isFallback: false },
    { name: "matt donald", gender: "men", country: "US", isFallback: false },
    { name: "Chris harney", gender: "men", country: "US", isFallback: false },
    { name: "Dvedat Demirci", gender: "men", country: "Germany", isFallback: false },
    { name: "Serhat Nuri Kaya", gender: "men", country: "Germany", isFallback: false },
    { name: "Julibel Golilao", gender: "women", country: "Indonesia", isFallback: false },
    { name: "Maria Gonzalez", gender: "women", country: "Mexico", isFallback: true },
    { name: "Carlos Mendez", gender: "men", country: "Mexico", isFallback: true },
    { name: "Linda Schmidt", gender: "women", country: "Germany", isFallback: true },
    { name: "Hans Becker", gender: "men", country: "Germany", isFallback: true },
    { name: "Priya Sharma", gender: "women", country: "India", isFallback: true },
    { name: "Raj Patel", gender: "men", country: "India", isFallback: true },
    { name: "Aisha Al-Farsi", gender: "women", country: "UAE", isFallback: true },
    { name: "Omar Hassan", gender: "men", country: "UAE", isFallback: true },
    { name: "Sofia Rossi", gender: "women", country: "Brazil", isFallback: true },
    { name: "Lucas Silva", gender: "men", country: "Brazil", isFallback: true },
    { name: "Chloe Martin", gender: "women", country: "United Kingdom", isFallback: true },
    { name: "James Taylor", gender: "men", country: "United Kingdom", isFallback: true },
    { name: "Emily Johnson", gender: "women", country: "US", isFallback: true },
    { name: "Michael Brown", gender: "men", country: "US", isFallback: true },
    { name: "Siti Nurhaliza", gender: "women", country: "Indonesia", isFallback: true },
    { name: "Budi Santoso", gender: "men", country: "Indonesia", isFallback: true },
    { name: "Zinhle Dlamini", gender: "women", country: "SouthAfrica", isFallback: true },
    { name: "Thabo Nkosi", gender: "men", country: "SouthAfrica", isFallback: true },
    { name: "Amara Okonkwo", gender: "women", country: "Nigeria", isFallback: true },
    { name: "Chidi Eze", gender: "men", country: "Nigeria", isFallback: true },
    { name: "Isabella Costa", gender: "women", country: "Brazil", isFallback: true },
    { name: "Mateo Fernandez", gender: "men", country: "Mexico", isFallback: true },
    { name: "Emma Wilson", gender: "women", country: "United Kingdom", isFallback: true },
    { name: "David Kim", gender: "men", country: "US", isFallback: true },
    { name: "Yuki Tanaka", gender: "women", country: "Indonesia", isFallback: true },
    { name: "Ahmed Al-Mansouri", gender: "men", country: "UAE", isFallback: true },
    { name: "Neha Gupta", gender: "women", country: "India", isFallback: true },
    { name: "Vikram Singh", gender: "men", country: "India", isFallback: true },
    { name: "Laura Fischer", gender: "women", country: "Germany", isFallback: true },
    { name: "Stefan Weber", gender: "men", country: "Germany", isFallback: true },
    { name: "Nia Siregar", gender: "women", country: "Indonesia", isFallback: true },
    { name: "Andi Wijaya", gender: "men", country: "Indonesia", isFallback: true },
    { name: "Lerato Mokoena", gender: "women", country: "SouthAfrica", isFallback: true },
    { name: "Sipho Khumalo", gender: "men", country: "SouthAfrica", isFallback: true },
    { name: "Folake Adeyemi", gender: "women", country: "Nigeria", isFallback: true },
    { name: "Tunde Balogun", gender: "men", country: "Nigeria", isFallback: true },
    { name: "Jessica Miller", gender: "women", country: "US", isFallback: true },
    { name: "Christopher Davis", gender: "men", country: "US", isFallback: true },
    { name: "Sophie Evans", gender: "women", country: "United Kingdom", isFallback: true },
    { name: "William Jones", gender: "men", country: "United Kingdom", isFallback: true },
    { name: "Camila Rocha", gender: "women", country: "Brazil", isFallback: true },
    { name: "Gustavo Lima", gender: "men", country: "Brazil", isFallback: true },
    { name: "Fatima Al-Zaabi", gender: "women", country: "UAE", isFallback: true },
    { name: "Rashid Al-Kaabi", gender: "men", country: "UAE", isFallback: true },
    { name: "Anjali Reddy", gender: "women", country: "India", isFallback: true },
    { name: "Arjun Mehta", gender: "men", country: "India", isFallback: true },
    { name: "Valeria Hernandez", gender: "women", country: "Mexico", isFallback: true },
    { name: "Alejandro Ruiz", gender: "men", country: "Mexico", isFallback: true },
    { name: "Anna Wagner", gender: "women", country: "Germany", isFallback: true },
    { name: "Thomas Schulz", gender: "men", country: "Germany", isFallback: true }
  ];

  const adminPersona = {
    name: "Aditya Renash",
    gender: "men",
    country: "India",
    isFallback: false,
    vip: 0,
    admin: true,
    initials: "AR",
    avatar: "assets/avatars/aditya_renash.jpg",
    traits: { archetype: "boss", grammar: "clean", slang: 0.15, typoRate: 0.02 }
  };

  const archetypeTraits = {
    boss:       { archetype: "boss", grammar: "clean", slang: 0.2, typoRate: 0.05 },
    analyst:    { archetype: "analyst", grammar: "clean", slang: 0.1, typoRate: 0.03 },
    joker:      { archetype: "joker", grammar: "informal", slang: 0.8, typoRate: 0.15 },
    wit:        { archetype: "sarcastic", grammar: "mixed", slang: 0.7, typoRate: 0.1 },
    newbie:     { archetype: "newbie", grammar: "informal", slang: 0.6, typoRate: 0.2 },
    lurker:     { archetype: "lurker", grammar: "mixed", slang: 0.3, typoRate: 0.05 },
    expert:     { archetype: "expert", grammar: "clean", slang: 0.25, typoRate: 0.04 },
    thoughtful: { archetype: "thoughtful", grammar: "clean", slang: 0.15, typoRate: 0.03 }
  };

  function getVipFromName(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i);
    const rand = Math.abs(hash % 100) / 100;
    if (rand < 0.6) return 0;
    if (rand < 0.85) return 1;
    if (rand < 0.95) return 2;
    return 3;
  }

  const nameToArchetype = {
    "oladapo ogunsakin": 'boss', "Anthony Onyinkwa": 'expert', "victor e keyz 🎹🎺📉": 'analyst',
    "Stanley Ezeorjika 💰": 'boss', "Das Haruna Fearless": 'expert', "Boaster Friday": 'joker',
    "Boss  Mega ⚡⚡⚡": 'boss', "Lazy Dark 🌑💰💲": 'wit', "Elmer nunez 📉": 'analyst',
    "Sergio Vega munoz 🔥": 'boss', "David Magana 💹📉": 'analyst', "Andy Zensation 📊": 'analyst',
    "Valentina Orozco 😎": 'joker', "Trovis banks 🏦💰": 'boss', "Flash BE": 'expert',
    "Red Barron": 'wit', "Kullest Kidd 🪐": 'joker', "marvel Da' sauce": 'joker',
    "Ron  Thomson 🏍️": 'expert', "Jamie Terrell": 'newbie', "ashley muse": 'newbie',
    "jen lee": 'newbie', "Mona Dent": 'lurker', "Sym Ple": 'lurker', "Cherry Reichhart": 'thoughtful',
    "Trovao Duchness 🦊": 'joker', "Salman Rasheed": 'analyst', "Syed Ali Zohaib": 'expert',
    "Nieves yazita 🌹❣️": 'thoughtful', "Dominic Harley": 'wit', "Latex mt tozer": 'lurker',
    "Kluta wangempella ll": 'lurker', "Paul jande": 'newbie', "Bwalya Coxy": 'expert',
    "Regard Nyakane": 'analyst', "Tdk Mj": 'newbie', "Mbg Mook 🍒": 'joker',
    "Larry Verb Washington": 'expert', "jens kleinschmidt": 'analyst', "Oliver Meszaros": 'thoughtful',
    "Ben Leary": 'wit', "Nicholas Marchese": 'newbie', "Joe Cottrell": 'expert',
    "Jovan Mircetic": 'analyst', "Dvedat Demirci": 'boss', "Serhat Nuri Kaya": 'thoughtful',
    "Julibel Golilao": 'newbie', "Chidi Eze": 'newbie', "Carlos Mendez": 'expert'
  };

  function getTraitsForPersona(name) {
    const key = nameToArchetype[name] || 'active';
    if (key === 'active') return { archetype: "active", grammar: "mixed", slang: 0.4, typoRate: 0.08 };
    return archetypeTraits[key] || archetypeTraits['active'];
  }

  const personaNames = personaData.map(p => {
    const vip = getVipFromName(p.name);
    const safeName = p.name
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/[^\w\s]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .toLowerCase();

    return {
      name: p.name,
      vip,
      admin: false,
      avatar: p.isFallback
        ? `https://ui-avatars.com/api/?name=${p.name.split(' ')[0][0]}+${p.name.split(' ').pop()[0]}&background=2f5b9c&color=fff&size=200&bold=true`
        : `assets/avatars/${safeName}.jpg`,
      isFallback: p.isFallback,
      initials: p.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      traits: getTraitsForPersona(p.name)
    };
  });

  personaNames.unshift({
    name: adminPersona.name,
    vip: 0,
    admin: true,
    avatar: adminPersona.avatar,
    isFallback: false,
    initials: adminPersona.initials,
    traits: adminPersona.traits
  });

  // ----- 7 DESIGNATED PROOF PERSONAS (2 Nigerians + 5 others) -----
  const proofPersonaNames = [
    "oladapo ogunsakin",          // Nigeria
    "Anthony Onyinkwa",           // Nigeria
    "Sergio Vega munoz 🔥",       // Mexico
    "Trovis banks 🏦💰",          // US
    "Flash BE",                   // United Kingdom
    "David Magana 💹📉",          // Mexico
    "Cherry Reichhart"            // Germany
  ];

  // Map actual persona objects for easy access
  const proofPersonas = proofPersonaNames
    .map(name => personaNames.find(p => p.name === name))
    .filter(Boolean);

  // Proof image paths
  const proofImages = {
    "oladapo ogunsakin":         "assets/withdrawals/proof_oladapo.jpg",
    "Anthony Onyinkwa":          "assets/withdrawals/proof_anthony.jpg",
    "Sergio Vega munoz 🔥":      "assets/withdrawals/proof_sergio.jpg",
    "Trovis banks 🏦💰":         "assets/withdrawals/proof_trovis.jpg",
    "Flash BE":                  "assets/withdrawals/proof_flash.jpg",
    "David Magana 💹📉":         "assets/withdrawals/proof_david.jpg",
    "Cherry Reichhart":          "assets/withdrawals/proof_cherry.jpg"
  };

  // ----- PROOF SCHEDULER: No repeats, no two Nigerians in a row -----
  let proofQueue = [];           // will hold persona objects in a random order
  let lastProofCountry = null;
  let proofTimer = null;

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function refillProofQueue() {
    // Create a fresh shuffled copy of the 7 proof personas
    proofQueue = shuffleArray([...proofPersonas]);
    // If the first one is Nigerian, we may still post it (that's okay once per cycle)
  }

  function scheduleNextProof() {
    clearTimeout(proofTimer);
    const delay = randomInt(120000, 300000); // 2–5 minutes
    proofTimer = setTimeout(postProof, delay);
  }

  function postProof() {
    if (!chatColumn) return;

    // If queue is empty, refill
    if (proofQueue.length === 0) refillProofQueue();

    // Pick a persona that does not violate "no two Nigerians in a row"
    let selectedPersona = null;
    for (let i = 0; i < proofQueue.length; i++) {
      const p = proofQueue[i];
      const isNigerian = (p.name === "oladapo ogunsakin" || p.name === "Anthony Onyinkwa");
      if (!isNigerian || lastProofCountry !== 'Nigeria') {
        selectedPersona = proofQueue.splice(i, 1)[0];
        break;
      }
    }

    // If all remaining are Nigerian but last was also Nigerian, we have to post one anyway
    if (!selectedPersona) {
      selectedPersona = proofQueue.shift();
    }

    const imageUrl = proofImages[selectedPersona.name] || '';
    const message = getRandomMessage(selectedPersona);

    // Create proof card (dark background, no white)
    const proofHtml = `<div style="background: rgba(11,16,32,0.96); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 10px; margin-top: 10px;">
      <img src="${imageUrl}" alt="Withdrawal Proof" style="max-width:100%; height:auto; border-radius:12px; display:block;" onerror="this.style.display='none'">
    </div>`;

    const cardHtml = createChatCard(selectedPersona, message, true, proofHtml, Date.now());
    chatColumn.insertAdjacentHTML('afterbegin', cardHtml);
    while (chatColumn.children.length > 80) chatColumn.removeChild(chatColumn.lastChild);

    lastProofCountry = selectedPersona.name === "oladapo ogunsakin" || selectedPersona.name === "Anthony Onyinkwa" ? 'Nigeria' : 'Other';

    // If queue is empty again, refill for next cycle
    if (proofQueue.length === 0) refillProofQueue();

    scheduleNextProof();
  }

  // ----- NORMAL CHAT MESSAGE FUNCTIONS (unchanged) -----
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const messageCategories = {
    general: [
      "Good morning everyone. Hope you're all profitable today.",
      "Market looking interesting today. Who's ready for the session?",
      "Trading is a marathon, not a sprint.",
      "Stay disciplined, stay profitable.",
      "I love the energy in this community. Let's keep winning.",
      "Consistency beats luck. Stick to your plan.",
      "Another green day loading… I can feel it.",
      "Don't forget to check the charts before opening trades.",
      "Patience is the trader's superpower.",
      "Let's make this week our best one yet.",
      "Risk management is the real key to success.",
      "Every pro was once a beginner. Keep learning!",
      "Let’s share the wins and learn from the losses.",
      "Anyone else trading the New York session?",
      "Quiet morning for me – waiting for the right setup.",
      "I'm still learning, but loving the process.",
      "This platform makes trading so much easier.",
      "Happy to be part of a community that shares real knowledge.",
      "Let’s keep pushing forward. No looking back!",
      "New day, new opportunities. Let's get after it."
    ],
    question: [
      "How long does withdrawal take usually?",
      "What's the minimum deposit to get started?",
      "Can I use a debit card for deposits?",
      "Is USDT available for withdrawals?",
      "How do I set a stop loss properly?",
      "What’s the difference between OTC and live trading?",
      "Do you offer copy trading?",
      "How often are signals sent out?",
      "Is this AI‑generated signals or manual?",
      "I'm new – any tips for my first trade?",
      "Which session gives the best moves for beginners?",
      "Do you trade around news events?",
      "What risk percentage do you recommend per trade?",
      "How many pips do you usually target?",
      "Can I try a demo account first?",
      "How do I verify my account?",
      "Is there a mobile app for this?",
      "What’s the success rate of the signals?",
      "Do you support bank transfers?",
      "How long does it take to learn the basics?"
    ],
    hype: [
      "This thing too sweet 🔥",
      "Just closed another winner!",
      "We eating good today 💰",
      "Pips for days!",
      "Market is giving today – don't miss it!",
      "Account growing daily. Consistency is everything.",
      "Compounding is the secret sauce. Let's go!",
      "Making the market my ATM!",
      "Don't sleep on these signals – they're on fire!",
      "I'm telling you, this works! Stick with it.",
      "Easy money when you follow the plan.",
      "Let's get this bread! 🥖",
      "Who else caught that move? I'm up big.",
      "I called it yesterday – today it played out perfectly.",
      "Wait till you see my next trade. It's going to be huge!",
      "The haters will be quiet after this one!",
      "No losses today. Perfect execution.",
      "I'm literally dancing right now. Profits rolling in!",
      "My heart is racing – just hit my personal best!",
      "This community is full of winners. Prove me wrong!"
    ],
    withdraw: [
      "Just withdrew $85 to my bank account. Smooth and fast!",
      "Withdrawal to USDT (TRC20) completed in 20 minutes. Great service.",
      "I got my money! Thanks for the reliable payouts.",
      "Requested withdrawal this morning, received by noon.",
      "Can't believe it's this easy. Withdrew $200 without any issues.",
      "For those asking – yes, withdrawals are real. I just got mine.",
      "Sent to Opay and it landed instantly. Very impressed.",
      "Third withdrawal this month. They never delay.",
      "Proof of payment attached. This platform is legit.",
      "Happy to share: just cashed out $120. Keep grinding!",
      "Withdrawing profits feels amazing. Keep pushing guys!",
      "I was nervous at first, but now I trust the process.",
      "Receiving money directly in my bank account – feels so good.",
      "Goodbye financial stress. This side hustle is paying off.",
      "I'm proof that it works. Just withdrew another chunk today."
    ],
    testimonial: [
      "I was skeptical at first, but now I'm a believer. Profits are real.",
      "Finally a platform that delivers. Withdrew my first profit today!",
      "Been following for a month, and I can honestly say it's changed my finances.",
      "If you're new, trust the process. I'm up 3 days in a row.",
      "Not a bot, real person. I've made consistent gains for 2 weeks.",
      "This community gave me the confidence to start trading. So grateful.",
      "Honest review: I've tried many groups, but this one actually works.",
      "Up 40% this week. I never thought I'd see results like this.",
      "I'm just a regular person, and this platform is making a difference.",
      "Thank you to the admins for the signals. They've been spot on.",
      "I never leave reviews, but I had to. This is the real deal.",
      "My family noticed the change. I can finally contribute more at home.",
      "I started with a small amount, and now I'm growing it every day.",
      "Never been so consistent. The signals are high quality.",
      "I'm paying off debts little by little. This is life changing."
    ],
    advice: [
      "Always use a stop loss. Protect your capital first.",
      "Never risk more than 2% per trade. It's the golden rule.",
      "Don't revenge trade. Step away if you're emotional.",
      "Stick to your plan. Impulse trades are account killers.",
      "Patience is key. Wait for the setup, don't chase.",
      "Trade with the trend – it's your best friend.",
      "Backtest before going live. Save yourself unnecessary losses.",
      "Only 7 spots left for the premium signals this week. Don't wait.",
      "The early bird gets the best setups. London session is approaching!",
      "If you're unsure, stay out. Cash is also a position.",
      "Limit your screen time – overtrading is a real problem.",
      "Focus on a few pairs. You can't master everything at once.",
      "Use a trading journal. It will show you where you're winning and losing.",
      "Celebrate small wins. Consistency builds confidence.",
      "Don't let a losing day define you. Tomorrow is a new opportunity."
    ]
  };

  function applyTypos(text, persona) {
    if (persona.traits.typoRate < Math.random()) return text;
    const words = text.split(' ');
    if (words.length < 3) return text;
    const idx = Math.floor(Math.random() * words.length);
    const word = words[idx];
    if (word.length < 4) return text;
    const pos = Math.floor(Math.random() * (word.length - 1));
    const chars = word.split('');
    [chars[pos], chars[pos + 1]] = [chars[pos + 1], chars[pos]];
    words[idx] = chars.join('');
    return words.join(' ');
  }

  function applySlang(text, persona) {
    if (persona.traits.slang < Math.random()) return text;
    const slangMap = {
      "going to": "gonna", "want to": "wanna", "you all": "y'all", "I am": "I'm",
      "you are": "you're", "cannot": "can't", "do not": "don't", "does not": "doesn't"
    };
    for (const [key, val] of Object.entries(slangMap)) {
      if (Math.random() < 0.5 && text.includes(key)) text = text.replace(new RegExp(key, 'g'), val);
    }
    return text;
  }

  const chatColumn = document.getElementById('communityChatColumn');
  if (!chatColumn) return;

  function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function getRandomPersona() { return personaNames[randomInt(0, personaNames.length - 1)]; }

  const recentMessagesText = new Set();
  const MAX_RECENT_MSGS = 100;

  function getRandomMessage(persona) {
    let preferred = ['general'];
    if (persona.admin) preferred = ['advice', 'hype', 'testimonial', 'general'];
    else if (persona.traits.archetype === 'boss') preferred = ['hype', 'testimonial', 'advice'];
    else if (persona.traits.archetype === 'analyst') preferred = ['question', 'advice', 'withdraw', 'general'];
    else if (persona.traits.archetype === 'joker') preferred = ['general', 'hype', 'withdraw'];
    else if (persona.traits.archetype === 'newbie') preferred = ['question', 'general', 'testimonial'];
    else if (persona.traits.archetype === 'lurker') preferred = ['general', 'testimonial'];
    else preferred = ['general', 'hype', 'withdraw'];

    const cat = preferred[Math.floor(Math.random() * preferred.length)] || 'general';
    const bank = messageCategories[cat] || messageCategories.general;

    let msg = null;
    for (let i = 0; i < 20; i++) {
      const candidate = bank[Math.floor(Math.random() * bank.length)];
      if (!recentMessagesText.has(candidate)) {
        msg = candidate;
        break;
      }
    }
    if (!msg) msg = bank[Math.floor(Math.random() * bank.length)];

    recentMessagesText.add(msg);
    if (recentMessagesText.size > MAX_RECENT_MSGS) {
      const iter = recentMessagesText.values();
      recentMessagesText.delete(iter.next().value);
    }

    msg = applySlang(msg, persona);
    msg = applyTypos(msg, persona);

    if (persona.traits.slang > 0.6 && Math.random() > 0.4) {
      const emojis = ['😂', '🔥', '🚀', '😎', '🤣', '👍', '💰'];
      msg += ' ' + emojis[Math.floor(Math.random() * emojis.length)];
    }

    return msg;
  }

  function formatRelativeTime(minutesAgo) {
    if (minutesAgo < 1) return 'Just now';
    if (minutesAgo < 60) return `${minutesAgo} min${minutesAgo > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutesAgo / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours % 12 || 12}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
  }

  function createChatCard(persona, message, isProof, proofHtml, timestamp) {
    const badgeHtml = persona.admin
      ? '<span class="chat-msg-badge badge-admin">Admin</span>'
      : (persona.vip > 0 ? `<span class="chat-msg-badge badge-vip">VIP ${persona.vip}</span>` : '');

    let avatarHtml;
    if (persona.isFallback) {
      avatarHtml = `<div class="chat-msg-avatar" style="background:${persona.admin?'rgba(245,158,11,.22)':'rgba(168,85,247,.22)'}">${persona.initials}</div>`;
    } else {
      avatarHtml = `<img class="chat-msg-avatar-img" src="${persona.avatar}" alt="${persona.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">
                    <div class="chat-msg-avatar" style="display:none;background:${persona.admin?'rgba(245,158,11,.22)':'rgba(168,85,247,.22)'}">${persona.initials}</div>`;
    }

    const timeAgo = Math.floor((Date.now() - timestamp) / 60000);
    const relativeTime = formatRelativeTime(timeAgo);

    return `<div class="community-chat-card">
      <div class="chat-msg-top">
        ${avatarHtml}
        <div>
          <div class="chat-msg-name">${persona.name} ${badgeHtml}</div>
          <div style="font-size:11px;color:#6b7280;">${relativeTime}</div>
        </div>
      </div>
      <div class="chat-msg-body">${message}</div>
      ${isProof ? proofHtml : ''}
      <div class="chat-reactions">
        <div class="chat-reaction">👍 ${randomInt(5,99)}</div>
        <div class="chat-reaction">❤️ ${randomInt(2,50)}</div>
        ${randomInt(0,1)?'<div class="chat-reaction">🔥 '+randomInt(1,30)+'</div>':''}
        ${randomInt(0,1)?'<div class="chat-reaction">🚀 '+randomInt(1,20)+'</div>':''}
      </div>
      <div class="chat-msg-time">${formatTime(new Date(timestamp))}</div>
    </div>`;
  }

  function addRandomChatMessage() {
    const persona = getRandomPersona();
    const cardHtml = createChatCard(persona, getRandomMessage(persona), false, null, Date.now() - randomInt(0, 900) * 1000);
    chatColumn.insertAdjacentHTML('afterbegin', cardHtml);
    while (chatColumn.children.length > 80) chatColumn.removeChild(chatColumn.lastChild);
  }

  // ========== ONLINE MEMBERS ==========
  function updateOnlineMembers() {
    const onlineCount = randomInt(800, 1800);
    document.getElementById('onlineCount').textContent = `${onlineCount.toLocaleString()} Online`;
    document.getElementById('sidebarOnlineCount').textContent = onlineCount.toLocaleString();
    document.getElementById('onlineStatCount').textContent = onlineCount.toLocaleString();

    const numVisible = randomInt(4, 8);
    const shuffled = [...personaNames].sort(() => 0.5 - Math.random());
    const onlinePersonas = shuffled.slice(0, numVisible);
    document.getElementById('sidebarOnlineMembers').innerHTML = onlinePersonas.map(p => {
      const badgeHtml = p.admin
        ? '<span class="chat-msg-badge badge-admin">Admin</span>'
        : (p.vip > 0 ? `<span class="chat-msg-badge badge-vip">VIP ${p.vip}</span>` : '');
      return `<div class="sidebar-member-row">
        <div class="sidebar-member-avatar" style="background:${p.admin?'rgba(245,158,11,.18)':'rgba(168,85,247,.18)'}">${p.initials}</div>
        <span class="sidebar-member-name">${p.name} ${badgeHtml}</span>
      </div>`;
    }).join('');
  }

  function updateLiveWithdrawals() {
    const withdrawals = [];
    for (let i = 0; i < 3; i++) {
      const persona = getRandomPersona();
      const amount = randomInt(5000, 200000);
      const method = ['Bank Transfer','USDT (TRC20)','Opay','E-Wallet'][randomInt(0,3)];
      const timeAgo = randomInt(1, 59);
      withdrawals.push({ persona, amount, method, timeAgo });
    }
    document.getElementById('liveWithdrawalsFeed').innerHTML = withdrawals.map(w => `
      <div class="live-withdrawal-row">
        <div class="live-wd-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 13 4 4L19 7"/></svg></div>
        <div class="live-wd-info">
          <div class="live-wd-name">${w.persona.name}</div>
          <div class="live-wd-loc">${w.method}</div>
        </div>
        <div>
          <div class="live-wd-amount">₦${w.amount.toLocaleString()}</div>
          <div class="live-wd-time">${w.timeAgo} mins ago</div>
        </div>
      </div>`).join('');
  }

  function startCommunitySimulation() {
    for (let i = 0; i < 8; i++) addRandomChatMessage();
    updateOnlineMembers();
    updateLiveWithdrawals();

    setInterval(() => {
      if (!document.getElementById('communityView')?.classList.contains('active')) return;
      addRandomChatMessage();
      if (Math.random() < 0.3) { updateOnlineMembers(); updateLiveWithdrawals(); }
    }, 8000);

    setInterval(() => {
      if (!document.getElementById('communityView')?.classList.contains('active')) return;
      updateOnlineMembers();
      updateLiveWithdrawals();
    }, 45000);

    // Initialise proof queue and start scheduler
    refillProofQueue();
    scheduleNextProof();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startCommunitySimulation);
  else startCommunitySimulation();
})();
