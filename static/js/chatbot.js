/* ══════════════════════════════════════════════════════════
   HenBot — Offline Poultry Disease Chatbot
   FIX: All DOM code wrapped in DOMContentLoaded so it works
   regardless of script load position or page state.
   ══════════════════════════════════════════════════════════ */

const DISEASE_PHOTOS = {
  coccidiosis: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Chickens_in_a_farm.jpg/480px-Chickens_in_a_farm.jpg",
    caption: "🔴 Coccidiosis — watch for bloody, watery droppings",
  },
  newcastle: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/White_Leghorn_hen.jpg/480px-White_Leghorn_hen.jpg",
    caption: "🟡 Newcastle Disease — twisted neck, respiratory distress",
  },
  salmonella: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Chickens_in_a_farm.jpg/480px-Chickens_in_a_farm.jpg",
    caption: "🟠 Salmonella — diarrhea, weakness, can spread to humans",
  },
  healthy: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/White_Leghorn_hen.jpg/480px-White_Leghorn_hen.jpg",
    caption: "✅ Healthy hen — bright eyes, clean feathers, active",
  },
};

const TOPIC_SYNONYMS = {
  symptoms: [
    "symptom",
    "sign",
    "signal",
    "look like",
    "what happen",
    "how do i know",
    "detect",
    "identify",
    "recognise",
    "recognize",
    "indicate",
    "show",
    "tell if",
    "spot",
    "notice",
  ],
  management: [
    "treat",
    "treatment",
    "cure",
    "fix",
    "help",
    "medicine",
    "drug",
    "medication",
    "antibiotic",
    "remedy",
    "heal",
    "recover",
    "manage",
    "deal with",
    "do about",
    "stop it",
    "control",
    "anticoccidial",
    "toltrazuril",
    "amprolium",
  ],
  prevention: [
    "prevent",
    "prevention",
    "avoid",
    "stop",
    "vaccin",
    "protect",
    "biosecur",
    "keep away",
    "reduce risk",
    "minimise",
    "minimize",
    "safe",
    "safeguard",
    "precaution",
  ],
  droppings: [
    "dropping",
    "poop",
    "feces",
    "faeces",
    "stool",
    "dung",
    "excrement",
    "waste",
    "manure",
    "litter",
  ],
  spread: [
    "spread",
    "transmit",
    "contagious",
    "infectious",
    "catch",
    "pass",
    "contact",
    "outbreak",
    "flock",
  ],
  cause: [
    "cause",
    "why",
    "reason",
    "where",
    "come from",
    "origin",
    "source",
    "what is",
    "what causes",
    "pathogen",
    "organism",
    "parasite",
    "bacteria",
    "virus",
    "fungi",
  ],
};

function detectTopic(t) {
  for (const [topic, words] of Object.entries(TOPIC_SYNONYMS)) {
    if (words.some((w) => t.includes(w))) return topic;
  }
  return "general";
}

function detectDisease(t) {
  if (
    /coccidiosis|cocci|eimeria|bloody dropping|blood.*stool|blood.*poop/.test(t)
  )
    return "coccidiosis";
  if (/newcastle|ncd|apmv|twisted neck|torticollis|paramyxo/.test(t))
    return "newcastle";
  if (/salmonella|salmonel|pullorum|typhoid/.test(t)) return "salmonella";
  if (/healthy|normal hen|fit hen|good hen|fine hen/.test(t)) return "healthy";
  return null;
}

