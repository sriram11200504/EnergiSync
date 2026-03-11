const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Use the current recommended model
const MODEL = 'llama-3.3-70b-versatile';

/**
 * Generate a one-shot energy saving insight
 */
const generateEnergyInsights = async (currentPower, appliances) => {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
        return "Please add your GROQ_API_KEY to backend/.env to activate the AI assistant.";
    }

    try {
        const activeAppliances = appliances
            .filter(app => app.status)
            .map(app => `${app.name} (${app.power} kW)`)
            .join(', ');

        const response = await groq.chat.completions.create({
            model: MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are an intelligent home energy assistant for a smart app called EnergiSync. Give short, friendly, data-specific 2-sentence energy saving tips.'
                },
                {
                    role: 'user',
                    content: `The user is currently consuming ${currentPower} kW. Active appliances: ${activeAppliances || 'None'}. Provide a specific tip based on this data.`
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
 * Chat with AI, with optional function-calling to control appliances
 */
const chatWithAi = async (message, currentPower, appliances) => {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
        return { text: "Please add your GROQ_API_KEY to backend/.env." };
    }

    try {
        const applianceListStr = appliances
            .map(a => `- ${a.name} in the ${a.room} (Currently ${a.status ? 'ON' : 'OFF'})`)
            .join('\n') || 'None';

        const systemPrompt = `You are EnergiSync AI, a smart home energy assistant.
Current live power draw: ${currentPower} kW.
Appliances:
${applianceListStr}

If the user asks to control an appliance, respond ONLY with a JSON object in this exact format (no extra text):
{"action": "controlAppliances", "actions": [{"applianceName": "Air Conditioner", "command": "OFF"}]}

For multiple appliances follow the same format with multiple items in the actions array.
For all other questions, answer helpfully and concisely in plain text.`;

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

        // Strip markdown code fences if the model wraps its JSON (e.g. ```json ... ```)
        const cleanedText = rawText.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();

        // Try to parse as an action JSON response
        const jsonMatch = cleanedText.match(/\{[\s\S]*"action"\s*:\s*"controlAppliances"[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const actionData = JSON.parse(jsonMatch[0]);
                return {
                    text: "I'll execute that command for you now.",
                    action: {
                        name: 'controlAppliances',
                        args: { actions: actionData.actions }
                    }
                };
            } catch (parseError) {
                console.warn("AI returned action-like text but JSON parsing failed:", parseError.message);
            }
        }

        return { text: rawText };

    } catch (error) {
        console.error("Groq AI Chat Error:", error.message);
        return { text: "An error occurred while thinking. Please check your API key and connection." };
    }
};

module.exports = { generateEnergyInsights, chatWithAi };
