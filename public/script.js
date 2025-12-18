// 1. The Full 78 Card Deck Data
const fullDeckData = [
    "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", 
    "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit", 
    "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance", 
    "The Devil", "The Tower", "The Star", "The Moon", "The Sun", 
    "Judgement", "The World",
    "Ace of Wands", "Two of Wands", "Three of Wands", "Four of Wands", "Five of Wands", "Six of Wands", "Seven of Wands", "Eight of Wands", "Nine of Wands", "Ten of Wands", "Page of Wands", "Knight of Wands", "Queen of Wands", "King of Wands",
    "Ace of Cups", "Two of Cups", "Three of Cups", "Four of Cups", "Five of Cups", "Six of Cups", "Seven of Cups", "Eight of Cups", "Nine of Cups", "Ten of Cups", "Page of Cups", "Knight of Cups", "Queen of Cups", "King of Cups",
    "Ace of Swords", "Two of Swords", "Three of Swords", "Four of Swords", "Five of Swords", "Six of Swords", "Seven of Swords", "Eight of Swords", "Nine of Swords", "Ten of Swords", "Page of Swords", "Knight of Swords", "Queen of Swords", "King of Swords",
    "Ace of Pentacles", "Two of Pentacles", "Three of Pentacles", "Four of Pentacles", "Five of Pentacles", "Six of Pentacles", "Seven of Pentacles", "Eight of Pentacles", "Nine of Pentacles", "Ten of Pentacles", "Page of Pentacles", "Knight of Pentacles", "Queen of Pentacles", "King of Pentacles"
];

let currentStep = 1;
let shuffledDeck = [];
let isDrawing = false; // Prevents double-clicking spam
let state = {
    deckTheme: 'Classic', // Default theme
    spreadName: '',
    cardsNeeded: 0,
    cardsDrawn: [],
    question: ''
};

// --- NAVIGATION LOGIC ---
function goToStep(stepNum) {
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`step-${stepNum}`);
    if (target) target.classList.add('active');
    
    currentStep = stepNum;
    
    // Toggle Back Button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.classList.toggle('hidden', currentStep === 1);
    }

    // Toggle Theme Pill
    const deckIndicator = document.getElementById('deck-indicator');
    if (deckIndicator) {
        deckIndicator.classList.toggle('hidden', currentStep === 1);
    }
}

function goBack() {
    if (currentStep > 1) {
        if (currentStep === 4) resetPullingStage();
        goToStep(currentStep - 1);
    }
}

function resetPullingStage() {
    state.cardsDrawn = [];
    isDrawing = false;
    document.getElementById('drawn-cards-container').innerHTML = '';
    
    const deckPile = document.getElementById('deck-pile');
    if(deckPile) deckPile.style.display = 'block';
    
    const readBtn = document.getElementById('read-btn');
    if(readBtn) readBtn.classList.add('hidden');
    
    const countLabel = document.getElementById('cards-left');
    if(countLabel) countLabel.innerText = state.cardsNeeded;
    
    startBreathingExercise(); 
}

// --- STEP 1: THEME SELECTION ---
function selectDeck(theme) {
    state.deckTheme = theme;
    document.body.className = theme.toLowerCase() + '-theme';
    
    const themeText = document.getElementById('current-theme');
    if(themeText) themeText.innerText = theme;
    
    const indicator = document.getElementById('deck-indicator');
    if(indicator) indicator.classList.remove('hidden');
    
    goToStep(2);
}

// --- STEP 2: SPREAD SELECTION ---
function selectSpread(name, count) {
    state.spreadName = name;
    state.cardsNeeded = count;
    
    const countLabel = document.getElementById('cards-left');
    if(countLabel) countLabel.innerText = count;
    
    const grid = document.getElementById('drawn-cards-container');
    grid.className = 'drawn-grid'; 
    
    if (count === 1) grid.classList.add('layout-1');
    else if (count === 3) grid.classList.add('layout-3');
    else if (count === 7) grid.classList.add('layout-horseshoe');
    else if (count === 9) grid.classList.add('layout-9');
    else if (name.includes('Cross')) grid.classList.add('layout-cross');
    else grid.classList.add('layout-default'); 

    goToStep(3);
    startBreathingExercise();
}

// --- STEP 3: BREATHING & SHUFFLING ---
function startBreathingExercise() {
    shuffledDeck = [...fullDeckData];
    // Fisher-Yates Shuffle
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
}

function startPulling() {
    const qInput = document.getElementById('user-question');
    let qValue = qInput ? qInput.value.trim() : "";
    if (!qValue) qValue = "General Guidance (No specific question asked)";
    state.question = qValue;
    goToStep(4);
}

