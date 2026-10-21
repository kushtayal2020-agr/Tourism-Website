# ✈️ AZURA Tourism — Backend API & Database Service

The dedicated backend service and data persistence layer for the **AZURA Luxury Travel Platform**, powered by **Node.js**, **Express**, and **MySQL 8.0**.

---

## 🛠️ Stack & Architecture

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database Engine**: MySQL 8.0 with `InnoDB` storage engine
- **Connection Driver**: `mysql2/promise` with connection pooling
- **Security & Tokens**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs` for salted password hashing
- **Environment**: Configured via `dotenv`

---

## 🚀 Service Setup

### 1. Database Initialization
Ensure your local or cloud MySQL 8.0 instance is active:
```bash
# Import complete schema, triggers, routines, and seed catalog
mysql -u root -p < schema.sql
```

### 2. Environment Configuration
Create your `.env` file from the example:
```bash
cp .env.example .env
```
Populate your environment variables:
```ini
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=azura_tourism

PORT=5000
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Comma-separated list of elevated Administrator email addresses
ADMIN_EMAILS=kushtayal2020@gmail.com,admin@azura.com
```

### 3. Start the Server
```bash
# Install production & development dependencies
npm install

# Start in production mode
npm start

# Or run with live file-watcher for development
npm run dev
```

The service will start at **`http://localhost:5000`**.

---

## 📡 REST API Specification

### Authentication (`/api/auth`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new traveler profile | No |
| `POST` | `/api/auth/login` | Authenticate email & password; returns signed JWT | No |
| `GET` | `/api/auth/me` | Fetch active profile and account role | Yes (`Bearer`) |
| `PUT` | `/api/auth/profile` | Update user name and phone contact | Yes (`Bearer`) |
| `GET` | `/api/auth/users` | List all users and privilege roles | Yes (Admin) |

### Bookings (`/api/bookings`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Reserve a travel package; writes booking + payment transactionally | Yes (`Bearer`) |
| `GET` | `/api/bookings` | Retrieve booking records for the authenticated user | Yes (`Bearer`) |
| `GET` | `/api/bookings/admin/all`| Platform-wide booking ledger with customer and package details | Yes (Admin) |
| `PUT` | `/api/bookings/:id/cancel`| Mark reservation as cancelled; executes stored procedure `CancelBooking` | Yes (`Bearer`) |
| `GET` | `/api/bookings/summary` | Query aggregated booking analytics via database view `booking_summary` | Yes (Admin) |

### Destinations & Catalog (`/api/destinations`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/destinations` | List destinations with optional filters (`?search=`, `?country=`, `?rating=`) | No |
| `GET` | `/api/destinations/:id` | Detailed destination profile with packages, hotels, and reviews | No |
| `POST` | `/api/destinations` | Add new destination to the catalog | Yes (Admin) |
| `PUT` | `/api/destinations/:id` | Update destination overview, rating, or base price | Yes (Admin) |
| `DELETE` | `/api/destinations/:id` | Delete destination record | Yes (Admin) |

### Hotels & Accommodations (`/api/hotels`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/hotels` | List all destination-linked hotels | No |
| `GET` | `/api/hotels/:id` | Fetch hotel profile with amenities and room inventory | No |
| `GET` | `/api/hotels/:id/rooms` | Retrieve available room types for a hotel | No |

### Packages & Tours (`/api/packages`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/packages` | List travel packages with style & price filters | No |
| `GET` | `/api/packages/:id` | Fetch specific tour itinerary and inclusions | No |
| `POST` | `/api/packages` | Create a new tour package | Yes (Admin) |

### Experiences (`/api/experiences`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/experiences` | List excursions by category (Culture, Nature, Adventure) | No |
| `GET` | `/api/experiences/:id` | Fetch activity details, duration, and price | No |

### Reviews (`/api/reviews`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reviews` | List verified customer reviews | No |
| `POST` | `/api/reviews` | Post a verified review for a destination (rating 1–5) | Yes (`Bearer`) |

### System & Telemetry (`/api/stats`, `/api/health`, `/api/audit-logs`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck returning DB connection and uptime status | No |
| `GET` | `/api/stats` | Aggregated metrics (total travelers, revenue, active bookings) | No |
| `GET` | `/api/audit-logs` | Live changelog feed populated by MySQL audit triggers | Yes (Admin) |

---

## 🔒 Security Best Practices
- **Prepared Statements**: Parameterized queries via `mysql2` prevent SQL injection attacks.
- **Salted Password Hashing**: Passwords are never saved in plaintext; hashed using `bcryptjs` with 10 salt rounds.
- **Role Verification**: Middleware validates claims inside signed JWT payloads before executing privileged routes.
- **Environment Isolation**: Database credentials and secrets are kept strictly out of version control.
