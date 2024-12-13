# 🚀 **HIRA Cafe POS System**
<p align="center" style="margin-top:">
  <img src="#" width="400" />
</p>
<p align="center" style="margin-top:">
  <img src="/frontend/public/hira.png" alt="Himalkom Logo" width="200" />
</p>
<p align="center">
  Welcome to the <b>HIRA Cafe Website</b> repository!
</p>

---

## 🛠️ **Technology Used**

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Google%20Cloud-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white" />
</p>

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Voice Recognition**: Google Speech-to-Text API
- **Deployment**: Google Cloud Platform (GCP)

---

## 🌐 **Live Website**

- **Link**: [frontend-dot-hira-444406.et.r.appspot.com](frontend-dot-hira-444406.et.r.appspot.com)
  
---

## 📋 **Table of Contents**

1. [Project Overview](#project-overview)  
2. [Features](#features)  
3. [Tech Stack](#tech-stack)  
4. [Folder Structure](#folder-structure)  

---

## 📝 **Project Overview**

This project aims to provide a streamlined platform for managing and displaying content related to **HIRA Cafe**. The website features:

- A user-friendly frontend interface for placing and managing orders.
- Voice-based ordering for faster service.
- A secure backend for data persistence and management.
- Order history and menu management.

---

## ⭐ **Features**

### **Frontend**

- Dynamic pages for menu display and order confirmation.
- Voice command-based ordering with real-time transcription.
- Responsive design with TailwindCSS.

### **Backend**

- API built with Node.js and Express.
- SQLite database for lightweight data storage.
- Secure endpoints with Helmet and rate limiting.

### **Voice Recognition**

- Integrates **Google Speech-to-Text API** to process voice orders.
- AI determines ordered menu items from transcribed text.

---

## 📁 **Folder Structure**

```plaintext
HIRA-Cafe/
│
├── frontend/                # Frontend code
│   ├── public/
│   └── src/
│       ├── assets/    # Reusable React components
│       ├── components/
│       ├── layouts/
│       ├── pages/         # Individual pages
│       ├── services/      # API calls
│       └── utils/
│       └── App.jsx
│
├── backend/                # Backend code
│   ├── src/       # Route controllers
│       ├── config/
│       ├── routes/
│       └── services/
│   └── index.js           # Entry point
│
└── README.md
