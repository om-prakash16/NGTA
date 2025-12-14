# 📈 NSE F&O Stock Analyzer

![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Stack](https://img.shields.io/badge/Tech-Next.js%20%7C%20FastAPI%20%7C%20Python-green.svg)
![License](https://img.shields.io/badge/License-MIT-orange.svg)

**A professional-grade real-time market analytics platform designed for the modern trader.**

The **NSE F&O Stock Analyzer** is a high-performance web application that processes live market data to identify high-probability trading setups. Unlike traditional brokers that list thousands of stocks, this system uses an **intelligent filtering engine** to isolate the few stocks that matter right now.

---

## 🚀 Why This Project Stands Out

In the fast-paced world of F&O (Futures & Options) trading, speed and clarity are everything. This project solves three critical problems:

1.  **Noise Reduction**: Instead of watching 200 stocks, the system highlights the top 5 "Moving" stocks using a proprietary **Strength Score**.
2.  **Context-Aware Analysis**: It doesn't just show "Price Change"; it correlates it with **RSI** and **MACD** to tell you if the move is genuine or a trap.
3.  **Instant Decision Making**: With the **"God Mode"** view, traders can see intraday, 1-day, and 3-day trends in a single glance.

---

## ⚡ Key Features

*   **📊 God Mode Dashboard**: A unified table view with multi-day performance metrics.
*   **🧠 Smart Strength Engine**: Automatically classifies stocks as **"Buyers Dominating"**, **"Sellers Dominating"**, or **"Neutral"**.
*   **🔍 Advanced Filtering**: Excel-style multi-column filtering (e.g., "Show me Auto Sector stocks with RSI < 30").
*   **📉 Real-Time Options Chain**: Live Call/Put data analysis.
*   **🌗 Dark/Light Theme**: Fully responsive UI built with **Tailwind CSS**.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **UI Library**: React 18
*   **Styling**: Tailwind CSS & Shadcn/UI
*   **State Management**: TanStack Query

### Backend
*   **API Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
*   **Data Processing**: Pandas & NumPy
*   **Market Data**: yFinance & SmartAPI Integration

---

## 🏁 Getting Started

### Prerequisites
*   Node.js (v18+)
# 📈 NSE F&O Stock Analyzer

![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Stack](https://img.shields.io/badge/Tech-Next.js%20%7C%20FastAPI%20%7C%20Python-green.svg)
![License](https://img.shields.io/badge/License-MIT-orange.svg)

**A professional-grade real-time market analytics platform designed for the modern trader.**

The **NSE F&O Stock Analyzer** is a high-performance web application that processes live market data to identify high-probability trading setups. Unlike traditional brokers that list thousands of stocks, this system uses an **intelligent filtering engine** to isolate the few stocks that matter right now.

---

## 🚀 Why This Project Stands Out

In the fast-paced world of F&O (Futures & Options) trading, speed and clarity are everything. This project solves three critical problems:

1.  **Noise Reduction**: Instead of watching 200 stocks, the system highlights the top 5 "Moving" stocks using a proprietary **Strength Score**.
2.  **Context-Aware Analysis**: It doesn't just show "Price Change"; it correlates it with **RSI** and **MACD** to tell you if the move is genuine or a trap.
3.  **Instant Decision Making**: With the **"God Mode"** view, traders can see intraday, 1-day, and 3-day trends in a single glance.

---

## ⚡ Key Features

*   **📊 God Mode Dashboard**: A unified table view with multi-day performance metrics.
*   **🧠 Smart Strength Engine**: Automatically classifies stocks as **"Buyers Dominating"**, **"Sellers Dominating"**, or **"Neutral"**.
*   **🔍 Advanced Filtering**: Excel-style multi-column filtering (e.g., "Show me Auto Sector stocks with RSI < 30").
*   **📉 Real-Time Options Chain**: Live Call/Put data analysis.
*   **🌗 Dark/Light Theme**: Fully responsive UI built with **Tailwind CSS**.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **UI Library**: React 18
*   **Styling**: Tailwind CSS & Shadcn/UI
*   **State Management**: TanStack Query

### Backend
*   **API Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
*   **Data Processing**: Pandas & NumPy
*   **Market Data**: yFinance & SmartAPI Integration

---

## 🏁 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)

### Installation

1.  **Clone the Repo**
    ```bash
    git clone https://github.com/om-prakash16/live.git
    cd live
    ```

2.  **Setup Backend**
    ```bash
    cd Backend
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    
    pip install -r requirements.txt
    python -m uvicorn app.main:app --reload
    ```

3.  **Setup Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Access the App**
    Open [http://localhost:3000](http://localhost:3000)

---

## 📸 Screenshots

*(See the `USER_GUIDE.md` for a detailed walkthrough with images)*

---

## 🤝 Contribution

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License.