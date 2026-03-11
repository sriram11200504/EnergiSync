import {
    Receipt,
    DollarSign,
    TrendingDown,
    TrendingUp,
    Calendar,
    Download,
    CreditCard,
    AlertCircle,
    CheckCircle
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
import './Billing.css';

const Billing = () => {
    const monthlyBills = [
        { month: 'Jan', amount: 2400, units: 320 },
        { month: 'Feb', amount: 2200, units: 295 },
        { month: 'Mar', amount: 2600, units: 348 },
        { month: 'Apr', amount: 2800, units: 375 },
        { month: 'May', amount: 3200, units: 428 },
        { month: 'Jun', amount: 2890, units: 387 },
    ];

    const costBreakdown = [
        { category: 'Energy Charges', amount: 1850, percentage: 64 },
        { category: 'Fixed Charges', amount: 320, percentage: 11 },
        { category: 'Taxes & Duties', amount: 520, percentage: 18 },
        { category: 'Meter Rent', amount: 50, percentage: 2 },
        { category: 'Others', amount: 150, percentage: 5 },
    ];

    const billHistory = [
        {
            month: 'June 2024',
            dueDate: '15 Jul 2024',
            amount: 2890,
            units: 387,
            status: 'pending',
            billNumber: 'BILL-2024-06-001'
        },
        {
            month: 'May 2024',
            dueDate: '15 Jun 2024',
            amount: 3200,
            units: 428,
            status: 'paid',
            billNumber: 'BILL-2024-05-001',
            paidDate: '12 Jun 2024'
        },
        {
            month: 'April 2024',
            dueDate: '15 May 2024',
            amount: 2800,
            units: 375,
            status: 'paid',
            billNumber: 'BILL-2024-04-001',
            paidDate: '10 May 2024'
        },
        {
            month: 'March 2024',
            dueDate: '15 Apr 2024',
            amount: 2600,
            units: 348,
            status: 'paid',
            billNumber: 'BILL-2024-03-001',
            paidDate: '08 Apr 2024'
        },
    ];

    const currentBill = billHistory[0];
    const totalAmount = costBreakdown.reduce((sum, item) => sum + item.amount, 0);

    const projectedSavings = {
        current: 2890,
        optimized: 2450,
        savings: 440,
        percentage: 15
    };

    return (
        <div className="billing">
            <div className="page-header">
                <div>
                    <h1>Billing & Payments</h1>
                    <p className="text-secondary">Manage your electricity bills and payment history</p>
                </div>
            </div>

            {/* Current Bill Summary */}
            <div className="current-bill-section">
                <div className="current-bill-card card-glass">
                    <div className="bill-header">
                        <div className="bill-icon">
                            <Receipt size={32} />
                        </div>
                        <div className="bill-info">
                            <h3>Current Bill</h3>
                            <p className="text-secondary">{currentBill.month}</p>
                        </div>
                        <span className="badge badge-warning">Pending</span>
                    </div>

                    <div className="bill-amount">
                        <span className="currency">₹</span>
                        <span className="amount">{currentBill.amount}</span>
                    </div>

                    <div className="bill-details">
                        <div className="detail-item">
                            <span className="detail-label">Units Consumed</span>
                            <span className="detail-value">{currentBill.units} kWh</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Due Date</span>
                            <span className="detail-value text-warning">{currentBill.dueDate}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Bill Number</span>
                            <span className="detail-value">{currentBill.billNumber}</span>
                        </div>
                    </div>

                    <div className="bill-actions">
                        <button className="btn btn-primary btn-lg">
                            <CreditCard size={20} />
                            Pay Now
                        </button>
                        <button className="btn btn-secondary btn-lg">
                            <Download size={20} />
                            Download
                        </button>
                    </div>
                </div>

                {/* Savings Projection */}
                <div className="savings-card card-glass">
                    <div className="savings-header">
                        <TrendingDown size={28} />
                        <h3>Potential Savings</h3>
                    </div>
                    <div className="savings-comparison">
                        <div className="comparison-item current">
                            <span className="comparison-label">Current Bill</span>
                            <span className="comparison-value">₹{projectedSavings.current}</span>
                        </div>
                        <div className="arrow-icon">→</div>
                        <div className="comparison-item optimized">
                            <span className="comparison-label">With Optimization</span>
                            <span className="comparison-value text-success">₹{projectedSavings.optimized}</span>
                        </div>
                    </div>
                    <div className="savings-amount">
                        <div className="savings-badge">
                            <DollarSign size={24} />
                            <div>
                                <h2>₹{projectedSavings.savings}</h2>
                                <p className="text-secondary">Save {projectedSavings.percentage}% this month</p>
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-success">
                        <CheckCircle size={18} />
                        Enable Smart Optimization
                    </button>
                </div>
            </div>

            {/* Billing Trends */}
            <div className="chart-section card-glass">
                <div className="section-header">
                    <h3>Billing Trends</h3>
                    <div className="chart-legend">
                        <span className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: 'hsl(142, 71%, 45%)' }}></span>
                            Amount (₹)
                        </span>
                        <span className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: 'hsl(210, 100%, 56%)' }}></span>
                            Units (kWh)
                        </span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={monthlyBills}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="month" stroke="var(--text-tertiary)" />
                        <YAxis yAxisId="left" stroke="var(--text-tertiary)" />
                        <YAxis yAxisId="right" orientation="right" stroke="var(--text-tertiary)" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)'
                            }}
                        />
                        <Legend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="amount"
                            stroke="hsl(142, 71%, 45%)"
                            strokeWidth={3}
                            dot={{ fill: 'hsl(142, 71%, 45%)', r: 5 }}
                            name="Amount (₹)"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="units"
                            stroke="hsl(210, 100%, 56%)"
                            strokeWidth={3}
                            dot={{ fill: 'hsl(210, 100%, 56%)', r: 5 }}
                            name="Units (kWh)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Cost Breakdown */}
            <div className="breakdown-section">
                <div className="breakdown-chart card-glass">
                    <h3>Cost Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={costBreakdown} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis type="number" stroke="var(--text-tertiary)" />
                            <YAxis dataKey="category" type="category" stroke="var(--text-tertiary)" width={120} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            />
                            <Bar dataKey="amount" fill="hsl(142, 71%, 45%)" radius={[0, 8, 8, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="breakdown-details card-glass">
                    <h3>Detailed Breakdown</h3>
                    <div className="breakdown-list">
                        {costBreakdown.map((item, index) => (
                            <div key={index} className="breakdown-item">
                                <div className="breakdown-info">
                                    <span className="breakdown-label">{item.category}</span>
                                    <span className="breakdown-percentage text-secondary">{item.percentage}%</span>
                                </div>
                                <div className="breakdown-bar">
                                    <div
                                        className="breakdown-fill"
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                                <span className="breakdown-amount">₹{item.amount}</span>
                            </div>
                        ))}
                        <div className="breakdown-total">
                            <span>Total Amount</span>
                            <span className="total-amount">₹{totalAmount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bill History */}
            <div className="history-section card-glass">
                <div className="section-header">
                    <h3>Payment History</h3>
                    <button className="btn btn-secondary">
                        <Download size={18} />
                        Export All
                    </button>
                </div>
                <div className="history-table">
                    <div className="table-header">
                        <span>Month</span>
                        <span>Bill Number</span>
                        <span>Units</span>
                        <span>Amount</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </div>
                    {billHistory.map((bill, index) => (
                        <div key={index} className="table-row">
                            <div className="table-cell">
                                <span className="cell-label">Month</span>
                                <span className="cell-value">{bill.month}</span>
                            </div>
                            <div className="table-cell">
                                <span className="cell-label">Bill Number</span>
                                <span className="cell-value text-secondary">{bill.billNumber}</span>
                            </div>
                            <div className="table-cell">
                                <span className="cell-label">Units</span>
                                <span className="cell-value">{bill.units} kWh</span>
                            </div>
                            <div className="table-cell">
                                <span className="cell-label">Amount</span>
                                <span className="cell-value">₹{bill.amount}</span>
                            </div>
                            <div className="table-cell">
                                <span className="cell-label">Status</span>
                                <span className={`badge badge-${bill.status === 'paid' ? 'success' : 'warning'}`}>
                                    {bill.status === 'paid' ? (
                                        <>
                                            <CheckCircle size={12} />
                                            Paid
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle size={12} />
                                            Pending
                                        </>
                                    )}
                                </span>
                            </div>
                            <div className="table-cell actions">
                                <button className="btn btn-sm btn-ghost">
                                    <Download size={16} />
                                    Download
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Billing;
