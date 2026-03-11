import { useState } from 'react';
import {
    Power,
    Wind,
    Refrigerator,
    Waves,
    Lightbulb,
    Tv,
    Clock,
    Settings,
    Plus,
    Calendar,
    Fan,
    ThermometerSun,
    Microwave,
    UtensilsCrossed,
    Zap
} from 'lucide-react';
import './ApplianceControl.css';
import mqttClient from '../mqttService';
import { useEffect } from 'react';

const ApplianceControl = () => {
    useEffect(() => {
        // Expose client for direct publishing
        window.mqttClient = mqttClient;
    }, []);

    const [appliances, setAppliances] = useState([
        {
            id: 1,
            name: 'Air Conditioner',
            room: 'Living Room',
            icon: Wind,
            status: true,
            power: '1.5 kW',
            temperature: 24,
            mode: 'Cool',
            schedule: { enabled: false, time: '22:00' }
        },
        {
            id: 2,
            name: 'Refrigerator',
            room: 'Kitchen',
            icon: Refrigerator,
            status: true,
            power: '0.3 kW',
            temperature: 4,
            mode: 'Normal',
            schedule: { enabled: false }
        },
        {
            id: 3,
            name: 'Washing Machine',
            room: 'Utility Room',
            icon: Waves,
            status: true,
            power: '0.8 kW',
            cycle: 'Quick Wash',
            timeLeft: '45 min',
            schedule: { enabled: true, time: '22:00' }
        },
        {
            id: 4,
            name: 'Smart Lights',
            room: 'Bedroom',
            icon: Lightbulb,
            status: false,
            power: '0.05 kW',
            brightness: 80,
            schedule: { enabled: true, time: '18:00' }
        },
        {
            id: 5,
            name: 'Television',
            room: 'Living Room',
            icon: Tv,
            status: false,
            power: '0.2 kW',
            schedule: { enabled: false }
        },
        {
            id: 6,
            name: 'Ceiling Fan',
            room: 'Bedroom',
            icon: Fan,
            status: true,
            power: '0.07 kW',
            speed: 'Medium',
            schedule: { enabled: false }
        },
        {
            id: 7,
            name: 'Water Heater',
            room: 'Bathroom',
            icon: ThermometerSun,
            status: false,
            power: '2.0 kW',
            temperature: 60,
            schedule: { enabled: true, time: '07:00' }
        },
        {
            id: 8,
            name: 'Microwave',
            room: 'Kitchen',
            icon: Microwave,
            status: false,
            power: '1.2 kW',
            mode: 'Defrost',
            schedule: { enabled: false }
        },
        {
            id: 9,
            name: 'Dishwasher',
            room: 'Kitchen',
            icon: UtensilsCrossed,
            status: false,
            power: '1.5 kW',
            cycle: 'Eco',
            schedule: { enabled: false }
        },
        {
            id: 10,
            name: 'EV Charger',
            room: 'Garage',
            icon: Zap,
            status: false,
            power: '7.2 kW',
            mode: 'Fast Charge',
            schedule: { enabled: true, time: '01:00' }
        }
    ]);

    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedAppliance, setSelectedAppliance] = useState(null);

    const toggleAppliance = (id) => {
        setAppliances(appliances.map(app => {
            if (app.id === id) {
                const newStatus = !app.status;
                // Publish control command to MQTT
                if (window.mqttClient && window.mqttClient.connected) {
                    const topic = `energysync/control/${app.name.toLowerCase().replace(' ', '_')}`;
                    const payload = JSON.stringify({
                        command: newStatus ? 'ON' : 'OFF',
                        timestamp: new Date().toISOString()
                    });
                    window.mqttClient.publish(topic, payload);
                    console.log(`📡 Sent command to ${topic}: ${payload}`);
                }
                return { ...app, status: newStatus };
            }
            return app;
        }));
    };

    const adjustTemperature = (id, delta) => {
        setAppliances(appliances.map(app =>
            app.id === id && app.temperature !== undefined
                ? { ...app, temperature: Math.max(16, Math.min(30, app.temperature + delta)) }
                : app
        ));
    };

    const adjustBrightness = (id, value) => {
        setAppliances(appliances.map(app =>
            app.id === id && app.brightness !== undefined
                ? { ...app, brightness: value }
                : app
        ));
    };

    const openSchedule = (appliance) => {
        setSelectedAppliance(appliance);
        setShowScheduleModal(true);
    };

    const activeCount = appliances.filter(app => app.status).length;
    const totalPower = appliances
        .filter(app => app.status)
        .reduce((sum, app) => sum + parseFloat(app.power), 0)
        .toFixed(2);

    return (
        <div className="appliance-control">
            <div className="page-header">
                <div>
                    <h1>Appliance Control</h1>
                    <p className="text-secondary">Manage and control all your connected appliances</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} />
                    Add Appliance
                </button>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card card-glass">
                    <div className="summary-icon success">
                        <Power size={24} />
                    </div>
                    <div className="summary-content">
                        <p className="summary-label">Active Appliances</p>
                        <h2 className="summary-value">{activeCount}</h2>
                    </div>
                </div>
                <div className="summary-card card-glass">
                    <div className="summary-icon warning">
                        <Settings size={24} />
                    </div>
                    <div className="summary-content">
                        <p className="summary-label">Total Power Usage</p>
                        <h2 className="summary-value">{totalPower} kW</h2>
                    </div>
                </div>
                <div className="summary-card card-glass">
                    <div className="summary-icon info">
                        <Clock size={24} />
                    </div>
                    <div className="summary-content">
                        <p className="summary-label">Scheduled Tasks</p>
                        <h2 className="summary-value">
                            {appliances.filter(app => app.schedule.enabled).length}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Appliances Grid */}
            <div className="appliances-grid">
                {appliances.map((appliance) => (
                    <div key={appliance.id} className={`appliance-card card-glass ${appliance.status ? 'active' : ''}`}>
                        <div className="appliance-card-header">
                            <div className="appliance-card-icon" style={{
                                backgroundColor: appliance.status
                                    ? 'rgba(34, 197, 94, 0.1)'
                                    : 'rgba(255, 255, 255, 0.05)'
                            }}>
                                <appliance.icon
                                    size={28}
                                    style={{ color: appliance.status ? 'var(--primary-green)' : 'var(--text-tertiary)' }}
                                />
                            </div>
                            <div className="appliance-card-info">
                                <h3>{appliance.name}</h3>
                                <p className="text-secondary">{appliance.room}</p>
                            </div>
                            <button
                                className={`power-toggle ${appliance.status ? 'on' : 'off'}`}
                                onClick={() => toggleAppliance(appliance.id)}
                            >
                                <Power size={20} />
                            </button>
                        </div>

                        <div className="appliance-card-body">
                            <div className="appliance-detail">
                                <span className="detail-label">Power</span>
                                <span className="detail-value">{appliance.power}</span>
                            </div>

                            {appliance.temperature !== undefined && (
                                <div className="temperature-control">
                                    <span className="detail-label">Temperature</span>
                                    <div className="temp-controls">
                                        <button
                                            className="btn btn-sm btn-ghost"
                                            onClick={() => adjustTemperature(appliance.id, -1)}
                                            disabled={!appliance.status}
                                        >
                                            -
                                        </button>
                                        <span className="temp-value">{appliance.temperature}°C</span>
                                        <button
                                            className="btn btn-sm btn-ghost"
                                            onClick={() => adjustTemperature(appliance.id, 1)}
                                            disabled={!appliance.status}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {appliance.brightness !== undefined && (
                                <div className="brightness-control">
                                    <span className="detail-label">Brightness</span>
                                    <div className="brightness-slider">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={appliance.brightness}
                                            onChange={(e) => adjustBrightness(appliance.id, parseInt(e.target.value))}
                                            disabled={!appliance.status}
                                            className="slider"
                                        />
                                        <span className="brightness-value">{appliance.brightness}%</span>
                                    </div>
                                </div>
                            )}

                            {appliance.mode && (
                                <div className="appliance-detail">
                                    <span className="detail-label">Mode</span>
                                    <span className="detail-value">{appliance.mode}</span>
                                </div>
                            )}

                            {appliance.cycle && (
                                <div className="appliance-detail">
                                    <span className="detail-label">Cycle</span>
                                    <span className="detail-value">{appliance.cycle}</span>
                                </div>
                            )}

                            {appliance.timeLeft && (
                                <div className="appliance-detail">
                                    <span className="detail-label">Time Left</span>
                                    <span className="detail-value text-warning">{appliance.timeLeft}</span>
                                </div>
                            )}
                        </div>

                        <div className="appliance-card-footer">
                            <button
                                className="btn btn-sm btn-ghost"
                                onClick={() => openSchedule(appliance)}
                            >
                                <Calendar size={16} />
                                {appliance.schedule.enabled
                                    ? `Scheduled: ${appliance.schedule.time}`
                                    : 'Schedule'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Schedule Modal */}
            {showScheduleModal && selectedAppliance && (
                <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
                    <div className="modal-content card-glass" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Schedule {selectedAppliance.name}</h3>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setShowScheduleModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="schedule-form">
                                <div className="form-group">
                                    <label>Turn On At</label>
                                    <input
                                        type="time"
                                        className="input"
                                        defaultValue={selectedAppliance.schedule.time || ''}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Turn Off At</label>
                                    <input
                                        type="time"
                                        className="input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Repeat</label>
                                    <select className="input">
                                        <option>Daily</option>
                                        <option>Weekdays</option>
                                        <option>Weekends</option>
                                        <option>Custom</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowScheduleModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary">
                                Save Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplianceControl;
