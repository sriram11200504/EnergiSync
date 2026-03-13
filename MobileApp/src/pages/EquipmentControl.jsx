import { useState, useContext, useEffect } from 'react';
import { EnergyContext } from '../context/EnergyContext';
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
    Zap,
    X,
    Trash2
} from 'lucide-react';
import './EquipmentControl.css';
import mqttClient from '../mqttService';

const EquipmentControl = () => {
    useEffect(() => {
        // Expose client for direct publishing
        window.mqttClient = mqttClient;
    }, []);

    const {
        equipmentList,
        setEquipment,
        addEquipment,
        deleteEquipment,
        zones,
        addZone
    } = useContext(EnergyContext);
    const [filter, setFilter] = useState('All');
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [showEquipmentModal, setShowEquipmentModal] = useState(false);

    // Form states
    const [newZone, setNewZone] = useState({ name: '', description: '' });
    const [newEquipment, setNewEquipment] = useState({
        name: '',
        zone: '',
        templateId: 'compute'
    });

    // Derive unique zones for filtering from both backend zones and equipment
    const filterZones = ['All', ...new Set([
        ...zones.map(z => z.name),
        ...equipmentList.map(eq => eq.zone)
    ])];

    const filteredEquipment = filter === 'All'
        ? equipmentList
        : equipmentList.filter(eq => eq.zone === filter);

    const handleAddZone = async (e) => {
        e.preventDefault();
        await addZone(newZone);
        setNewZone({ name: '', description: '' });
        setShowZoneModal(false);
    };
    // Equipment Templates
    const EQUIPMENT_TEMPLATES = [
        { id: 'ac', name: 'Air Conditioner', type: 'Cooling', power: 2500, minScale: 16, maxScale: 30, unit: '°C', icon: <ThermometerSun size={24} /> },
        { id: 'fan', name: 'Ceiling Fan', type: 'Ventilation', power: 75, minScale: 1, maxScale: 5, unit: 'Level', icon: <Fan size={24} /> },
        { id: 'light', name: 'Smart Lighting', type: 'Lighting', power: 100, minScale: 0, maxScale: 100, unit: '%', icon: <Lightbulb size={24} /> },
        { id: 'appliance', name: 'General Appliance', type: 'Appliance', power: 500, minScale: null, maxScale: null, unit: '', icon: <Zap size={24} /> },
        { id: 'compute', name: 'Server/Workstation', type: 'Compute', power: 1000, minScale: null, maxScale: null, unit: '', icon: <Settings size={24} /> }
    ];

    const handleAddEquipment = async (e) => {
        e.preventDefault();
        const template = EQUIPMENT_TEMPLATES.find(t => t.id === newEquipment.templateId);
        const finalEquipment = {
            ...newEquipment,
            name: newEquipment.name || template.name,
            power: template.power,
            type: template.type,
            minScale: template.minScale,
            maxScale: template.maxScale,
            unit: template.unit,
            value: template.minScale || 0
        };
        await addEquipment(finalEquipment);
        setNewEquipment({ name: '', zone: '', templateId: 'compute' });
        setShowEquipmentModal(false);
    };

    const handleScaleUpdate = (id, newValue) => {
        setEquipment(equipmentList.map(eq => {
            if (eq.id === id) {
                if (window.mqttClient && window.mqttClient.connected) {
                    const topic = `energysync/control/${eq.name.toLowerCase().replaceAll(' ', '_')}`;
                    const payload = JSON.stringify({
                        command: 'SET',
                        value: newValue,
                        timestamp: new Date().toISOString()
                    });
                    window.mqttClient.publish(topic, payload);
                }
                return { ...eq, value: newValue };
            }
            return eq;
        }));
    };

    const toggleEquipment = (id) => {
        setEquipment(equipmentList.map(eq => {
            if (eq.id === id) {
                const newStatus = !eq.status;
                if (window.mqttClient && window.mqttClient.connected) {
                    const topic = `energysync/control/${eq.name.toLowerCase().replaceAll(' ', '_')}`;
                    const payload = JSON.stringify({
                        command: newStatus ? 'ON' : 'OFF',
                        timestamp: new Date().toISOString(),
                        enabled: newStatus,
                        value: eq.value
                    });
                    window.mqttClient.publish(topic, payload);
                }
                return { ...eq, status: newStatus };
            }
            return eq;
        }));
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'Cooling': return <ThermometerSun size={24} />;
            case 'Ventilation': return <Fan size={24} />;
            case 'Lighting': return <Lightbulb size={24} />;
            case 'Appliance': return <Zap size={24} />;
            default: return <Settings size={24} />;
        }
    };

    const activeCount = equipmentList.filter(eq => eq.status).length;
    const totalPower = equipmentList
        .filter(eq => eq.status)
        .reduce((sum, eq) => sum + parseFloat(eq.power), 0)
        .toFixed(2);

    return (
        <div className="equipment-control-container">
            <header className="page-header">
                <div className="header-content">
                    <h2>Campus Infrastructure Control</h2>
                    <p>Live resource management for your smart campus.</p>
                </div>
                <div className="header-actions">
                    <button className="add-btn secondary" onClick={() => setShowZoneModal(true)}>
                        <Plus size={20} />
                        Add Zone
                    </button>
                    <button className="add-btn" onClick={() => setShowEquipmentModal(true)}>
                        <Plus size={20} />
                        Add Equipment
                    </button>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card card-glass">
                    <div className="summary-icon success">
                        <Power size={24} />
                    </div>
                    <div className="summary-content">
                        <p className="summary-label">Active Equipment</p>
                        <h2 className="summary-value">{activeCount}</h2>
                    </div>
                </div>
                <div className="summary-card card-glass">
                    <div className="summary-icon warning">
                        <Zap size={24} />
                    </div>
                    <div className="summary-content">
                        <p className="summary-label">Live Load (W)</p>
                        <h2 className="summary-value">{totalPower} W</h2>
                    </div>
                </div>
                <div className="summary-card card-glass">
                    <div className="summary-icon info">
                        <Clock size={24} />
                    </div>
                    <div className="summary-content">
                        <p className="summary-label">Schedules Run</p>
                        <h2 className="summary-value">
                            {equipmentList.filter(eq => eq.schedule?.enabled).length}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="filters-container">
                {filterZones.map(zone => (
                    <button
                        key={zone}
                        className={`filter-btn ${filter === zone ? 'active' : ''}`}
                        onClick={() => setFilter(zone)}
                    >
                        {zone}
                    </button>
                ))}
            </div>

            <div className="equipment-grid">
                {filteredEquipment.map(eq => (
                    <div key={eq.id} className={`equipment-card ${eq.status ? 'active' : ''}`}>
                        <div className="card-header">
                            <div className="eq-icon-wrap">
                                {getIconForType(eq.type)}
                            </div>
                            <div className="eq-info">
                                <h3>{eq.name}</h3>
                                <span>{eq.zone} | {eq.type}</span>
                            </div>
                        </div>

                        <div className="card-body">
                            <div className="details-grid">
                                <div className="detail highlight">
                                    <label>Draw</label>
                                    <span>{eq.power}W</span>
                                </div>
                                <div className="detail">
                                    <label>Scale</label>
                                    <span>{eq.maxScale ? `${eq.minScale}-${eq.maxScale}${eq.unit}` : 'Binary'}</span>
                                </div>
                            </div>

                            {/* Scale Controls - Only if min/max defined */}
                            {eq.maxScale !== null && eq.status && (
                                <div className="scale-control-group">
                                    <div className="scale-label">
                                        <span>Intensity/Level</span>
                                        <span className="current-val">{eq.value}{eq.unit}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={eq.minScale}
                                        max={eq.maxScale}
                                        value={eq.value}
                                        onChange={(e) => handleScaleUpdate(eq.id, parseInt(e.target.value))}
                                        className="scale-slider"
                                    />
                                </div>
                            )}

                            <div className="status-row">
                                <div className="status-indicator">
                                    <span className="dot"></span>
                                    {eq.status ? 'ONLINE' : 'STANDBY'}
                                </div>
                                <button
                                    className={`power-toggle ${eq.status ? 'on' : 'off'}`}
                                    onClick={() => toggleEquipment(eq.id)}
                                    title={eq.status ? 'Shutdown' : 'Power On'}
                                >
                                    <Power size={18} />
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => {
                                        if (window.confirm(`Are you sure you want to remove ${eq.name}?`)) {
                                            deleteEquipment(eq.id);
                                        }
                                    }}
                                    title="Remove Equipment"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Zone Modal */}
            {showZoneModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <div className="modal-header">
                            <h3>Create Campus Zone</h3>
                            <button className="close-btn" onClick={() => setShowZoneModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form className="admin-form" onSubmit={handleAddZone}>
                            <div className="form-group">
                                <label>Zone Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Block C"
                                    value={newZone.name}
                                    onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    placeholder="Description..."
                                    value={newZone.description}
                                    onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowZoneModal(false)}>Cancel</button>
                                <button type="submit" className="submit-btn">Create Zone</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Equipment Modal */}
            {showEquipmentModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <div className="modal-header">
                            <h3>Deploy New Smart Resource</h3>
                            <button className="close-btn" onClick={() => setShowEquipmentModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form className="admin-form" onSubmit={handleAddEquipment}>
                            <div className="form-group">
                                <label>Equipment Template</label>
                                <select
                                    required
                                    value={newEquipment.templateId}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, templateId: e.target.value })}
                                >
                                    {EQUIPMENT_TEMPLATES.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.power}W)</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Custom Name (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Lab AC 1"
                                    value={newEquipment.name}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Deployment Zone</label>
                                <select
                                    required
                                    value={newEquipment.zone}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, zone: e.target.value })}
                                >
                                    <option value="">Select a Zone</option>
                                    {zones.map(z => (
                                        <option key={z._id} value={z.name}>{z.name}</option>
                                    ))}
                                    {zones.length === 0 && Array.from(new Set(equipmentList.map(eq => eq.zone))).map(z => (
                                        <option key={z} value={z}>{z}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowEquipmentModal(false)}>Cancel</button>
                                <button type="submit" className="submit-btn">Deploy Equipment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipmentControl;
