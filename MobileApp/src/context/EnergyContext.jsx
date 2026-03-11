import { createContext, useState, useEffect } from 'react';
import mqttClient from '../mqttService';

export const EnergyContext = createContext();

export const EnergyProvider = ({ children }) => {
    // Global State
    const [currentPower, setCurrentPower] = useState(0); // Live total kW
    const [appliances, setAppliancesInternal] = useState([]);
    const [billingSummary, setBillingSummary] = useState({
        month: '',
        grandTotalEnergy: 0,
        grandTotalCost: 0,
        summaryByAppliance: []
    });
    const [energyHistory, setEnergyHistory] = useState([]);



    // Fetch monthly billing summary from backend
    const fetchBillingSummary = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appliances/usage/monthly`);
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

    // Load data on mount
    const fetchAppliances = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appliances`);
            if (res.ok) {
                const data = await res.json();
                setAppliancesInternal(data);
            }
        } catch (error) {
            console.error("Error fetching appliances:", error);
            // Default fallback if backend is unavailable so the UI doesn't crash completely
            setAppliancesInternal([
                { id: 1, name: 'Air Conditioner', room: 'Living Room', status: true, power: '1.5', schedule: {} },
                { id: 2, name: 'Refrigerator', room: 'Kitchen', status: true, power: '0.3', schedule: {} }
            ]);
        }
    };
    useEffect(() => {
        fetchAppliances();
        fetchBillingSummary();
    }, []);

    // Wrapper around internal state setter that also syncs to backend
    const setAppliances = (newAppliancesOrFn) => {
        setAppliancesInternal(prev => {
            const nextAppliances = typeof newAppliancesOrFn === 'function'
                ? newAppliancesOrFn(prev)
                : newAppliancesOrFn;

            // Sync changed appliances to backend
            nextAppliances.forEach(nextApp => {
                const prevApp = prev.find(p => p.id === nextApp.id);
                if (prevApp !== nextApp) {
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appliances/${nextApp.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(nextApp)
                    }).then(() => {
                        // Refetch billing whenever an appliance is toggled
                        fetchBillingSummary();
                    }).catch(error => console.error("Error updating appliance in backend:", error));
                }
            });

            return nextAppliances;
        });
    };

    // MQTT: listen for simulator messages
    useEffect(() => {
        const handleMqttMessage = (topic, message) => {
            try {
                const data = JSON.parse(message.toString());

                if (topic.includes('appliances')) {
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
                const activePower = appliances
                    .filter(a => a.status)
                    .reduce((sum, a) => sum + parseFloat(a.power), 0);

                return Math.max(0, activePower + fluctuation);
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [appliances]);

    // Context value — everything components need
    const value = {
        currentPower: currentPower.toFixed(2),
        appliances,
        setAppliances,
        energyHistory,
        billingSummary
    };

    return (
        <EnergyContext.Provider value={value}>
            {children}
        </EnergyContext.Provider>
    );
};
