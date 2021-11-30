const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

// Returns all invoices
router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices: [results.rows] });
  } catch (err) {
    return next(err);
  }
});

// Returns obj on given invoice.
router.get('/:id', async (req, res, next) => {
  try {
    const invoice_id = req.params.id;
    const invoices = await db.query(`SELECT * FROM invoices WHERE id=$1 `, [
      invoice_id
    ]);
    if (invoices.rows.length === 0) {
      return res
        .status(404)
        .send(new ExpressError('Cannot find specified invoice', 404));
    }
    found_comp = invoices.rows[0].comp_code;
    const company = await db.query(`SELECT * FROM companies WHERE code=$1`, [
      found_comp
    ]);

    return res.json({ invoice: invoices.rows, company: company.rows });
  } catch (err) {
    return next(err);
  }
});

//Adds an invoice.
router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      `INSERT INTO invoices(comp_code, amt) VALUES($1,$2) RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );
    return res.json({ invoice: result.rows });
  } catch (err) {
    return next(err);
  }
});

// modifies an invoice
router.put('/:id', async (req, res, next) => {
  try {
    const invoice_id = req.params.id;
    const { amt } = req.body;
    const result = await db.query(
      `UPDATE invoices SET amt=$1 WHERE id =$2 RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, invoice_id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .send(new ExpressError('Cannot find specified invoice', 404));
    }
    return res.json({ invoice: result.rows });
  } catch (err) {
    return next(err);
  }
});

//deletes an invoice
router.delete('/:id', async (req, res, next) => {
  try {
    const invoice_id = req.params.id;
    const result = await db.query(
      `DELETE FROM invoices WHERE id = $1 RETURNING id, comp_code, amt`,
      [invoice_id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .send(new ExpressError('Cannot find specified invoice', 404));
    }
    return res.json({ status: 'deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
