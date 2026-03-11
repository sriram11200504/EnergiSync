import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../services/mqtt_service.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final mqttService = context.watch<MqttService>();
    final currentPower = 4.2; // Mocking or pulling from mqttService if available

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 40),
          const Text(
            'Dashboard',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
          ),
          Text(
            'Welcome back! EnergySync is ${mqttService.isConnected ? "Connected" : "Disconnected"}',
            style: const TextStyle(color: Colors.grey),
          ),
          const SizedBox(height: 24),
          
          // Stats Grid
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 1.4,
            children: [
              _buildStatCard('Current Usage', '${currentPower} kW', '+12%', Icons.bolt_rounded, const Color(0xFF00D1FF)),
              _buildStatCard("Today's Cost", '₹${(currentPower * 58).toStringAsFixed(0)}', '-8%', Icons.currency_rupee, const Color(0xFF10B981)),
              _buildStatCard('Monthly Savings', '₹1,240', '+15%', Icons.trending_down_rounded, const Color(0xFFF59E0B)),
              _buildStatCard('Carbon Saved', '42 kg', '+20%', Icons.eco_rounded, const Color(0xFF10B981)),
            ],
          ),
          
          const SizedBox(height: 24),
          
          // Chart Card
          _buildCard(
            title: 'Energy Consumption',
            child: SizedBox(
              height: 200,
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: false),
                  titlesData: const FlTitlesData(show: false),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: const [
                        FlSpot(0, 2.1),
                        FlSpot(1, 1.8),
                        FlSpot(2, 4.5),
                        FlSpot(3, 5.2),
                        FlSpot(4, 6.8),
                        FlSpot(5, 7.5),
                        FlSpot(6, 3.2),
                      ],
                      isCurved: true,
                      color: const Color(0xFF10B981),
                      barWidth: 3,
                      isStrokeCapRound: true,
                      dotData: const FlDotData(show: false),
                      belowBarData: BarAreaData(
                        show: true,
                        color: const Color(0xFF10B981).withOpacity(0.1),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Active Appliances
          const Text(
            'Active Appliances',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          _buildApplianceItem('Air Conditioner', 'Living Room', '1.6 kW', 'Running'),
          _buildApplianceItem('Refrigerator', 'Kitchen', '0.3 kW', 'Running'),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, String change, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color, size: 28),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: Colors.grey, fontSize: 12)),
              Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCard({required String title, required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildApplianceItem(String name, String room, String power, String status) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          const Icon(Icons.power_settings_new_rounded, color: Color(0xFF10B981)),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
                Text(room, style: const TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(power, style: const TextStyle(fontWeight: FontWeight.bold)),
              Text(status, style: const TextStyle(color: Color(0xFF10B981), fontSize: 12)),
            ],
          ),
        ],
      ),
    );
  }
}
