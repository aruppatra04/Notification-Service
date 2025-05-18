# Notification Service

A Node.js microservice for queuing and processing notifications (email, SMS, in-app) using RabbitMQ and MongoDB.

---

## Features

- Queue notifications via REST API.
- Batch or single notification support.
- Priority & category determined by message content.
- RabbitMQ for async messaging.
- MongoDB for persistent storage.
- Extensible: Add new notification types easily.

---

## API Endpoints : 
1. **user/resgister** : Register a new user.
2. **user/:username** : Get user profile info by username.
3. **user/:username/notifications** : Retrieve all notifications for a given user.
4. **/notifications** : Queue one or more notifications for processing (single or batch).

---
## Setup Instructions (Without Docker)

### 1. Prerequisites

Install and run the following:

- **MongoDB**
  - [Download MongoDB](https://www.mongodb.com/try/download/community)
  - [Installation Docs](https://www.mongodb.com/docs/manual/installation/)

- **RabbitMQ**
  - [Download RabbitMQ](https://www.rabbitmq.com/download.html)
    
---

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/notification-service.git
cd notification-service
```
---

### 3. Install Dependencies

```bash
npm install
```
---

### 4. Setup Environment Variables

Create a `.env` file in the root with the following:

```env
# MongoDB connection string (required)
CONNECTION_STRING=mongodb://localhost:27812/Notification-Service 

# RabbitMQ connection string (required)
RABBITMQ_URL=amqp://localhost

# Application port (optional)
PORT=4001
```

### 5. Start the Server

#### Development mode (auto-restarts with nodemon)

```bash
npm run dev
```
#### Production mode

```bash
node index.js
```
---

### 6. Start the Consumer Worker

In a separate terminal:

#### Development mode (auto-restarts with nodemon)

```bash
npm run rabbitmq
```
#### Production mode

```bash
node worker/consumer.js
```
---

## API Endpoint

###  **POST `/notification`**

Queue one or more notifications.

#### Single Notification Example:

```json
{
  "username": "arup04",
  "type": "email",
  "message": "Your OTP is 123456"
}
```

#### Batch Notification Example:

```json
[
  { "username": "arup04", "type": "in-app", "message": "You got a like!" },
  { "username": "arup04", "type": "sms", "message": "Your balance is low." }
]
```

#### Response:

```json
{
  "message": "Notifications processed",
  "results": [
    {
      "success": true,
      "queue": "notification_in-app",
      "username": "arup04",
      "type": "in-app"
    },
    {
      "success": true,
      "queue": "notification_sms",
      "username": "arup04",
      "type": "sms"
    }
  ]
}
```

#### Notes:

* `type` must be one of: `email`, `sms`, `in-app`
* Each notification must include: `username`, `type`, `message`

---

## Priority Rules

Notification priority is auto-detected based on keywords in the message:

| Keyword(s)               | Priority | Level  |
| ------------------------ | -------- | ------ |
| `otp`, `verify`, `code`  | 1        | High   |
| `payment`, `bill`, `txn` | 2        | Medium |
| Anything else            | 3        | Low    |

---

## .env Example

```
# MongoDB
CONNECTION_STRING=mongodb://localhost:27017/notificationdb

# RabbitMQ
RABBITMQ_URL=amqp://localhost

# Optional server port
PORT=4001
```

---

## Project Structure

```
├── config/
│   └── dbconnection.js
├── controller/
│   ├── notificationController.js
│   └── userController.js
├── middleware/
│   └── errorHandler.js
├── routes/
│   ├── notificationRoutes.js
│   └── userRoutes.js
├── schema/
│   ├── notificationSchema.js
│   └── userSchema.js
├── utils/
│   └── rabbitmq.js
├── worker/
│   └── consumer.js
├── .gitignore
├── constants.js
├── index.js
├── package-lock.json
├── package.json
└── README.md
```

---

## Troubleshooting

* Ensure MongoDB and RabbitMQ are running before starting the app.
* Double-check your `.env` file values.
* Use tools like Postman or curl to test the API.
* Watch terminal logs for any errors.
