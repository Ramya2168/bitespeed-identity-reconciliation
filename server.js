const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());

/*
DATABASE CONNECTION
Render environment variable name = DATABASE_URL
*/
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

/*
ROOT ENDPOINT
*/
app.get("/", (req, res) => {
  res.send("Bitespeed Identity Reconciliation API is running");
});

/*
IDENTIFY ENDPOINT
*/
app.post("/identify", async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({
        error: "email or phoneNumber required",
      });
    }

    const existing = await pool.query(
      `
      SELECT * FROM Contact
      WHERE email = $1 OR phoneNumber = $2
      ORDER BY createdAt ASC
      `,
      [email, phoneNumber]
    );

    let primaryContact;

    if (existing.rows.length === 0) {
      const newContact = await pool.query(
        `
        INSERT INTO Contact (email, phoneNumber, linkPrecedence)
        VALUES ($1,$2,'primary')
        RETURNING *
        `,
        [email, phoneNumber]
      );

      primaryContact = newContact.rows[0];
    } else {
      primaryContact = existing.rows[0];
    }

    const linked = await pool.query(
      `
      SELECT * FROM Contact
      WHERE id = $1 OR linkedId = $1
      `,
      [primaryContact.id]
    );

    const emails = [...new Set(linked.rows.map(c => c.email).filter(Boolean))];
    const phones = [...new Set(linked.rows.map(c => c.phonenumber).filter(Boolean))];
    const secondaryIds = linked.rows
      .filter(c => c.linkprecedence === "secondary")
      .map(c => c.id);

    res.json({
      contact: {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers: phones,
        secondaryContactIds: secondaryIds,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Server error",
    });
  }
});

/*
USE RENDER PORT
*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
