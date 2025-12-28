# 🏥 HealthX (Project FutureBuilders 2025)

> **Bridging the gap in medical support for Bangladesh's Hill Tracts and Rural Regions.**

### 1. Team Name & Member Details
**Team Name:** IUT_CGPA_Doesn't_Matter 
**Event:** FutureBuilders 2025 (IUT)

**Team Members:**
* **Member 1:** Abrar Mahmud Hasan
* **Member 2:** Saibul Haque Jessan


---

### 2. Problem Statement
**The Silent Struggle: Why Medical Support in Bangladesh's Hill Tracts and Rural Regions Remains Hard to Find.**

In the sprawling greens of Bangladesh’s hill tracts and the distant stretches of rural villages, life often moves with a quiet rhythm—yet behind that calm lies a persistent struggle: access to medical support. For millions living in these regions, healthcare is not a guaranteed right but a long-distance hope, often travelling on unpaved roads, across rivers, or through steep, forested terrain.

Create a solution to overcome this challenge for the helpless people with limited internet access,with the following requirements:


---


**Key Features Implemented:**
* **📷 Smart Symptom Scanner (Input Layer):** A dedicated tool for patients to log their current condition. Users can describe symptoms in text or upload images (e.g., rashes, wounds). This data is tagged and securely stored in the patient's medical history for analysis.
* **🤖 AI Doctor (Analysis Layer):** The intelligent consultant that analyzes the data. Unlike simple chatbots, it **automatically retrieves the latest symptom scan** combined with the patient's **previous medical history** to generate a context-aware, holistic diagnosis and first-aid plan.
* **📝 Medical History & Report Overview:** A centralized dashboard that tracks all previous scans and reports, allowing the AI to detect patterns (e.g., recurring fevers) that a one-time scan might miss.
* **👨‍⚕️ Digital OPD (Doctor Consultancy):** A dedicated appointment system allowing rural patients to request consultations with human specialists. It supports asynchronous requests, perfect for areas with unstable internet.
* **📍 Smart Hospital Finder:** Uses the phone's GPS to locate the nearest hospitals. It features a **Hybrid Mode** that fetches live data from OpenStreetMap when online and switches to a hardcoded emergency database when offline.
* **🗺️ Live Navigation:** One-tap integration with **Google Maps** and **Waze** to guide villagers to the nearest facility via the fastest route.
* **📢 Digital Notice Board:** Critical health updates (Vaccination drives, Cold wave alerts) for the local community.

---

### 4. Technologies Used
**Frontend:**
* **React.js (Vite):** Fast, modern UI framework.
* **Tailwind CSS:** For responsive, mobile-first styling.
* **Lucide React:** Lightweight iconography.
* **Geolocation API:** For real-time user tracking.

**Backend:**
* **Node.js & Express.js:** RESTful API server.
* **Multer:** Handling image uploads.
* **Axios:** Proxying external requests to OpenStreetMap.

**AI & Cloud Services:**
* **Google Gemini 1.5 Flash:** Core intelligence for symptom analysis and medical advice.
* **Firebase Authentication:** Secure user login and management.
* **Overpass API (OpenStreetMap):** For fetching live hospital location data.

---

### 5. AI Tools Disclosure (MANDATORY)
* **Core Logic:** We utilize **Google Gemini 2.5 Flash** API for generating medical advice and analyzing symptom images.
* **Development Assistance:** Large Language Models (Gemini/ChatGPT) were used for code debugging, refactoring, and generating boilerplate configurations.

---

### 6. Handling Limited Internet Access
Our solution is explicitly designed for the "Hill Tracts" scenario where internet is unstable:

1.  **Hybrid Architecture (Online/Offline Mode):**
    * **Online:** The app uses Gemini 1.5 Flash for deep analysis and OpenStreetMap for live hospital tracking.
    * **Offline Fallback:** If the internet fails, the app automatically switches to **Local Mode**. It uses a lightweight, hardcoded medical dataset (`offlineData.ts`) for first aid and a pre-loaded database of major hill tract hospitals for location services.
2.  **Low Bandwidth Optimization:**
    * Images sent to the AI are compressed client-side before upload, ensuring requests work even on slow 2G/3G networks.
3.  **Static Resource Caching:** Crucial data like the  "nearby hospitals" and "Disease Info" are structured to be cached locally.

---

### 🚀 How to Run the Project

1.  **Clone the repository.**
2.  **Setup Backend:**
    ```bash
    cd backend
    npm install
    # Create a .env file with GEMINI_API_KEY=your_key and FIREBASE_API_KEY=your_key
    node server.js
    ```
3.  **Setup Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
4.  Open `http://localhost:5173` in your browser.
