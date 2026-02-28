# Bitespeed Identity Reconciliation API

## Overview

This project implements an **Identity Reconciliation API** that links customer contacts based on shared email addresses and phone numbers.

Customers may use different emails or phone numbers across purchases. This API identifies and consolidates all related contacts and returns a unified identity.

---

## Live API Endpoint

POST
https://bitespeed-identity-reconciliation-ri1b.onrender.com/identify

---

## Request Format

Content-Type: application/json

Example Request:

```json
{
  "email": "doc@example.com",
  "phoneNumber": "123456"
}
```

Both fields are optional, but at least one must be provided.

---

## Response Format

Example Response:

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": [
      "doc@example.com"
    ],
    "phoneNumbers": [
      "123456"
    ],
    "secondaryContactIds": []
  }
}
```

---

## How It Works

The API performs the following steps:

1. Checks if the email or phone number already exists in the database

2. If no contact exists:

   * Creates a new primary contact

3. If contact exists:

   * Finds the primary contact
   * Links new contact as secondary if needed
   * Consolidates all emails and phone numbers

4. Returns unified contact identity including:

   * primaryContactId
   * all emails
   * all phone numbers
   * secondaryContactIds

---

## Database Schema

Table: Contact

Columns:

* id (Primary Key)
* phoneNumber (VARCHAR)
* email (VARCHAR)
* linkedId (References Contact.id)
* linkPrecedence (primary / secondary)
* createdAt (Timestamp)
* updatedAt (Timestamp)
* deletedAt (Timestamp)

---

## Tech Stack

Backend:

* Node.js
* Express.js

Database:

* PostgreSQL (Neon)

Deployment:

* Render

Testing:

* Hoppscotch

Version Control:

* GitHub

---

## Project Structure

```
project/
│
├── server.js
├── package.json
└── README.md
```

---

## Installation (Local Setup)

1. Clone repository

```
git clone https://github.com/YOUR_USERNAME/bitespeed-identity-reconciliation.git
```

2. Install dependencies

```
npm install
```

3. Add database connection string

In server.js configure Neon PostgreSQL connection.

4. Run server

```
npm start
```

---

## API Testing

You can test the API using:

Hoppscotch
Postman
curl

Endpoint:

```
POST /identify
```

---

## Example Test Case

Request:

```json
{
  "email": "john@example.com",
  "phoneNumber": "999999"
}
```

Response:

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["john@example.com"],
    "phoneNumbers": ["999999"],
    "secondaryContactIds": []
  }
}
```

---

## Features

* Identity reconciliation
* Contact linking
* Primary-secondary relationship
* Duplicate prevention
* REST API
* Cloud deployment

---

## Author

Developed as part of Bitespeed Backend Task