// --- STEP 4: PULLING CARDS ---
function drawCard() {
    // 1. Safety Checks (Prevent double pull & over pull)
    if (isDrawing) return; 
    if (state.cardsDrawn.length >= state.cardsNeeded) return;

    isDrawing = true; // Lock the function
    setTimeout(() => { isDrawing = false; }, 300); // Unlock after 300ms

    const cardName = shuffledDeck.pop(); 
    if (!cardName) return; 

    const isReversed = Math.random() < 0.4; 
    state.cardsDrawn.push({ name: cardName, isReversed: isReversed });

    const container = document.getElementById('drawn-cards-container');
    const cardDiv = document.createElement('div');
    cardDiv.className = 'tarot-card-display';
    
    const positionNumber = state.cardsDrawn.length;
    cardDiv.classList.add(`pos-${positionNumber}`);

    if (state.spreadName.includes('Cross') && positionNumber === 2) {
        cardDiv.classList.add('cross-center-2');
    }

    // --- PATH FIXING LOGIC (Based on your Screenshots) ---
    const assetsBaseUrl = "https://killer7wayes-lab.github.io/TarotAssets/";
    const themeKey = state.deckTheme.toLowerCase();
    
    // 1. Fix Typo: Ace of Swords double underscore
    let fileName = cardName.toLowerCase().split(' ').join('_') + ".webp";
    if (fileName === "ace_of_swords.webp") {
        fileName = "ace__of_swords.webp"; 
    }

    // 2. Fix Nested Folders
    let specificPath = "";
    if (themeKey === 'anime') {
        specificPath = "decks/anime/"; // Files are directly here
    } else if (themeKey === 'classic') {
        specificPath = "decks/anime/decks/classic/"; // Nested deep
    } else if (themeKey === 'goth') {
        specificPath = "decks/anime/decks/goth/"; // Nested deep
    } else {
        specificPath = "decks/classic/"; // Fallback
    }
    
    const imagePath = `${assetsBaseUrl}${specificPath}${fileName}`;
    // ----------------------------------------------------

    const cardContent = `
        <img 
            src="${imagePath}" 
            class="card-img" 
            alt="${cardName}" 
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        >
        <div class="fallback-text" style="display:none; flex-direction:column; width:100%; height:100%; align-items:center; justify-content:center; padding:5px; background:#222; color:white; font-size:0.7rem; text-align:center;">
            <span style="font-size:1rem; font-weight:bold; margin-bottom:5px;">${cardName}</span>
            <span style="color:red; word-break:break-all;">Failed to load:<br>${specificPath}${fileName}</span>
        </div>
    `;

    cardDiv.innerHTML = `
        <div class="card-inner ${isReversed ? 'is-flipped' : ''}">
            ${cardContent}
            ${isReversed ? '<div class="rev-icon" style="font-size:0.8rem; margin-top:5px;">↻</div>' : ''}
        </div>
    `;
    
    container.appendChild(cardDiv);

    // Update Counter
    const remaining = state.cardsNeeded - state.cardsDrawn.length;
    const countLabel = document.getElementById('cards-left');
    if(countLabel) countLabel.innerText = remaining;

    // Check if finished
    if (remaining === 0) {
        document.getElementById('deck-pile').style.display = 'none';
        const btn = document.getElementById('read-btn');
        if(btn) {
            btn.classList.remove('hidden');
            btn.style.animation = "fadeIn 1s";
        }
    }
}

// --- STEP 5: AI API CALL ---
async function getAIReading() {
    goToStep(5);
    const loading = document.getElementById('loading');
    const result = document.getElementById('ai-response');
    const errorBox = document.getElementById('error-box');
    
    if(loading) loading.classList.remove('hidden');
    if(result) result.innerHTML = "";
    if(errorBox) errorBox.classList.add('hidden');

    try {
        const response = await fetch('/api/reading', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: state.question,
                spread: state.spreadName,
                cards: state.cardsDrawn, 
                deckTheme: state.deckTheme
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || "Connection error.");
        }
        
        const data = await response.json();
        if(loading) loading.classList.add('hidden');
        if(result) result.innerHTML = data.reading; 

    } catch (e) {
        if(loading) loading.classList.add('hidden');
        if(errorBox) {
            errorBox.classList.remove('hidden');
            errorBox.innerText = "The Oracle is currently silent. Please try again.";
        }
    }
}

// --- FOOTER BUTTONS ---
function copyReading() {
    const result = document.getElementById('ai-response');
    if(result) {
        navigator.clipboard.writeText(result.innerText).then(() => alert("Saved!"));
    }
}

function pullAgain() {
    resetPullingStage();
    goToStep(4);
}

function askNewQuestion() {
    resetPullingStage();
    const input = document.getElementById('user-question');
    if (input) input.value = "";
    state.question = "";
    goToStep(3);
}

// --- INITIALIZATION (SAFE VERSION) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. DECK CLICK (Uses .onclick to prevent double-firing)
    const deckPile = document.getElementById('deck-pile');
    if (deckPile) {
        deckPile.onclick = drawCard; 
    }
    
    // 2. REVEAL BUTTON
    const readBtn = document.getElementById('read-btn');
    if (readBtn) {
        readBtn.onclick = getAIReading;
    }

    // 3. BACK BUTTON
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.onclick = goBack;
    }
});
