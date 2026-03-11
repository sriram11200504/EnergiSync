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
    const { currentPower, equipmentList, setEquipment, energyHistory, billingSummary } = useContext(EnergyContext);

    // Fallback if no history yet
    const displayEnergyData = energyHistory.length > 0 ? energyHistory : [
        { time: '00:00', consumption: 0, cost: 0 }
    ];

    // Calculate active equipment
    const activeEquipmentCount = equipmentList.filter(eq => eq.status).length;

    // Prepare dynamic pie chart data
    const activeTotalPower = equipmentList.filter(eq => eq.status).reduce((sum, eq) => sum + parseFloat(eq.power), 0) || 1;
    const colors = ['hsl(210, 100%, 56%)', 'hsl(142, 71%, 45%)', 'hsl(25, 95%, 53%)', 'hsl(45, 93%, 58%)', 'hsl(271, 76%, 53%)'];

    const equipmentData = equipmentList.filter(eq => eq.status).length > 0 ? equipmentList.filter(eq => eq.status).map((eq, index) => ({
        name: eq.name,
        value: parseFloat(eq.power), // Raw value, recharts pie calculates percentage natively
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

    const toggleEquipment = (id) => {
        setEquipment(prev => prev.map(eq =>
            eq.id === id ? { ...eq, status: !eq.status } : eq
        ));
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>Manage and control all your connected equipment</h2>
            </header>
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
                <div className="stat-card">
                    <div className="stat-icon power-icon">
                        <Power size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Active Equipment</span>
                        <span className="stat-value">{activeEquipmentCount}</span>
                    </div>
                </div>
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
                        <h3>Equipment Distribution</h3>
                        <span className="badge badge-warning">Today</span>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={equipmentData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {equipmentData.map((entry, index) => (
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
                        {equipmentData.map((item, index) => (
                            <div key={index} className="legend-item">
                                <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                                <span className="legend-label">{item.name}</span>
                                <span className="legend-value">{((item.value / activeTotalPower) * 100).toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>



            <section className="equipment-section">
                <div className="section-header">
                    <h3>Connected Devices</h3>
                </div>
                <div className="equipment-list-grid">
                    {equipmentList.map((eq) => (
                        <div key={eq.id} className={`equipment-card glass ${eq.status ? 'active' : ''}`}>
                            <div className="equipment-header">
                                <div className="equipment-info">
                                    <div className="equipment-icon">
                                        <Zap size={24} />
                                    </div>
                                    <div className="equipment-details">
                                        <h3>{eq.name}</h3>
                                        <p>{eq.zone}</p>
                                    </div>
                                </div>
                                <button
                                    className={`power-btn ${eq.status ? 'on' : 'off'}`}
                                    onClick={() => toggleEquipment(eq.id)}
                                >
                                    <Power size={20} />
                                </button>
                            </div>

                            <div className="equipment-stats">
                                <div className="stat">
                                    <span>Power</span>
                                    <strong>{eq.power} kW</strong>
                                </div>
                            </div>

                            {eq.schedule?.enabled && (
                                <div className="equipment-schedule">
                                    <Clock size={16} />
                                    <span>Scheduled: {eq.schedule.time}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

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
