# Database & Workflow Mapping Guide

Use this guide during your project review to show the panel exactly how user interactions on the UI trigger APIs and write/modify data in the Oracle and MongoDB databases.

---

## Workflow 1: User Registration & Authentication

### 1. Workflow Description
* **Customer / Admin Registration**: User inputs details. Saved with `verified = true` (Active).
* **Provider Registration**: Inputs details + uploads docs (Aadhaar, DL, Bank details). Saved with `verified = false` (Pending).
* **Password Security**: Spring Boot uses `BCryptPasswordEncoder` to hash passwords before storing them.
* **Token Management**: On registration/login, Spring generates an Access JWT Token and a Refresh Token (Refresh token is hashed and saved to database).

### 2. API Endpoints Called
* **Register**: `POST /api/auth/register` (Payload: JSON body with signup details).
* **Login**: `POST /api/auth/login` (Returns JWT token in response).

### 3. Database Storage (Oracle)
* **Table**: `HS_USERS`
* **Commands to show reviewers**:
  * Check user registration, password hashes, and verification status:
    ```sql
    SELECT id, name, email, role, verified, password FROM HS_USERS WHERE email = 'provider@handyserve.com';
    ```
  * Note how the password column contains a BCrypt hash starting with `$2a$` (e.g. `$2a$10$Uo2g...`), proving password encryption works.
  * Check stored refresh token hashes used for security sessions:
    ```sql
    SELECT name, refresh_token FROM HS_USERS WHERE email = 'provider@handyserve.com';
    ```

---

## Workflow 2: Provider Verification & Document Upload

### 1. Workflow Description
* During signup, the provider uploads Aadhaar, Driving License, and Bank Passbook files.
* Files are converted to Base64 data URLs in the browser and stored in Oracle Database as Large Object (`LOB`) columns.
* **Approval**: Admin clicks "Approve & Verify Account" which updates verification to true.
* **Rejection / Termination**: Admin clicks "Reject & Decline" which runs a deletion query on the DB to terminate the user account.

### 2. API Endpoints Called
* **Verification (PATCH)**: `PATCH /api/providers/{id}/verify?verified=true` (Approve) or `PATCH /api/providers/{id}/verify?verified=false` (Reject).

### 3. Database Storage (Oracle)
* **Table**: `HS_USERS`
* **Columns**: `AADHAAR_DOC`, `DRIVING_LICENSE_DOC`, `BANK_PASSBOOK_DOC` (All stored as CLOB/LOB).
* **Commands to show reviewers**:
  * Inspect the uploaded document size and details:
    ```sql
    SELECT name, verified, aadhaar_number, dbms_lob.getlength(aadhaar_doc) AS aadhaar_doc_chars 
    FROM HS_USERS 
    WHERE email = 'provider@handyserve.com';
    ```
  * Search for unverified/pending accounts under review:
    ```sql
    SELECT id, name, email, verified FROM HS_USERS WHERE role = 'provider' AND verified = 0;
    ```
  * Show that after clicking **Reject**, the account is terminated and no longer exists:
    ```sql
    SELECT * FROM HS_USERS WHERE email = 'provider@handyserve.com'; -- Returns 0 rows
    ```

---

## Workflow 3: Service Bookings Lifecycle

### 1. Workflow Description
* Customer finds a provider and creates a booking request.
* Booking lifecycle status transitions: `Requested` ➔ `Accepted` ➔ `On_the_Way` ➔ `Destination` ➔ `Reached` ➔ `Reached_Confirmed` ➔ `Pending_Payment` ➔ `Completed`.

### 2. API Endpoints Called
* **Create Booking**: `POST /api/bookings`
* **Update Booking Status**: `PATCH /api/bookings/{id}/status?status={NEW_STATUS}`

### 3. Database Storage (Oracle)
* **Table**: `HS_BOOKINGS`
* **Commands to show reviewers**:
  * Query all active bookings and status transitions:
    ```sql
    SELECT id, customer_name, provider_name, service, amount, status, booking_date 
    FROM HS_BOOKINGS 
    ORDER BY created_at DESC;
    ```
  * Filter bookings for a specific customer or provider:
    ```sql
    SELECT id, service, status, amount FROM HS_BOOKINGS WHERE customer_id = 1;
    ```

---

## Workflow 4: Real-time Chat Messaging

### 1. Workflow Description
* Customer and provider exchange messages in the chat sidebar drawer.
* Messages are delivered instantly using WebSockets.
* For durability and scalability, history is persisted as documents in MongoDB.

### 2. API Endpoints / Sockets Called
* **WebSocket Port**: `ws://localhost:8081/ws?token={JWT_TOKEN}`
* **Send Message**: `POST /api/bookings/{id}/chat`

### 3. Database Storage (MongoDB)
* **Collection**: `HS_CHAT_MESSAGES` (or named `chatMessage`)
* **Commands to show reviewers**:
  * Connect to Mongo shell (`mongosh`) or MongoDB Compass and run:
    ```javascript
    use handyserve;
    db.chatMessage.find().pretty();
    ```
  * Query chat messages for a specific booking ID:
    ```javascript
    db.chatMessage.find({ bookingId: 1 }).sort({ timestamp: 1 }).pretty();
    ```

---

## Workflow 5: Dispute Ticket Management

### 1. Workflow Description
* Customer/Provider raises a dispute (support ticket) regarding a booking.
* Admin resolves or rejects disputes from the administrative workspace.

### 2. API Endpoints Called
* **Create Dispute**: `POST /api/disputes`
* **Resolve/Update Dispute**: `PATCH /api/disputes/{id}/status?status={RESOLVED/REJECTED}`

### 3. Database Storage (MongoDB)
* **Collection**: `HS_DISPUTES` (or named `dispute`)
* **Commands to show reviewers**:
  * Query all tickets logged by users:
    ```javascript
    db.dispute.find().pretty();
    ```
  * Filter disputes by priority (e.g., High) or category:
    ```javascript
    db.dispute.find({ priority: "high" }).pretty();
    ```

---

## Workflow 6: Off-Day (Leave Request) Calendar

### 1. Workflow Description
* Provider requests a leaf slot (e.g. date + specific hours) to temporarily block customer bookings.
* Admin approves/rejects the request. If approved, the slot blocks discover queries on those timings.

### 2. API Endpoints Called
* **Request Off-Day**: `POST /api/leave`
* **Approve/Reject (PATCH)**: `PATCH /api/leave/{id}/status?status={approved/rejected}`

### 3. Database Storage (Oracle)
* **Table**: `HS_LEAVE_REQUESTS`
* **Commands to show reviewers**:
  * Query all submitted off-day requests:
    ```sql
    SELECT id, provider_id, leave_date, status, reason FROM HS_LEAVE_REQUESTS;
    ```
