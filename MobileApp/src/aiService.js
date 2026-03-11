import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const generateEnergyInsights = async (currentPower, appliances) => {
    try {
        if (!import.meta.env.VITE_GEMINI_API_KEY) {
            return "Hi there! I am the EnergiSync AI Assistant. Please add your Google Gemini API Key to the .env file to activate me!";
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const activeAppliances = appliances
            .filter(app => app.status)
            .map(app => `${app.name} (${app.power} kW)`)
            .join(', ');

        const prompt = `
        You are an intelligent home energy assistant for a smart app called EnergiSync.
        The user is currently consuming ${currentPower} kW of power.
        The active appliances right now are: ${activeAppliances || 'None'}.
        
        Please provide a short, friendly, and highly specific 2-sentence insight or energy-saving tip based on this exact live data. Do not use generic advice. Address the user directly.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("AI Generation Error:", error);
        return "I'm having trouble connecting to the AI brain right now. Please try again later.";
    }
};

export const chatWithAi = async (message, currentPower, appliances) => {
    try {
        if (!import.meta.env.VITE_GEMINI_API_KEY) {
            return { text: "Please add your VITE_GEMINI_API_KEY to your .env file." };
        }

        // Define the Tool schema that Gemini is allowed to use
        const controlAppliancesTool = {
            name: "controlAppliances",
            description: "Turns one or multiple smart home appliances ON or OFF.",
            parameters: {
                type: "OBJECT",
                properties: {
                    actions: {
                        type: "ARRAY",
                        description: "A list of appliances and the commands to execute on them.",
                        items: {
                            type: "OBJECT",
                            properties: {
                                applianceName: {
                                    type: "STRING",
                                    description: "The name of the appliance to control.",
                                },
                                command: {
                                    type: "STRING",
                                    description: "The action to take, exactly 'ON' or 'OFF'.",
                                }
                            },
                            required: ["applianceName", "command"]
                        }
                    }
                },
                required: ["actions"],
            },
        };

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            tools: [{ functionDeclarations: [controlAppliancesTool] }]
        });

        const applianceListStr = appliances.map(a => `- ${a.name} in the ${a.room} (Currently ${a.status ? 'ON' : 'OFF'})`).join('\n') || 'None';

        const activeSystemContext = `
        System Context for AI:
        The current live power draw of the home is: ${currentPower} kW.
        Here are the exact names and current states of the user's smart home appliances:
        ${applianceListStr}
        `;

        const chatPrompt = `${activeSystemContext}\n\nThe user says: "${message}"\n\nIf the user asks to turn an appliance on or off, use the controlAppliances tool with the exact appliance name from the list above. If they ask to turn 'all' devices on/off, insert an action for EVERY running appliance in the array. Otherwise, answer the user helpfully and concisely as the EnergiSync AI assistant based on the live home context.`;

        const result = await model.generateContent(chatPrompt);
        const response = result.response;

        // Check if the AI decided to call a function
        const functionCalls = response.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
            // Return both the action request and whatever text it wanted to say (if any)
            return {
                text: response.text() || "I am executing that hardware command for you now.",
                action: functionCalls[0] // e.g. { name: 'controlAppliance', args: { applianceName: 'Air Conditioner', command: 'OFF' } }
            };
        }

        // Standard conversational response
        return { text: response.text() };

    } catch (error) {
        console.error("AI Chat Error:", error);
        return { text: "An error occurred while thinking. Please check your API key and connection." };
    }
};
