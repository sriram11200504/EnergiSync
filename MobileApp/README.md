# EnergySync - Smart Energy Management System

A comprehensive React-based energy management application that helps users monitor, control, and optimize their home energy consumption with real-time insights and AI-powered recommendations.

![EnergySync Dashboard](file:///C:/Users/srira/.gemini/antigravity/brain/0acd6500-3b9a-4602-b9f7-0577cfc8b49d/energysync_dashboard_1767845040967.png)

## 🌟 New Features: Real-Time IoT Integration

We have upgraded the platform to a fully functional **Real-Time IoT System**.

### 📡 1. Live Data Streaming
- **Protocol**: MQTT over WebSockets.
- **Latency**: Sub-second updates.
- **Function**: The dashboard listens to the `energysync/appliances/+` topic and updates power charts and "Current Usage" stats instantly without page reloads.

### 🏠 2. Virtual Smart Home (Node-RED)
- A complete backend simulation of a smart home using **Node-RED**.
- Simulates logic for **10 Independent Smart Appliances**.
- **Two-Way Communication**:
    - **Web -> Device**: Clicking "ON" in the app sends a command to Node-RED.
    - **Device -> Web**: Node-RED processes the command and reports back the new power state.
- **Visual Demo**: Perfect for jury presentations to visualize data flow.

### 💡 3. Hardware Ready
- Includes production-ready C++ firmware (`smart_light_firmware.ino`) for **ESP32** microcontrollers.
- Allows physical smart bulbs/plugs to be controlled by the same web interface.

---

## 📱 Core Features

### 1. **Dashboard**
- Real-time energy consumption (Live Pulse)
- Live appliance status tracking
- Smart recommendations for energy optimization
- Quick stats: current usage, daily cost, monthly savings, carbon saved

### 2. **Universal Appliance Control**
Remote control and scheduling for **10 Smart Devices**:
1.  **Air Conditioner**
2.  **Refrigerator**
3.  **Washing Machine**
4.  **Smart Lights**
5.  **Television**
6.  **Ceiling Fan**
7.  **Water Heater (Geyser)**
8.  **Microwave**
9.  **Dishwasher**
10. **EV Charger**

### 3. **Tariff Optimization**
- Time-of-Day (ToD) tariff rate visualization
- AI-powered scheduling recommendations to save ~15% on bills.

### 4. **Energy Insights**
- Hourly, daily, weekly, and monthly consumption trends.
- Appliance-level power breakdowns.

### 5. **Carbon Footprint**
- CO₂ emissions tracking and "Trees Planted" equivalents.

### 6. **Billing & Payments**
- Simulated monthly bills with cost breakdowns and savings projections.

---

## 🚀 Technology Stack

- **Frontend**: React 18, Vite
- **IoT Protocol**: MQTT (via HiveMQ Public Broker)
- **Simulation**: Node-RED (Logic Flows)
- **Hardware**: ESP32 / Arduino (C++)
- **Visualization**: Recharts
- **Styling**: Vanilla CSS (Glassmorphism Design)

---

## 📦 Installation & Setup

### 1. Run the Web App
1. **Clone the repository**
   ```bash
   cd e:\EnergySync\MobileApp
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Run the development server**
   ```bash
   npm run dev
   ```
4. **Open in browser**: `http://localhost:5173`

### 2. Run the Virtual Smart Home (Simulation)
1. **Install Node-RED**
   ```bash
   npm install -g node-red
   node-red
   ```
2. **Import Logic**
   - Open `http://127.0.0.1:1880`
   - Import the file `virtual_house_flow.json` (found in project root).
   - Click **Deploy**.

### 3. (Optional) Run Physical Hardware
1. Flash `smart_light_firmware.ino` to an ESP32.
2. Connect to WiFi.
3. Watch it respond to the web app commands!

---

## 🎨 Design Features

- **Modern Dark Theme**: Energy-themed color palette.
- **Glassmorphism**: Premium transparent UI cards.
- **Pulse Animations**: Visual indicators for live data connection.
- **Responsive**: Full mobile support.

---

## 👥 Support
For questions or support, please refer to the BusinessRequirements documentation or contact the development team.

**Built with ⚡ by the EnergySync Team**
