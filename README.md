# 🌾 AgroLink — Agricultural Marketplace & Farm-to-Market Platform

> **Connect. Trade. Grow.**

AgroLink is a role-based agricultural marketplace platform designed to digitally connect **Farmers, Buyers, and Transporters** in a unified ecosystem.

The platform aims to simplify the journey from **crop listing and price discovery to buyer negotiation, order management, transportation, shipment tracking, and payment records** — while providing farmers with practical decision-support features such as market insights, price alerts, and post-harvest alerts.

---

## 🏆 SIH 2026 Project

**Project:** AgroLink  
**Domain:** Agriculture & Rural Technology  
**Focus:** Digital Agricultural Marketplace, Logistics & Farm-to-Market Connectivity

AgroLink is designed around a simple idea:

> **A farmer should be able to discover opportunities, sell produce, arrange transportation, and track the delivery process from one platform.**

---

# 📌 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Objectives](#-key-objectives)
- [User Roles](#-user-roles)
- [Core Features](#-core-features)
- [End-to-End Workflow](#-end-to-end-workflow)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Application Modules](#-application-modules)
- [Database Design](#-database-design)
- [API Architecture](#-api-architecture)
- [Maps & Location](#-maps--location)
- [Localization](#-localization)
- [Decision Support](#-decision-support)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Running the Project](#-running-the-project)
- [Authentication](#-authentication)
- [Security Considerations](#-security-considerations)
- [Future Scope](#-future-scope)
- [Current Limitations](#-current-limitations)
- [Why AgroLink](#-why-agrolink)
- [Project Vision](#-project-vision)

---

# 🌱 Problem Statement

Agricultural supply chains often involve multiple disconnected activities:

- Farmers need better access to buyers and market opportunities.
- Buyers need a convenient way to discover available crops and place orders.
- Transportation is often handled separately from the buying process.
- Farmers may lack simple tools for monitoring market prices and post-harvest risks.
- Communication between farmers, buyers, and transporters can become fragmented.
- Shipment and delivery information may not be available in one place.

This creates unnecessary friction between **production, selling, transportation, and delivery**.

AgroLink addresses this problem by bringing these activities together into a single digital platform.

---

# 💡 Our Solution

AgroLink provides a unified marketplace and logistics ecosystem with three primary user roles:

### 👨‍🌾 Farmer
Farmers can:

- Add and manage crop listings
- View their crops and available quantities
- Receive and manage buyer offers
- View orders received
- Access marketplace information
- Monitor market prices
- Receive price alerts
- Monitor post-harvest/spoilage alerts
- Request transportation
- Maintain payment-related records
- Communicate through the platform

### 🏪 Buyer
Buyers can:

- Browse available agricultural products
- Discover crop listings
- View crop information and pricing
- Make offers
- Place/manage orders
- Track active orders
- Arrange transportation
- Monitor shipment progress
- Communicate with farmers and transporters

### 🚚 Transporter
Transporters can:

- View transport requests
- Accept transport bookings
- Manage trips
- View active deliveries
- Track delivery information
- Manage vehicles
- Monitor earnings
- View performance information
- Communicate with users

---

# 🎯 Key Objectives

AgroLink focuses on:

1. **Direct marketplace connectivity**
2. **Simplified crop selling and buying**
3. **Integrated transportation**
4. **Shipment visibility**
5. **Market price awareness**
6. **Post-harvest risk awareness**
7. **Role-based workflows**
8. **Multilingual accessibility**
9. **Centralized transaction records**
10. **Simple and beginner-friendly user experience**

---

# 👥 User Roles

```text
                    ┌─────────────────────┐
                    │      AgroLink       │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
        👨‍🌾 Farmer         🏪 Buyer          🚚 Transporter
             │                 │                 │
             ▼                 ▼                 ▼
       Crop Listing       Marketplace       Transport Requests
       Offers             Orders            Trips
       Orders             Offers            Deliveries
       Alerts             Tracking          Earnings
       Transport          Payments          Performance
🚜 Core Features
1. 🌾 Crop Management

Farmers can create and manage crop listings containing relevant information such as:

Crop name
Category
Quantity
Price
Location
Availability
Crop-related information

This creates the foundation of the AgroLink marketplace.

2. 🛒 Agricultural Marketplace

The marketplace connects crop sellers with potential buyers.

Buyers can:

Browse available crops
Search and discover listings
Review pricing
View available quantities
Initiate purchase/offer workflows
3. 🤝 Negotiation & Offers

AgroLink supports offer-based interactions between farmers and buyers.

Typical workflow:

Buyer
  ↓
Views Crop
  ↓
Makes Offer
  ↓
Farmer Receives Offer
  ↓
Accept / Manage Offer
  ↓
Order Confirmation
4. 📦 Order Management

Orders form the core transaction layer between farmers and buyers.

The platform maintains the relationship between:

Farmer
   ↓
Crop
   ↓
Order
   ↓
Transport
   ↓
Shipment
   ↓
Delivery
   ↓
Payment Record
5. 🚚 Integrated Transportation

Instead of treating transportation as a completely separate activity, AgroLink connects transport requirements with agricultural orders.

Farmers/buyers can request transportation and transporters can view and accept available transport requests.

6. 📍 Shipment Tracking

AgroLink provides a map-based shipment visualization system for tracking delivery progress.

The tracking workflow connects:

Pickup Location
       ↓
   Transporter
       ↓
    In Transit
       ↓
Destination
       ↓
   Delivered

The current implementation provides map-based shipment visualization and simulated tracking behavior.

7. 💰 Payments Ledger

AgroLink maintains payment-related transaction records connected with orders.

This creates a clearer relationship between:

Order → Payment Record

and helps maintain transaction history within the platform.

8. 📈 Market Advisor

AgroLink includes a rule-based Market Advisor designed to provide simple market-related decision support.

It can help users interpret available market information and make more informed decisions.

Note: The current Market Advisor is rule-based and does not claim to be a machine-learning model.

9. 🔔 Price Alerts

Users can monitor agricultural market prices and configure relevant price alerts.

This helps users stay aware of changes in market conditions.

10. ⚠️ Post-Harvest Alerts

AgroLink includes post-harvest/spoilage monitoring functionality.

The purpose is to help identify crops that may require attention based on their storage/availability conditions.

The system can notify users when potential post-harvest risks need attention.

11. 💬 Messaging

AgroLink provides communication capabilities between platform participants.

This helps support interactions across:

Farmers
Buyers
Transporters
12. 🚗 Carpool

The platform includes a carpool/transport-sharing module designed to support transportation coordination.

13. 🌐 Multilingual Interface

AgroLink is designed for accessibility across different user groups.

Supported languages include:

🇬🇧 English
🇮🇳 Hindi
🇮🇳 Marathi

The application includes a centralized localization system so interface text can be managed consistently across dashboards and modules.

🔄 End-to-End Workflow

One of the core AgroLink workflows is:

                     AGROLINK TRANSACTION FLOW

Farmer
  │
  ├── Create Crop Lot
  │
  ▼
Marketplace Listing
  │
  ▼
Buyer Discovers Crop
  │
  ├── Make Offer
  │
  ▼
Farmer Reviews Offer
  │
  ▼
Order Confirmed
  │
  ▼
Transport Request
  │
  ▼
Transporter Receives Request
  │
  ▼
Transporter Accepts
  │
  ▼
Shipment Created
  │
  ├── Ready for Pickup
  │
  ├── Picked Up
  │
  ├── In Transit
  │
  ▼
Delivered
  │
  ▼
Payment Record
  │
  ▼
Transaction Completed
🏗️ System Architecture

AgroLink follows a three-tier web application architecture.

┌─────────────────────────────────────────────┐
│                 FRONTEND                    │
│                                             │
│ React 18 + Vite                             │
│ Tailwind CSS                                │
│ React Router                                │
│ Lucide Icons                                │
│ Localization                                │
│ Leaflet + OpenStreetMap                     │
└──────────────────────┬──────────────────────┘
                       │
                       │ REST API + JWT
                       ▼
┌─────────────────────────────────────────────┐
│                  BACKEND                    │
│                                             │
│ Node.js                                     │
│ Express.js                                  │
│ Authentication                              │
│ Crop Management                              │
│ Marketplace                                 │
│ Orders & Offers                             │
│ Transport                                   │
│ Shipment Tracking                            │
│ Notifications                               │
│ Payments Ledger                             │
│ Price Alerts                                │
│ Carpool                                     │
└──────────────────────┬──────────────────────┘
                       │
                       │ SQL
                       ▼
┌─────────────────────────────────────────────┐
│                 DATABASE                    │
│                                             │
│ SQLite + sql.js                             │
│                                             │
│ Users                                       │
│ Crops                                       │
│ Orders                                      │
│ Transport Bookings                          │
│ Shipments                                   │
│ Payments                                    │
│ Notifications                               │
│ Market Prices                               │
│ Price Alerts                                │
│ Carpool / Messages                          │
└─────────────────────────────────────────────┘
🧰 Technology Stack
Layer	Technology
Frontend	React 18
Build Tool	Vite
Styling	Tailwind CSS
Routing	React Router
Icons	Lucide Icons
Backend	Node.js
Server Framework	Express.js
Database	SQLite
SQLite Runtime	sql.js
Authentication	JWT
Password Security	bcrypt
API Communication	REST APIs
Maps	Leaflet
Map Data	OpenStreetMap
Localization	English / Hindi / Marathi
🧩 Application Modules

AgroLink is organized around several functional modules:

Authentication
Registration
Login
Role-based access
JWT authentication
Password hashing
Farmer
Dashboard
Crop Management
Marketplace
Negotiation Offers
Orders Received
Market Advisor
Price Alerts
Post-Harvest Alerts
Payments
Transport
Carpool
Messages
Buyer
Dashboard
Marketplace
Crop Discovery
Offers
Orders
Transport
Shipment Tracking
Payments
Messages
Transporter
Dashboard
Transport Requests
My Trips
Active Delivery
Vehicle Management
Earnings
Performance
Messages
🗄️ Database Design

The core data relationships are structured around the agricultural transaction lifecycle.

Users
  │
  ├───────────────┐
  │               │
  ▼               ▼
Crops           Notifications
  │
  ▼
Orders
  │
  ├───────────────┐
  │               │
  ▼               ▼
Transport       Payments
Bookings
  │
  ▼
Shipments

Additional supporting entities include:

Market Prices
Price Alerts
Carpool
Messages
Core Relationship
Users → Crops → Orders → Transport Bookings → Shipments
Orders → Payments
Users → Notifications
Users → Price Alerts
🔌 API Architecture

The frontend communicates with the backend through REST APIs.

Major backend responsibilities include:

Authentication
     │
     ├── User Registration
     └── User Login

Crop Management
     │
     ├── Create Crop
     ├── Update Crop
     └── Retrieve Crops

Marketplace
     │
     ├── Browse Crops
     └── Crop Discovery

Orders & Offers
     │
     ├── Create Offer
     ├── Manage Offer
     └── Manage Order

Transport
     │
     ├── Create Booking
     ├── View Requests
     └── Accept Booking

Shipment
     │
     ├── Shipment Status
     └── Tracking

Notifications
     │
     └── User Notifications

Payments
     │
     └── Payment Records

Market Intelligence
     │
     ├── Market Prices
     ├── Price Alerts
     └── Market Advisor
🗺️ Maps & Location

AgroLink uses:

Leaflet for interactive map rendering
OpenStreetMap for map tiles

Maps are used for shipment and location-related visualization.

The tracking system can represent:

Pickup location
Destination
Transporter/shipment position
Route visualization
Shipment status
Tracking Lifecycle
Pickup
  ↓
Ready for Pickup
  ↓
Picked Up
  ↓
In Transit
  ↓
Delivered

Implementation Note: The current shipment tracking implementation is a map-based/demo tracking system and should not be interpreted as continuous real-world GPS tracking unless a live GPS integration is explicitly enabled.

🌐 Localization

AgroLink supports:

English
Hindi
Marathi

Localization is handled through a centralized translation system.

The objective is to make the platform accessible to users who may be more comfortable using regional languages.

🧠 Decision Support
Rule-Based Market Advisor

AgroLink includes a rule-based Market Advisor that uses available market information and predefined decision rules to provide simple guidance.

The current implementation is intentionally lightweight and transparent.

Market Data
    ↓
Rule Evaluation
    ↓
Market Insight
    ↓
User Decision Support

This is currently a rule-based system, not an ML prediction model.

📁 Project Structure

A simplified project structure:

AgroLink/
│
├── backend/
│   ├── ...
│   └── agrolink.db
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── translations/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── ...
│   │
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
⚙️ Installation & Setup
Prerequisites

Make sure the following are installed:

Node.js
npm
Git

Verify:

node --version
npm --version
git --version
🚀 Running AgroLink Locally
1. Clone the repository
git clone https://github.com/Prithvi208/AgroLink.git

Navigate into the project:

cd AgroLink
2. Install frontend dependencies
cd frontend
npm install
3. Start the frontend
npm run dev

The frontend will be available at the local development URL shown by Vite.

4. Start the backend

Open another terminal and navigate to the backend directory:

cd backend

Install backend dependencies if required:

npm install

Then start the backend using the project's configured start command.

🔐 Authentication

AgroLink uses:

JWT for authentication/session authorization
bcrypt for password hashing
Role-based access control

Users are associated with one of the primary roles:

FARMER
BUYER
TRANSPORTER

Protected routes ensure that users can access functionality appropriate to their role.

🛡️ Security Considerations

The application is designed with basic web application security practices including:

Password hashing using bcrypt
JWT-based authentication
Protected application routes
Role-based authorization
Environment-based configuration for sensitive values
Important for Deployment

Do not commit sensitive values such as:

JWT secrets
API keys
Database credentials
Environment variables

to the public repository.

Use environment variables for production configuration.

📱 User Experience

AgroLink focuses on a simple, clean and beginner-friendly interface.

The design philosophy is:

Less complexity. More clarity.

Important actions are organized around role-specific dashboards so that users can quickly access the tasks most relevant to them.

Farmer
Dashboard
   ↓
My Crops
   ↓
Marketplace
   ↓
Offers
   ↓
Orders
   ↓
Transport
Buyer
Dashboard
   ↓
Marketplace
   ↓
Offers
   ↓
Orders
   ↓
Transport
   ↓
Tracking
Transporter
Dashboard
   ↓
Transport Requests
   ↓
Trips
   ↓
Active Delivery
   ↓
Earnings
🔮 Future Scope

AgroLink can be extended with several advanced capabilities.

📍 Real-Time GPS Tracking

Integrate real device GPS/location services to provide continuous transporter/shipment tracking.

🗺️ Advanced Routing

Integrate production-grade routing and navigation services for:

Distance calculation
ETA
Route optimization
Multiple stops
Delivery planning
🤖 Advanced AI/ML Decision Support

Future versions could introduce machine-learning models for:

Crop price forecasting
Demand prediction
Spoilage prediction
Route optimization
Personalized market recommendations
💳 Digital Payments

The payment ledger can be extended into a complete digital payment system with:

Payment gateway integration
Online settlement
Transaction verification
Digital receipts
📊 Analytics Dashboard

Future analytics could provide:

Farmer sales trends
Buyer purchase trends
Transporter performance
Crop demand analytics
Regional market trends
🌍 Scalability

The current architecture can be evolved toward:

Cloud deployment
PostgreSQL/MySQL
Redis caching
Object storage
Microservices where appropriate
Production-grade observability
⚠️ Current Limitations

The current prototype has some intentional limitations:

Shipment tracking is currently map-based/demo tracking rather than continuous real-world GPS.
The Market Advisor is rule-based rather than ML-based.
The current database setup is designed for the project/prototype environment.
Production deployment would require additional infrastructure, security hardening, monitoring, and scalability work.

These limitations provide clear directions for future development.

🌟 Why AgroLink?

AgroLink is not only a crop marketplace.

It connects multiple stages of the agricultural transaction lifecycle:

       🌾 FARM
          │
          ▼
    Crop Listing
          │
          ▼
     Marketplace
          │
          ▼
    Buyer + Farmer
          │
          ▼
        Order
          │
          ▼
     Transportation
          │
          ▼
       Shipment
          │
          ▼
       Delivery
          │
          ▼
        Payment

Around this core transaction flow, AgroLink adds:

Market Advisor
Price Alerts
Post-Harvest Alerts
Messaging
Carpool
Notifications

This creates a connected farm-to-market digital ecosystem rather than a standalone marketplace.

🎯 Project Vision

Our vision is to build a technology platform where agricultural stakeholders can interact through a single, accessible ecosystem.

AgroLink aims to reduce fragmentation between:

Farmer → Market → Buyer → Transport → Delivery

and make the agricultural supply chain more connected, transparent, and accessible.

👨‍💻 Development Philosophy

AgroLink is built around four principles:

🌱 Simplicity

Interfaces should remain easy to understand for first-time users.

🔗 Connectivity

Farmers, buyers, and transporters should be connected through a unified workflow.

📍 Visibility

Orders and shipments should provide clear status information.

📈 Decision Support

Users should have access to useful market and operational information.

🏁 Conclusion

AgroLink brings together agricultural commerce, logistics, shipment visibility, market information, and role-based collaboration into one platform.

The project provides a foundation that can evolve from a functional prototype into a larger digital agricultural ecosystem through real-time GPS, advanced analytics, AI/ML decision support, digital payments, and scalable cloud infrastructure.

AgroLink — Connect. Trade. Grow. 🌾

📜 License

This project is developed as part of the Smart India Hackathon (SIH) 2026 project work.

Refer to the repository for the applicable project/license information.

⭐ Support the Project

If you find AgroLink interesting, consider giving the repository a ⭐ on GitHub.

AgroLink — Connecting Agriculture, People & Possibilities. 🌾


### Ek important correction, bhai

README mein maine **Google Maps nahi dala**, kyunki tumhare current project architecture ke according map implementation **Leaflet + OpenStreetMap** hai. Agar hum Google Maps properly implement kar dete hain, tab README ke relevant sections ko update karke:

> Google Maps JavaScript API + Places API + Geocoding + Routes API

kar denge.

Aur **ML/AI ka overclaim bhi nahi kiya** — Market Advisor ko correctly **rule-based** rakha hai. SIH presentation mein ye honesty actually useful rahegi.

### README ko aur professional banana ho toh

GitHub repo ke top par eventually ye 3 cheezein bhi add kar sakte hain:

```text
🌾 AgroLink
Connect. Trade. Grow.

[Live Demo] [Documentation] [SIH 2026]

Screenshots
Architecture
Features
Demo Flow
