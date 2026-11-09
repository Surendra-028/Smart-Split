# Smart-Split AI 💸

> An intelligent full-stack financial platform designed to simplify shared-bill management by automating itemized expense distribution, tracking individual contributions, and providing transparent real-time settlement ledgers.

---
> **Live Demo Links:**
> * **Frontend:** [https://frontend-8pf9.onrender.com](https://frontend-8pf9.onrender.com)
> * **Backend API:** [https://smart-split-o5px.onrender.com](https://smart-split-o5px.onrender.com)

## 🚀 Features

* **GenAI-Powered Digitization:** Instantly scan and convert receipt images into structured expense data, eliminating manual entry.
* **Secure Authentication:** Built with robust security protocols using **BCrypt** for password hashing and **JSON Web Tokens (JWT)** for safe, authenticated user sessions.
* **Automated Notification Engine:** Integrated **Nodemailer** to enhance financial accountability through automated email payment reminders and transaction updates.
* **Scalable Group Architecture:** Architected isolated, multi-tenant group environments featuring granular transaction histories and real-time activity feeds for professional-grade accounting.

---

## 🛠️ Tech Stack

* **Frontend:** React.js
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Managed via MongoDB Atlas)
* **AI & Integrations:** GenAI API, Nodemailer
* **Security & Auth:** JWT, BCrypt
* **Version Control:** Git, GitHub

---

## 📁 Project Structure

```text
Smart-Split/
├── client/              # React frontend application
├── server/              # Node.js & Express backend API
│   ├── models/          # Mongoose database schemas
│   ├── routes/          # API endpoint controllers
│   ├── middleware/      # Auth & error-handling middleware
│   └── utils/           # Nodemailer & helper services
└── README.md
```

---

## ⚙️ Getting Started & Installation

Follow these steps to set up and run the project locally on your machine.

### Prerequisites

* Node.js and npm installed on your system.
* MongoDB Atlas account or local MongoDB instance.

### 1. Clone the Repository

```bash
git clone [https://github.com/Surendra-028/Smart-Split.git](https://github.com/Surendra-028/Smart-Split.git)
cd Smart-Split
```

### 2. Backend Setup

Navigate to the server directory, install dependencies, and configure your environment variables:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and add the following configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
GENAI_API_KEY=your_genai_api_key
```

Start the backend server:

```bash
npm start
```

### 3. Frontend Setup

Open a new terminal window, navigate to the client directory, and install dependencies:

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

Start the React development server:

```bash
npm start
```

---

## 💡 Usage

1. Register a new account or log in securely.
2. Create or join expense groups with friends or roommates.
3. Upload receipt images to let the GenAI engine automatically parse and split bills.
4. Track balances, settle dues, and trigger automated email reminders via Nodemailer.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Surendra-028/Smart-Split/issues).

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
