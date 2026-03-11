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
    AreaChart,
    Area,
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
    const [recommendations, setRecommendations] = useState([]);
    const [savingsHistory, setSavingsHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recRes, savRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/equipment/optimization/recommendations`),
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/equipment/optimization/savings`)
                ]);

                if (recRes.ok && savRes.ok) {
                    const recData = await recRes.json();
                    const savData = await savRes.json();
                    setRecommendations(recData);
                    setSavingsHistory(savData);
                }
            } catch (error) {
                console.error("Error fetching optimization data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // Polling every 30s
        return () => clearInterval(interval);
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

    const handleSchedule = async (id, recommendedTime) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/equipment/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    schedule: {
                        enabled: true,
                        time: recommendedTime || "22:00"
                    }
                })
            });

            if (response.ok) {
                setScheduledItems([...scheduledItems, id]);
                setShowSuccess(id);
                setTimeout(() => setShowSuccess(null), 3000);
            }
        } catch (error) {
            console.error("Error persisting schedule:", error);
        }
    };

    const totalPotentialSavings = recommendations.reduce((sum, rec) => sum + rec.savings, 0);

    if (loading) return <div className="loading-container">Analyzing usage patterns...</div>;

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
                        <span className="badge badge-success">Dynamic Trend</span>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={savingsHistory}>
                            <defs>
                                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
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
                            <Area
                                type="monotone"
                                dataKey="current"
                                stroke="hsl(0, 84%, 60%)"
                                strokeWidth={2}
                                fill="url(#colorCurrent)"
                                name="Current Cost"
                            />
                            <Area
                                type="monotone"
                                dataKey="optimized"
                                stroke="hsl(142, 71%, 45%)"
                                strokeWidth={2}
                                fill="url(#colorOptimized)"
                                name="AI Optimized"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recommendations */}
            <div className="recommendations-section">
                <div className="section-header">
                    <div>
                        <h3>Smart Scheduling Recommendations</h3>
                        <p className="text-secondary">AI-driven suggestions based on your real usage patterns</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            recommendations.forEach(r => {
                                if (!scheduledItems.includes(r.id)) handleSchedule(r.id, r.recommendedTime);
                            });
                        }}
                        disabled={scheduledItems.length === recommendations.length || recommendations.length === 0}
                    >
                        <CheckCircle size={18} />
                        Apply All Optimizations
                    </button>
                </div>

                <div className="recommendations-grid">
                    {recommendations.length > 0 ? recommendations.map((rec) => (
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
                                        <span>Estimated Monthly: ₹{(rec.savings * 30).toFixed(0)} saved</span>
                                    </div>
                                    <div className="recommendation-actions">
                                        {!scheduledItems.includes(rec.id) ? (
                                            <button
                                                className="btn-success-glass"
                                                onClick={() => handleSchedule(rec.id, rec.recommendedTime)}
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
                    )) : (
                        <div className="empty-recommendations card-glass">
                            <p>No optimization recommendations currently. Your usage is already highly efficient!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Banner */}
            <div className="info-banner card-glass">
                <AlertCircle size={24} className="text-primary" />
                <div className="info-content">
                    <h4>AI Optimization Engine</h4>
                    <p>
                        Your smart home profile is being analyzed in real-time. By shifting high-power loads to off-peak windows (22:00 - 05:00),
                        you can reduce your carbon footprint while significantly lowering your monthly bill.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TariffOptimization;
