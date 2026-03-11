import { useState, useContext, useEffect, useRef } from 'react';
import { EnergyContext } from '../context/EnergyContext';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import './AIAssistantWidget.css';

const AIAssistantWidget = () => {
    const { currentPower, appliances, setAppliances } = useContext(EnergyContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hi! I'm your EnergiSync AI. Ask me about your current energy usage or how to save power!" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Auto-scroll logic
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsTyping(true);

        // Call backend AI endpoint (Groq runs on backend — key never exposed to browser)
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMsg, currentPower, appliances })
        });
        const responseData = await res.json();

        setMessages(prev => [...prev, { role: 'assistant', text: responseData.text }]);

        // Execute hardware command if AI decided it was necessary
        if (responseData.action && responseData.action.name === 'controlAppliances') {
            const actions = responseData.action.args.actions;
            let successCount = 0;
            let failCount = 0;

            for (const act of actions) {
                const { applianceName, command } = act;
                // Soft match to handle "Air Conditioner in the Living Room" vs "Air Conditioner"
                const targetAppliance = appliances.find(a =>
                    applianceName.toLowerCase().includes(a.name.toLowerCase()) ||
                    a.name.toLowerCase().includes(applianceName.toLowerCase())
                );

                if (targetAppliance && window.mqttClient && window.mqttClient.connected) {
                    const topic = `energysync/control/${targetAppliance.name.toLowerCase().replace(' ', '_')}`;
                    const isTurningOn = command === 'ON';

                    const payload = JSON.stringify({
                        command: command,
                        timestamp: new Date().toISOString(),
                        enabled: isTurningOn
                    });

                    window.mqttClient.publish(topic, payload);
                    console.log(`🤖 AI Sent command to ${topic}: ${payload}`);

                    // Optimistically update the React UI state so toggles move
                    setAppliances(prevAppliances =>
                        prevAppliances.map(app =>
                            app.id === targetAppliance.id
                                ? { ...app, status: isTurningOn }
                                : app
                        )
                    );

                    successCount++;
                } else {
                    failCount++;
                }
            }

            if (failCount > 0 && successCount === 0) {
                setMessages(prev => [...prev, { role: 'assistant', text: `(System: Could not execute commands. Please ensure the target appliances exist and the MQTT broker is connected.)` }]);
            } else if (successCount > 0) {
                setMessages(prev => [...prev, { role: 'assistant', text: `(System: Processed ${successCount} hardware commands successfully.)` }]);
            }
        }

        setIsTyping(false);
    };

    return (
        <>
            {/* Action Button */}
            {!isOpen && (
                <button
                    className="ai-fab-button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open AI Assistant"
                >
                    <Sparkles size={24} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="ai-chat-window card-glass">
                    <div className="ai-chat-header">
                        <div className="ai-header-title">
                            <Bot size={20} className="text-secondary-blue" />
                            <h3>EnergiSync AI</h3>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="ai-chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-bubble ${msg.role}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message-bubble assistant typing">
                                <Loader2 size={16} className="spin" /> Thinking...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="ai-chat-input" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Ask about your energy..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary btn-icon"
                            disabled={!input.trim() || isTyping}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default AIAssistantWidget;
