module.exports = async (req, res) => {
    // 1. CORS & Setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: "Server Error: API Key missing." });
    }

    try {
        const { question, spread, cards, deckTheme } = req.body;

        // --- 2. DEFINE SPREAD POSITIONS ---
        const spreadMeanings = {
            "1 Card Pull": ["The Insight"],
            "3 Card Spread": ["The Past", "The Present", "The Future"],
            "Mind Body Spirit": ["Mind (Mental State)", "Body (Physical Reality)", "Spirit (Inner Self)"],
            "Career & Wealth": ["Current Situation", "Challenges", "Outcome"],
            "Love & Connection": ["You", "Them", "The Dynamic"],
            "Horseshoe Spread": ["1. The Past", "2. The Present", "3. Hidden Influences", "4. Obstacles", "5. External Influences", "6. Action to Take", "7. The Outcome"],
            "9 Card Destiny Grid": ["Past Mind", "Past Body", "Past Spirit", "Present Mind", "Present Body", "Present Spirit", "Future Mind", "Future Body", "Future Spirit"],
            "Celtic Cross": ["1. The Heart of the Matter", "2. The Challenge (Crosses You)", "3. The Root (Unconscious)", "4. The Past", "5. The Crown (Conscious Goal)", "6. The Future", "7. Self Perception", "8. Environment", "9. Hopes & Fears", "10. The Outcome"]
        };

        const positions = spreadMeanings[spread] || [];

        // Format cards
        const formattedCards = cards.map((c, i) => {
            const positionName = positions[i] || `Card ${i + 1}`;
            const status = c.isReversed ? "REVERSED (Internal Block)" : "UPRIGHT";
            return `- **${positionName}**: ${c.name} *${status}*`;
        }).join('\n');


        // --- 3. DEFINE PERSONAS (The "Flavor") ---
        let systemPersona = "";

        if (deckTheme === "Anime") {
            systemPersona = `You are a spirited "Fate Weaver" from an anime world. 
            Your tone is energetic, empowering, and dramatic. 
            Always frame challenges as "training arcs" or "boss battles" that the user is destined to win.`;
        } 
        else if (deckTheme === "Goth") {
            systemPersona = `You are the "Oracle of the Void." 
            Your tone is dark and poetic, but ultimately protective.
            You help the user find the light within the darkness. Even the abyss has a bottom, and you are the guide up.`;
        } 
        else { // Classic
            systemPersona = `You are a wise, benevolent Tarot Master. 
            Your tone is soothing, optimistic, and encouraging. 
            You focus on growth, healing, and the abundance coming into the user's life.`;
        }


        // --- 4. THE "POSITIVE VIBES" PROMPT ---
        const finalPrompt = `
        ${systemPersona}

        **CONTEXT:**
        - User Question: "${question || "General Guidance"}"
        - Spread Type: "${spread}"
        
        **THE CARDS DRAWN:**
        ${formattedCards}

        **YOUR MISSION (CRITICAL):**
        Provide a highly detailed, **uplifting, and empowering** reading. 
        **Rule #1:** Never predict doom or failure. If a card is negative (like Death or Tower), frame it as a "necessary release" or an "exciting new beginning." 
        **Rule #2:** The user must feel hopeful and capable of changing their fate after reading this.
        
        **FORMATTING:**
        Use HTML tags (<h3>, <p>, <strong>).
        
        1. <h3>The Heart of the Matter</h3>
           <p>A direct, 3-sentence summary. Focus on the potential for success.</p>

        2. <h3>Detailed Interpretation</h3>
           <p>Analyze each card. Connect them together to tell a story of growth.
           <strong>Crucial:</strong> If a card is Reversed, explain it as a temporary delay that the user can easily fix, not a permanent block.</p>

        3. <h3>Actionable Guidance</h3>
           <p>Provide 2 concrete, positive actions the user can take right now to manifest their best outcome.</p>

        **CONSTRAINTS:**
        - Length: Approx 400-600 words.
        - Tone: Encouraging, Warm, insightful.
        `;

        // --- 5. CALL GROQ API ---
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", 
                messages: [
                    { role: "system", content: finalPrompt },
                    { role: "user", content: "Interpret my spread with hope." }
                ],
                temperature: 0.7, 
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();
        const reading = data.choices[0]?.message?.content || "The spirits are silent.";

        return res.status(200).json({ reading });

    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ error: "The connection to the ether was severed." });
    }
};
