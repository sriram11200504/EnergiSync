import { useState, useContext, useEffect, useRef } from 'react';
import { EnergyContext } from '../context/EnergyContext';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import './AIAssistantWidget.css';

const AIAssistantWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hello! I am EnergiSync Data Center AI. How can I help optimize your infrastructure today?' }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const { currentPower, equipmentList, setEquipment } = useContext(EnergyContext);

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
        if (!input.trim() || isThinking) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsThinking(true);

        // Call backend API
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                currentPower: currentPower,
                equipment: equipmentList
            })
        });
        const responseData = await res.json();

        setMessages(prev => [...prev, { role: 'assistant', text: responseData.text }]);

        // Execute hardware command if AI decided it was necessary
        if (responseData.action && responseData.action.name === 'controlEquipment') {
            const actions = responseData.action.args.actions;
            let successCount = 0;
            let failCount = 0;

            for (const act of actions) {
                const { equipmentName, command, delay } = act;
                // Soft match
                const targetEquipment = equipmentList.find(a =>
                    equipmentName.toLowerCase().includes(a.name.toLowerCase()) ||
                    a.name.toLowerCase().includes(equipmentName.toLowerCase())
                );

                if (targetEquipment) {
                    const executeAction = () => {
                        const isTurningOn = command === 'ON';

                        // Publish MQTT command
                        if (window.mqttClient && window.mqttClient.connected) {
                            const topic = `energysync/control/${targetEquipment.name.toLowerCase().replaceAll(' ', '_')}`;
                            const payload = JSON.stringify({
                                command: command,
                                timestamp: new Date().toISOString(),
                                enabled: isTurningOn
                            });
                            window.mqttClient.publish(topic, payload);
                            console.log(`🤖 AI Executed MQTT to ${topic}: ${payload}`);
                        }

                        // Update React UI state optimistically
                        setEquipment(prevEquipment =>
                            prevEquipment.map(eq =>
                                eq.id === targetEquipment.id
                                    ? { ...eq, status: isTurningOn }
                                    : eq
                            )
                        );
                    };

                    if (delay && delay > 0) {
                        console.log(`🤖 AI Scheduled action for ${targetEquipment.name} with ${delay}s delay`);
                        setTimeout(executeAction, delay * 1000);
                    } else {
                        executeAction();
                    }

                    successCount++;
                } else {
                    failCount++;
                }
            }

            if (failCount > 0 && successCount === 0) {
                setMessages(prev => [...prev, { role: 'assistant', text: `(System: Could not find the specified equipment. Please check the name and try again.)` }]);
            } else if (successCount > 0) {
                setMessages(prev => [...prev, { role: 'assistant', text: `(System: ✅ ${successCount} command(s) executed successfully.)` }]);
            }
        }

        setIsThinking(false);
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
                            <h3>EnergiSync Data Center AI</h3>
                            <span className="status-indicator active"></span>
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
                        {isThinking && (
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
                            disabled={isThinking}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary btn-icon"
                            disabled={!input.trim() || isThinking}
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
