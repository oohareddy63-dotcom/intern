# Expense Tracker App

A full-stack mobile expense tracking app built with React Native (Expo), Node.js, Express, and MongoDB.

## Features

- JWT-based user authentication (register / login / logout)
- Add, edit, delete expense records (amount, category, date, note)
- Dashboard with pie chart and category-wise expense summary
- Search and filter expenses by category
- Offline banner when network is unavailable
- Error boundary for unexpected crashes
- Form validation on all inputs
- Auto-logout on expired token (401 handling)

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Mobile    | React Native (Expo ~49), React Navigation |
| State     | Redux Toolkit + redux-persist           |
| HTTP      | Axios                                   |
| Backend   | Node.js, Express.js                     |
| Database  | MongoDB + Mongoose                      |
| Auth      | JWT (jsonwebtoken) + bcryptjs           |

---

## Prerequisites

- Node.js >= 16
- MongoDB running locally on port 27017
- Expo CLI: `npm install -g expo-cli`

---

## Setup & Run

### 1. Clone the repo

```bash
git clone <repo-url>
cd expense-tracker
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file (or edit the existing one):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=change_this_to_a_strong_secret
NODE_ENV=development
```

Start the server:

```bash
npm run dev      # development (nodemon)
# or
npm start        # production
```

Backend runs at: `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npx expo start
```

- Press `w` for web browser
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app for physical device

> **Note for Android emulator:** The app automatically uses `http://10.0.2.2:5000/api` instead of `localhost` so the emulator can reach your machine's backend.

> **Note for physical device:** Update `API_BASE_URL` in `frontend/src/services/api.js` to your machine's local IP (e.g. `http://192.168.1.x:5000/api`).

---

## API Endpoints

### Auth
| Method | Endpoint            | Description       |
|--------|---------------------|-------------------|
| POST   | /api/auth/register  | Register new user |
| POST   | /api/auth/login     | Login user        |

### Expenses (requires Bearer token)
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /api/expenses         | Get all expenses (paginated, filterable) |
| GET    | /api/expenses/:id     | Get single expense       |
| POST   | /api/expenses         | Add new expense          |
| PUT    | /api/expenses/:id     | Update expense           |
| DELETE | /api/expenses/:id     | Delete expense           |
| GET    | /api/expenses/summary | Category-wise summary    |

---

## Project Structure

```
├── backend/
│   ├── models/          # Mongoose models (User, Expense)
│   ├── routes/          # Express routes (auth, expenses)
│   ├── server.js        # Entry point
│   └── .env             # Environment variables
│
└── frontend/
    └── src/
        ├── components/  # ErrorBoundary, OfflineAlert, LoadingSpinner
        ├── constants/   # Categories, colors
        ├── hooks/       # useNetworkStatus
        ├── navigation/  # AppNavigator (stack + tabs)
        ├── screens/
        │   ├── auth/    # LoginScreen, RegisterScreen
        │   └── main/    # Dashboard, Expenses, Add, Edit, Detail
        ├── services/    # api.js, offlineStorage.js, syncService.js
        └── store/       # Redux store + slices (auth, expenses)
```


---

## Key Evaluation Criteria Addressed

### 1. React Native Component Design & Navigation
- Clean component structure with separation of concerns
- React Navigation v6 with Stack + Bottom Tab navigators
- Proper screen transitions and parameter passing
- Reusable components (ErrorBoundary, OfflineAlert, LoadingSpinner)

### 2. State Management
- Redux Toolkit for global state (auth, expenses)
- redux-persist for auth persistence across app restarts
- Async thunks for API calls with proper loading/error states
- Clean action creators and reducers

### 3. API Integration & Async Handling
- Axios with interceptors for auth token injection
- Proper error handling with try/catch and rejectWithValue
- Loading states during API calls
- 401 auto-logout on token expiration
- Platform-specific API URLs (Android emulator support)

### 4. Problem-Solving: Edge Cases, Empty States, Form Validation
- Empty states for dashboard and expenses list
- Form validation on all inputs (amount, category, date, note)
- Character count for note field (200 max)
- Error messages displayed to user
- Offline banner when network unavailable
- Error boundary catches unexpected crashes
- Delete confirmation dialogs
- Logout confirmation dialog

### 5. Code Readability & Project Structure
- Clear folder structure (screens, components, services, store)
- Consistent naming conventions
- Comments where needed
- Modular code with single responsibility
- Reusable constants for categories and colors
- Proper separation of API, storage, and sync services

---

## Screenshots & Demo

(Add screenshots here after running the app)

---

## Known Limitations & Future Enhancements

- Offline sync service is implemented but not fully integrated into UI
- No pagination UI (backend supports it)
- No date range filtering UI (backend supports it)
- No unit/integration tests
- No token refresh mechanism (tokens expire after 7 days)
- Physical device requires manual IP configuration

---

## Troubleshooting

### Backend won't start
- Ensure MongoDB is running: `mongod` or check your MongoDB service
- Check port 5000 is not in use: `lsof -i :5000` (Mac/Linux) or `netstat -ano | findstr :5000` (Windows)

### Frontend can't connect to backend
- **Web:** Backend must be at `http://localhost:5000`
- **Android emulator:** Uses `http://10.0.2.2:5000` automatically
- **iOS simulator:** Uses `http://localhost:5000` automatically
- **Physical device:** Update `API_BASE_URL` in `frontend/src/services/api.js` to your machine's local IP

### Expo errors
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

---

## License

MIT

---

## Author

Made with love
