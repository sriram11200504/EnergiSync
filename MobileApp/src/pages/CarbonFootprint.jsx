import {
    Leaf,
    TrendingDown,
    TreePine,
    Car,
    Home,
    Award,
    Target
} from 'lucide-react';
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';
import './CarbonFootprint.css';

const CarbonFootprint = () => {
    const monthlyEmissions = [
        { month: 'Jan', emissions: 185, saved: 25 },
        { month: 'Feb', emissions: 172, saved: 32 },
        { month: 'Mar', emissions: 165, saved: 38 },
        { month: 'Apr', emissions: 158, saved: 45 },
        { month: 'May', emissions: 142, saved: 52 },
        { month: 'Jun', emissions: 138, saved: 58 },
    ];

    const emissionsBySource = [
        { name: 'Air Conditioner', value: 45, color: 'hsl(210, 100%, 56%)' },
        { name: 'Refrigerator', value: 18, color: 'hsl(142, 71%, 45%)' },
        { name: 'Washing Machine', value: 12, color: 'hsl(25, 95%, 53%)' },
        { name: 'Lighting', value: 10, color: 'hsl(45, 93%, 58%)' },
        { name: 'Others', value: 15, color: 'hsl(271, 76%, 53%)' },
    ];

    const environmentalImpact = [
        { category: 'Energy Efficiency', value: 78 },
        { category: 'Renewable Usage', value: 45 },
        { category: 'Peak Avoidance', value: 82 },
        { category: 'Smart Scheduling', value: 68 },
        { category: 'Conservation', value: 72 },
    ];

    const achievements = [
        {
            title: 'Carbon Warrior',
            description: 'Reduced emissions by 30%',
            icon: Award,
            earned: true,
            color: 'hsl(142, 71%, 45%)'
        },
        {
            title: 'Tree Planter',
            description: 'Equivalent to planting 15 trees',
            icon: TreePine,
            earned: true,
            color: 'hsl(142, 71%, 45%)'
        },
        {
            title: 'Eco Champion',
            description: 'Saved 500kg CO₂ this year',
            icon: Leaf,
            earned: false,
            color: 'hsl(220, 26%, 28%)'
        },
        {
            title: 'Green Driver',
            description: 'Offset 1000km of car travel',
            icon: Car,
            earned: true,
            color: 'hsl(142, 71%, 45%)'
        },
    ];

    const stats = [
        {
            label: 'Total CO₂ Saved',
            value: '250 kg',
            description: 'This month',
            icon: Leaf,
            color: 'var(--success)'
        },
        {
            label: 'Trees Equivalent',
            value: '15',
            description: 'Trees planted',
            icon: TreePine,
            color: 'var(--primary-green)'
        },
        {
            label: 'Car Miles Offset',
            value: '620 km',
            description: 'Driving distance',
            icon: Car,
            color: 'var(--secondary-blue)'
        },
        {
            label: 'Homes Powered',
            value: '2.5',
            description: 'For one day',
            icon: Home,
            color: 'var(--accent-orange)'
        },
    ];

    const currentEmissions = 138;
    const targetEmissions = 100;
    const progress = ((targetEmissions / currentEmissions) * 100).toFixed(0);

    return (
        <div className="carbon-footprint">
            <div className="page-header">
                <div>
                    <h1>Carbon Footprint</h1>
                    <p className="text-secondary">Track your environmental impact and sustainability goals</p>
                </div>
            </div>

            {/* Impact Stats */}
            <div className="impact-stats">
                {stats.map((stat, index) => (
                    <div key={index} className="impact-card card-glass">
                        <div className="impact-icon" style={{ color: stat.color }}>
                            <stat.icon size={28} />
                        </div>
                        <div className="impact-content">
                            <h2 className="impact-value">{stat.value}</h2>
                            <p className="impact-label">{stat.label}</p>
                            <p className="impact-description text-secondary">{stat.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Dashboard */}
            <div className="carbon-dashboard">
                {/* Emissions Trend */}
                <div className="dashboard-card card-glass large">
                    <div className="card-header">
                        <h3>Carbon Emissions Trend</h3>
                        <div className="trend-badge">
                            <TrendingDown size={16} />
                            <span className="text-success">-25% reduction</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={monthlyEmissions}>
                            <defs>
                                <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="month" stroke="var(--text-tertiary)" />
                            <YAxis stroke="var(--text-tertiary)" label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="emissions"
                                stroke="hsl(0, 84%, 60%)"
                                strokeWidth={2}
                                fill="url(#colorEmissions)"
                                name="Emissions (kg)"
                            />
                            <Area
                                type="monotone"
                                dataKey="saved"
                                stroke="hsl(142, 71%, 45%)"
                                strokeWidth={2}
                                fill="url(#colorSaved)"
                                name="Saved (kg)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Emissions by Source */}
                <div className="dashboard-card card-glass">
                    <div className="card-header">
                        <h3>Emissions by Source</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={emissionsBySource}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {emissionsBySource.map((entry, index) => (
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
                        {emissionsBySource.map((item, index) => (
                            <div key={index} className="legend-item">
                                <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                                <span className="legend-label">{item.name}</span>
                                <span className="legend-value">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Environmental Score */}
                <div className="dashboard-card card-glass">
                    <div className="card-header">
                        <h3>Environmental Impact Score</h3>
                        <span className="badge badge-success">Good</span>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={environmentalImpact}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="category" stroke="var(--text-tertiary)" />
                            <PolarRadiusAxis stroke="var(--text-tertiary)" />
                            <Radar
                                name="Score"
                                dataKey="value"
                                stroke="hsl(142, 71%, 45%)"
                                fill="hsl(142, 71%, 45%)"
                                fillOpacity={0.3}
                                strokeWidth={2}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Target Progress */}
            <div className="target-section card-glass">
                <div className="target-header">
                    <div className="target-icon">
                        <Target size={32} />
                    </div>
                    <div>
                        <h3>Monthly Reduction Target</h3>
                        <p className="text-secondary">Goal: Reduce to 100 kg CO₂ per month</p>
                    </div>
                </div>
                <div className="target-progress">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="progress-labels">
                        <span>Current: {currentEmissions} kg</span>
                        <span className="text-success">{progress}% to goal</span>
                        <span>Target: {targetEmissions} kg</span>
                    </div>
                </div>
            </div>

            {/* Achievements */}
            <div className="achievements-section">
                <h3>Environmental Achievements</h3>
                <div className="achievements-grid">
                    {achievements.map((achievement, index) => (
                        <div key={index} className={`achievement-card card-glass ${achievement.earned ? 'earned' : 'locked'}`}>
                            <div className="achievement-icon" style={{ color: achievement.color }}>
                                <achievement.icon size={32} />
                            </div>
                            <div className="achievement-content">
                                <h4>{achievement.title}</h4>
                                <p className="text-secondary">{achievement.description}</p>
                            </div>
                            {achievement.earned && (
                                <div className="achievement-badge">
                                    <Award size={20} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Tips */}
            <div className="tips-section card-glass">
                <h3>Eco-Friendly Tips</h3>
                <div className="tips-list">
                    <div className="tip-item">
                        <Leaf size={20} />
                        <p>Use appliances during off-peak hours to reduce strain on the grid and lower emissions</p>
                    </div>
                    <div className="tip-item">
                        <TrendingDown size={20} />
                        <p>Reduce AC usage by 2°C to save up to 15% energy and reduce carbon footprint</p>
                    </div>
                    <div className="tip-item">
                        <TreePine size={20} />
                        <p>Your current savings are equivalent to planting 15 trees this month!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarbonFootprint;
