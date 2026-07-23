// ===== Trade Pulse AI – community.js (FULL with fixed announcement dates – FINAL) =====
(function() {
  console.log('community.js loaded with organic chat refinements');

  // ========== PERSONA DATA (includes admin + 4 moderators) ==========
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
    { name: "Thomas Schulz", gender: "men", country: "Germany", isFallback: true },
    // ----- NEW PERSONAS -----
    { name: "Ajide Femi", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Andrew ♈", gender: "men", country: "US", isFallback: false },
    { name: "Angela", gender: "women", country: "US", isFallback: false },
    { name: "anna", gender: "women", country: "US", isFallback: false },
    { name: "Bigboy JO 💯", gender: "men", country: "Nigeria", isFallback: false },
    { name: "billy eseronio", gender: "men", country: "US", isFallback: false },
    { name: "bruce gaines", gender: "men", country: "US", isFallback: false },
    { name: "Cody Lamp", gender: "men", country: "US", isFallback: false },
    { name: "cynthia sherman", gender: "women", country: "US", isFallback: false },
    { name: "Danielle marie", gender: "women", country: "US", isFallback: false },
    { name: "diane", gender: "women", country: "US", isFallback: false },
    { name: "don m bennett", gender: "men", country: "US", isFallback: false },
    { name: "eric shiffler", gender: "men", country: "US", isFallback: false },
    { name: "Eric Temple", gender: "men", country: "US", isFallback: false },
    { name: "Gayle Churchill", gender: "women", country: "US", isFallback: false },
    { name: "gordon sadler", gender: "men", country: "US", isFallback: false },
    { name: "HAM ZAT", gender: "men", country: "Nigeria", isFallback: false },
    { name: "harshana", gender: "women", country: "India", isFallback: false },
    { name: "henry catt", gender: "men", country: "US", isFallback: false },
    { name: "ITZ DULZY", gender: "men", country: "Nigeria", isFallback: false },
    { name: "jackie costello", gender: "women", country: "US", isFallback: false },
    { name: "james creve", gender: "men", country: "US", isFallback: false },
    { name: "jeanne jennings", gender: "women", country: "US", isFallback: false },
    { name: "jenny seymore", gender: "women", country: "US", isFallback: false },
    { name: "jeremy reid", gender: "men", country: "US", isFallback: false },
    { name: "jim", gender: "men", country: "US", isFallback: false },
    { name: "junior ndlebe", gender: "men", country: "SouthAfrica", isFallback: false },
    { name: "Kachy emmanuel", gender: "men", country: "Nigeria", isFallback: false },
    { name: "kandrice casekey", gender: "women", country: "US", isFallback: false },
    { name: "Marian ❤️", gender: "women", country: "US", isFallback: false },
    { name: "micheal etezadi", gender: "men", country: "US", isFallback: false },
    { name: "Mimi Griffin", gender: "women", country: "US", isFallback: false },
    { name: "nan baker", gender: "women", country: "US", isFallback: false },
    { name: "nxumalo luh", gender: "men", country: "SouthAfrica", isFallback: false },
    { name: "olowoleru kayode", gender: "men", country: "Nigeria", isFallback: false },
    { name: "Paul Stokes", gender: "men", country: "US", isFallback: false },
    { name: "pearl smith", gender: "women", country: "US", isFallback: false },
    { name: "Phil Capps", gender: "men", country: "US", isFallback: false },
    { name: "philp rocco", gender: "men", country: "US", isFallback: false },
    { name: "randy ford", gender: "men", country: "US", isFallback: false },
    { name: "Ray Minnifield", gender: "men", country: "US", isFallback: false },
    { name: "richard khan", gender: "men", country: "US", isFallback: false },
    { name: "robert brown", gender: "men", country: "US", isFallback: false },
    { name: "Ryan", gender: "men", country: "US", isFallback: false },
    { name: "sxovalova jama", gender: "women", country: "US", isFallback: false },
    { name: "tabitha atkins", gender: "women", country: "US", isFallback: false },
    { name: "tobb bascom", gender: "men", country: "US", isFallback: false },
    { name: "Tony Cawood", gender: "men", country: "US", isFallback: false },
    { name: "troy gossman", gender: "men", country: "US", isFallback: false },
    { name: "tyler bishop", gender: "men", country: "US", isFallback: false },
    { name: "Van Grevenbroek", gender: "men", country: "US", isFallback: false },

    // 4 Moderators
    { name: "Jeraldine Blackwell", gender: "women", country: "US", isModerator: true },
    { name: "Philippe Obladen", gender: "men", country: "Germany", isModerator: true },
    { name: "Samantha Kelly", gender: "women", country: "United Kingdom", isModerator: true },
    { name: "Tajuanza S.", gender: "men", country: "US", isModerator: true }
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
    thoughtful: { archetype: "thoughtful", grammar: "clean", slang: 0.15, typoRate: 0.03 },
    moderator:  { archetype: "moderator", grammar: "clean", slang: 0.1, typoRate: 0.01 }
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
    "Julibel Golilao": 'newbie', "Chidi Eze": 'newbie', "Carlos Mendez": 'expert',
    // NEW PERSONAS
    "Ajide Femi": 'boss', "Andrew ♈": 'analyst', "Angela": 'thoughtful', "anna": 'newbie',
    "Bigboy JO 💯": 'joker', "billy eseronio": 'wit', "bruce gaines": 'expert',
    "Cody Lamp": 'lurker', "cynthia sherman": 'boss', "Danielle marie": 'analyst',
    "diane": 'thoughtful', "don m bennett": 'expert', "eric shiffler": 'joker',
    "Eric Temple": 'wit', "Gayle Churchill": 'newbie', "gordon sadler": 'lurker',
    "HAM ZAT": 'boss', "harshana": 'analyst', "henry catt": 'expert',
    "ITZ DULZY": 'joker', "jackie costello": 'thoughtful', "james creve": 'wit',
    "jeanne jennings": 'newbie', "jenny seymore": 'lurker', "jeremy reid": 'boss',
    "jim": 'analyst', "junior ndlebe": 'expert', "Kachy emmanuel": 'joker',
    "kandrice casekey": 'thoughtful', "Marian ❤️": 'wit', "micheal etezadi": 'newbie',
    "Mimi Griffin": 'lurker', "nan baker": 'boss', "nxumalo luh": 'analyst',
    "olowoleru kayode": 'expert', "Paul Stokes": 'joker', "pearl smith": 'thoughtful',
    "Phil Capps": 'wit', "philp rocco": 'newbie', "randy ford": 'lurker',
    "Ray Minnifield": 'boss', "richard khan": 'analyst', "robert brown": 'expert',
    "Ryan": 'joker', "sxovalova jama": 'thoughtful', "tabitha atkins": 'wit',
    "tobb bascom": 'newbie', "Tony Cawood": 'lurker', "troy gossman": 'boss',
    "tyler bishop": 'analyst', "Van Grevenbroek": 'expert',
    // Moderators
    "Jeraldine Blackwell": 'moderator', "Philippe Obladen": 'moderator', "Samantha Kelly": 'moderator', "Tajuanza S.": 'moderator'
  };

  function getTraitsForPersona(name) {
    const key = nameToArchetype[name] || 'active';
    if (key === 'active') return { archetype: "active", grammar: "mixed", slang: 0.4, typoRate: 0.08 };
    return archetypeTraits[key] || archetypeTraits['active'];
  }

  const personaNames = personaData.map(p => {
    const vip = getVipFromName(p.name);
    let avatar, isFallback = p.isFallback || false;
    if (p.isModerator) {
      const safe = p.name.replace(/[^a-zA-Z ]/g, '').trim().replace(/\s+/g, '_').toLowerCase();
      avatar = `assets/avatars/${safe}.jpg`;
    } else if (isFallback) {
      avatar = `https://ui-avatars.com/api/?name=${p.name.split(' ')[0][0]}+${p.name.split(' ').pop()[0]}&background=2f5b9c&color=fff&size=200&bold=true`;
    } else {
      const safe = p.name
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
        .replace(/[^\w\s]/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .toLowerCase();
      avatar = `assets/avatars/${safe}.jpg`;
    }

    const cleanInitials = p.name
      .split(' ')
      .map(part => part.replace(/[^A-Za-z]/g, '').charAt(0))
      .join('')
      .toUpperCase();

    return {
      name: p.name,
      vip,
      admin: false,
      moderator: !!p.isModerator,
      avatar,
      isFallback,
      initials: cleanInitials,
      traits: getTraitsForPersona(p.name),
      country: p.country,
      gender: p.gender
    };
  });

  personaNames.unshift({
    name: adminPersona.name,
    vip: 0,
    admin: true,
    moderator: false,
    avatar: adminPersona.avatar,
    isFallback: false,
    initials: adminPersona.initials,
    traits: adminPersona.traits,
    country: adminPersona.country,
    gender: adminPersona.gender
  });

  window.personaNames = personaNames;

  // ========== MESSAGE CATEGORIES ==========
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
      "Let's share the wins and learn from the losses.",
      "Anyone else trading the New York session?",
      "Quiet morning for me – waiting for the right setup.",
      "I'm still learning, but loving the process.",
      "This platform makes trading so much easier.",
      "Happy to be part of a community that shares real knowledge.",
      "Let's keep pushing forward. No looking back!",
      "New day, new opportunities. Let's get after it.",
      "Just woke up and already see green pips. What a day!",
      "Who else is holding through the weekend?",
      "Never a dull moment in this market. Love it.",
      "I'm genuinely impressed by how supportive everyone is.",
      "Wishing everyone a profitable session ahead.",
      "London open in a few – who's ready?",
      "Slow start today, but I'm staying patient.",
      "Just finished my morning analysis – things look promising.",
      "Stay humble when you're winning, and calm when you're not.",
      "I'm bullish on this community. So much good vibes!",
      "Checking in from Nigeria – everything steady over here.",
      "Sending good vibes to all traders tonight.",
      "Focus on the process, not just the profit.",
      "Who else finds the pre‑market the most exciting?",
      "Just catching up – anything big happen overnight?"
    ],
    question: [
      "How long does withdrawal take usually?",
      "What's the minimum deposit to get started?",
      "Can I use a debit card for deposits?",
      "Is USDT available for withdrawals?",
      "How do I set a stop loss properly?",
      "What's the difference between OTC and live trading?",
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
      "What's the success rate of the signals?",
      "Do you support bank transfers?",
      "How long does it take to learn the basics?",
      "Are there any hidden fees when I withdraw?",
      "Can I trade on weekends?",
      "What's the best pair to focus on as a beginner?",
      "Do you have a referral program?",
      "When is the best time to enter a position?",
      "How secure is my personal data?",
      "Can I have multiple accounts?",
      "What's the leverage offered?",
      "Is there a maximum I can invest?",
      "How quickly do signals update?",
      "Do you offer any educational resources?",
      "What's the difference between Standard and Premium plans?",
      "How often are the plans updated?",
      "Can I change my investment amount after starting?",
      "Is there a withdrawal limit per day?",
      "Do I need to keep my account active?",
      "Will I get notifications when a signal opens?",
      "What happens if I miss a signal?",
      "Can I talk to a real person for help?"
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
      "This community is full of winners. Prove me wrong!",
      "I just hit 50% return this month. Insane!",
      "The signals are so accurate it's almost scary.",
      "From $100 to $500 in two weeks – I'm speechless.",
      "I've never felt this confident trading before.",
      "The VIP signals are on another level.",
      "My withdrawal just landed. Time to celebrate!",
      "I'm not even watching the charts – the AI does it all.",
      "This is the best decision I've made all year.",
      "Let's crush the markets together!",
      "I'm so hyped I can't sleep. Another big day tomorrow.",
      "My wife thinks I'm a genius now 🤣",
      "My friends keep asking me how I do it. Trade Pulse AI!",
      "I just cleared my debts thanks to this platform.",
      "If you're not in yet, you're missing out big time.",
      "Signal accuracy is off the charts this month.",
      "I'm up 300% since I started. Not kidding.",
      "Reinvesting profits and watching it compound – beautiful.",
      "The admins here are literally angels.",
      "Who needs a 9‑5 when you have Trade Pulse?",
      "Every day I wake up richer. Thank you signals!",
      "This community is a goldmine. Keep it up everyone!",
      "I'm just getting started and already profitable.",
      "My withdrawals are always on time. No stress.",
      "I'm telling my whole family about this.",
      "Can't wait to see my portfolio in a year.",
      "The daily profit just keeps coming.",
      "I'm literally living my dream because of this.",
      "Another green week. Six in a row!",
      "There's no better feeling than passive income.",
      "I'm finally financially free. It's surreal."
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
      "I'm proof that it works. Just withdrew another chunk today.",
      "Withdrew $300 this morning – it hit my account before lunch.",
      "First withdrawal ever and it was flawless. So relieved!",
      "My Opay balance just got a nice boost. Thank you!",
      "I've made 5 withdrawals now, all fast and easy.",
      "Even my sceptical friend couldn't believe how fast it was.",
      "Withdrawal fees are minimal too. Very fair.",
      "The process is super straightforward. No hidden steps.",
      "I was worried about delays but it came through instantly.",
      "Receiving money while I sleep – that's the dream.",
      "Cashed out some profits to pay for my daughter's school fees.",
      "My rent money just came from trading profits. So grateful.",
      "Never had a withdrawal issue. Support is always helpful.",
      "Today's withdrawal went to my USDT wallet in minutes.",
      "I've tried other platforms, but this payout speed is unmatched.",
      "Just in time for the weekend. Withdrawal landed Friday morning."
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
      "I'm paying off debts little by little. This is life changing.",
      "I was about to give up on trading until I found this.",
      "Trust me, I've been burned before. But this is different.",
      "The community is what makes it special. Real people sharing real results.",
      "My portfolio has never looked this green. It's remarkable.",
      "I was so lost, but the education here helped me turn it around.",
      "Thank you Trade Pulse AI. You've given me hope.",
      "I'm telling everyone I know. This is too good to keep secret.",
      "I've made more in a month than I did all of last year.",
      "I was scared of losing money, but the risk management tips work.",
      "No more 9‑5 stress. I'm building my own future.",
      "My confidence has grown so much. I'm actually trading well now.",
      "I'm a single mom, and this extra income is a lifesaver.",
      "I retired early thanks to the profits I made here.",
      "Words can't express how grateful I am. Bless this community.",
      "If I can do it, anyone can. Just follow the plan."
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
      "Don't let a losing day define you. Tomorrow is a new opportunity.",
      "Set realistic goals. Slow and steady wins the race.",
      "Keep your emotions in check. The market doesn't care about your feelings.",
      "Learn to read price action – indicators can lag.",
      "Understand the news, but don't let it dictate your trades.",
      "Position sizing is everything. Never go all in.",
      "Treat trading like a business, not a hobby.",
      "Keep learning. The market always has something to teach.",
      "Have a support system. Trading can be lonely sometimes.",
      "Know when to walk away. A fresh mind makes better decisions.",
      "Diversify your strategies, but not too much.",
      "Stay humble. The market can humble anyone quickly.",
      "Track your stats. What gets measured gets improved.",
      "Don't compare yourself to others. Your journey is unique.",
      "Invest in your education first, then your account.",
      "Remember why you started. Keep that vision in mind."
    ],
    nigerian: [
      "Abeg, who fit explain the minimum deposit again?",
      "I just cashout small money, this thing sweet o",
      "Na God dey run this platform. I dey tell you",
      "Una see the signal wey drop for VIP? E too correct",
      "Omo, the withdrawal hit my Opay like play",
      "I no fit shout, my account don turn green again",
      "Wahala no dey for this trade. Everything smooth",
      "Make una no dull, this market na for serious people",
      "I just dey observe, but I go soon jump in",
      "Naija to the world! We dey represent",
      "E go better for all of us. Just trust the process",
      "Shey you see that move? I nearly faint",
      "I dey happy say I join this family",
      "No be hype, this thing work well well",
      "Make I see the next signal, I ready to load",
      "Omo see gains! I don hammer",
      "I no know say trading fit sweet like this",
      "Na who get money dey sleep? We dey collect!",
      "I dey tell my people make dem join. E no easy to explain",
      "This profit wey I see so, I go buy motor soon"
    ],
    mexican: [
      "Hermano, esta señal está de locos 🔥",
      "Acabo de retirar sin problemas. Increíble servicio.",
      "¡Qué chulada! Otra semana en verde.",
      "Jaja, ya ni me preocupo. Todo automático.",
      "No manches, hoy saqué $200 en un solo trade.",
      "La comunidad es puro amor. Gracias a todos.",
      "Estoy aprendiendo muchísimo aquí.",
      "Vamos por más, México presente.",
      "Nunca había confiado en un bot, pero esto es real.",
      "Ya le dije a mi compadre que se meta.",
      "Puro pinche profit, compa.",
      "La neta, esto sí cumple.",
      "Ando feliz, ya pagué mis deudas.",
      "Aquí el que no arriesga no gana, pero con control.",
      "Mis respetos a los que diseñaron este sistema.",
      "Cada día estoy más sorprendido.",
      "Los gringos se lo pierden, jaja.",
      "Hoy me toca celebrar. Otra retirada exitosa.",
      "Mi esposa ya no me regaña, jajaja.",
      "Desde que empecé, todo ha cambiado para bien."
    ]
  };

  // ========== TYPO & SLANG HELPERS ==========
  const commonTypos = {
    "the": "teh", "and": "adn", "you": "yuo", "are": "aer", "that": "taht",
    "with": "wiht", "have": "hav", "this": "tihs", "will": "wil",
    "when": "wehn", "where": "wher", "there": "tehre", "their": "thier",
    "profit": "proffit", "signal": "singal", "trade": "tarde",
    "market": "makret", "stop": "sotp", "loss": "lose", "time": "tiem",
    "today": "todday", "good": "goood", "great": "greaat", "making": "makign",
    "community": "comunity", "everyone": "evreyone", "session": "sessoin",
    "deposit": "depoist", "withdrawal": "withdrawl", "support": "spport"
  };

  function applyTypos(text, persona) {
    if (persona.traits.typoRate < Math.random()) return text;
    const words = text.split(' ');
    if (words.length < 2) return text;
    const idx = Math.floor(Math.random() * words.length);
    const word = words[idx].toLowerCase();
    if (commonTypos[word]) {
      words[idx] = Math.random() < 0.6 ? commonTypos[word] : words[idx];
      return words.join(' ');
    }
    if (word.length > 3 && Math.random() < 0.4) {
      const pos = Math.floor(Math.random() * (word.length - 1));
      const chars = word.split('');
      [chars[pos], chars[pos + 1]] = [chars[pos + 1], chars[pos]];
      words[idx] = chars.join('');
    }
    return words.join(' ');
  }

  function applySlang(text, persona) {
    if (persona.traits.slang < Math.random()) return text;
    const slangMap = {
      "going to": "gonna", "want to": "wanna", "you all": "y'all",
      "I am": "I'm", "you are": "you're", "cannot": "can't",
      "do not": "don't", "does not": "doesn't", "let us": "let's",
      "what is": "what's", "it is": "it's", "that is": "that's"
    };
    for (const [key, val] of Object.entries(slangMap)) {
      if (Math.random() < 0.5 && text.includes(key)) text = text.replace(new RegExp(key, 'g'), val);
    }
    return text;
  }

  function getCountrySlang(persona) {
    const country = persona.country;
    if (country === 'Nigeria' && Math.random() < 0.7) {
      return messageCategories.nigerian[Math.floor(Math.random() * messageCategories.nigerian.length)];
    }
    if (country === 'Mexico' && Math.random() < 0.7) {
      return messageCategories.mexican[Math.floor(Math.random() * messageCategories.mexican.length)];
    }
    return null;
  }

  // ========== MESSAGE GENERATION WITH UNIQUENESS ==========
  const recentMessagesText = new Set();
  const MAX_RECENT_MSGS = 200;

  function getRandomMessage(persona) {
    if (persona.moderator) {
      const pool = [...messageCategories.advice, ...messageCategories.hype, ...messageCategories.testimonial, ...messageCategories.general];
      let msg = pool[Math.floor(Math.random() * pool.length)];
      for (let i = 0; i < 30; i++) {
        if (!recentMessagesText.has(msg)) break;
        msg = pool[Math.floor(Math.random() * pool.length)];
      }
      recentMessagesText.add(msg);
      if (recentMessagesText.size > MAX_RECENT_MSGS) {
        const iter = recentMessagesText.values();
        recentMessagesText.delete(iter.next().value);
      }
      return msg;
    }

    const slangMsg = getCountrySlang(persona);
    if (slangMsg) {
      let msg = slangMsg;
      msg = applySlang(msg, persona);
      msg = applyTypos(msg, persona);
      if (persona.traits.slang > 0.6 && Math.random() < 0.3) msg += ' ' + (['🔥','😂','💰','😎','👍'][Math.floor(Math.random()*5)]);
      return msg;
    }

    let preferred = ['general'];
    if (persona.admin) preferred = ['advice', 'hype', 'testimonial', 'general'];
    else if (persona.traits.archetype === 'boss') preferred = ['hype', 'testimonial', 'advice'];
    else if (persona.traits.archetype === 'analyst') preferred = ['question', 'advice', 'withdraw', 'general'];
    else if (persona.traits.archetype === 'joker') preferred = ['general', 'hype', 'withdraw', 'nigerian', 'mexican'];
    else if (persona.traits.archetype === 'newbie') preferred = ['question', 'general', 'testimonial'];
    else if (persona.traits.archetype === 'lurker') preferred = ['general', 'testimonial'];
    else preferred = ['general', 'hype', 'withdraw'];

    if (persona.country === 'Nigeria' && Math.random() < 0.4) preferred.push('nigerian');
    if (persona.country === 'Mexico' && Math.random() < 0.4) preferred.push('mexican');

    const cat = preferred[Math.floor(Math.random() * preferred.length)] || 'general';
    const bank = messageCategories[cat] || messageCategories.general;

    let msg = null;
    for (let i = 0; i < 30; i++) {
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

    if (persona.traits.slang > 0.6 && Math.random() < 0.2) {
      const emojis = ['😂', '🔥', '🚀', '😎', '🤣', '👍', '💰'];
      msg += ' ' + emojis[Math.floor(Math.random() * emojis.length)];
    }

    return msg;
  }

  // ========== ORGANIC REACTION SYSTEM ==========
  const reactionEmojis = ['👍', '❤️', '🔥', '🚀'];

  function createChatCard(persona, message, timestamp) {
    const badgeHtml = persona.admin
      ? '<span class="chat-msg-badge badge-admin">Admin</span>'
      : (persona.moderator ? '<span class="chat-msg-badge badge-vip" style="background:rgba(59,130,246,.14);color:#60a5fa;">Mod</span>' : (persona.vip > 0 ? `<span class="chat-msg-badge badge-vip">VIP ${persona.vip}</span>` : ''));

    let avatarHtml;
    if (persona.admin) {
      avatarHtml = `<img src="${persona.avatar}" alt="Admin" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="chat-msg-avatar" style="display:none;background:rgba(245,158,11,.22)">${persona.initials}</div>`;
    } else if (persona.moderator || persona.isFallback) {
      avatarHtml = `<img src="${persona.avatar}" alt="${persona.name}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="chat-msg-avatar" style="display:none;background:${persona.moderator?'rgba(59,130,246,.22)':'rgba(168,85,247,.22)'}">${persona.initials}</div>`;
    } else {
      avatarHtml = `<img src="${persona.avatar}" alt="${persona.name}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="chat-msg-avatar" style="display:none;background:rgba(168,85,247,.22)">${persona.initials}</div>`;
    }

    const timeAgo = Math.floor((Date.now() - timestamp) / 60000);
    const relativeTime = formatRelativeTime(timeAgo);

    return `<div class="community-chat-card" data-msg-timestamp="${timestamp}">
      <div class="chat-msg-top">
        ${avatarHtml}
        <div>
          <div class="chat-msg-name">${persona.name} ${badgeHtml}</div>
          <div style="font-size:11px;color:#6b7280;">${relativeTime}</div>
        </div>
      </div>
      <div class="chat-msg-body">${message}</div>
      <div class="chat-reactions" id="reactions-${timestamp}"></div>
      <div class="chat-msg-time">${formatTime(new Date(timestamp))}</div>
    </div>`;
  }

  function startReactionSimulation(cardElement) {
    const timestamp = parseInt(cardElement.dataset.msgTimestamp);
    const reactionsDiv = cardElement.querySelector('.chat-reactions');
    if (!reactionsDiv) return;
    
    const targetCounts = {
      '👍': Math.floor(Math.random() * 80) + 5,
      '❤️': Math.floor(Math.random() * 50) + 2,
      '🔥': Math.random() > 0.5 ? Math.floor(Math.random() * 40) + 1 : 0,
      '🚀': Math.random() > 0.6 ? Math.floor(Math.random() * 30) + 1 : 0
    };
    let currentCounts = { '👍': 0, '❤️': 0, '🔥': 0, '🚀': 0 };
    
    if (Math.random() < 0.4) {
      const initialEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
      currentCounts[initialEmoji] = 1;
      updateReactionsDisplay(reactionsDiv, currentCounts);
    }

    const interval = setInterval(() => {
      const available = reactionEmojis.filter(e => currentCounts[e] < targetCounts[e]);
      if (available.length === 0) {
        clearInterval(interval);
        return;
      }
      const emoji = available[Math.floor(Math.random() * available.length)];
      const increment = Math.min(Math.floor(Math.random() * 3) + 1, targetCounts[emoji] - currentCounts[emoji]);
      currentCounts[emoji] += increment;
      updateReactionsDisplay(reactionsDiv, currentCounts);
    }, 1000 + Math.random() * 4000);
  }

  function updateReactionsDisplay(container, counts) {
    let html = '';
    for (const emoji of reactionEmojis) {
      if (counts[emoji] > 0) {
        html += `<div class="chat-reaction">${emoji} ${counts[emoji]}</div>`;
      }
    }
    container.innerHTML = html;
  }

  // ========== HELPER FUNCTIONS ==========
  function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function getRandomPersona() { return personaNames[randomInt(0, personaNames.length - 1)]; }

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

  // ========== CHAT PACE: add messages gradually ==========
  let chatMessageInterval;
  function startChatMessageLoop() {
    if (chatMessageInterval) clearTimeout(chatMessageInterval);
    const addMessageWithDelay = () => {
      addRandomChatMessage();
      chatMessageInterval = setTimeout(addMessageWithDelay, 3000 + Math.random() * 12000);
    };
    addMessageWithDelay();
  }

  function addRandomChatMessage() {
    const col = document.getElementById('communityChatColumn');
    if (!col) return;
    const persona = getRandomPersona();
    const cardHtml = createChatCard(persona, getRandomMessage(persona), Date.now() - randomInt(0, 900) * 1000);
    col.insertAdjacentHTML('afterbegin', cardHtml);
    const cardElement = col.firstElementChild;
    if (cardElement) startReactionSimulation(cardElement);
    while (col.children.length > 80) col.removeChild(col.lastChild);
  }

  function preloadChatMessages() {
    const col = document.getElementById('communityChatColumn');
    if (!col) return;
    col.innerHTML = '';
    const count = randomInt(5, 8);
    for (let i = 0; i < count; i++) {
      const persona = getRandomPersona();
      const cardHtml = createChatCard(persona, getRandomMessage(persona), Date.now() - (i * 60000 + randomInt(0, 300) * 1000));
      col.insertAdjacentHTML('beforeend', cardHtml);
      const cardElement = col.lastElementChild;
      if (cardElement) startReactionSimulation(cardElement);
    }
  }

  // ========== ONLINE MEMBERS ==========
  function updateOnlineMembers() {
    const onlineCount = randomInt(800, 1800);
    const onlineCountEl = document.getElementById('onlineCount');
    if (onlineCountEl) onlineCountEl.textContent = `${onlineCount.toLocaleString()} Online`;
    const sidebarOnlineCountEl = document.getElementById('sidebarOnlineCount');
    if (sidebarOnlineCountEl) sidebarOnlineCountEl.textContent = onlineCount.toLocaleString();
    const onlineStatCountEl = document.getElementById('onlineStatCount');
    if (onlineStatCountEl) onlineStatCountEl.textContent = onlineCount.toLocaleString();

    const numVisible = randomInt(4, 8);
    const shuffled = [...personaNames].sort(() => 0.5 - Math.random());
    const onlinePersonas = shuffled.slice(0, numVisible);
    const sidebarOnlineMembers = document.getElementById('sidebarOnlineMembers');
    if (sidebarOnlineMembers) {
      sidebarOnlineMembers.innerHTML = onlinePersonas.map(p => {
        const badgeHtml = p.admin ? '<span class="chat-msg-badge badge-admin">Admin</span>' : (p.moderator ? '<span class="chat-msg-badge badge-vip" style="background:rgba(59,130,246,.14);color:#60a5fa;">Mod</span>' : (p.vip > 0 ? `<span class="chat-msg-badge badge-vip">VIP ${p.vip}</span>` : ''));
        return `<div class="sidebar-member-row">
          <div class="sidebar-member-avatar" style="background:${p.admin?'rgba(245,158,11,.18)':'rgba(168,85,247,.18)'}">${p.initials}</div>
          <span class="sidebar-member-name">${p.name} ${badgeHtml}</span>
        </div>`;
      }).join('');
    }
  }

  // ========== LIVE WITHDRAWALS MODULE (full) ==========
  const currencyMethods = {
    NGN: [
      { name: 'GTBank', icon: 'assets/banks/gtbank.png' },
      { name: 'Access Bank', icon: 'assets/banks/access.png' },
      { name: 'Opay', icon: 'assets/banks/opay.png' },
      { name: 'First Bank', icon: 'assets/banks/firstbank.png' },
      { name: 'UBA', icon: 'assets/banks/uba.png' },
      { name: 'Zenith Bank', icon: 'assets/banks/zenith.png' },
      { name: 'Palmpay', icon: 'assets/banks/palmpay.png' },
      { name: 'Kuda Bank', icon: 'assets/banks/kuda.png' },
      { name: 'Wema Bank', icon: 'assets/banks/wema.png' }
    ],
    USD: [
      { name: 'Bank of America', icon: 'assets/banks/boa.png' },
      { name: 'Chase', icon: 'assets/banks/chase.png' },
      { name: 'Wells Fargo', icon: 'assets/banks/wells_fargo.png' },
      { name: 'Citibank', icon: 'assets/banks/citibank.png' },
      { name: 'PayPal', icon: 'assets/banks/paypal.png' },
      { name: 'Cash App', icon: 'assets/banks/cashapp.png' },
      { name: 'Venmo', icon: 'assets/banks/venmo.png' },
      { name: 'Zelle', icon: 'assets/banks/zelle.png' },
      { name: 'USAA', icon: 'assets/banks/usaa.png' }
    ],
    EUR: [
      { name: 'Deutsche Bank', icon: 'assets/banks/deutsche.png' },
      { name: 'BNP Paribas', icon: 'assets/banks/bnp_paribas.png' },
      { name: 'ING', icon: 'assets/banks/ing.png' },
      { name: 'Santander', icon: 'assets/banks/santander.png' },
      { name: 'Revolut', icon: 'assets/banks/revolut.png' },
      { name: 'N26', icon: 'assets/banks/n26.png' },
      { name: 'Bunq', icon: 'assets/banks/bunq.png' },
      { name: 'Commerzbank', icon: 'assets/banks/commerzbank.png' },
      { name: 'Vivid', icon: 'assets/banks/vivid.png' }
    ],
    GBP: [
      { name: 'Barclays', icon: 'assets/banks/barclays.png' },
      { name: 'HSBC UK', icon: 'assets/banks/hsbc_uk.png' },
      { name: 'Lloyds', icon: 'assets/banks/lloyds.png' },
      { name: 'NatWest', icon: 'assets/banks/natwest.png' },
      { name: 'Monzo', icon: 'assets/banks/monzo.png' },
      { name: 'Starling', icon: 'assets/banks/starling.png' },
      { name: 'Revolut UK', icon: 'assets/banks/revolut_uk.png' },
      { name: 'Metro Bank', icon: 'assets/banks/metro.png' },
      { name: 'Halifax', icon: 'assets/banks/halifax.png' }
    ],
    USDT: [
      { name: 'Binance Pay', icon: 'assets/banks/binance.png' },
      { name: 'Bybit', icon: 'assets/banks/bybit.png' },
      { name: 'OKX', icon: 'assets/banks/okx.png' },
      { name: 'Coinbase', icon: 'assets/banks/coinbase.png' },
      { name: 'Kraken', icon: 'assets/banks/kraken.png' },
      { name: 'Trust Wallet', icon: 'assets/banks/trustwallet.png' },
      { name: 'MetaMask', icon: 'assets/banks/metamask.png' },
      { name: 'KuCoin', icon: 'assets/banks/kucoin.png' },
      { name: 'Huobi', icon: 'assets/banks/huobi.png' }
    ]
  };

  const currencySymbols = {
    NGN: '₦', USD: '$', EUR: '€', GBP: '£', USDT: '₮'
  };

  const toUSDT = {
    USDT: 1,
    USD: 1,
    EUR: 1.08,
    GBP: 1.27,
    NGN: 0.000667
  };

  function getCurrentCurrency() {
    const btn = document.getElementById('currencyBtn');
    if (!btn) return 'USDT';
    return btn.textContent.trim().split(' ')[0];
  }

  function formatAmount(amount, currency) {
    const sym = currencySymbols[currency] || '';
    return sym + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function maskName(fullName) {
    const clean = fullName.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
    if (clean.length <= 2) return clean[0] + '*'.repeat(Math.max(1, clean.length - 1));
    const first = clean[0];
    const last = clean[clean.length - 1];
    return first + '*'.repeat(clean.length - 2) + last;
  }

  function timeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds} sec ago`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const withdrawalPersonas = personaNames.filter(p => !p.admin).map(p => ({ ...p }));
  const shuffledPool = shuffleArray([...withdrawalPersonas]);
  let poolIndex = 0;

  function createWithdrawal(persona, minutesAgo, currency) {
    const methods = currencyMethods[currency] || currencyMethods.USDT;
    const method = methods[Math.floor(Math.random() * methods.length)];
    const amount = Math.floor(Math.random() * 200000) + 5000;
    const date = new Date(Date.now() - minutesAgo * 60 * 1000);

    return {
      id: Date.now() + Math.random(),
      maskedName: maskName(persona.name),
      initials: persona.initials,
      avatarUrl: persona.avatar,
      isFallback: persona.isFallback,
      amount,
      currency,
      methodName: method.name,
      methodIcon: method.icon,
      time: date,
      status: 'completed'
    };
  }

  let allWithdrawals = [];
  const currencies = ['NGN', 'USD', 'EUR', 'GBP', 'USDT'];
  currencies.forEach(cur => {
    for (let i = 0; i < 50; i++) {
      const persona = shuffledPool[(currencies.indexOf(cur) * 50 + i) % shuffledPool.length];
      const minsAgo = Math.floor(Math.random() * 1440) + 1;
      allWithdrawals.push(createWithdrawal(persona, minsAgo, cur));
    }
  });
  allWithdrawals.forEach(w => { if (Math.random() < 0.1) w.status = 'processing'; });
  allWithdrawals.sort((a, b) => b.time - a.time);

  let inlineLoadedCount = 6;
  let inlineActiveFilter = 'all';

  const whiteBgExceptions = ['Binance Pay', 'Bybit', 'Cash App', 'Vivid', 'USAA'];
  function methodNeedsWhiteBg(name) {
    return !whiteBgExceptions.includes(name);
  }

  // ----- SIDEBAR LIVE WITHDRAWALS -----
  function updateSidebarWithdrawals() {
    const feed = document.getElementById('liveWithdrawalsFeed');
    if (!feed) return;
    const cur = getCurrentCurrency();
    const filtered = allWithdrawals.filter(w => w.currency === cur).slice(0, 3);

    feed.innerHTML = filtered.map(w => {
      const bgStyle = methodNeedsWhiteBg(w.methodName) ? 'background:#ffffff; padding:2px;' : '';
      return `<div class="live-withdrawal-row">
        <div class="live-wd-check">
          ${w.status === 'processing'
            ? '<div style="width:24px;height:24px;border:2px solid #f59e0b;border-radius:50%;border-top-color:transparent;animation:spin 1s linear infinite;"></div>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 13 4 4L19 7"/></svg>'}
        </div>
        <div class="live-wd-info">
          <div class="live-wd-name">${w.maskedName}</div>
          <div class="live-wd-loc">
            <img src="${w.methodIcon}" alt="" style="width:16px;height:16px;vertical-align:middle;border-radius:2px; ${bgStyle}" onerror="this.style.display='none'"> ${w.methodName}
          </div>
        </div>
        <div>
          <div class="live-wd-amount">${formatAmount(w.amount, w.currency)}</div>
          <div class="live-wd-time">${timeAgo(w.time)}</div>
        </div>
        <span style="background:${w.status === 'processing' ? 'rgba(245,158,11,.2)' : 'rgba(34,197,94,.1)'}; color:${w.status === 'processing' ? '#f59e0b' : '#22c55e'}; padding:2px 8px; border-radius:999px; font-size:10px; font-weight:600;">
          ${w.status === 'processing' ? 'Processing' : 'Completed'}
        </span>
      </div>`;
    }).join('');
  }

  // ========== WINS & PROOFS CONTENT ==========
  function buildWinsProofsContent() {
    const container = document.getElementById('winsProofsContent');
    if (!container) return;
    container.innerHTML = `
      <div class="section" style="margin-top:0;">
        <div style="display:flex; flex-direction:column; margin-bottom:16px; background:linear-gradient(135deg, rgba(168,85,247,.08), rgba(0,0,0,.2)); border-radius:16px; padding:14px; position:relative;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
            <button id="winsProofsBackBtn" style="background:none; border:none; color:#c084fc; cursor:pointer; padding:4px; display:flex; align-items:center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
            </button>
            <span style="background:#ef4444; color:#fff; padding:2px 10px; border-radius:999px; font-size:11px; font-weight:700;">● LIVE</span>
          </div>
          <div style="font-size:12px; color:#9ca3af; margin-bottom:10px;">Track live withdrawal activity from verified members.</div>
          <div style="display:flex; align-items:center; gap:8px;">
            <div id="heroAvatarStackInline" style="display:flex; align-items:center;"></div>
            <div style="font-size:11px; color:#9ca3af;">12,586+ Members</div>
          </div>
        </div>

        <div class="kpi-grid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-bottom:16px;">
          <div style="background:rgba(11,16,32,.9); border-radius:14px; padding:14px 10px; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><path d="M3 7h18v10H3z"/><path d="M16 12h4"/><circle cx="16.5" cy="12" r="1.2" fill="#a855f7" stroke="none"/></svg>
            <div style="font-size:11px; color:#9ca3af; margin-top:6px;">Total Withdrawn Today</div>
            <div style="font-size:16px; font-weight:700; color:#fff; margin-top:4px;" id="kpiTotalWithdrawnInline">₮0.00</div>
            <div style="font-size:10px; color:#4ade80; margin-top:2px;">+12.45% from yesterday</div>
          </div>
          <div style="background:rgba(11,16,32,.9); border-radius:14px; padding:14px 10px; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><path d="m5 13 4 4L19 7"/></svg>
            <div style="font-size:11px; color:#9ca3af; margin-top:6px;">Successful Withdrawals</div>
            <div style="font-size:16px; font-weight:700; color:#fff; margin-top:4px;" id="kpiSuccessfulInline">0</div>
            <div style="font-size:10px; color:#9ca3af; margin-top:2px;">Today</div>
          </div>
          <div style="background:rgba(11,16,32,.9); border-radius:14px; padding:14px 10px; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M4 17l6-6 4 4 6-6"/><path d="M14 9h6v6"/></svg>
            <div style="font-size:11px; color:#9ca3af; margin-top:6px;">Success Rate</div>
            <div style="font-size:16px; font-weight:700; color:#4ade80; margin-top:4px;">98.6%</div>
            <div style="font-size:10px; color:#9ca3af; margin-top:2px;">All Time</div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="font-size:15px; font-weight:700;">Latest Withdrawal</div>
          <div style="font-size:11px; color:#4ade80;" id="liveTickerInline">● Just now</div>
        </div>

        <div style="display:flex; gap:6px; margin-bottom:12px; overflow-x:auto;" id="filterTabsInlineContainer"></div>

        <div id="liveWithdrawalListInline" style="margin-bottom:14px;"></div>

        <div style="text-align:center; margin-bottom:16px;">
          <button id="loadMoreWithdrawalsBtnInline" style="background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); color:#cbd5e1; padding:10px 24px; border-radius:999px; font-size:13px; cursor:pointer;">Load More ↓</button>
        </div>

        <div style="text-align:center; font-size:11px; color:#6b7280; margin-bottom:8px;">
          All withdrawals are verified and secured by Trade Pulse AI
        </div>
      </div>
    `;
    document.getElementById('winsProofsBackBtn')?.addEventListener('click', () => {
      switchToGeneralChat();
    });
  }

  const heroAvatars = [
    { name: 'Oladapo O.', avatar: 'assets/avatars/hero1.jpg' },
    { name: 'Anthony O.', avatar: 'assets/avatars/hero2.jpg' },
    { name: 'Victor K.', avatar: 'assets/avatars/hero3.jpg' }
  ];

  function updateHeroAvatarStackInline() {
    const stack = document.getElementById('heroAvatarStackInline');
    if (!stack) return;
    stack.innerHTML = heroAvatars.map((h, i) => `
      <div style="width:36px; height:36px; border-radius:50%; border:2px solid #0a1020; overflow:hidden; background:#1e1b4b; margin-left:${i>0?'-10px':'0'}; z-index:${3-i}; position:relative; display:grid; place-items:center; font-size:14px; font-weight:700; color:white;">
        <img src="${h.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none';this.parentNode.textContent='${h.name.split(' ').map(n=>n[0]).join('')}';">
      </div>
    `).join('') + `
      <div style="width:36px; height:36px; border-radius:50%; border:2px solid #0a1020; background:linear-gradient(135deg, #a855f7, #6d28d9); margin-left:-10px; z-index:2; position:relative; display:grid; place-items:center; font-size:12px; font-weight:700; color:white;">
        +128
      </div>
    `;
  }

  function renderFilterTabsInline() {
    const container = document.getElementById('filterTabsInlineContainer');
    if (!container) return;
    container.innerHTML = `
      <button class="liveFilterTabInline active" data-filter="all" style="background:rgba(168,85,247,.2); color:#c084fc; border:none; padding:6px 14px; border-radius:999px; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap;">All</button>
      <button class="liveFilterTabInline" data-filter="completed" style="background:rgba(255,255,255,.04); color:#9ca3af; border:1px solid rgba(255,255,255,.1); padding:6px 14px; border-radius:999px; font-size:12px; cursor:pointer; white-space:nowrap;">Completed</button>
      <button class="liveFilterTabInline" data-filter="processing" style="background:rgba(255,255,255,.04); color:#9ca3af; border:1px solid rgba(255,255,255,.1); padding:6px 14px; border-radius:999px; font-size:12px; cursor:pointer; white-space:nowrap;">Processing</button>
      <button class="liveFilterTabInline" data-filter="usdt" style="background:rgba(255,255,255,.04); color:#9ca3af; border:1px solid rgba(255,255,255,.1); padding:6px 14px; border-radius:999px; font-size:12px; cursor:pointer; white-space:nowrap;">USDT</button>
      <button class="liveFilterTabInline" data-filter="usd" style="background:rgba(255,255,255,.04); color:#9ca3af; border:1px solid rgba(255,255,255,.1); padding:6px 14px; border-radius:999px; font-size:12px; cursor:pointer; white-space:nowrap;">USD</button>
      <button class="liveFilterTabInline" data-filter="eur" style="background:rgba(255,255,255,.04); color:#9ca3af; border:1px solid rgba(255,255,255,.1); padding:6px 14px; border-radius:999px; font-size:12px; cursor:pointer; white-space:nowrap;">EUR</button>
      <button class="liveFilterTabInline" data-filter="gbp" style="background:rgba(255,255,255,.04); color:#9ca3af; border:1px solid rgba(255,255,255,.1); padding:6px 14px; border-radius:999px; font-size:12px; cursor:pointer; white-space:nowrap;">GBP</button>
      <button class="liveFilterTabInline" data-filter="ngn" style="background:rgba(255,255,255,.04); color:#9ca3af; border:1px solid rgba(255,255,255,.1); padding:6px 14px; border-radius:999px; font-size:12px; cursor:pointer; white-space:nowrap;">NGN</button>
    `;
    document.querySelectorAll('.liveFilterTabInline').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.liveFilterTabInline').forEach(t => {
          t.style.background = 'rgba(255,255,255,.04)';
          t.style.color = '#9ca3af';
          t.classList.remove('active');
        });
        tab.style.background = 'rgba(168,85,247,.2)';
        tab.style.color = '#c084fc';
        tab.classList.add('active');
        inlineActiveFilter = tab.dataset.filter;
        inlineLoadedCount = 6;
        renderLiveWithdrawalListInline();
      });
    });
  }

  function avatarHTML(w) {
    const initials = w.initials;
    return `<div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, #a855f7, #6d28d9); display:grid; place-items:center; font-size:14px; font-weight:700; color:white;">${initials}</div>`;
  }

  function renderLiveWithdrawalListInline() {
    const list = document.getElementById('liveWithdrawalListInline');
    const loadBtn = document.getElementById('loadMoreWithdrawalsBtnInline');
    if (!list) return;

    let filtered = [...allWithdrawals];
    if (inlineActiveFilter === 'completed') filtered = filtered.filter(w => w.status === 'completed');
    else if (inlineActiveFilter === 'processing') filtered = filtered.filter(w => w.status === 'processing');
    else if (inlineActiveFilter === 'usdt') filtered = filtered.filter(w => w.currency === 'USDT');
    else if (inlineActiveFilter === 'usd') filtered = filtered.filter(w => w.currency === 'USD');
    else if (inlineActiveFilter === 'eur') filtered = filtered.filter(w => w.currency === 'EUR');
    else if (inlineActiveFilter === 'gbp') filtered = filtered.filter(w => w.currency === 'GBP');
    else if (inlineActiveFilter === 'ngn') filtered = filtered.filter(w => w.currency === 'NGN');

    const totalInUSDT = filtered.reduce((sum, w) => sum + (w.amount * (toUSDT[w.currency] || 1)), 0);
    const kpiTotal = document.getElementById('kpiTotalWithdrawnInline');
    if (kpiTotal) kpiTotal.textContent = formatAmount(totalInUSDT, 'USDT');
    const kpiSuccessful = document.getElementById('kpiSuccessfulInline');
    if (kpiSuccessful) kpiSuccessful.textContent = filtered.length;

    const visible = filtered.slice(0, inlineLoadedCount);
    const ticker = document.getElementById('liveTickerInline');
    if (ticker && visible.length > 0) ticker.textContent = `● ${timeAgo(visible[0].time)}`;

    list.innerHTML = visible.map(w => {
      const bgStyle = methodNeedsWhiteBg(w.methodName) ? 'background:#ffffff; padding:2px;' : '';
      return `<div style="display:flex; align-items:center; gap:10px; padding:12px 0; border-bottom:1px solid rgba(255,255,255,.04);">
        ${avatarHTML(w)}
        <div style="flex:1; min-width:0;">
          <div style="font-size:13px; font-weight:600; max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${w.maskedName}</div>
          <div style="font-size:11px; color:#9ca3af;">
            <img src="${w.methodIcon}" alt="" style="width:16px;height:16px;vertical-align:middle;border-radius:2px;margin-right:4px; ${bgStyle}" onerror="this.style.display='none'"> ${w.methodName}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:14px; font-weight:700; color:#4ade80;">${formatAmount(w.amount, w.currency)}</div>
          <div style="font-size:10px; color:#6b7280;">${timeAgo(w.time)}</div>
        </div>
        <span style="background:${w.status==='processing'?'rgba(245,158,11,.2)':'rgba(34,197,94,.1)'}; color:${w.status==='processing'?'#f59e0b':'#22c55e'}; padding:2px 8px; border-radius:999px; font-size:10px; font-weight:600;">${w.status==='processing'?'Processing':'Completed'}</span>
      </div>`;
    }).join('');

    if (inlineLoadedCount >= filtered.length) {
      loadBtn.style.display = 'none';
    } else {
      loadBtn.style.display = 'block';
    }
  }

  // ========== ANNOUNCEMENTS WITH USER-SPECIFIC DATES (FIXED) ==========
  const announcementsTemplate = [
    { id: 1, title: "⏳ 43 Spots Left – Closing Soon", description: "Only 43 spots remaining for our exclusive VIP Signal Group! Registration closes on Friday, July 18, 2025. Don't miss this opportunity to get premium signals with a 92% win rate. Secure your spot now!", image: "assets/announcements/announcement1.jpg", reactions: { "👍": 312, "❤️": 176, "🔥": 134, "🚀": 98 } },
    { id: 2, title: "BTC/USDT Breakout Alert", description: "Bitcoin just broke above the $72,500 resistance. Analysts expect continuation to $74,200. Stay cautious with leverage and use tight stop losses.", image: "assets/announcements/announcement2.jpg", reactions: { "👍": 127, "❤️": 45, "🔥": 33, "🎯": 21 } },
    { id: 3, title: "VIP Signal Performance Report", description: "Our VIP signals delivered a 92% win rate this week with an average profit of 145 pips. Congratulations to all VIP members! Premium and VIP plans are open for new members.", image: "assets/announcements/announcement3.jpg", reactions: { "👍": 203, "❤️": 89, "🥳": 55, "💎": 32 } },
    { id: 4, title: "New Trading Pairs Added", description: "SOL/USDT and AVAX/USDT are now available for trading on our platform. Enjoy competitive spreads and instant execution.", image: "assets/announcements/announcement4.jpg", reactions: { "👍": 96, "❤️": 38, "🎉": 19, "💹": 14 } },
    { id: 5, title: "System Maintenance Notice", description: "We will perform scheduled maintenance on June 28, 2026 from 02:00–04:00 UTC. Trading will be temporarily paused. Withdrawals remain unaffected.", image: "assets/announcements/announcement5.jpg", reactions: { "👍": 54, "❤️": 12, "🔧": 25, "⏳": 8 } },
    { id: 6, title: "EUR/USD Analysis", description: "EUR/USD found support at 1.0650. A potential rebound toward 1.0720 is expected if the ECB minutes remain hawkish. Manage risk accordingly.", image: "assets/announcements/announcement6.jpg", reactions: { "👍": 78, "❤️": 27, "📊": 34, "🤔": 11 } },
    { id: 7, title: "Monthly Profit Distribution", description: "June profit share of $1.2M has been distributed among eligible investors. Check your wallet for the credit. Thank you for your trust!", image: "assets/announcements/announcement7.jpg", reactions: { "👍": 312, "❤️": 176, "💰": 134, "🥂": 67 } },
    { id: 8, title: "Referral Program Update", description: "Earn 5% commission for every friend you invite. Top referrer this month received $4,200 in bonuses. Share your link now!", image: "assets/announcements/announcement8.jpg", reactions: { "👍": 143, "❤️": 58, "👥": 41, "💸": 39 } },
    { id: 9, title: "Security Enhancement", description: "We've upgraded our encryption to SHA-256 with 2FA biometric verification. Your funds and data are safer than ever.", image: "assets/announcements/announcement9.jpg", reactions: { "👍": 189, "❤️": 94, "🔐": 76, "🛡️": 52 } },
    { id: 10, title: "Market Outlook Q3 2026", description: "Our analysts forecast a bullish Q3 with possible new ATHs for major pairs. Inflation data and Fed policy will be key drivers.", image: "assets/announcements/announcement10.jpg", reactions: { "👍": 267, "❤️": 102, "📈": 89, "🌍": 44 } },
    { id: 11, title: "GBP/USD Technical Outlook", description: "Cable remains range‑bound between 1.2450 and 1.2600. A breakout above 1.2600 could target 1.2750. FOMC minutes later this week.", image: "assets/announcements/announcement11.jpg", reactions: { "👍": 65, "❤️": 23, "📉": 17, "👀": 29 } },
    { id: 12, title: "Weekend Trading Schedule", description: "Markets will be closed this Saturday and Sunday. Regular trading resumes Monday 00:00 UTC. Use this time to review your portfolio.", image: "assets/announcements/announcement12.jpg", reactions: { "👍": 34, "❤️": 11, "📅": 20, "⏸️": 7 } }
  ];

  function getUserAnnouncementDates() {
    let user = null;
    try { user = JSON.parse(sessionStorage.getItem('tradePulseCurrentUser')); } catch(e) {}
    if (!user) return null;

    // Always regenerate if dates are invalid or missing
    if (user.announcementDates && Array.isArray(user.announcementDates) && user.announcementDates.length === 12) {
      const valid = user.announcementDates.every(d => typeof d.postedStr === 'string' && d.postedStr.length > 0);
      if (valid) return user.announcementDates;
    }

    // Generate fresh dates
    const now = new Date();
    let firstVisit;

    if (user.firstVisitDate) {
      const parsed = new Date(user.firstVisitDate);
      firstVisit = !isNaN(parsed.getTime()) ? parsed : now;
    } else {
      firstVisit = now;
    }

    const nextFriday = new Date(firstVisit);
    nextFriday.setDate(firstVisit.getDate() + ((5 - firstVisit.getDay() + 7) % 7) + 7);

    const dates = [];
    for (let i = 0; i < 12; i++) {
      if (i === 0) {
        const postedDate = new Date(now);
        postedDate.setDate(postedDate.getDate() - (Math.floor(Math.random() * 3) + 1));
        const postedStr = postedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + postedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        dates.push({ id: 1, postedDate, closingDate: nextFriday, postedStr });
      } else {
        const postedDate = new Date(now);
        postedDate.setDate(postedDate.getDate() - Math.floor(Math.random() * 7 + 1));
        const postedStr = postedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + postedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        dates.push({ id: i+1, postedDate, closingDate: null, postedStr });
      }
    }

    user.announcementDates = dates;
    user.firstVisitDate = user.firstVisitDate || now.toISOString();
    try {
      sessionStorage.setItem('tradePulseCurrentUser', JSON.stringify(user));
      const users = JSON.parse(localStorage.getItem('tradePulseUsers') || '[]');
      const idx = users.findIndex(u => u.username === user.username);
      if (idx !== -1) { users[idx] = user; localStorage.setItem('tradePulseUsers', JSON.stringify(users)); }
    } catch(e) {}
    return dates;
  }

  function renderAnnouncements() {
    let container = document.getElementById('announcementsContent');
    if (!container) {
      container = document.createElement('div');
      container.id = 'announcementsContent';
      container.style.display = 'none';
      const tabsDiv = document.querySelector('.community-tabs');
      if (tabsDiv) {
        tabsDiv.parentNode.insertBefore(container, tabsDiv.nextSibling);
      } else {
        document.getElementById('communityView').appendChild(container);
      }
    }

    const userDates = getUserAnnouncementDates() || [];
    const getDateForId = (id) => {
      const found = userDates.find(d => d.id === id);
      return found && found.postedStr ? found.postedStr : 'Unknown date';
    };

    const adminAvatarHtml = `<img src="assets/avatars/aditya_renash.jpg" alt="Admin" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><div class="chat-msg-avatar" style="display:none;width:40px;height:40px;background:rgba(245,158,11,.22);">AR</div>`;

    container.innerHTML = `
      <div class="section" style="margin-top:0;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <div style="font-size:17px; font-weight:700;">📢 Announcements</div>
          <span style="background:rgba(59,130,246,.15); color:#60a5fa; font-size:12px; padding:4px 10px; border-radius:999px;">12 New</span>
        </div>
        ${announcementsTemplate.map(a => {
          let desc = a.description;
          if (a.id === 1) {
            const closingDateItem = userDates.find(d => d.id === 1);
            if (closingDateItem && closingDateItem.closingDate) {
              // FIX: closingDate might be a string (from JSON), parse it first
              const closingDate = new Date(closingDateItem.closingDate);
              if (!isNaN(closingDate.getTime())) {
                const closingStr = closingDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                desc = a.description.replace(/closes on .+$/, `closes on ${closingStr}.`);
              }
            }
          }
          return `
          <div style="background:rgba(11,16,32,.9); border-radius:16px; padding:14px; margin-bottom:12px; border:1px solid rgba(255,255,255,.05);">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
              ${adminAvatarHtml}
              <div>
                <div style="font-weight:600; color:#fff;">${a.title}</div>
                <div style="font-size:12px; color:#9ca3af;">Admin · ${getDateForId(a.id)}</div>
              </div>
            </div>
            <img src="${a.image}" style="width:100%; border-radius:12px; margin-bottom:10px;" onerror="this.style.display='none';">
            <div style="font-size:14px; color:#e5e7eb; line-height:1.5; margin-bottom:10px;">${desc}</div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              ${Object.entries(a.reactions).map(([emoji, count]) => `
                <span style="background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:999px; padding:4px 10px; font-size:12px; color:#d1d5db;">${emoji} ${count}</span>
              `).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  // ========== HELP DESK SUPPORT SECTION ==========
  function renderHelpDesk() {
    let container = document.getElementById('helpDeskContent');
    if (!container) {
      container = document.createElement('div');
      container.id = 'helpDeskContent';
      container.style.display = 'none';
      const tabsDiv = document.querySelector('.community-tabs');
      if (tabsDiv) {
        tabsDiv.parentNode.insertBefore(container, tabsDiv.nextSibling);
      } else {
        document.getElementById('communityView').appendChild(container);
      }
    }
    container.innerHTML = `
      <div class="section" style="margin-top:0;">
        <div style="background:rgba(11,16,32,.9); border-radius:20px; padding:24px; text-align:center;">
          <div style="font-size:48px; margin-bottom:16px;">🎧</div>
          <div style="font-size:20px; font-weight:700; margin-bottom:8px;">24/7 Support</div>
          <div style="font-size:14px; color:#9ca3af; margin-bottom:20px;">Our support team is available around the clock via Telegram. Tap the button below to chat with us instantly.</div>
          <a href="https://t.me/trade_pulse_ai_support" target="_blank" style="display:inline-block; background:linear-gradient(90deg, #6d28d9, #8b5cf6); color:#fff; padding:14px 28px; border-radius:999px; font-size:16px; font-weight:700; text-decoration:none; box-shadow:0 6px 18px rgba(124,58,237,.2);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle; margin-right:8px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.66-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.41-.88.03-.24.37-.49 1.02-.74 4.01-1.75 6.69-2.9 8.05-3.45 3.84-1.6 4.64-1.88 5.16-1.89.11 0 .37.03.54.16.14.11.18.26.2.37.02.11.04.37.03.57z"/></svg>
            Contact Support on Telegram
          </a>
        </div>
      </div>
    `;
  }

  // ========== SWITCH FUNCTIONS ==========
  function switchToGeneralChat() {
    document.querySelectorAll('.community-tab').forEach(t => t.classList.remove('active'));
    const generalTab = document.getElementById('tabGeneralChat');
    if (generalTab) generalTab.classList.add('active');

    const chatLayout = document.getElementById('communityChatLayout');
    if (chatLayout) chatLayout.style.display = '';
    const winsContent = document.getElementById('winsProofsContent');
    if (winsContent) winsContent.style.display = 'none';
    const announcementsContainer = document.getElementById('announcementsContent');
    if (announcementsContainer) announcementsContainer.style.display = 'none';
    const helpDeskContainer = document.getElementById('helpDeskContent');
    if (helpDeskContainer) helpDeskContainer.style.display = 'none';
    const membersPanel = document.getElementById('communityMembersPanel');
    if (membersPanel) membersPanel.style.display = 'none';

    const pinned = document.querySelector('.community-pinned');
    if (pinned) pinned.style.display = 'flex';
    const inputBar = document.getElementById('communityInputBar');
    if (inputBar) inputBar.style.display = 'flex';
  }

  function switchToWinsProofs() {
    const pinned = document.querySelector('.community-pinned');
    if (pinned) pinned.style.display = 'none';
    const inputBar = document.getElementById('communityInputBar');
    if (inputBar) inputBar.style.display = 'none';
    const announcementsContainer = document.getElementById('announcementsContent');
    if (announcementsContainer) announcementsContainer.style.display = 'none';
    const helpDeskContainer = document.getElementById('helpDeskContent');
    if (helpDeskContainer) helpDeskContainer.style.display = 'none';
    const membersPanel = document.getElementById('communityMembersPanel');
    if (membersPanel) membersPanel.style.display = 'none';

    document.querySelectorAll('.community-tab').forEach(t => t.classList.remove('active'));
    const winsTab = document.getElementById('tabWinsProofs');
    if (winsTab) winsTab.classList.add('active');

    const chatLayout = document.getElementById('communityChatLayout');
    if (chatLayout) chatLayout.style.display = 'none';
    const winsContent = document.getElementById('winsProofsContent');
    if (winsContent) winsContent.style.display = 'block';

    buildWinsProofsContent();
    updateHeroAvatarStackInline();
    renderFilterTabsInline();

    inlineActiveFilter = 'all';
    inlineLoadedCount = 6;
    renderLiveWithdrawalListInline();

    document.getElementById('loadMoreWithdrawalsBtnInline')?.addEventListener('click', () => {
      inlineLoadedCount += 10;
      renderLiveWithdrawalListInline();
    });
  }

  function switchToMarketUpdates() {
    const pinned = document.querySelector('.community-pinned');
    if (pinned) pinned.style.display = 'none';
    const inputBar = document.getElementById('communityInputBar');
    if (inputBar) inputBar.style.display = 'none';
    const chatLayout = document.getElementById('communityChatLayout');
    if (chatLayout) chatLayout.style.display = 'none';
    const winsContent = document.getElementById('winsProofsContent');
    if (winsContent) winsContent.style.display = 'none';
    const helpDeskContainer = document.getElementById('helpDeskContent');
    if (helpDeskContainer) helpDeskContainer.style.display = 'none';
    const membersPanel = document.getElementById('communityMembersPanel');
    if (membersPanel) membersPanel.style.display = 'none';

    document.querySelectorAll('.community-tab').forEach(t => t.classList.remove('active'));
    const tab = document.getElementById('tabMarketUpdates');
    if (tab) tab.classList.add('active');

    renderAnnouncements();
    const announcementsContainer = document.getElementById('announcementsContent');
    if (announcementsContainer) announcementsContainer.style.display = 'block';
  }

  function switchToHelpDesk() {
    const pinned = document.querySelector('.community-pinned');
    if (pinned) pinned.style.display = 'none';
    const inputBar = document.getElementById('communityInputBar');
    if (inputBar) inputBar.style.display = 'none';
    const chatLayout = document.getElementById('communityChatLayout');
    if (chatLayout) chatLayout.style.display = 'none';
    const winsContent = document.getElementById('winsProofsContent');
    if (winsContent) winsContent.style.display = 'none';
    const announcementsContainer = document.getElementById('announcementsContent');
    if (announcementsContainer) announcementsContainer.style.display = 'none';
    const membersPanel = document.getElementById('communityMembersPanel');
    if (membersPanel) membersPanel.style.display = 'none';

    document.querySelectorAll('.community-tab').forEach(t => t.classList.remove('active'));
    const tab = document.getElementById('tabHelpDesk');
    if (tab) tab.classList.add('active');

    renderHelpDesk();
    const helpDeskContainer = document.getElementById('helpDeskContent');
    if (helpDeskContainer) helpDeskContainer.style.display = 'block';
  }

  // Expose functions globally
  window.switchToWinsProofs = switchToWinsProofs;
  window.switchToGeneralChat = switchToGeneralChat;

  // Attach tab listeners
  document.getElementById('tabGeneralChat')?.addEventListener('click', switchToGeneralChat);
  document.getElementById('tabWinsProofs')?.addEventListener('click', switchToWinsProofs);
  document.getElementById('tabMarketUpdates')?.addEventListener('click', switchToMarketUpdates);
  document.getElementById('tabHelpDesk')?.addEventListener('click', switchToHelpDesk);

  // Quick card listeners
  const chatQuickCard = document.querySelector('.community-quick-ico.purple')?.closest('.community-quick-card');
  if (chatQuickCard) chatQuickCard.addEventListener('click', switchToGeneralChat);
  const announcementsQuickCard = document.querySelector('.community-quick-ico.blue')?.closest('.community-quick-card');
  if (announcementsQuickCard) announcementsQuickCard.addEventListener('click', switchToMarketUpdates);
  const withdrawalsQuickCard = document.querySelector('.community-quick-ico.green')?.closest('.community-quick-card');
  if (withdrawalsQuickCard) withdrawalsQuickCard.addEventListener('click', switchToWinsProofs);

  // ========== INVITE FRIENDS BUTTON ==========
  document.querySelector('.community-invite-btn')?.addEventListener('click', () => {
    const user = JSON.parse(sessionStorage.getItem('tradePulseCurrentUser'));
    if (!user || !user.referralCode) return;

    const code = user.referralCode;
    const inviteText = `🚀 Join me on Trade Pulse AI and start earning daily profits!%0AUse my referral code *${code}* when you sign up and both of us get a bonus.%0A👉 Sign up here: https://tradepulseaibot.github.io/Trade-Pulse-AI/?ref=${code}`;

    window.open(`https://wa.me/?text=${inviteText}`, '_blank');
  });

  // Inject new live withdrawal
  function injectNewLiveWithdrawal() {
    const cur = getCurrentCurrency();
    const persona = shuffledPool[poolIndex % shuffledPool.length];
    poolIndex++;
    const w = createWithdrawal(persona, 0, cur);
    w.status = 'processing';
    allWithdrawals.unshift(w);
    if (allWithdrawals.length > 600) allWithdrawals.pop();

    setTimeout(() => {
      w.status = 'completed';
      if (document.getElementById('communityView')?.classList.contains('active')) {
        updateSidebarWithdrawals();
        if (document.getElementById('winsProofsContent')?.style.display !== 'none') {
          renderLiveWithdrawalListInline();
        }
      }
    }, 2000 + Math.random() * 3000);

    if (document.getElementById('communityView')?.classList.contains('active')) {
      updateSidebarWithdrawals();
      if (document.getElementById('winsProofsContent')?.style.display !== 'none') {
        renderLiveWithdrawalListInline();
      }
    }
  }

  // ========== INITIALIZATION ==========
  function startCommunitySimulation() {
    try {
      const communityView = document.getElementById('communityView');
      if (!communityView) return;

      preloadChatMessages();
      startChatMessageLoop();

      updateOnlineMembers();
      updateSidebarWithdrawals();

      setInterval(() => {
        if (!communityView.classList.contains('active')) return;
        updateOnlineMembers();
        updateSidebarWithdrawals();
      }, 45000);

      setInterval(() => {
        if (communityView.classList.contains('active')) {
          injectNewLiveWithdrawal();
        }
      }, 10000 + Math.random() * 10000);
    } catch (error) {
      console.error('Community start error:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startCommunitySimulation);
  } else {
    startCommunitySimulation();
  }
})();
