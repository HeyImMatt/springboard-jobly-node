const express = require('express');
const ExpressError = require('../helpers/expressError');
const Company = require('../models/company')
const Ajv = require('ajv');
const companySchema = require('../schemas/companySchema.json')

const router = new express.Router();

const ajv = new Ajv();

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
    const valid = ajv.validate(companySchema, req.body);
    if (!valid) {
      const listOfErrors = ajv.errors.map(error => error.message);
      throw new ExpressError(listOfErrors, 400);
    }
    if (Company.findOne(req.body.handle)) {
      throw new ExpressError('Company already exists', 400)
    }
    const company = await Company.create(req.body);
    return res.json({ company });
  } catch (e) {
    return next(e);
  }
})

module.exports = router;