const KB = {
  coccidiosis: {
    image: DISEASE_PHOTOS.coccidiosis,
    name: "Coccidiosis",
    emoji: "🔴",
    followUps: [
      "What are the symptoms?",
      "How do I manage it?",
      "How do I prevent it?",
      "How does it spread?",
    ],
    responses: {
      general: `<strong>Coccidiosis</strong> 🔴 is caused by <strong>Eimeria</strong> parasites that destroy the intestinal lining. Young chicks (3–6 weeks) are most at risk.<br/><br/>Want to know about its <em>symptoms</em>, <em>management</em>, or <em>prevention</em>?`,
      cause: `Caused by <strong>Eimeria parasites</strong> — birds ingest oocysts from contaminated litter, feed, or water.<br/><br/>💡 <em>A single infected bird can shed millions of oocysts per day!</em>`,
      symptoms: `<strong>Symptoms of Coccidiosis:</strong><br/>🩸 <strong>Bloody or watery droppings</strong><br/>😔 Lethargy, hunched birds<br/>🪶 Ruffled, dull feathers<br/>🍽️ Loss of appetite<br/>📉 Drop in egg production<br/><br/>💡 Check droppings daily — early signs save lives!`,
      management: `💊 <strong>Anticoccidial drugs</strong> — Amprolium, Toltrazuril, or Sulfonamides in drinking water<br/>💧 Fresh, clean water during treatment<br/>🌿 Supplement with Vitamins A & K<br/>🔒 Isolate sick birds immediately<br/><br/>⚠️ Get your vet to confirm the correct dosage.`,
      prevention: `🧹 Keep litter <strong>dry and clean</strong><br/>💉 Vaccinate day-old chicks with live Eimeria vaccines<br/>🍽️ Use medicated chick starter feed<br/>🚫 Avoid overcrowding<br/>🧴 Disinfect drinkers and feeders weekly`,
      droppings: `🩸 <strong>Bloody droppings</strong> — bright red or dark brown blood<br/>💧 Very watery, sometimes orange-brown<br/>⚠️ Even one bloody dropping should put you on high alert!`,
      spread: `🦠 Birds swallow oocysts from infected droppings<br/>🍽️ Contaminated feed and water<br/>👟 Carried on boots, clothing, equipment<br/>💡 <em>One sick bird can infect an entire flock within days!</em>`,
    },
  },
  newcastle: {
    image: DISEASE_PHOTOS.newcastle,
    name: "Newcastle Disease",
    emoji: "🟡",
    followUps: [
      "What are the symptoms?",
      "How do I manage it?",
      "How do I prevent it?",
      "How does it spread?",
    ],
    responses: {
      general: `<strong>Newcastle Disease (NCD)</strong> 🟡 is caused by <strong>APMV-1</strong> and can wipe out an entire flock in days. It is a <strong>legally notifiable disease</strong> in most countries.<br/><br/>Want to know about its <em>symptoms</em>, <em>management</em>, or <em>prevention</em>?`,
      cause: `Caused by <strong>Avian Paramyxovirus Type 1 (APMV-1)</strong>. Wild and migratory birds are major natural carriers.<br/><br/>💡 <em>The velogenic strain can kill 100% of an unvaccinated flock within 3–5 days!</em>`,
      symptoms: `<strong>Symptoms:</strong><br/>🌀 <strong>Twisted neck (torticollis)</strong><br/>😮‍💨 Respiratory gasping, coughing<br/>💚 Greenish, watery diarrhea<br/>⚡ Sudden death with no warning<br/>📉 Complete stop in egg production<br/><br/>⚠️ <em>Twisted necks = isolate immediately and call your vet!</em>`,
      management: `⛔ <strong>There is NO cure.</strong><br/>🔒 Quarantine all affected birds immediately<br/>📞 <strong>Report to your vet and animal health authority</strong> — legally required<br/>🚫 Do NOT move birds, eggs, or equipment off the farm`,
      prevention: `💉 <strong>Vaccinate regularly</strong> — La Sota or HB1 vaccines<br/>📅 At 1 week old, boost at 4 weeks, then every 3 months<br/>🚷 Restrict farm visitors — disinfect footwear<br/>🐦 Keep wild birds away — use netting<br/>🆕 Quarantine new birds for 14 days`,
      spread: `💨 <strong>Airborne</strong> — the virus travels through the air<br/>🐦 Wild and migratory birds are major carriers<br/>👟 Contaminated boots, clothing, vehicles, equipment<br/><br/>⚠️ One visitor can infect your whole farm!`,
    },
  },
  salmonella: {
    image: DISEASE_PHOTOS.salmonella,
    name: "Salmonella",
    emoji: "🟠",
    followUps: [
      "What are the symptoms?",
      "How do I manage it?",
      "How do I prevent it?",
      "Can it spread to humans?",
    ],
    responses: {
      general: `<strong>Salmonella</strong> 🟠 is a bacterial infection that affects chickens AND is a serious <strong>human health risk</strong>. Chickens can carry it without showing any signs at all.<br/><br/>Want to know about its <em>symptoms</em>, <em>management</em>, or <em>prevention</em>?`,
      cause: `Caused by <strong>Salmonella enterica</strong> bacteria. Rodents, wild birds, and insects are major carriers that bring it onto farms.<br/><br/>💡 <em>An infected hen can pass Salmonella directly into eggs before the shell forms!</em>`,
      symptoms: `<strong>Symptoms:</strong><br/>💩 Yellow-green watery diarrhea<br/>😴 Extreme lethargy and weakness<br/>🪶 Ruffled feathers, hunched posture<br/>📉 Drop in egg production<br/><br/>⚠️ <strong>Many adult birds show NO symptoms</strong> but still infect eggs!`,
      management: `💊 <strong>Antibiotics</strong> (Enrofloxacin, Tetracycline) — only under vet prescription<br/>🧫 Always do sensitivity testing first — resistance is growing<br/>⏱️ Observe egg and meat withdrawal periods after antibiotic use`,
      prevention: `💉 Vaccinate breeding flocks<br/>🐀 <strong>Control rodents aggressively</strong> — they are the #1 source<br/>🧹 Clean and disinfect housing between each flock<br/>🧤 Wear gloves when handling birds — wash hands thoroughly after`,
      spread: `🐀 <strong>Rodents</strong> — the primary on-farm reservoir<br/>🥚 Contaminated eggs — bacteria can be inside the egg<br/>👤 Infected birds spread it to humans through handling, eggs, or meat<br/><br/>⚠️ <em>This is a zoonotic disease — always treat it as a human health risk!</em>`,
    },
  },
  healthy: {
    image: DISEASE_PHOTOS.healthy,
    name: "Healthy Hen",
    emoji: "✅",
    followUps: [
      "What do normal droppings look like?",
      "How do I keep my flock healthy?",
      "How do I spot early disease?",
    ],
    responses: {
      general: `A <strong>healthy hen</strong> ✅ is active, alert, and full of life.<br/><br/><strong>Signs of health:</strong><br/>👁️ Bright, clear eyes<br/>🪶 Clean, smooth feathers<br/>🚶 Active movement<br/>🍽️ Good appetite<br/>💩 Firm, brown droppings with a white cap<br/>🔴 Bright red comb and wattles`,
      droppings: `✅ <strong>Normal:</strong> Firm, brown/grey with a white uric acid cap<br/>✅ <strong>Caecal droppings:</strong> Dark brown, sticky, strong smell — totally normal<br/><br/><strong>Warning signs:</strong><br/>🩸 Blood → Coccidiosis<br/>💚 Green & watery → Newcastle<br/>💛 Yellow/white → Salmonella`,
      management: `💧 Fresh, clean water every day<br/>🍽️ Balanced, quality feed<br/>🏠 Clean, dry, well-ventilated housing<br/>💉 Maintain your vaccination schedule<br/>🧹 Remove soiled litter regularly<br/>👁️ Daily visual health checks`,
      prevention: `🚷 Control who enters your farm — disinfect footwear<br/>🆕 Quarantine all new birds for 14+ days<br/>💉 Maintain your vaccination calendar strictly<br/>🐀 Active rodent control year-round<br/>🩺 Schedule regular vet check-ups`,
    },
  },
};

