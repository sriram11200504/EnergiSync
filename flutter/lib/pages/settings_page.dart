import 'package:flutter/material.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSettingsSection('Connectivity', [
            _buildSettingsTile(Icons.wifi_rounded, 'IoT Connection', 'Broker, Client ID, and Security'),
            _buildSettingsTile(Icons.cloud_queue_rounded, 'Cloud Sync', 'Sync your data with EnergySync Cloud'),
          ]),
          const SizedBox(height: 24),
          _buildSettingsSection('Account & Users', [
            _buildSettingsTile(Icons.people_alt_rounded, 'User Management', 'Add or remove family members'),
            _buildSettingsTile(Icons.shield_rounded, 'Security', 'Password and biometric settings'),
          ]),
          const SizedBox(height: 24),
          _buildSettingsSection('Preferences', [
            _buildSettingsTile(Icons.notifications_active_rounded, 'Notifications', 'Alerts for high usage and savings'),
            _buildSettingsTile(Icons.palette_rounded, 'Appearance', 'Dark mode, theme and accent color'),
          ]),
        ],
      ),
    );
  }

  Widget _buildSettingsSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 16, bottom: 8),
          child: Text(title, style: const TextStyle(color: Color(0xFF00D1FF), fontWeight: FontWeight.bold, fontSize: 13)),
        ),
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            children: children,
          ),
        ),
      ],
    );
  }

  Widget _buildSettingsTile(IconData icon, String title, String subtitle) {
    return ListTile(
      leading: Icon(icon, color: Colors.grey),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      trailing: const Icon(Icons.chevron_right_rounded, color: Colors.grey),
      onTap: () {},
    );
  }
}
