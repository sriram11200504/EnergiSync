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

    const fetchBillingSummary = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appliances/usage/monthly`);
            if (res.ok) {
                const data = await res.json();
                setBillingSummary({
                    ...data,
                    grandTotalCost: data.grandTotalCost.toFixed(2),
                    grandTotalEnergy: data.grandTotalEnergy.toFixed(2)
                });
            }
        } catch (error) {
            console.error("Error fetching billing summary:", error);
        }
    };

    useEffect(() => {
        // Initial fetches
        fetchAppliances();
        fetchBillingSummary();
    }, []);

    const setAppliances = (newAppliancesOrFn) => {
        setAppliancesInternal(prev => {
            const nextAppliances = typeof newAppliancesOrFn === 'function'
                ? newAppliancesOrFn(prev)
                : newAppliancesOrFn;

            // Sync meaningful changes to backend
            nextAppliances.forEach(nextApp => {
                const prevApp = prev.find(p => p.id === nextApp.id);
                if (prevApp !== nextApp) {
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appliances/${nextApp.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(nextApp)
                    }).then(() => {
                        // Refetch billing whenever an appliance toggles
                        // since turning off seals a session bill calculation
                        fetchBillingSummary();
                    }).catch(error => console.error("Error updating appliance in backend:", error));
                }
            });

            return nextAppliances;
        });
    };

    // Derived/Aggregated History State
    const [energyHistory, setEnergyHistory] = useState([]);

    useEffect(() => {
        const handleMqttMessage = (topic, message) => {
            try {
                const data = JSON.parse(message.toString());

                // If it's the simulator sending fake appliance power directly
                if (topic.includes('appliances')) {
                    const power = parseFloat(data.power);
                    if (!isNaN(power)) {
                        setCurrentPower(power);

                        // Push into history ring-buffer
                        const now = new Date();
                        const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

                        setEnergyHistory(prev => {
                            const newData = [...prev.slice(-19), {
                                time: timeStr,
                                consumption: power,
                                cost: (power * 0.8).toFixed(2),
                                cumulative: power * 0.1 // Simulated cumulative fake math
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

    // Also simulate background cumulative usage if the simulator isn't running
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPower(prev => {
                const fluctuation = (Math.random() * 0.4) - 0.2; // slight fake organic movement
                const activePower = appliances
                    .filter(a => a.status)
                    .reduce((sum, a) => sum + parseFloat(a.power), 0);

                return Math.max(0, activePower + fluctuation);
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [appliances]);

    // Context Value payload
    const value = {
        currentPower: currentPower.toFixed(2),
        appliances,
        setAppliances, // Allow ApplianceControl to push changes
        energyHistory
    };

    return (
        <EnergyContext.Provider value={value}>
            {children}
        </EnergyContext.Provider>
    );
};
