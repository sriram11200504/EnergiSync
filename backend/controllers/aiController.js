const { generateEnergyInsights, chatWithAi, generateOptimizationAdvice } = require('../services/aiService');

/**
 * POST /api/ai/chat
 * Body: { message, currentPower, equipment }
 */
export const chat = async (req, res) => {
    try {
        const { message, currentPower, equipment } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'message is required' });
        }

        const result = await chatWithAi(
            message,
            currentPower || 0,
            equipment || []
        );

        res.status(200).json(result);
    } catch (error) {
        console.error('AI Chat Controller Error:', error);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
};

/**
 * GET /api/ai/insight?currentPower=1.5
 * Query: currentPower, equipment (JSON string)
 */
export const insight = async (req, res) => {
    try {
        const { currentPower } = req.query;
        // equipment passed from frontend context as JSON string
        let equipment = [];
        if (req.query.equipment) {
            try { equipment = JSON.parse(req.query.equipment); } catch { }
        }

        const text = await generateEnergyInsights(currentPower || 0, equipment);
        res.status(200).json({ text });
    } catch (error) {
        console.error('AI Insight Controller Error:', error);
        res.status(500).json({ error: 'Failed to get AI insight' });
    }
};

/**
 * POST /api/ai/advice
 * Body: { equipment }
 */
const advice = async (req, res) => {
    try {
        const { equipment } = req.body;
        if (!equipment || !Array.isArray(equipment)) {
            return res.status(400).json({ error: 'equipment array is required' });
        }

        const text = await generateOptimizationAdvice(equipment);
        res.status(200).json({ text });
    } catch (error) {
        console.error('AI Advice Controller Error:', error);
        res.status(500).json({ error: 'Failed to get AI advice' });
    }
};

module.exports = { chat, insight, advice };
