const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// Replace with your Neon connection string
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_oA1JpiysN4MV@ep-sweet-cake-a12b2r6b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false,
  },
});

// Identify endpoint
app.post("/identify", async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({ error: "Email or phoneNumber required" });
    }

    // Find existing contacts
    const result = await pool.query(
      `SELECT * FROM Contact 
       WHERE email = $1 OR phoneNumber = $2
       ORDER BY createdAt ASC`,
      [email, phoneNumber]
    );

    let contacts = result.rows;

    let primaryContact;

    if (contacts.length === 0) {
      // Create new primary contact
      const insert = await pool.query(
        `INSERT INTO Contact (email, phoneNumber, linkPrecedence)
         VALUES ($1, $2, 'primary')
         RETURNING *`,
        [email, phoneNumber]
      );

      primaryContact = insert.rows[0];
      contacts = [primaryContact];
    } else {
      primaryContact =
        contacts.find((c) => c.linkprecedence === "primary") || contacts[0];

      // Check if new info provided
      const exists = contacts.some(
        (c) => c.email === email && c.phonenumber === phoneNumber
      );

      if (!exists) {
        const secondary = await pool.query(
          `INSERT INTO Contact (email, phoneNumber, linkedId, linkPrecedence)
           VALUES ($1, $2, $3, 'secondary')
           RETURNING *`,
          [email, phoneNumber, primaryContact.id]
        );

        contacts.push(secondary.rows[0]);
      }
    }

    // Collect response data
    const primaryId = primaryContact.id;

    const allContacts = await pool.query(
      `SELECT * FROM Contact
       WHERE id = $1 OR linkedId = $1`,
      [primaryId]
    );

    const emails = [...new Set(allContacts.rows.map((c) => c.email).filter(Boolean))];
    const phoneNumbers = [
      ...new Set(allContacts.rows.map((c) => c.phonenumber).filter(Boolean)),
    ];
    const secondaryContactIds = allContacts.rows
      .filter((c) => c.linkprecedence === "secondary")
      .map((c) => c.id);

    res.json({
      contact: {
        primaryContactId: primaryId,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
