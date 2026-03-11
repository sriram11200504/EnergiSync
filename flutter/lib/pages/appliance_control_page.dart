import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/mqtt_service.dart';
import '../models/appliance.dart';

class ApplianceControlPage extends StatefulWidget {
  const ApplianceControlPage({super.key});

  @override
  State<ApplianceControlPage> createState() => _ApplianceControlPageState();
}

class _ApplianceControlPageState extends State<ApplianceControlPage> {
  final List<Appliance> _appliances = [
    Appliance(
      id: 1,
      name: 'Air Conditioner',
      room: 'Living Room',
      icon: Icons.ac_unit_rounded,
      status: true,
      power: '1.5 kW',
      temperature: 24,
      mode: 'Cool',
    ),
    Appliance(
      id: 2,
      name: 'Refrigerator',
      room: 'Kitchen',
      icon: Icons.kitchen_rounded,
      status: true,
      power: '0.3 kW',
      temperature: 4,
    ),
    Appliance(
      id: 3,
      name: 'Washing Machine',
      room: 'Utility Room',
      icon: Icons.wash_rounded,
      status: false,
      power: '0.8 kW',
      cycle: 'Quick Wash',
      timeLeft: '45 min',
    ),
    Appliance(
      id: 4,
      name: 'Smart Lights',
      room: 'Bedroom',
      icon: Icons.lightbulb_outline_rounded,
      status: false,
      power: '0.05 kW',
      brightness: 80,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final mqttService = context.watch<MqttService>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Appliance Control', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _appliances.length,
        itemBuilder: (context, index) {
          final app = _appliances[index];
          return _buildApplianceCard(app, mqttService);
        },
      ),
    );
  }

  Widget _buildApplianceCard(Appliance app, MqttService mqttService) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: app.status ? const Color(0xFF10B981).withOpacity(0.3) : Colors.transparent,
          width: 2,
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: app.status ? const Color(0xFF10B981).withOpacity(0.1) : Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(app.icon, color: app.status ? const Color(0xFF10B981) : Colors.grey, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(app.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    Text(app.room, style: const TextStyle(color: Colors.grey, fontSize: 13)),
                  ],
                ),
              ),
              Switch(
                value: app.status,
                activeColor: const Color(0xFF10B981),
                onChanged: (val) {
                  setState(() {
                    app.status = val;
                  });
                  // Publish to MQTT
                  final topic = 'energysync/control/${app.name.toLowerCase().replaceAll(' ', '_')}';
                  mqttService.publish(topic, '{"command": "${val ? 'ON' : 'OFF'}"}');
                },
              ),
            ],
          ),
          const Divider(height: 32, color: Colors.white10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildDetail('Power', app.power),
              if (app.temperature != null)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Temp', style: TextStyle(color: Colors.grey, fontSize: 12)),
                    Row(
                      children: [
                        IconButton(
                          visualDensity: VisualDensity.compact,
                          iconSize: 16,
                          icon: const Icon(Icons.remove_circle_outline),
                          onPressed: app.status ? () => setState(() => app.temperature = app.temperature! - 1) : null,
                        ),
                        Text('${app.temperature!.toInt()}°C', style: const TextStyle(fontWeight: FontWeight.bold)),
                        IconButton(
                          visualDensity: VisualDensity.compact,
                          iconSize: 16,
                          icon: const Icon(Icons.add_circle_outline),
                          onPressed: app.status ? () => setState(() => app.temperature = app.temperature! + 1) : null,
                        ),
                      ],
                    ),
                  ],
                ),
              if (app.brightness != null)
                _buildDetail('Brightness', '${app.brightness}%'),
              if (app.timeLeft != null)
                _buildDetail('Time Left', app.timeLeft!, valueColor: Colors.orange),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDetail(String label, String value, {Color? valueColor}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: valueColor)),
      ],
    );
  }
}
