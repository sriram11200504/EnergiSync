import {
    TrendingDown,
    Clock,
    DollarSign,
    Zap,
    AlertCircle,
    CheckCircle,
    Calendar
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
    Legend
} from 'recharts';
import './TariffOptimization.css';

const TariffOptimization = () => {
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

    const savingsData = [
        { month: 'Jan', current: 2400, optimized: 2040 },
        { month: 'Feb', current: 2200, optimized: 1870 },
        { month: 'Mar', current: 2600, optimized: 2210 },
        { month: 'Apr', current: 2800, optimized: 2380 },
        { month: 'May', current: 3200, optimized: 2720 },
        { month: 'Jun', current: 3400, optimized: 2890 },
    ];

    const recommendations = [
        {
            appliance: 'Washing Machine',
            currentTime: '14:00',
            suggestedTime: '22:00',
            currentCost: 45,
            optimizedCost: 25,
            savings: 20,
            priority: 'high'
        },
        {
            appliance: 'Dishwasher',
            currentTime: '19:00',
            suggestedTime: '23:00',
            currentCost: 35,
            optimizedCost: 22,
            savings: 13,
            priority: 'medium'
        },
        {
            appliance: 'EV Charging',
            currentTime: '18:00',
            suggestedTime: '01:00',
            currentCost: 180,
            optimizedCost: 120,
            savings: 60,
            priority: 'high'
        },
        {
            appliance: 'Water Heater',
            currentTime: '17:00',
            suggestedTime: '05:00',
            currentCost: 55,
            optimizedCost: 38,
            savings: 17,
            priority: 'medium'
        },
    ];

    const totalPotentialSavings = recommendations.reduce((sum, rec) => sum + rec.savings, 0);

    return (
        <div className="tariff-optimization">
            <div className="page-header">
                <div>
                    <h1>Tariff Optimization</h1>
                    <p className="text-secondary">Maximize savings with smart scheduling based on dynamic tariff rates</p>
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
                        <span className="amount">{totalPotentialSavings * 30}</span>
                        <span className="period">/month</span>
                    </div>
                    <div className="summary-breakdown">
                        <div className="breakdown-item">
                            <span className="breakdown-label">Daily Savings</span>
                            <span className="breakdown-value text-success">₹{totalPotentialSavings}</span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Yearly Projection</span>
                            <span className="breakdown-value text-success">₹{totalPotentialSavings * 365}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tariff Rate Chart */}
            <div className="chart-section card-glass">
                <div className="section-header">
                    <h3>Time-of-Day Tariff Rates</h3>
                    <div className="tariff-legend">
                        <span className="legend-item">
                            <span className="legend-dot" style={{ backgroundColor: 'hsl(142, 71%, 45%)' }}></span>
                            Off-Peak (₹3-4/kWh)
                        </span>
                        <span className="legend-item">
                            <span className="legend-dot" style={{ backgroundColor: 'hsl(45, 93%, 58%)' }}></span>
                            Normal (₹5-7/kWh)
                        </span>
                        <span className="legend-item">
                            <span className="legend-dot" style={{ backgroundColor: 'hsl(0, 84%, 60%)' }}></span>
                            Peak (₹8-10/kWh)
                        </span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={tariffData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="hour" stroke="var(--text-tertiary)" />
                        <YAxis stroke="var(--text-tertiary)" label={{ value: '₹/kWh', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)'
                            }}
                        />
                        <Bar dataKey="rate" fill="hsl(142, 71%, 45%)">
                            {tariffData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Savings Comparison */}
            <div className="chart-section card-glass">
                <div className="section-header">
                    <h3>Savings Comparison</h3>
                    <span className="badge badge-success">15% Average Savings</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={savingsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="month" stroke="var(--text-tertiary)" />
                        <YAxis stroke="var(--text-tertiary)" label={{ value: '₹', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)'
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="current"
                            stroke="hsl(0, 84%, 60%)"
                            strokeWidth={2}
                            name="Current Cost"
                        />
                        <Line
                            type="monotone"
                            dataKey="optimized"
                            stroke="hsl(142, 71%, 45%)"
                            strokeWidth={2}
                            name="Optimized Cost"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Recommendations */}
            <div className="recommendations-section">
                <div className="section-header">
                    <h3>Smart Scheduling Recommendations</h3>
                    <button className="btn btn-primary">
                        <CheckCircle size={18} />
                        Apply All
                    </button>
                </div>

                <div className="recommendations-grid">
                    {recommendations.map((rec, index) => (
                        <div key={index} className={`recommendation-card card-glass priority-${rec.priority}`}>
                            <div className="recommendation-header">
                                <div className="recommendation-title">
                                    <h4>{rec.appliance}</h4>
                                    <span className={`priority-badge badge-${rec.priority === 'high' ? 'danger' : 'warning'}`}>
                                        {rec.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                                    </span>
                                </div>
                                <div className="savings-badge">
                                    <TrendingDown size={16} />
                                    <span>Save ₹{rec.savings}/day</span>
                                </div>
                            </div>

                            <div className="recommendation-body">
                                <div className="time-comparison">
                                    <div className="time-block current">
                                        <span className="time-label">Current Time</span>
                                        <div className="time-value">
                                            <Clock size={16} />
                                            <span>{rec.currentTime}</span>
                                        </div>
                                        <span className="cost-value">₹{rec.currentCost}</span>
                                    </div>

                                    <div className="arrow">→</div>

                                    <div className="time-block suggested">
                                        <span className="time-label">Suggested Time</span>
                                        <div className="time-value">
                                            <Clock size={16} />
                                            <span>{rec.suggestedTime}</span>
                                        </div>
                                        <span className="cost-value text-success">₹{rec.optimizedCost}</span>
                                    </div>
                                </div>

                                <div className="recommendation-footer">
                                    <div className="savings-info">
                                        <DollarSign size={16} />
                                        <span>Monthly savings: ₹{rec.savings * 30}</span>
                                    </div>
                                    <div className="recommendation-actions">
                                        <button className="btn btn-sm btn-ghost">Dismiss</button>
                                        <button className="btn btn-sm btn-success">
                                            <Calendar size={14} />
                                            Schedule
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Banner */}
            <div className="info-banner card-glass">
                <AlertCircle size={24} />
                <div className="info-content">
                    <h4>How Tariff Optimization Works</h4>
                    <p>
                        Our AI analyzes your energy consumption patterns and dynamic tariff rates to automatically
                        suggest the best times to run your appliances. By shifting high-power appliances to off-peak
                        hours, you can save 10-15% on your monthly electricity bill without compromising convenience.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TariffOptimization;
