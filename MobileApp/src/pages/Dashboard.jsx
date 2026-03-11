import { useState, useEffect } from 'react';
import mqttClient from '../mqttService';
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
    const [currentPower, setCurrentPower] = useState(4.2);

    // Sample data for energy consumption
    const [energyData, setEnergyData] = useState([
        { time: '00:00', consumption: 2.1, cost: 1.5 },
        { time: '04:00', consumption: 1.8, cost: 1.2 },
        { time: '08:00', consumption: 4.5, cost: 3.8 },
        { time: '12:00', consumption: 5.2, cost: 4.5 },
        { time: '16:00', consumption: 6.8, cost: 6.2 },
        { time: '20:00', consumption: 7.5, cost: 7.0 },
        { time: '23:59', consumption: 3.2, cost: 2.8 },
    ]);

    useEffect(() => {
        const handleMessage = (topic, message) => {
            if (topic.includes('appliances')) {
                try {
                    const data = JSON.parse(message.toString());
                    if (data.power !== undefined) {
                        const newPower = parseFloat(data.power);
                        setCurrentPower(newPower);

                        // Update chart with live point
                        const now = new Date();
                        const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

                        setEnergyData(prev => {
                            const newData = [...prev.slice(-6), { time: timeStr, consumption: newPower, cost: (newPower * 0.8).toFixed(2) }];
                            return newData;
                        });
                    }
                } catch (e) {
                    console.error("Failed to parse MQTT message", e);
                }
            }
        };

        mqttClient.on('message', handleMessage);
        return () => mqttClient.off('message', handleMessage);
    }, []);

    const applianceData = [
        { name: 'Air Conditioner', value: 35, color: 'hsl(210, 100%, 56%)' },
        { name: 'Washing Machine', value: 15, color: 'hsl(142, 71%, 45%)' },
        { name: 'Refrigerator', value: 20, color: 'hsl(25, 95%, 53%)' },
        { name: 'Lighting', value: 12, color: 'hsl(45, 93%, 58%)' },
        { name: 'Others', value: 18, color: 'hsl(271, 76%, 53%)' },
    ];

    const stats = [
        {
            title: 'Current Usage',
            value: `${currentPower} kW`,
            change: '+12%',
            trend: 'up',
            icon: Zap,
            color: 'var(--secondary-blue)',
            bgColor: 'rgba(59, 130, 246, 0.1)'
        },
        {
            title: 'Today\'s Cost',
            value: `₹${(currentPower * 58).toFixed(0)}`, // Simulated dynamic calculation
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
            change: '+20%',
            trend: 'up',
            icon: Leaf,
            color: 'var(--success)',
            bgColor: 'rgba(34, 197, 94, 0.1)'
        },
    ];

    const activeAppliances = [
        { name: 'Air Conditioner', room: 'Living Room', power: `${(currentPower * 0.4).toFixed(1)} kW`, status: 'on', temp: '24°C' },
        { name: 'Refrigerator', room: 'Kitchen', power: '0.3 kW', status: 'on', temp: '4°C' },
        { name: 'Washing Machine', room: 'Utility', power: '0.8 kW', status: 'on', cycle: '45 min left' },
    ];

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
                        <AreaChart data={energyData}>
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
                        {activeAppliances.length} Running
                    </span>
                </div>
                <div className="appliances-list">
                    {activeAppliances.map((appliance, index) => (
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
