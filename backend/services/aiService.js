const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Use the current recommended model
const MODEL = 'llama-3.3-70b-versatile';

/**
 * Generate a one-shot energy saving insight
 */
const generateEnergyInsights = async (currentPower, equipment) => {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
        return "Please add your GROQ_API_KEY to backend/.env to activate the AI assistant.";
    }

    try {
        const activeEquipment = equipment
            .filter(eq => eq.status)
            .map(eq => `${eq.name} (${eq.power} kW)`)
            .join(', ');

        const response = await groq.chat.completions.create({
            model: MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are an intelligent data center energy manager for a platform called EnergiSync. Give short, professional, data-specific 2-sentence energy saving insights.'
                },
                {
                    role: 'user',
                    content: `The data center is currently consuming ${currentPower} kW. Active equipment: ${activeEquipment || 'None'}. Provide a specific insight based on this data.`
                }
            ],
            max_tokens: 150
        });

        return response.choices[0]?.message?.content || "Unable to generate insight.";
    } catch (error) {
        console.error("Groq AI Insight Error:", error.message);
        return "I'm having trouble connecting to the AI brain right now. Please try again later.";
    }
};

/**
 * Chat with AI, with optional function-calling to control equipment
 */
const chatWithAi = async (message, currentPower, equipment) => {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
        return { text: "Please add your GROQ_API_KEY to backend/.env." };
    }

    try {
        const equipmentListStr = equipment
            .map(e => `- ${e.name} in the ${e.zone} (Currently ${e.status ? 'ON' : 'OFF'})`)
            .join('\n') || 'None';

        const systemPrompt = `You are EnergiSync Data Center AI, a smart campus energy assistant.
Current live power draw: ${currentPower} kW.
Equipment:
${equipmentListStr}

If the user asks to control an equipment (including setting temperature, speed, or intensity), respond ONLY with a JSON object in this exact format:
{"action": "controlEquipment", "actions": [{"equipmentName": "AC", "command": "ON", "newValue": 20, "delay": 5}]}

- "command" can be "ON", "OFF", or "SET".
- "newValue" is the numerical value for temperature, speed (1-5), or intensity (0-100).
- "delay" is optional and should be in seconds.
- For all other questions, answer helpfully and concisely in plain text.`;

        const response = await groq.chat.completions.create({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            max_tokens: 300,
            temperature: 0.7
        });

        const rawText = response.choices[0]?.message?.content || '';

        // Strip markdown code fences if the model wraps its JSON
        const cleanedText = rawText.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();

        // Try to parse as an action JSON response
        const jsonMatch = cleanedText.match(/\{[\s\S]*"action"\s*:\s*"controlEquipment"[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const actionData = JSON.parse(jsonMatch[0]);
                const hasDelay = actionData.actions.some(a => a.delay > 0);

                return {
                    text: hasDelay
                        ? "I've scheduled those commands with the requested delay."
                        : "I'll execute that command for you now.",
                    action: {
                        name: 'controlEquipment',
                        args: { actions: actionData.actions }
                    }
                };
            } catch (error) {
                console.warn("AI returned action-like text but JSON parsing failed:", error.message);
            }
        }

        return { text: rawText };

    } catch (error) {
        console.error("Groq AI Chat Error:", error.message);
        return { text: "An error occurred while thinking. Please check your API key and connection." };
    }
};

/**
 * Generate specific optimization advice for the Tariff Optimizer
 */
const generateOptimizationAdvice = async (equipment) => {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
        return "Please add your GROQ_API_KEY to activate AI optimizations.";
    }

    try {
        const equipmentSummary = equipment
            .map(e => `- ${e.name} (${e.power}W) in ${e.zone}. Status: ${e.status ? 'ON' : 'OFF'}`)
            .join('\n');

        const response = await groq.chat.completions.create({
            model: MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are an Expert Smart Energy Consultant. Analyze the provided equipment list and give 3 precise, actionable bullet points to optimize energy costs using time-of-day tariffs (Peak: 9-12 and 18-21, Off-Peak: 22-05). Be specific about which appliances to shift.'
                },
                {
                    role: 'user',
                    content: `Here is the current equipment configuration:\n${equipmentSummary}\nProvide optimization advice.`
                }
            ],
            max_tokens: 400,
            temperature: 0.7
        });

        return response.choices[0]?.message?.content || "No advice available at the moment.";
    } catch (error) {
        console.error("Groq AI Advice Error:", error.message);
        return "Unable to generate optimization strategies right now.";
    }
};

module.exports = { generateEnergyInsights, chatWithAi, generateOptimizationAdvice };
