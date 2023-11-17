const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("pg");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const client = new Client({
  connectionString: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@db:5432/${process.env.POSTGRES_DB}`,
});

// Connect to the PostgreSQL database
client.connect();

// Simple query example
const queryText = 'SELECT NOW() as current_time';

function escapeHtml(unsafe)
{
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

app.get("/", async (req, res) => {
  let items;
  try {
    const { rows } = await client.query(`SELECT * FROM message`);
    items = rows;
  } catch {
    items = [];
  }

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <form method="POST" action="/send">
    <input type="text" name="message" />
    <button>Skicka</button>
  </form>
  <ul>
${items.map(({ value }) => `<li>${escapeHtml(value)}</li>`).join("\n")}
  </ul>
</body>
</html>
  `.trim());
});

app.post("/send", async (req, res) => {
  try {
    await client.query(`INSERT INTO message (value) VALUES ($1)`, [req.body.message]);
  } catch {}
  res.redirect("/");
});

app.listen(3000);
