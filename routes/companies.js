const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

// returns list of all companies
router.get('/', async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: results.rows });
  } catch (err) {
    return next(err);
  }
});

// returns info on specified company based on company code
router.get('/:code', async (req, res, next) => {
  try {
    const company_code = req.params.code;
    const result = await db.query(`SELECT * FROM companies WHERE code =$1`, [
      company_code
    ]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .send(new ExpressError('Cannot find specified company', 404));
    }
    const invoices = await db.query(
      `SELECT * FROM invoices WHERE comp_code=$1`,
      [company_code]
    );
    return res.json({ company: result.rows, invoices: invoices.rows });
  } catch (err) {
    return next(err);
  }
});

// Creates a new company
router.post('/', async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const result = await db.query(
      `INSERT INTO companies(code, name, description) VALUES($1,$2,$3) RETURNING code, name, description`,
      [code, name, description]
    );
    return res.json({ company: result.rows });
  } catch (err) {
    return next(err);
  }
});

// If company exists based on give company code, then update company with new json info
router.put('/:code', async (req, res, next) => {
  try {
    const company_code = req.params.code;
    const { name, description } = req.body;
    const result = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code =$3 RETURNING code, name, description`,
      [name, description, company_code]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .send(new ExpressError('Cannot find specified company', 404));
    }
    return res.json({ company: result.rows });
  } catch (err) {
    return next(err);
  }
});

// If comaony exists, delete company
router.delete('/:code', async (req, res, next) => {
  try {
    const company_code = req.params.code;
    const result = await db.query(
      `DELETE FROM companies WHERE code = $1 RETURNING code, name, description`,
      [company_code]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .send(new ExpressError('Cannot find specified company', 404));
    }
    return res.json({ status: 'deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
