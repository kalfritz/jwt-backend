const express = require('express');
const router = express.Router();
const Joi = require('joi');

const Note = require(`./models/Note.js`);
const schema = Joi.object().keys({
  title: Joi.string()
    .trim()
    .max(100)
    .required(),
  note: Joi.string()
    .trim()
    .required(),
});

router.get('/', (req, res, next) => {
  Note.find({
    user_id: req.user._id,
  })
    .then(notes => res.json(notes))
    .catch(next);
});

router.post('/', (req, res, next) => {
  const result = Joi.validate(req.body, schema);
  if (result.error === null) {
    const note = {
      ...req.body,
      user_id: req.user._id,
    };
    Note.create(note)
      .then(insertedNote => {
        res.json(insertedNote);
      })
      .catch(next);
  } else {
    res.status(422);
    next(result.error);
  }
});

module.exports = router;
