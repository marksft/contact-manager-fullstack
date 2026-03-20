const db = require("./db");
const express = require("express");
const cors = require("cors");

const app = express();

const Joi = require("joi");

const contactSchema = Joi.object({
  name: Joi.string().min(3).required(),
  phone: Joi.string()
  .pattern(/^[0-9+\-\s()]+$/)
  .min(8)
  .required()
  .messages({
    "string.pattern.base": "Telefone inválido",
  }),
  email: Joi.string().email().allow(""),
  notes: Joi.string().allow(""),
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Contact Agenda API running");
});

// 🔹 GET ALL
app.get("/contacts", (req, res) => {
  db.all("SELECT * FROM contacts", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// 🔹 CREATE
app.post("/contacts", (req, res) => {
  const { name, phone, email, notes } = req.body;

  const { error } = contactSchema.validate(req.body);

if (error) {
  return res.status(400).json({ error: error.details[0].message });
}

  const sql = `
    INSERT INTO contacts (name, phone, email, notes)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [name, phone, email, notes], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      id: this.lastID,
      name,
      phone,
      email,
      notes,
    });
  });
});

// 🔹 UPDATE (CORRIGIDO)
app.put("/contacts/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, phone, email, notes } = req.body;

const { error } = contactSchema.validate(req.body);

if (error) {
  return res.status(400).json({ error: error.details[0].message });
}

  const sql = `
    UPDATE contacts
    SET name = ?, phone = ?, email = ?, notes = ?
    WHERE id = ?
  `;

  db.run(sql, [name, phone, email, notes, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({
      id,
      name,
      phone,
      email,
      notes,
    });
  });
});

// 🔹 DELETE (NOVO CORRETO)
app.delete("/contacts/:id", (req, res) => {
  const id = Number(req.params.id);

  db.run("DELETE FROM contacts WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ message: "Deleted successfully" });
  });
});

// 🔹 START SERVER
app.listen(3001, () => {
  console.log("Server running on port 3001");
});