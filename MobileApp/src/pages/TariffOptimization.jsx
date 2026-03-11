import { useState, useEffect } from 'react';
import {
    TrendingDown,
    Clock,
    DollarSign,
    Zap,
    AlertCircle,
    CheckCircle,
    Calendar,
    ArrowRight,
    Info
} from 'lucide-react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell
} from 'recharts';
import './TariffOptimization.css';

const TariffOptimization = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [scheduledItems, setScheduledItems] = useState([]);
    const [showSuccess, setShowSuccess] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const tariffData = [
        { hour: '00:00', rate: 3.5, type: 'Off-Peak', color: 'hsl(142, 71%, 45%)' },
        { hour: '06:00', rate: 5.2, type: 'Normal', color: 'hsl(45, 93%, 58%)' },
        { hour: '09:00', rate: 8.5, type: 'Peak', color: 'hsl(0, 84%, 60%)' },
        { hour: '12:00', rate: 7.2, type: 'Peak', color: 'hsl(0, 84%, 60%)' },
        { hour: '15:00', rate: 5.8, type: 'Normal', color: 'hsl(45, 93%, 58%)' },
        { hour: '18:00', rate: 9.2, type: 'Peak', color: 'hsl(0, 84%, 60%)' },
        { hour: '21:00', rate: 6.5, type: 'Normal', color: 'hsl(45, 93%, 58%)' },
        { hour: '23:00', rate: 4.0, type: 'Off-Peak', color: 'hsl(142, 71%, 45%)' },
    ];

    const getCurrentTariff = () => {
        const hour = currentTime.getHours();
        const found = [...tariffData].reverse().find(t => parseInt(t.hour) <= hour);
        return found || tariffData[0];
    };

    const currentTariff = getCurrentTariff();

    const savingsData = [
        { month: 'Jan', current: 2400, optimized: 2040 },
        { month: 'Feb', current: 2200, optimized: 1870 },
        { month: 'Mar', current: 2600, optimized: 2210 },
        { month: 'Apr', current: 2800, optimized: 2380 },
        { month: 'May', current: 3200, optimized: 2720 },
        { month: 'Jun', current: 3400, optimized: 2890 },
    ];

    const initialRecommendations = [
        {
            id: 1,
            appliance: 'Washing Machine',
            currentTime: '14:00',
            suggestedTime: '22:00',
            currentCost: 45,
            optimizedCost: 25,
            savings: 20,
            priority: 'high'
        },
        {
            id: 2,
            appliance: 'Dishwasher',
            currentTime: '19:00',
            suggestedTime: '23:00',
            currentCost: 35,
            optimizedCost: 22,
            savings: 13,
            priority: 'medium'
        },
        {
            id: 3,
            appliance: 'EV Charging',
            currentTime: '18:00',
            suggestedTime: '01:00',
            currentCost: 180,
            optimizedCost: 120,
            savings: 60,
            priority: 'high'
        },
        {
            id: 4,
            appliance: 'Water Heater',
            currentTime: '17:00',
            suggestedTime: '05:00',
            currentCost: 55,
            optimizedCost: 38,
            savings: 17,
            priority: 'medium'
        },
    ];

    const handleSchedule = (id) => {
        setScheduledItems([...scheduledItems, id]);
        setShowSuccess(id);
        setTimeout(() => setShowSuccess(null), 3000);
    };

    const totalPotentialSavings = initialRecommendations.reduce((sum, rec) => sum + rec.savings, 0);

    return (
        <div className="tariff-optimization">
            <div className="page-header">
                <div>
                    <h1>Tariff Optimization</h1>
                    <p className="text-secondary">Maximize savings with smart scheduling based on dynamic tariff rates</p>
                </div>
                <div className="live-status-pill glass">
                    <span className="pulse-icon" style={{ backgroundColor: currentTariff.color }}></span>
                    <span className="live-label">LIVE RATE:</span>
                    <span className="live-value">₹{currentTariff.rate.toFixed(1)}/kWh</span>
                    <span className="live-type" style={{ color: currentTariff.color }}>({currentTariff.type})</span>
                </div>
            </div>

            {/* Savings Summary */}
            <div className="savings-summary">
                <div className="summary-card-large card-glass">
                    <div className="summary-header">
                        <div className="summary-icon-large">
                            <TrendingDown size={32} />
                        </div>
                        <div>
                            <h2>Potential Monthly Savings</h2>
                            <p className="text-secondary">By optimizing appliance schedules</p>
                        </div>
                    </div>
                    <div className="summary-amount">
                        <span className="currency">₹</span>
                        <span className="amount">{(totalPotentialSavings * 30).toLocaleString()}</span>
                        <span className="period">/month</span>
                    </div>
                    <div className="summary-breakdown">
                        <div className="breakdown-item">
                            <span className="breakdown-label">Daily Savings</span>
                            <span className="breakdown-value text-success">₹{totalPotentialSavings}</span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Yearly Projection</span>
                            <span className="breakdown-value text-success">₹{(totalPotentialSavings * 365).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="chart-grid">
                {/* Tariff Rate Chart */}
                <div className="chart-section card-glass">
                    <div className="section-header">
                        <h3><Clock size={18} /> Time-of-Day Tariff</h3>
                        <div className="tariff-legend">
                            <span className="legend-item"><span className="dot off-peak"></span> Off-Peak</span>
                            <span className="legend-item"><span className="dot normal"></span> Normal</span>
                            <span className="legend-item"><span className="dot peak"></span> Peak</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={tariffData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="hour" stroke="var(--text-tertiary)" fontSize={12} />
                            <YAxis stroke="var(--text-tertiary)" fontSize={12} unit="₹" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-card-dark)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '12px'
                                }}
                            />
                            <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                                {tariffData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        fillOpacity={currentTariff.hour === entry.hour ? 1 : 0.6}
                                        stroke={currentTariff.hour === entry.hour ? '#fff' : 'none'}
                                        strokeWidth={2}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Savings Comparison */}
                <div className="chart-section card-glass">
                    <div className="section-header">
                        <h3><Zap size={18} /> Cost Reduction</h3>
                        <span className="badge badge-success">15% Optimized</span>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={savingsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
                            <YAxis stroke="var(--text-tertiary)" fontSize={12} unit="₹" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-card-dark)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '12px'
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                            <Line
                                type="monotone"
                                dataKey="current"
                                stroke="hsl(0, 84%, 60%)"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name="Normal Cost"
                            />
                            <Line
                                type="monotone"
                                dataKey="optimized"
                                stroke="hsl(142, 71%, 45%)"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name="AI Optimized"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recommendations */}
            <div className="recommendations-section">
                <div className="section-header">
                    <div>
                        <h3>Smart Scheduling Recommendations</h3>
                        <p className="text-secondary">AI-driven suggestions to shift loads to off-peak hours</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            initialRecommendations.forEach(r => {
                                if (!scheduledItems.includes(r.id)) handleSchedule(r.id);
                            });
                        }}
                        disabled={scheduledItems.length === initialRecommendations.length}
                    >
                        <CheckCircle size={18} />
                        Apply All Optimizations
                    </button>
                </div>

                <div className="recommendations-grid">
                    {initialRecommendations.map((rec) => (
                        <div key={rec.id} className={`recommendation-card card-glass priority-${rec.priority} ${scheduledItems.includes(rec.id) ? 'scheduled' : ''}`}>
                            <div className="recommendation-header">
                                <div className="recommendation-title">
                                    <h4>{rec.appliance}</h4>
                                    <span className={`priority-badge`}>
                                        {rec.priority.toUpperCase()} PRIORITY
                                    </span>
                                </div>
                                {scheduledItems.includes(rec.id) && (
                                    <div className="success-badge scale-in">
                                        <CheckCircle size={14} /> Scheduled
                                    </div>
                                )}
                            </div>

                            <div className="recommendation-body">
                                <div className="time-comparison">
                                    <div className="time-block current">
                                        <span className="time-label">CURRENT</span>
                                        <div className="time-value">
                                            <span>{rec.currentTime}</span>
                                        </div>
                                        <span className="cost-value">₹{rec.currentCost}</span>
                                    </div>

                                    <div className="arrow-container">
                                        <ArrowRight size={20} className="arrow-icon" />
                                        <div className="savings-label">SAVE ₹{rec.savings}</div>
                                    </div>

                                    <div className="time-block suggested">
                                        <span className="time-label">OPTIMIZED</span>
                                        <div className="time-value">
                                            <span>{rec.suggestedTime}</span>
                                        </div>
                                        <span className="cost-value text-success">₹{rec.optimizedCost}</span>
                                    </div>
                                </div>

                                <div className="recommendation-footer">
                                    <div className="savings-info">
                                        <Info size={14} />
                                        <span>Monthly: ₹{rec.savings * 30} saved</span>
                                    </div>
                                    <div className="recommendation-actions">
                                        {!scheduledItems.includes(rec.id) ? (
                                            <button
                                                className="btn-success-glass"
                                                onClick={() => handleSchedule(rec.id)}
                                            >
                                                <Calendar size={14} />
                                                Schedule Shift
                                            </button>
                                        ) : (
                                            <button className="btn-ghost" disabled>
                                                Applied
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {showSuccess === rec.id && (
                                <div className="toast-notification">
                                    ✅ Shift scheduled for {rec.suggestedTime}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Banner */}
            <div className="info-banner card-glass">
                <AlertCircle size={24} className="text-primary" />
                <div className="info-content">
                    <h4>AI Optimization Engine</h4>
                    <p>
                        Your smart home profile is being analyzed in real-time. By shifting <strong>{totalPotentialSavings}%</strong> of
                        your daily load to off-peak windows (22:00 - 05:00), you can reduce your carbon footprint
                        by <strong>12kg CO2e</strong> per month while saving money.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TariffOptimization;
