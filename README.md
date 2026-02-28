# Bitespeed Identity Reconciliation API

## Hosted Endpoint

POST  
https://bitespeed-api-2ovf.onrender.com/identify

---

## Overview

This project implements an Identity Reconciliation API that links customer contacts based on shared email addresses and phone numbers.

Customers may use different emails or phone numbers across purchases. This API identifies related contacts and returns a unified identity with primary and secondary contact relationships.

---

## Request Format

Content-Type: application/json

Example request:

```json
{
  "email": "doc@example.com",
  "phoneNumber": "123456"
}
