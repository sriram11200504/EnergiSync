import { useContext } from 'react';
import { EnergyContext } from '../context/EnergyContext';
import {
    Zap,
    TrendingDown,
    TrendingUp,
    Activity,
    DollarSign,
    Leaf,
    Clock,
    Power
} from 'lucide-react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    const { currentPower, appliances, energyHistory, billingSummary } = useContext(EnergyContext);

    // Fallback if no history yet
    const displayEnergyData = energyHistory.length > 0 ? energyHistory : [
        { time: '00:00', consumption: 0, cost: 0 }
    ];

    const activeAppliances = appliances.filter(app => app.status);

    // Prepare dynamic pie chart data
    const activeTotalPower = activeAppliances.reduce((sum, app) => sum + parseFloat(app.power), 0) || 1;
    const colors = ['hsl(210, 100%, 56%)', 'hsl(142, 71%, 45%)', 'hsl(25, 95%, 53%)', 'hsl(45, 93%, 58%)', 'hsl(271, 76%, 53%)'];

    const applianceData = activeAppliances.length > 0 ? activeAppliances.map((app, index) => ({
        name: app.name,
        value: parseFloat(app.power), // Raw value, recharts pie calculates percentage natively
        color: colors[index % colors.length]
    })) : [{ name: 'None Active', value: 1, color: 'hsl(0, 0%, 20%)' }];

    const stats = [
        {
            title: 'Current Usage',
            value: `${currentPower} kW`,
            change: '+2%',
            trend: 'up',
            icon: Zap,
            color: 'var(--secondary-blue)',
            bgColor: 'rgba(59, 130, 246, 0.1)'
        },
        {
            title: 'Monthly Bill (Est)',
            value: `₹${billingSummary?.grandTotalCost || 0}`, // Live calculation from backend
            change: '-8%',
            trend: 'down',
            icon: DollarSign,
            color: 'var(--primary-green)',
            bgColor: 'rgba(34, 197, 94, 0.1)'
        },
        {
            title: 'Monthly Savings',
            value: '₹1,240',
            change: '+15%',
            trend: 'up',
            icon: TrendingDown,
            color: 'var(--accent-orange)',
            bgColor: 'rgba(251, 146, 60, 0.1)'
        },
        {
            title: 'Carbon Saved',
            value: '42 kg',
            change: '+10%',
            trend: 'up',
            icon: Leaf,
            color: 'var(--success)',
            bgColor: 'rgba(34, 197, 94, 0.1)'
        },
    ];

    // Format active appliances for UI display
    const formattedActiveAppliances = activeAppliances.map(app => ({
        name: app.name,
        room: app.room,
        power: `${app.power} kW`,
        status: 'on',
        temp: app.type === 'AC' ? '24°C' : null,
        cycle: app.type === 'Washing Machine' ? 'Running' : null
    }));

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="text-secondary">Welcome back! Here's your energy overview <span className="badge badge-success" style={{ fontSize: '10px', marginLeft: '10px' }}>Live Connected</span></p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <Clock size={18} />
                        Last 24 Hours
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card card-glass">
                        <div className="stat-icon" style={{ backgroundColor: stat.bgColor }}>
                            <stat.icon size={24} style={{ color: stat.color }} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-title">{stat.title}</p>
                            <h2 className="stat-value">{stat.value}</h2>
                            <div className="stat-change">
                                {stat.trend === 'up' ? (
                                    <TrendingUp size={16} className="text-success" />
                                ) : (
                                    <TrendingDown size={16} className="text-success" />
                                )}
                                <span className="text-success">{stat.change} from yesterday</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                <div className="chart-card card-glass">
                    <div className="chart-header">
                        <h3>Energy Consumption</h3>
                        <span className="badge badge-info pulse">Real-time</span>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={displayEnergyData}>
                            <defs>
                                <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="time" stroke="var(--text-tertiary)" />
                            <YAxis stroke="var(--text-tertiary)" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            />
                            <Area
                                isAnimationActive={false}
                                type="monotone"
                                dataKey="consumption"
                                stroke="hsl(142, 71%, 45%)"
                                strokeWidth={2}
                                fill="url(#colorConsumption)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card card-glass">
                    <div className="chart-header">
                        <h3>Appliance Distribution</h3>
                        <span className="badge badge-warning">Today</span>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={applianceData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {applianceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="pie-legend">
                        {applianceData.map((item, index) => (
                            <div key={index} className="legend-item">
                                <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                                <span className="legend-label">{item.name}</span>
                                <span className="legend-value">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Appliances */}
            <div className="active-appliances card-glass">
                <div className="section-header">
                    <h3>Active Appliances</h3>
                    <span className="badge badge-success">
                        <Activity size={12} />
                        {formattedActiveAppliances.length} Running
                    </span>
                </div>
                <div className="appliances-list">
                    {formattedActiveAppliances.map((appliance, index) => (
                        <div key={index} className="appliance-item">
                            <div className="appliance-icon">
                                <Power size={20} />
                            </div>
                            <div className="appliance-info">
                                <h4>{appliance.name}</h4>
                                <p className="text-secondary">{appliance.room}</p>
                            </div>
                            <div className="appliance-stats">
                                <div className="appliance-stat">
                                    <span className="stat-label">Power</span>
                                    <span className="stat-value">{appliance.power}</span>
                                </div>
                                {appliance.temp && (
                                    <div className="appliance-stat">
                                        <span className="stat-label">Temp</span>
                                        <span className="stat-value">{appliance.temp}</span>
                                    </div>
                                )}
                                {appliance.cycle && (
                                    <div className="appliance-stat">
                                        <span className="stat-label">Time</span>
                                        <span className="stat-value">{appliance.cycle}</span>
                                    </div>
                                )}
                            </div>
                            <div className="appliance-status">
                                <span className="status-indicator active"></span>
                                <span className="text-success">Running</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Smart Recommendations */}
            <div className="recommendations card-glass">
                <h3>Smart Recommendations</h3>
                <div className="recommendation-list">
                    <div className="recommendation-item">
                        <div className="recommendation-icon success">
                            <TrendingDown size={20} />
                        </div>
                        <div className="recommendation-content">
                            <h4>Optimal Time to Run Washing Machine</h4>
                            <p>Run your washing machine after 10 PM to save ₹20 with off-peak tariff rates</p>
                        </div>
                        <button className="btn btn-sm btn-success">Schedule</button>
                    </div>
                    <div className="recommendation-item">
                        <div className="recommendation-icon warning">
                            <Zap size={20} />
                        </div>
                        <div className="recommendation-content">
                            <h4>High AC Usage Detected</h4>
                            <p>Your AC has been running for 6 hours. Consider increasing temperature by 2°C to save ₹15/day</p>
                        </div>
                        <button className="btn btn-sm btn-secondary">Adjust</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
