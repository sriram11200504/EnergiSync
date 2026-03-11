import { createContext, useState, useEffect } from 'react';
import mqttClient from '../mqttService';

export const EnergyContext = createContext();

export const EnergyProvider = ({ children }) => {
    // Global State
    const [currentPower, setCurrentPower] = useState(0); // Live total kW
    const [equipmentList, setEquipmentInternal] = useState([]);
    const [billingSummary, setBillingSummary] = useState({
        month: '',
        grandTotalEnergy: 0,
        grandTotalCost: 0,
        summaryByEquipment: []
    });
    const [energyHistory, setEnergyHistory] = useState([]);
    const [zones, setZones] = useState([]);
    const [devices, setDevices] = useState([]); // Dynamic IoT devices

    // Carbon analytics state (from aggregation pipeline)
    const [carbonData, setCarbonData] = useState({
        totalEnergy: 0,
        totalEmissions: 0,
        co2Saved: 0,
        treesEquivalent: 0,
        byDevice: []
    });
    const [monthlyTrend, setMonthlyTrend] = useState([]);

    // Fetch equipment from backend
    const fetchEquipment = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/equipment`);
            if (res.ok) {
                const data = await res.json();
                setEquipmentInternal(data);
            }
        } catch (error) {
            console.error("Error fetching equipment:", error);
        }
    };


    // Fetch monthly billing summary from backend
    const fetchBillingSummary = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/equipment/usage/monthly`);
            if (res.ok) {
                const data = await res.json();
                setBillingSummary({
                    ...data,
                    grandTotalCost: parseFloat(data.grandTotalCost).toFixed(2),
                    grandTotalEnergy: parseFloat(data.grandTotalEnergy).toFixed(4)
                });
            }
        } catch (error) {
            console.error("Error fetching billing summary:", error);
        }
    };

    // Fetch zones from backend
    const fetchZones = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/zones`);
            if (res.ok) {
                const data = await res.json();
                setZones(data);
            }
        } catch (error) {
            console.error("Error fetching zones:", error);
        }
    };

    // Fetch aggregated carbon footprint stats from backend
    const fetchCarbonStats = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/analytics/carbon-stats`);
            if (res.ok) {
                const data = await res.json();
                setCarbonData(data);
            }
        } catch (error) {
            console.error('Error fetching carbon stats:', error);
        }
    };

    // Fetch last-6-months trend for AreaChart
    const fetchMonthlyTrend = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/analytics/monthly-trend`);
            if (res.ok) {
                const data = await res.json();
                setMonthlyTrend(data);
            }
        } catch (error) {
            console.error('Error fetching monthly trend:', error);
        }
    };

    const addZone = async (zoneData) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/zones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(zoneData)
            });
            if (res.ok) {
                const newZone = await res.json();
                setZones(prev => [...prev, newZone]);
                return newZone;
            }
        } catch (error) {
            console.error("Error adding zone:", error);
        }
    };

    const deleteZone = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/zones/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setZones(prev => prev.filter(z => z._id !== id));
            }
        } catch (error) {
            console.error("Error deleting zone:", error);
        }
    };

    const addEquipment = async (equipmentData) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/equipment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(equipmentData)
            });
            if (res.ok) {
                const newEq = await res.json();
                setEquipmentInternal(prev => [...prev, newEq]);
                return newEq;
            }
        } catch (error) {
            console.error("Error adding equipment:", error);
        }
    };

    const deleteEquipment = async (id) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/equipment/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setEquipmentInternal(prev => prev.filter(eq => eq.id !== id));
                // Also refetch billing to show updated numbers
                fetchBillingSummary();
            }
        } catch (error) {
            console.error("Error deleting equipment:", error);
        }
    };

    // Load data on mount
    useEffect(() => {
        fetchEquipment();
        fetchBillingSummary();
        fetchZones();
        fetchDevices();
        fetchCarbonStats();
        fetchMonthlyTrend();

        // Refresh devices every 10s for new provisioning detection
        const deviceInterval = setInterval(fetchDevices, 10000);

        // Refresh carbon analytics every 60s
        const carbonInterval = setInterval(() => {
            fetchCarbonStats();
            fetchMonthlyTrend();
        }, 60000);

        return () => {
            clearInterval(deviceInterval);
            clearInterval(carbonInterval);
        };
    }, []);

    // Wrapper around internal state setter that also syncs to backend
    const setEquipment = (newEquipmentOrFn) => {
        setEquipmentInternal(prev => {
            const nextEquipment = typeof newEquipmentOrFn === 'function'
                ? newEquipmentOrFn(prev)
                : newEquipmentOrFn;

            // Sync changed equipment to backend
            nextEquipment.forEach(nextEq => {
                const prevEq = prev.find(p => p.id === nextEq.id);
                if (prevEq && prevEq !== nextEq) {
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/equipment/${nextEq.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(nextEq)
                    }).then(() => {
                        // Refetch billing whenever equipment is toggled
                        fetchBillingSummary();
                    }).catch(error => console.error("Error updating equipment in backend:", error));
                }
            });

            return nextEquipment;
        });
    };

    // MQTT: listen for simulator messages
    useEffect(() => {
        const handleMqttMessage = (topic, message) => {
            try {
                const data = JSON.parse(message.toString());

                if (topic.includes('equipment')) {
                    const power = parseFloat(data.power);
                    if (!isNaN(power)) {
                        setCurrentPower(power);

                        const now = new Date();
                        const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

                        setEnergyHistory(prev => {
                            const newData = [...prev.slice(-19), {
                                time: timeStr,
                                consumption: power,
                                cost: (power * 0.8).toFixed(2),
                                cumulative: power * 0.1
                            }];
                            return newData;
                        });
                    }
                }
            } catch (e) {
                console.error("MQTT parse err in context:", e);
            }
        };

        mqttClient.on('message', handleMqttMessage);
        return () => mqttClient.off('message', handleMqttMessage);
    }, []);

    // Simulate background cumulative usage when simulator isn't running
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPower(() => {
                const fluctuation = (Math.random() * 0.4) - 0.2;
                const activePower = equipmentList
                    .filter(a => a.status)
                    .reduce((sum, a) => sum + parseFloat(a.power), 0);

                return Math.max(0, activePower + fluctuation);
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [equipmentList]);

    // Context value — everything components need
    const value = {
        currentPower: currentPower.toFixed(2),
        equipmentList,
        setEquipment,
        addEquipment,
        deleteEquipment,
        energyHistory,
        billingSummary,
        zones,
        addZone,
        deleteZone,
        devices,
        carbonData,
        monthlyTrend
    };

    return (
        <EnergyContext.Provider value={value}>
            {children}
        </EnergyContext.Provider>
    );
};

