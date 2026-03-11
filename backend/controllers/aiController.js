const { generateEnergyInsights, chatWithAi } = require('../services/aiService');

/**
 * POST /api/ai/chat
 * Body: { message, currentPower, equipment }
 */
const chat = async (req, res) => {
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
const insight = async (req, res) => {
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

module.exports = { chat, insight };
