# 🌍 TripUp – Your Smart Travel Assistant

> 🚆 Plan smart. ✈️ Book easily. 📸 Share freely. All in one platform.

**TripUp** is a full-featured travel web app built using the MERN stack. It combines Train, Flight, and Bus Booking with a Smart Itinerary Planner and a Social Travel Diary — optimized for Indian users.

---

## 🚀 Key Features

### 🛫 1. Multi-Mode Booking (Train / Flight / Bus)

- Search available trains, flights, and buses using source, destination, and date.
- Shows only those trains that **pass through both cities** (validated via full route check).
- Filter options: time, type, price.
- Dummy seat booking and fare calculation.
- Booking summary with history.
- Station Finder: enter any city → see nearby **rail stations, bus stands, airports**.

### 📅 2. Smart Itinerary Planner

- Input destination, travel dates, and interests (e.g. nature, food, heritage).
- Generate a day-wise itinerary.
- Save, and revisit plans anytime.

### 🌍 3. Travel Diary (Social Feed)

- Post travel stories with title, location, image & travel date.
- View all public travel posts in global feed.
- Like, comment, bookmark posts.
- Rate locations (1–5 stars).
- Personal dashboard to manage your content.

### 🔐 4. Secure User System

- JWT-based authentication (signup/login).
- Profile Dashboard:
  - My Bookings
  - My Trips (Itineraries)
  - My Travel Posts

---

## 🛠️ Tech Stack

### 🖥️ Frontend

- **React.js** – SPA architecture
- **Vite** – Fast dev server and builds
- **Tailwind CSS** – Utility-first styling
- **React Router DOM** – Page routing
- **Axios** – API requests
- **React Icons** – UI icons
- **React Toastify** – Notifications
- **React DatePicker** – Calendar UI
- **Rect-Redux** – Handling State
- **Cloudinary** – Image upload

### 🧠 Backend

- **Node.js** – JavaScript runtime
- **Express.js** – Server + routing
- **MongoDB** with **Mongoose** – NoSQL DB
- **JWT** – Auth token management
- **bcrypt.js** – Password encryption
- **dotenv** – Manage secrets
- **Multer** + **Cloudinary SDK** – File upload system

### Admin setup

Set the following optional values in `Backend/.env` before starting the backend to securely bootstrap the first administrator. The account is only created when no account exists with that email.

```env
ADMIN_NAME=TripUp Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PHONE=+919876543210
ADMIN_PASSWORD=use-a-strong-password
```

Administrators sign in through `/admin/login`. Once signed in, use **Administrators** in the admin sidebar to create, activate, or deactivate other administrator accounts.

---

## 🌐 External APIs (Optional / Recommended)

| API Name          | Purpose                |
| ----------------- | ---------------------- |
| Google Gemini API | Plan                   |
| Cloudinary        | Store and serve images |

---

## 📁 Folder Structure(Example)

```
TrupUp/
├── client/ → React Frontend
│ ├── components/
│ ├── pages/
│ ├── utils/
│ └── App.jsx
│
├── server/ → Express Backend
│ ├── routes/
│ ├── controllers/
│ ├── models/
│ ├── data/
│ └── index.js
│
├── .env
└── README.md
```

---

## 💾 Dummy Datasets Used

### 1. `trains.json`

```
{
  "trainNumber": "11025",
  "trainName": "Pune-Amravati Express",
  "route": ["Pune", "Daund", "Ahmednagar", "Manmad", "Akola", "Amravati"],
  "departureTime": "10:00 AM",
  "arrivalTime": "10:30 PM",
  "days": ["Mon", "Wed", "Fri"]
}
```

### 2. `station.json`

```
{
  "city": "Pune",
  "stations": {
    "train": [{ "name": "Pune Junction", "code": "PUNE" }],
    "bus": [{ "name": "Swargate ST Stand" }],
    "airport": [{ "name": "Pune Airport", "code": "PNQ" }]
  }
}
```

### 3. `flight.json`

```
{
  "flightNumber": "AI850",
  "airline": "Air India",
  "from": "Pune",
  "to": "Delhi",
  "departureTime": "08:00 AM",
  "arrivalTime": "10:10 AM",
  "duration": "2h 10m",
  "days": ["Daily"],
  "price": 4200
}
```

### 4. `bus.json`

```
{
  "busNumber": "MH14-BUS3012",
  "operator": "MSRTC",
  "from": "Pune",
  "to": "Nashik",
  "departureTime": "02:00 PM",
  "arrivalTime": "07:30 PM",
  "duration": "5h 30m",
  "type": "AC Sleeper",
  "price": 650,
  "days": ["Mon", "Wed", "Sat"]
}
```

## 👨‍💻 Developer Info

- **👨‍💻 Name:** Yogesh Pote
- **🎓 Education:** B.Sc. Computer Science (Final Year, 2026)
- **💻 Tech Stack:** MERN, Java, DSA, C++, PHP, MySQL, T-SQL, OOPs
- **📫 Email:** [yogpote035@gmail.com](mailto:yogpote035@gmail.com)
- **📱 Contact:** +91 8999390368
- **🌐 Portfolio:** [https://yogpote035.github.io/Portfolio-Website/](https://yogpote035.github.io/Portfolio-Website/)
- **📂 GitHub:** [@yogpote035](https://github.com/yogpote035)
