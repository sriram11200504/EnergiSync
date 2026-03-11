import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class TariffOptimizationPage extends StatelessWidget {
  const TariffOptimizationPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tariff Optimization', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Live Status Pill
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(30),
                border: Border.all(color: Colors.white10),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      color: Color(0xFF10B981),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text('LIVE RATE: ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  const Text('₹5.2/kWh ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  const Text('(Normal)', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 12)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            // Savings Summary
            _buildSavingsCard(),
            const SizedBox(height: 24),
            
            // Charts Section
            const Text('Time-of-Day Tariff', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: BarChart(
                BarChartData(
                  gridData: const FlGridData(show: false),
                  titlesData: const FlTitlesData(show: false),
                  borderData: FlBorderData(show: false),
                  barGroups: [
                    _buildBarGroup(0, 3.5, const Color(0xFF10B981)),
                    _buildBarGroup(1, 5.2, const Color(0xFFF59E0B)),
                    _buildBarGroup(2, 8.5, const Color(0xFFEF4444)),
                    _buildBarGroup(3, 7.2, const Color(0xFFEF4444)),
                    _buildBarGroup(4, 5.8, const Color(0xFFF59E0B)),
                    _buildBarGroup(5, 9.2, const Color(0xFFEF4444)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),
            
            const Text('Smart Recommendations', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            _buildRecommendationCard('Washing Machine', '14:00', '22:00', '20'),
            _buildRecommendationCard('EV Charging', '18:00', '01:00', '60'),
          ],
        ),
      ),
    );
  }

  Widget _buildSavingsCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF3B82F6), Color(0xFF1D4ED8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.trending_down_rounded, color: Colors.white, size: 32),
              SizedBox(width: 12),
              Text('Potential Monthly Savings', style: TextStyle(color: Colors.white, fontSize: 16)),
            ],
          ),
          const SizedBox(height: 16),
          const Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text('₹', style: TextStyle(color: Colors.white70, fontSize: 24)),
              Text('3,420', style: TextStyle(color: Colors.white, fontSize: 42, fontWeight: FontWeight.bold)),
              Text('/month', style: TextStyle(color: Colors.white70, fontSize: 16)),
            ],
          ),
          const Divider(color: Colors.white24, height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildSavingsDetail('Daily', '₹114'),
              _buildSavingsDetail('Yearly', '₹41,040'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSavingsDetail(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
      ],
    );
  }

  BarChartGroupData _buildBarGroup(int x, double y, Color color) {
    return BarChartGroupData(
      x: x,
      barRods: [
        BarChartRodData(
          toY: y,
          color: color,
          width: 16,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
        ),
      ],
    );
  }

  Widget _buildRecommendationCard(String appliance, String current, String suggested, String savings) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(appliance, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text('HIGH PRIORITY', style: TextStyle(color: Color(0xFFEF4444), fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildTimeBlock('CURRENT', current, Colors.white70),
              const Icon(Icons.arrow_forward_rounded, color: Color(0xFF00D1FF)),
              _buildTimeBlock('SUGGESTED', suggested, const Color(0xFF10B981)),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Save ₹$savings per use', style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold)),
              ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Schedule Shift'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimeBlock(String label, String time, Color color) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 10)),
        const SizedBox(height: 4),
        Text(time, style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
