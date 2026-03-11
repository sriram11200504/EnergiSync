import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Zap,
    Calendar,
    Download
} from 'lucide-react';
import {
    AreaChart,
    Area,
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
import './EnergyInsights.css';

const EnergyInsights = () => {
    const weeklyData = [
        { day: 'Mon', consumption: 45, cost: 380 },
        { day: 'Tue', consumption: 52, cost: 440 },
        { day: 'Wed', consumption: 48, cost: 405 },
        { day: 'Thu', consumption: 55, cost: 465 },
        { day: 'Fri', consumption: 50, cost: 425 },
        { day: 'Sat', consumption: 62, cost: 525 },
        { day: 'Sun', consumption: 58, cost: 490 },
    ];

    const hourlyData = [
        { hour: '00', consumption: 2.1 },
        { hour: '03', consumption: 1.8 },
        { hour: '06', consumption: 3.5 },
        { hour: '09', consumption: 4.8 },
        { hour: '12', consumption: 5.2 },
        { hour: '15', consumption: 6.5 },
        { hour: '18', consumption: 8.2 },
        { hour: '21', consumption: 7.5 },
        { hour: '23', consumption: 4.2 },
    ];

    const applianceComparison = [
        { appliance: 'AC', thisMonth: 850, lastMonth: 920 },
        { appliance: 'Refrigerator', thisMonth: 320, lastMonth: 310 },
        { appliance: 'Washing Machine', thisMonth: 180, lastMonth: 220 },
        { appliance: 'Lighting', thisMonth: 150, lastMonth: 160 },
        { appliance: 'TV', thisMonth: 120, lastMonth: 140 },
        { appliance: 'Others', thisMonth: 280, lastMonth: 300 },
    ];

    const insights = [
        {
            title: 'Peak Usage Time',
            value: '6 PM - 9 PM',
            description: 'Your highest consumption period',
            trend: 'neutral',
            icon: Zap
        },
        {
            title: 'Average Daily Usage',
            value: '52.8 kWh',
            description: '+8% from last week',
            trend: 'up',
            icon: TrendingUp
        },
        {
            title: 'Most Efficient Day',
            value: 'Wednesday',
            description: '48 kWh consumed',
            trend: 'down',
            icon: TrendingDown
        },
        {
            title: 'Monthly Projection',
            value: '1,584 kWh',
            description: 'Based on current usage',
            trend: 'neutral',
            icon: Calendar
        },
    ];

    const stats = [
        { label: 'Total Consumption', value: '1,245 kWh', change: '+5%', trend: 'up' },
        { label: 'Total Cost', value: '₹10,482', change: '+3%', trend: 'up' },
        { label: 'Avg. Daily Cost', value: '₹349', change: '-2%', trend: 'down' },
        { label: 'Efficiency Score', value: '78/100', change: '+12%', trend: 'up' },
    ];

    return (
        <div className="energy-insights">
            <div className="page-header">
                <div>
                    <h1>Energy Insights</h1>
                    <p className="text-secondary">Detailed analytics and consumption patterns</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <Calendar size={18} />
                        This Month
                    </button>
                    <button className="btn btn-primary">
                        <Download size={18} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card card-glass">
                        <p className="stat-label">{stat.label}</p>
                        <h2 className="stat-value">{stat.value}</h2>
                        <div className="stat-change">
                            {stat.trend === 'up' ? (
                                <TrendingUp size={16} className={stat.change.startsWith('+') ? 'text-danger' : 'text-success'} />
                            ) : (
                                <TrendingDown size={16} className="text-success" />
                            )}
                            <span className={stat.change.startsWith('+') && stat.trend === 'up' ? 'text-danger' : 'text-success'}>
                                {stat.change} from last month
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Weekly Overview */}
            <div className="chart-card card-glass">
                <div className="chart-header">
                    <h3>Weekly Overview</h3>
                    <div className="chart-legend">
                        <span className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: 'hsl(142, 71%, 45%)' }}></span>
                            Consumption (kWh)
                        </span>
                        <span className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: 'hsl(210, 100%, 56%)' }}></span>
                            Cost (₹)
                        </span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={weeklyData}>
                        <defs>
                            <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(210, 100%, 56%)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(210, 100%, 56%)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="day" stroke="var(--text-tertiary)" />
                        <YAxis yAxisId="left" stroke="var(--text-tertiary)" />
                        <YAxis yAxisId="right" orientation="right" stroke="var(--text-tertiary)" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)'
                            }}
                        />
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="consumption"
                            stroke="hsl(142, 71%, 45%)"
                            strokeWidth={2}
                            fill="url(#colorConsumption)"
                            name="Consumption (kWh)"
                        />
                        <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="cost"
                            stroke="hsl(210, 100%, 56%)"
                            strokeWidth={2}
                            fill="url(#colorCost)"
                            name="Cost (₹)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Hourly Pattern & Appliance Comparison */}
            <div className="charts-grid">
                <div className="chart-card card-glass">
                    <div className="chart-header">
                        <h3>Hourly Consumption Pattern</h3>
                        <span className="badge badge-info">Today</span>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={hourlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="hour" stroke="var(--text-tertiary)" />
                            <YAxis stroke="var(--text-tertiary)" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="consumption"
                                stroke="hsl(142, 71%, 45%)"
                                strokeWidth={3}
                                dot={{ fill: 'hsl(142, 71%, 45%)', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card card-glass">
                    <div className="chart-header">
                        <h3>Appliance Comparison</h3>
                        <span className="badge badge-warning">Month-over-Month</span>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={applianceComparison}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="appliance" stroke="var(--text-tertiary)" />
                            <YAxis stroke="var(--text-tertiary)" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="lastMonth" fill="hsl(220, 26%, 28%)" name="Last Month" />
                            <Bar dataKey="thisMonth" fill="hsl(142, 71%, 45%)" name="This Month" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Key Insights */}
            <div className="insights-section">
                <h3>Key Insights</h3>
                <div className="insights-grid">
                    {insights.map((insight, index) => (
                        <div key={index} className="insight-card card-glass">
                            <div className="insight-icon">
                                <insight.icon size={24} />
                            </div>
                            <div className="insight-content">
                                <p className="insight-label">{insight.title}</p>
                                <h3 className="insight-value">{insight.value}</h3>
                                <p className="insight-description text-secondary">{insight.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="breakdown-section card-glass">
                <h3>Detailed Breakdown</h3>
                <div className="breakdown-table">
                    <div className="table-header">
                        <span>Appliance</span>
                        <span>This Month</span>
                        <span>Last Month</span>
                        <span>Change</span>
                    </div>
                    {applianceComparison.map((item, index) => {
                        const change = ((item.thisMonth - item.lastMonth) / item.lastMonth * 100).toFixed(1);
                        const isIncrease = item.thisMonth > item.lastMonth;
                        return (
                            <div key={index} className="table-row">
                                <span className="appliance-name">{item.appliance}</span>
                                <span className="value">₹{item.thisMonth}</span>
                                <span className="value text-secondary">₹{item.lastMonth}</span>
                                <span className={`change ${isIncrease ? 'text-danger' : 'text-success'}`}>
                                    {isIncrease ? '+' : ''}{change}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default EnergyInsights;
