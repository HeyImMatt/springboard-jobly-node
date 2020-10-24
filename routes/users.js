const express = require('express');
const ExpressError = require('../helpers/expressError');
const User = require('../models/user')
const Ajv = require('ajv');
const { ensureCorrectUser, authRequired } = require('../middleware/auth');
const createToken = require('../helpers/createToken');
const userNewSchema = require('../schemas/userNewSchema.json')
const userUpdateSchema = require('../schemas/userUpdateSchema.json')

const router = new express.Router();

const ajv = new Ajv();

router.get('/', authRequired, async (req, res, next) => {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

router.get('/:username', authRequired, async (req, res, next) => {
  try {
    const user = await User.findOne(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const valid = ajv.validate(userNewSchema, req.body);
    if (!valid) {
      const listOfErrors = ajv.errors.map(error => error.message);
      throw new ExpressError(listOfErrors, 400);
    }
    const newUser = await User.register(req.body);
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

router.patch('/:username', ensureCorrectUser, async (req, res, next) => {
  try {
    if ('username' in req.body || 'is_admin' in req.body) {
        throw new ExpressError(
          'You are not allowed to change username or is_admin properties.',
          400);
    }

    const valid = ajv.validate(userUpdateSchema, req.body);
    if (!valid) {
      const listOfErrors = ajv.errors.map(error => error.message);
      throw new ExpressError(listOfErrors, 400);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:username', ensureCorrectUser, async (req, res, next) => {
  try {
    await User.remove(req.params.username);
    return res.json({ message: 'User deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
