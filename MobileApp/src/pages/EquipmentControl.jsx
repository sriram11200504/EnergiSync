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
        power: '',
        type: 'Compute'
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

    const handleAddEquipment = async (e) => {
        e.preventDefault();
        await addEquipment(newEquipment);
        setNewEquipment({ name: '', zone: '', power: '', type: 'Compute' });
        setShowEquipmentModal(false);
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
                        enabled: newStatus
                    });
                    window.mqttClient.publish(topic, payload);
                    console.log(`📡 Sent command to ${topic}: ${payload} `);
                }
                return { ...eq, status: newStatus };
            }
            return eq;
        }));
    };

    // Removed adjustTemperature, adjustBrightness, openSchedule functions as per diff

    const activeCount = equipmentList.filter(eq => eq.status).length;
    const totalPower = equipmentList
        .filter(eq => eq.status)
        .reduce((sum, eq) => sum + parseFloat(eq.power), 0)
        .toFixed(2);

    return (
        <div className="equipment-control-container">
            <header className="page-header">
                <div className="header-content">
                    <h2>Equipment Management</h2>
                    <p>Control and monitor your data center infrastructure.</p>
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
                                <Settings size={24} /> {/* Using a generic Settings icon for now */}
                            </div>
                            <div className="eq-info">
                                <h3>{eq.name}</h3>
                                <span>{eq.zone} | {eq.type}</span>
                            </div>
                        </div>

                        <div className="card-body">
                            <div className="details-grid">
                                <div className="detail highlight">
                                    <label>Live Draw</label>
                                    <span>{eq.power} kW</span>
                                </div>
                                <div className="detail">
                                    <label>Schedule</label>
                                    <span>{eq.schedule?.enabled ? eq.schedule.time : 'None'}</span>
                                </div>
                            </div>

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
                            <h3>Create New Management Zone</h3>
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
                                    placeholder="e.g. Server Floor 2"
                                    value={newZone.name}
                                    onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    placeholder="Brief purpose of this zone..."
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
                            <h3>Register New Infrastructure Node</h3>
                            <button className="close-btn" onClick={() => setShowEquipmentModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form className="admin-form" onSubmit={handleAddEquipment}>
                            <div className="form-group">
                                <label>Equipment Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. UPS Unit 05"
                                    value={newEquipment.name}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Assigned Zone</label>
                                <select
                                    required
                                    value={newEquipment.zone}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, zone: e.target.value })}
                                >
                                    <option value="">Select a Zone</option>
                                    {zones.map(z => (
                                        <option key={z._id} value={z.name}>{z.name}</option>
                                    ))}
                                    {/* Fallback for hardcoded zones if none in DB yet */}
                                    {zones.length === 0 && Array.from(new Set(equipmentList.map(eq => eq.zone))).map(z => (
                                        <option key={z} value={z}>{z}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Expected Power Draw (kW)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    placeholder="0.0"
                                    value={newEquipment.power}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, power: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Asset Type</label>
                                <select
                                    value={newEquipment.type}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value })}
                                >
                                    <option value="Compute">Compute</option>
                                    <option value="Cooling">Cooling</option>
                                    <option value="Networking">Networking</option>
                                    <option value="Power">Power</option>
                                    <option value="Lighting">Lighting</option>
                                    <option value="Security">Security</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowEquipmentModal(false)}>Cancel</button>
                                <button type="submit" className="submit-btn">Register Node</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipmentControl;
