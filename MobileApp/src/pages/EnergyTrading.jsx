import { useState } from 'react';
import {
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    Building2,
    Globe,
    History,
    TrendingUp
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import './EnergyTrading.css';

const EnergyTrading = () => {
    const [tradingMode, setTradingMode] = useState('grid'); // 'grid' or 'p2p'
    const [exportLimit, setExportLimit] = useState(100); // percentage of excess to export
    const [isSelling, setIsSelling] = useState(false);

    // Realistic dummy data for the trading page
    const [currentMetrics, setCurrentMetrics] = useState({
        totalStored: 45.5, // kWh
        dailyRequirement: 12.0, // kWh
        emergencyReserve: 10.0, // kWh
        tradableExcess: 23.5, // kWh
        gridSellPrice: 0.12, // $/kWh
        p2pSellPrice: 0.15, // $/kWh
    });

    const [recentTransactions, setRecentTransactions] = useState([
        { id: 'T-9876', type: 'Credit', to: 'National Grid', amount: '5.2 kWh', value: '+$0.62', date: '2 hours ago', status: 'Completed' },
        { id: 'T-5432', type: 'Credit', to: 'Neighboring Campus (P2P)', amount: '3.0 kWh', value: '+$0.45', date: 'Yesterday', status: 'Completed' },
        { id: 'T-1098', type: 'Credit', to: 'National Grid', amount: '7.8 kWh', value: '+$0.94', date: '2 days ago', status: 'Completed' },
    ]);

    const energyExportData = [
        { name: 'Mon', exported: 12, revenue: 1.44 },
        { name: 'Tue', exported: 15, revenue: 1.80 },
        { name: 'Wed', exported: 8, revenue: 0.96 },
        { name: 'Thu', exported: 22, revenue: 2.64 },
        { name: 'Fri', exported: 18, revenue: 2.16 },
        { name: 'Sat', exported: 25, revenue: 3.00 },
        { name: 'Sun', exported: 20, revenue: 2.40 },
    ];

    const handleSellEnergy = () => {
        setIsSelling(true);

        setTimeout(() => {
            const energyToSell = (currentMetrics.tradableExcess * (exportLimit / 100)).toFixed(1);
            const price = tradingMode === 'grid' ? currentMetrics.gridSellPrice : currentMetrics.p2pSellPrice;
            const revenue = (parseFloat(energyToSell) * price).toFixed(2);
            const destination = tradingMode === 'grid' ? 'National Grid' : 'Neighboring Campus (P2P)';

            const newTx = {
                id: `T-${Math.floor(Math.random() * 10000)}`,
                type: 'Credit',
                to: destination,
                amount: `${energyToSell} kWh`,
                value: `+$${revenue}`,
                date: 'Just Now',
                status: 'Completed'
            };

            setRecentTransactions([newTx, ...recentTransactions]);
            setCurrentMetrics(prev => ({
                ...prev,
                totalStored: (prev.totalStored - parseFloat(energyToSell)).toFixed(1),
                tradableExcess: (prev.tradableExcess - parseFloat(energyToSell)).toFixed(1)
            }));

            setIsSelling(false);
        }, 1500);
    };

    return (
        <div className="energy-trading">
            <div className="page-header">
                <div>
                    <h1>Energy Trading</h1>
                    <p className="text-secondary">Monetize and distribute your excess solar energy</p>
                </div>
                <div className="status-badge active card-glass">
                    <span className="pulse-dot"></span>
                    Grid Connection Active
                </div>
            </div>

            {/* Overview Metrics */}
            <div className="metrics-grid">
                <div className="metric-card card-glass">
                    <div className="metric-icon success">
                        <Zap size={24} />
                    </div>
                    <div className="metric-content">
                        <p className="metric-label">Total Stored Energy</p>
                        <h2 className="metric-value">{currentMetrics.totalStored} <span className="unit">kWh</span></h2>
                        <p className="metric-trend positive">Fully Charged Panels</p>
                    </div>
                </div>

                <div className="metric-card card-glass">
                    <div className="metric-icon info">
                        <ArrowDownRight size={24} />
                    </div>
                    <div className="metric-content">
                        <p className="metric-label">Required + Emergency Reserve</p>
                        <h2 className="metric-value">{(currentMetrics.dailyRequirement + currentMetrics.emergencyReserve).toFixed(1)} <span className="unit">kWh</span></h2>
                        <p className="metric-trend text-secondary">Locked for safety</p>
                    </div>
                </div>

                <div className="metric-card card-glass highlight">
                    <div className="metric-icon warning">
                        <ArrowUpRight size={24} />
                    </div>
                    <div className="metric-content">
                        <p className="metric-label">Tradable Excess Energy</p>
                        <h2 className="metric-value">{currentMetrics.tradableExcess} <span className="unit">kWh</span></h2>
                        <p className="metric-trend positive">Available to sell</p>
                    </div>
                </div>
            </div>

            <div className="trading-dashboard">
                {/* Configuration Panel */}
                <div className="card-glass trading-config">
                    <div className="card-header">
                        <h3>Export Settings</h3>
                    </div>

                    <div className="config-body">
                        <div className="trading-modes">
                            <button
                                className={`mode-btn ${tradingMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setTradingMode('grid')}
                            >
                                <Globe size={20} />
                                <div className="mode-info">
                                    <h4>National Grid</h4>
                                    <p>Sell at ${currentMetrics.gridSellPrice}/kWh</p>
                                </div>
                            </button>

                            <button
                                className={`mode-btn ${tradingMode === 'p2p' ? 'active' : ''}`}
                                onClick={() => setTradingMode('p2p')}
                            >
                                <Building2 size={20} />
                                <div className="mode-info">
                                    <h4>P2P Network</h4>
                                    <p>Sell at ${currentMetrics.p2pSellPrice}/kWh</p>
                                </div>
                            </button>
                        </div>

                        <div className="slider-control mt-4">
                            <div className="slider-header">
                                <label>Amount of Excess to Sell ({((exportLimit / 100) * currentMetrics.tradableExcess).toFixed(1)} kWh)</label>
                                <span>{exportLimit}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={exportLimit}
                                onChange={(e) => setExportLimit(e.target.value)}
                                className="styled-slider"
                            />
                            <p className="hint text-secondary mt-1">
                                Retain {100 - exportLimit}% of the excess energy in your battery bank. Your {currentMetrics.emergencyReserve} kWh emergency reserve is untouched.
                            </p>
                        </div>

                        <div className="power-flow-viz">
                            <div className="flow-node solar">Battery</div>
                            <div className="flow-line active"></div>
                            <div className="flow-node home">Inverter</div>
                            <div className="flow-line export">→</div>
                            <div className="flow-node destination">
                                {tradingMode === 'grid' ? 'Grid' : 'Peers'}
                            </div>
                        </div>

                        <button
                            className={`btn btn-primary w-full mt-4 sell-btn ${isSelling ? 'loading' : ''}`}
                            onClick={handleSellEnergy}
                            disabled={isSelling || currentMetrics.tradableExcess <= 0 || exportLimit == 0}
                        >
                            {isSelling ? 'Processing Transaction...' : `Sell ${((exportLimit / 100) * currentMetrics.tradableExcess).toFixed(1)} kWh Now`}
                        </button>
                    </div>
                </div>

                {/* Export Chart */}
                <div className="card-glass chart-panel">
                    <div className="card-header">
                        <h3>Weekly Export Revenue</h3>
                        <div className="chart-legend-custom">
                            <span className="legend-item"><div className="dot revenue-dot"></div> Revenue ($)</span>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={energyExportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Transactions */}
            <div className="transactions-panel card-glass mt-4">
                <div className="card-header">
                    <div className="header-title">
                        <History size={20} className="text-primary" />
                        <h3>Transaction History</h3>
                    </div>
                    <button className="btn btn-ghost btn-sm">View All</button>
                </div>
                <div className="transactions-list">
                    {recentTransactions.map((tx, index) => (
                        <div key={index} className="transaction-item">
                            <div className="tx-icon">
                                {tx.type === 'Credit' ? <ArrowUpRight className="text-success" size={20} /> : <ArrowDownRight className="text-warning" size={20} />}
                            </div>
                            <div className="tx-details">
                                <h4>{tx.to}</h4>
                                <p className="text-secondary">{tx.date} • {tx.amount}</p>
                            </div>
                            <div className="tx-status">
                                <h4 className={tx.type === 'Credit' ? 'text-success' : 'text-default'}>{tx.value}</h4>
                                <span className="status-pill text-xs">{tx.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EnergyTrading;
