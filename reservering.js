// Bestand: netlify/functions/reservering.js
// Zorg dat je 'pg' installeert: npm install pg

const { Client } = require("pg");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Ongeldige data" }) };
  }

  const { voornaam, achternaam, email, kamer, datum, tijdslot, spelers } = data;

  if (!voornaam || !achternaam || !email || !kamer || !datum || !tijdslot || !spelers) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Alle velden zijn verplicht" }),
    };
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    await client.query(
      `INSERT INTO reserveringen (voornaam, achternaam, email, kamer, datum, tijdslot, spelers)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [voornaam, achternaam, email, kamer, datum, tijdslot, spelers]
    );
    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, bericht: "Reservering opgeslagen!" }),
    };
  } catch (err) {
    console.error("Database fout:", err);
    await client.end();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Er ging iets mis met de database" }),
    };
  }
};
