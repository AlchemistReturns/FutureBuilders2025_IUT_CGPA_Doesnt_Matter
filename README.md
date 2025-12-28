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

### 3. Solution Overview
**Rural Health AI** is a hybrid, bilingual web application designed to act as a "First-Aid Assistant" for remote communities. It empowers local rural dispensers and individuals to get instant medical advice, even with poor connectivity.

**Key Features Implemented:**
* **🤖 AI Doctor (Symptom Scanner):** Users can describe symptoms (text) or upload images of visible conditions (cuts, rashes). The system provides immediate first-aid advice in 
* **📚 Medical Encyclopedia:** A searchable knowledge base of common diseases (Malaria, Dengue, Snakebite) featuring bilingual descriptions and images sourced from Wikipedia.
* **📢 Digital Notice Board:** A dedicated tab for critical health updates (Vaccination drives, Cold wave alerts, Free eye camps), ensuring villagers stay informed about community health events.

---

### 4. Technologies Used
**Frontend:**
* **React.js (Vite):** Fast, modern UI framework.
* **Tailwind CSS:** For responsive, mobile-first styling.
* **Lucide React:** Lightweight iconography.


**Backend:**
* **Node.js & Express.js:** RESTful API server.
* **Multer:** Handling image uploads for the AI scanner.

**AI & Cloud Services:**
* **Google Gemini 1.5 Flash:** The core intelligence engine for symptom analysis and medical advice.
* **Firebase Authentication:** Secure user login and management.
* **Wikipedia Summary API:** Fetching real-time disease information.

---

### 5. AI Tools Disclosure (MANDATORY)
* **Core Logic:** We utilize **Google Gemini 2.5 Flash** API for generating medical advice and analyzing symptom images.
* **Development Assistance:** Large Language Models (Gemini/ChatGPT) were used for code debugging, refactoring, and generating boilerplate configurations.

---

### 6. Handling Limited Internet Access
Our solution is explicitly designed for the "Hill Tracts" scenario where internet is unstable:

1.  **Hybrid Architecture (Online/Offline Mode):**
    * **Online:** When connectivity is available, the app uses the full power of Gemini 1.5 Flash for deep analysis and fetches live Wikipedia data.
    * **Offline Fallback:** If the internet fails, the app automatically switches to **Local Mode**. It uses a lightweight, hardcoded medical dataset (`offlineData.ts`) to recognize keywords (e.g., "cut", "snake", "fever") and provide immediate, pre-saved emergency advice without needing a server connection.
2.  **Low Bandwidth Optimization:**
    * Images sent to the AI are compressed on the client-side using `browser-image-compression` before upload, ensuring requests work even on slow 2G/3G networks.
3.  **Static Resource Caching:** Crucial data like the "Notice Board" and core "Disease Info" are structured to be cached locally, allowing the app to remain functional during temporary outages.

---
