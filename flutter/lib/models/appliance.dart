import 'package:flutter/material.dart';

class Appliance {
  final int id;
  final String name;
  final String room;
  final IconData icon;
  bool status;
  final String power;
  double? temperature;
  String? mode;
  String? cycle;
  String? timeLeft;
  int? brightness;

  Appliance({
    required this.id,
    required this.name,
    required this.room,
    required this.icon,
    required this.status,
    required this.power,
    this.temperature,
    this.mode,
    this.cycle,
    this.timeLeft,
    this.brightness,
  });
}
