const { compareSync } = require('bcrypt');
const express = require('express');
const ExpressError = require('../helpers/expressError');

const router = new express.Router();

router.get('/', async (req, res, next) => {
  try {
    const companies = await Company.findAll(req.query);
    return res.json({ companies });
  } catch (e) {
    return next(e);
  }
})