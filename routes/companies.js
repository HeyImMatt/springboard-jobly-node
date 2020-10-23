const { compareSync } = require('bcrypt');
const express = require('express');
const ExpressError = require('../helpers/expressError');
const Company = require('../models/company')

const router = new express.Router();

router.get('/', async (req, res, next) => {
  try {
    const companies = await Company.findAll(req.query);
    return res.json({ companies });
  } catch (e) {
    return next(e);
  }
})

router.post('/', async (req, res, next) => {
  try {
    if (Company.findOne(req.body.name)) {
      throw new ExpressError('Company already exists', 400)
    }
    const company = await Company.create(req.body);
    return res.json({ company });
  } catch (e) {
    return next(e);
  }
})

module.exports = router;