const memory = {
  history: [],
  lastDisease: null,
  lastTopic: null,
  userName: null,
  push(role, text, disease, topic) {
    this.history.push({ role, text, disease, topic, ts: Date.now() });
    if (disease) this.lastDisease = disease;
    if (topic) this.lastTopic = topic;
    if (this.history.length > 30) this.history.shift();
  },
};

function getReply(rawText) {
  const t = rawText.toLowerCase().trim();

  if (
    /^(exit|bye|goodbye|quit|close|farewell|see you|cya|later|done|finish)\b/.test(
      t,
    )
  ) {
    return {
      html: `Goodbye! 👋 Thanks for using <strong>HenBot</strong>. Take good care of your flock! 🐔<br/><em>This window will close in 3 seconds…</em>`,
      img: null,
      followUps: [],
      closeAfter: 3000,
    };
  }
  if (
    /^(hi|hello|hey|howdy|good morning|good afternoon|good evening|sup|hie|yo|greetings)\b/.test(
      t,
    )
  ) {
    const g = memory.userName
      ? `Hi again, ${memory.userName}! 👋`
      : `👋 Hello there!`;
    return {
      html: `${g} I'm <strong>HenBot</strong> — your poultry disease expert.<br/><br/>I know about <strong>Coccidiosis 🔴</strong>, <strong>Newcastle Disease 🟡</strong>, <strong>Salmonella 🟠</strong>, and keeping your flock <strong>healthy ✅</strong>.<br/><br/>What would you like to know?`,
      img: null,
      followUps: [
        "Tell me about Coccidiosis",
        "Tell me about Newcastle Disease",
        "Tell me about Salmonella",
        "What does a healthy hen look like?",
      ],
    };
  }
  const nameMatch = t.match(/(?:my name is|i am|i'm|call me)\s+([a-z]+)/);
  if (nameMatch) {
    memory.userName =
      nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
    return {
      html: `Nice to meet you, <strong>${memory.userName}</strong>! 😊 What would you like to know about your flock?`,
      img: null,
      followUps: [
        "Tell me about Coccidiosis",
        "Tell me about Newcastle Disease",
        "How do I keep hens healthy?",
      ],
    };
  }
  if (/thank|thanks|thank you|cheers|appreciated|helpful/.test(t)) {
    return {
      html: `You're very welcome! 😊 Your flock is lucky to have such a caring farmer. 🐔`,
      img: null,
      followUps: [
        "Tell me more about " + (memory.lastDisease || "Coccidiosis"),
        "How do I keep my flock healthy?",
      ],
    };
  }
  if (
    /what can you|what do you know|help me|topics|capabilities|tell me about yourself/.test(
      t,
    )
  ) {
    return {
      html: `I'm a poultry disease specialist!<br/><br/>🔴 <strong>Coccidiosis</strong><br/>🟡 <strong>Newcastle Disease</strong><br/>🟠 <strong>Salmonella</strong><br/>✅ <strong>Healthy Hen care</strong><br/><br/>Ask something like <em>"Symptoms of Newcastle?"</em> or <em>"How to prevent Coccidiosis?"</em>`,
      img: null,
      followUps: [
        "Tell me about Coccidiosis",
        "Tell me about Newcastle Disease",
        "Tell me about Salmonella",
        "What does a healthy hen look like?",
      ],
    };
  }
  if (
    /difference|compare|versus|vs|which is worse|all three|overview/.test(t)
  ) {
    return {
      html: `<strong>Quick comparison:</strong><br/><br/>🔴 <strong>Coccidiosis</strong> — Parasite | Bloody droppings | Manageable with drugs<br/>🟡 <strong>Newcastle</strong> — Virus | Twisted neck, sudden death | NO cure — vaccinate only!<br/>🟠 <strong>Salmonella</strong> — Bacteria | Diarrhea | Antibiotics | Spreads to humans<br/><br/>⚠️ <em>Newcastle is the most dangerous!</em>`,
      img: null,
      followUps: [
        "Tell me more about Newcastle",
        "Symptoms of Coccidiosis?",
        "How to prevent Salmonella?",
      ],
    };
  }
  if (
    /tell me more|more about|what else|continue|go on|elaborate|explain more/.test(
      t,
    )
  ) {
    if (memory.lastDisease && memory.lastTopic) {
      const entry = KB[memory.lastDisease];
      const topics = Object.keys(entry.responses).filter(
        (tp) => tp !== memory.lastTopic && tp !== "general",
      );
      if (topics.length > 0) {
        const nextTopic = topics[0];
        memory.push("bot", "", memory.lastDisease, nextTopic);
        return {
          html: entry.responses[nextTopic],
          img: entry.image,
          followUps: entry.followUps,
        };
      }
    }
  }
  const pronounRef =
    /\b(it|this disease|this|that disease|the disease|the infection)\b/.test(t);
  let disease = detectDisease(t);
  const topic = detectTopic(t);
  if (!disease && (pronounRef || topic !== "general") && memory.lastDisease)
    disease = memory.lastDisease;
  if (disease) {
    const entry = KB[disease];
    const validTopics = Object.keys(entry.responses);
    const resolved = validTopics.includes(topic) ? topic : "general";
    memory.push("user", rawText, disease, resolved);
    return {
      html: entry.responses[resolved],
      img: entry.image,
      followUps: entry.followUps,
    };
  }
  const suggestions = memory.lastDisease
    ? [
        `Tell me more about ${KB[memory.lastDisease].name}`,
        "How do I prevent it?",
        "What are the symptoms?",
      ]
    : [
        "Tell me about Coccidiosis",
        "Tell me about Newcastle Disease",
        "Tell me about Salmonella",
      ];
  return {
    html: `I'm not quite sure what you mean. 🤔 Try asking:<br/>• <em>"Symptoms of Coccidiosis?"</em><br/>• <em>"How to manage Newcastle?"</em><br/>• <em>"How to prevent Salmonella?"</em>`,
    img: null,
    followUps: suggestions,
  };
}

/* ══════════════════════════════════════════════════════════
   ALL DOM CODE — safely inside DOMContentLoaded
   ══════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  const fab = document.getElementById("chatFab");
  const win = document.getElementById("chatWindow");
  const closeBtn = document.getElementById("chatClose");
  const messages = document.getElementById("chatMessages");
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("chatSend");
  const typing = document.getElementById("typingIndicator");
  const quickBtnsContainer = document.getElementById("quickBtns");

  // Guard: bail out if chatbot markup isn't on this page
  if (
    !fab ||
    !win ||
    !closeBtn ||
    !messages ||
    !input ||
    !sendBtn ||
    !typing ||
    !quickBtnsContainer
  )
    return;

  let isOpen = false;

  const openChat = () => {
    isOpen = true;
    win.classList.add("open");
    input.focus();
    if (!messages.children.length) greetUser();
  };
  const closeChat = () => {
    isOpen = false;
    win.classList.remove("open");
  };

  fab.addEventListener("click", () => (isOpen ? closeChat() : openChat()));
  closeBtn.addEventListener("click", closeChat);

  // Static quick buttons
  document.querySelectorAll(".quick-btn[data-q]").forEach((btn) => {
    btn.addEventListener("click", () => sendMessage(btn.dataset.q));
  });

  function renderFollowUps(suggestions) {
    document.querySelectorAll(".quick-btn-dynamic").forEach((b) => b.remove());
    if (!suggestions || !suggestions.length) return;
    suggestions.forEach((text) => {
      const btn = document.createElement("button");
      btn.className = "quick-btn quick-btn-dynamic";
      btn.textContent = text;
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".quick-btn-dynamic")
          .forEach((b) => b.remove());
        sendMessage(text);
      });
      quickBtnsContainer.appendChild(btn);
    });
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      triggerSend();
    }
  });
  sendBtn.addEventListener("click", triggerSend);
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 80) + "px";
  });

  function triggerSend() {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    input.style.height = "auto";
    sendMessage(text);
  }

  function greetUser() {
    addBotMessage(
      "👋 Hi! I'm <strong>HenBot</strong>, your poultry disease expert.<br/><br/>" +
        "I know about <strong>Coccidiosis 🔴</strong>, <strong>Newcastle Disease 🟡</strong>, " +
        "<strong>Salmonella 🟠</strong>, and keeping your flock <strong>healthy ✅</strong>.<br/><br/>" +
        "What would you like to know?",
      null,
      [
        "Tell me about Coccidiosis",
        "Tell me about Newcastle Disease",
        "Tell me about Salmonella",
        "What does a healthy hen look like?",
      ],
    );
  }

  function addUserMessage(text) {
    document.querySelectorAll(".quick-btn-dynamic").forEach((b) => b.remove());
    const div = document.createElement("div");
    div.className = "chat-msg user";
    div.innerHTML = `<div class="msg-avatar">👤</div><div class="msg-bubble">${escHtml(text)}</div>`;
    messages.appendChild(div);
    scrollBottom();
  }

  function addBotMessage(html, imgData, followUps) {
    const div = document.createElement("div");
    div.className = "chat-msg bot";
    const imgHtml = imgData
      ? `<div class="msg-image"><img src="${imgData.url}" alt="${escHtml(imgData.caption)}" onerror="this.parentElement.style.display='none'" loading="lazy"/><div class="msg-image-caption">${escHtml(imgData.caption)}</div></div>`
      : "";
    div.innerHTML = `<div class="msg-avatar">🐔</div><div class="msg-bubble">${html}${imgHtml}</div>`;
    messages.appendChild(div);
    scrollBottom();
    if (followUps) renderFollowUps(followUps);
  }

  const showTyping = () => {
    typing.classList.add("visible");
    scrollBottom();
  };
  const hideTyping = () => {
    typing.classList.remove("visible");
  };
  const scrollBottom = () =>
    setTimeout(() => {
      messages.scrollTop = messages.scrollHeight;
    }, 50);
  const escHtml = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function sendMessage(rawText) {
    addUserMessage(rawText);
    memory.push(
      "user",
      rawText,
      detectDisease(rawText.toLowerCase()),
      detectTopic(rawText.toLowerCase()),
    );
    showTyping();
    sendBtn.disabled = true;
    input.disabled = true;
    setTimeout(
      () => {
        const { html, img, followUps, closeAfter } = getReply(rawText);
        hideTyping();
        addBotMessage(html, img, followUps);
        sendBtn.disabled = false;
        input.disabled = false;
        input.focus();
        if (closeAfter) setTimeout(closeChat, closeAfter);
      },
      500 + Math.random() * 500,
    );
  }
});
