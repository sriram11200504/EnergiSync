import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:mqtt_client/mqtt_client.dart';
import 'package:mqtt_client/mqtt_server_client.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MqttService extends ChangeNotifier {
  MqttServerClient? _client;
  bool isConnected = false;
  Map<String, dynamic> applianceValues = {};

  MqttService() {
    _initialize();
  }

  Future<void> _initialize() async {
    final prefs = await SharedPreferences.getInstance();
    final savedConfig = prefs.getString('mqtt_config');

    String brokerUrl = 'broker.hivemq.com';
    int port = 8883; // Default secure port
    String? username;
    String? password;
    String clientId = 'EnergySyncFlutter_${DateTime.now().millisecondsSinceEpoch}';

    if (savedConfig != null) {
      try {
        final config = json.decode(savedConfig);
        if (config['brokerUrl'] != null) {
          // Parse host and port from URL if possible, or use as host
          brokerUrl = config['brokerUrl'].replaceAll('wss://', '').split(':')[0];
        }
        username = config['username'];
        password = config['password'];
        if (config['clientId'] != null) clientId = config['clientId'];
      } catch (e) {
        debugPrint('Failed to parse saved MQTT config: $e');
      }
    }

    _client = MqttServerClient.withPort(brokerUrl, clientId, port);
    _client!.secure = true;
    _client!.keepAlivePeriod = 60;
    _client!.onDisconnected = _onDisconnected;
    _client!.onConnected = _onConnected;
    _client!.onSubscribed = _onSubscribed;

    final connMessage = MqttConnectMessage()
        .withClientIdentifier(clientId)
        .startClean()
        .withWillQos(MqttQos.atLeastOnce);

    if (username != null && password != null) {
      connMessage.authenticateAs(username, password);
    }

    _client!.connectionMessage = connMessage;

    try {
      debugPrint('Connecting to MQTT broker...');
      await _client!.connect();
    } catch (e) {
      debugPrint('MQTT Connection failed: $e');
      _client!.disconnect();
    }
  }

  void _onConnected() {
    isConnected = true;
    notifyListeners();
    debugPrint('Connected to MQTT Broker');
    _client!.subscribe('energysync/appliances/+', MqttQos.atLeastOnce);
    
    _client!.updates!.listen((List<MqttReceivedMessage<MqttMessage?>>? c) {
      final recMess = c![0].payload as MqttPublishMessage;
      final pt = MqttPublishPayload.bytesToStringAsString(recMess.payload.message);
      
      final topic = c[0].topic;
      try {
        applianceValues[topic] = json.decode(pt);
        notifyListeners();
      } catch (e) {
        debugPrint('Error parsing message on $topic: $e');
      }
    });
  }

  void _onDisconnected() {
    isConnected = false;
    notifyListeners();
    debugPrint('Disconnected from MQTT Broker');
  }

  void _onSubscribed(String topic) {
    debugPrint('Subscribed to topic: $topic');
  }

  void publish(String topic, String message) {
    if (isConnected) {
      final builder = MqttClientPayloadBuilder();
      builder.addString(message);
      _client!.publishMessage(topic, MqttQos.atLeastOnce, builder.payload!);
    }
  }
}
