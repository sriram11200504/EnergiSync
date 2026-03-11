import { useState, useEffect } from 'react';
import { Globe, Save, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const IoTConnectionSettings = () => {
    const [config, setConfig] = useState({
        brokerUrl: 'wss://broker.hivemq.com:8884/mqtt',
        username: '',
        password: '',
        clientId: 'energysync_' + Math.random().toString(16).substr(2, 8)
    });
    const [isConnected, setIsConnected] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const savedConfig = localStorage.getItem('mqtt_config');
        if (savedConfig) {
            try {
                setConfig(JSON.parse(savedConfig));
            } catch (e) {
                console.error('Failed to parse saved MQTT config', e);
            }
        }

        // Initial check and set up listener
        const checkConnection = () => {
            setIsConnected(window.mqttClient?.connected || false);
        };

        checkConnection();
        const interval = setInterval(checkConnection, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        localStorage.setItem('mqtt_config', JSON.stringify(config));

        // Reload page to apply new connection settings
        setTimeout(() => {
            window.location.reload();
        }, 800);
    };

    const handleReset = () => {
        if (window.confirm('Reset to default HiveMQ broker settings?')) {
            const defaultConfig = {
                brokerUrl: 'wss://broker.hivemq.com:8884/mqtt',
                username: '',
                password: '',
                clientId: 'energysync_' + Math.random().toString(16).substr(2, 8)
            };
            setConfig(defaultConfig);
            localStorage.setItem('mqtt_config', JSON.stringify(defaultConfig));
            window.location.reload();
        }
    };

    return (
        <div className="iot-settings">
            <div className="settings-section-header">
                <Globe className="text-primary" size={24} />
                <h2>IoT Broker Configuration</h2>
            </div>

            <div className="connection-status-bar mb-4">
                <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div>
                        <strong>Status: </strong>
                        {isConnected ? (
                            <span className="text-success">Connected to MQTT Broker</span>
                        ) : (
                            <span className="text-danger">Disconnected</span>
                        )}
                    </div>
                </div>
                {isConnected ? <Wifi size={18} className="text-success" style={{ marginLeft: 'auto' }} /> : <WifiOff size={18} className="text-danger" style={{ marginLeft: 'auto' }} />}
            </div>

            <form className="settings-form" onSubmit={handleSave}>
                <div className="settings-subsection card-glass-dark">
                    <h3>Connection Details</h3>
                    <div className="form-group">
                        <label>Broker WebSockets URL</label>
                        <input
                            type="text"
                            name="brokerUrl"
                            className="glass-input"
                            value={config.brokerUrl}
                            onChange={handleChange}
                            placeholder="wss://broker.hivemq.com:8884/mqtt"
                            required
                        />
                        <small className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '4px' }}>Must be a secure WebSockets URL (wss://) for browser clients</small>
                    </div>

                    <div className="form-group mt-md">
                        <label>Client ID</label>
                        <input
                            type="text"
                            name="clientId"
                            className="glass-input"
                            value={config.clientId}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="settings-subsection card-glass-dark mt-md">
                    <h3>Authentication (Optional)</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                className="glass-input"
                                value={config.username}
                                onChange={handleChange}
                                placeholder="Optional"
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                className="glass-input"
                                value={config.password}
                                onChange={handleChange}
                                placeholder="Optional"
                            />
                        </div>
                    </div>
                </div>

                <hr className="divider" />

                <div className="settings-actions">
                    <button type="button" className="btn-secondary" onClick={handleReset} style={{ marginRight: '1rem' }}>
                        <RefreshCw size={18} /> Reset Defaults
                    </button>
                    <button type="submit" className="btn-primary" disabled={isSaving}>
                        {isSaving ? (
                            <RefreshCw size={18} className="spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        {isSaving ? 'Reconnecting...' : 'Save & Connect'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default IoTConnectionSettings;
