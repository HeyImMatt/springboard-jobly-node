const express = require('express');
const ExpressError = require('../helpers/expressError');
const Job = require('../models/job')
const Ajv = require('ajv');
const jobSchema = require('../schemas/jobSchema.json')

const router = new express.Router();

const ajv = new Ajv();

router.get('/', async (req, res, next) => {
  try {
    const jobs = await Job.findAll(req.query);
    return res.json({ jobs });
  } catch (e) {
    return next(e);
  }
})

router.post('/', async (req, res, next) => {
  try {
    const valid = ajv.validate(jobSchema, req.body);
    if (!valid) {
      const listOfErrors = ajv.errors.map(error => error.message);
      throw new ExpressError(listOfErrors, 400);
    }
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (e) {
    return next(e);
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const job = await Job.findOne(req.params.id);
    return res.json({ job });
  } catch (e) {
    return next(e);
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const valid = ajv.validate(jobSchema, req.body);
    if (!valid) {
      const listOfErrors = ajv.errors.map(error => error.message);
      throw new ExpressError(listOfErrors, 400);
    }
    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (e) {
    return next(e);
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await Job.remove(req.params.id);
    return res.json({ message: 'Job deleted' });
  } catch (e) {
    return next(e);
  }
})

module.exports = router;