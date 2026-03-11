import { generateEnergyInsights, chatWithAi } from '../services/aiService.js';

/**
 * POST /api/ai/chat
 * Body: { message, currentPower, appliances }
 */
export const chat = async (req, res) => {
    try {
        const { message, currentPower, appliances } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'message is required' });
        }

        const result = await chatWithAi(
            message,
            currentPower || 0,
            appliances || []
        );

        res.status(200).json(result);
    } catch (error) {
        console.error('AI Chat Controller Error:', error);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
};

/**
 * GET /api/ai/insight?currentPower=1.5
 * Query: currentPower, appliances (JSON string)
 */
export const insight = async (req, res) => {
    try {
        const { currentPower } = req.query;
        // appliances passed from frontend context as JSON string
        let appliances = [];
        if (req.query.appliances) {
            try { appliances = JSON.parse(req.query.appliances); } catch { }
        }

        const text = await generateEnergyInsights(currentPower || 0, appliances);
        res.status(200).json({ text });
    } catch (error) {
        console.error('AI Insight Controller Error:', error);
        res.status(500).json({ error: 'Failed to get AI insight' });
    }
};

