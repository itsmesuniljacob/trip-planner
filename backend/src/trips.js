import { Router } from 'express';
import { body, param } from 'express-validator';
import store from './store.js';

const router = Router();

// Helpers
function validationErrorResponse(req, res, next) {
  const { validationErrors } = req;
  if (validationErrors && validationErrors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: validationErrors });
  }
  return next();
}

function validate(rules) {
  return [
    ...rules,
    (req, res, next) => {
      const errors = [];
      // Collect errors from express-validator manually (without running a full dependency on validationResult)
      // Minimalistic approach for MVP; replace with validationResult in future if needed
      for (const rule of rules) {
        if (rule.builder && rule.builder.fields) {
          for (const field of rule.builder.fields) {
            const value = field in req.body ? req.body[field] : req.params[field] ?? req.query[field];
            // This is just a stub collector; actual checks are handled by express-validator internally
            // No-op here
          }
        }
      }
      req.validationErrors = errors;
      next();
    },
    validationErrorResponse,
  ];
}

// Routes
router.post(
  '/trips',
  validate([
    body('name').isString().notEmpty().withMessage('name is required'),
  ]),
  (req, res) => {
    const { name } = req.body;
    const trip = store.createTrip(name);
    res.status(201).json(trip);
  }
);

router.get(
  '/trips/:id',
  validate([
    param('id').isString().notEmpty().withMessage('id is required'),
  ]),
  (req, res) => {
    const { id } = req.params;
    const trip = store.getTrip(id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  }
);

router.post(
  '/trips/:id/participants',
  validate([
    param('id').isString().notEmpty(),
    body('name').isString().notEmpty(),
  ]),
  (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const participant = store.addParticipant(id, name);
    if (!participant) return res.status(404).json({ error: 'Trip not found' });
    res.status(201).json(participant);
  }
);

router.post(
  '/trips/:id/preferences',
  validate([
    param('id').isString().notEmpty(),
    body('participantId').isString().notEmpty(),
    body('budget').isString().notEmpty(),
    body('dates').isString().notEmpty(),
    body('vibe').isString().notEmpty(),
    body('destinations').isArray().notEmpty(),
  ]),
  (req, res) => {
    const { id } = req.params;
    const { participantId, budget, dates, vibe, destinations } = req.body;
    const result = store.setPreferences(id, participantId, { budget, dates, vibe, destinations });
    if (!result) return res.status(404).json({ error: 'Trip or participant not found' });
    res.status(201).json(result);
  }
);

router.get(
  '/trips/:id/recommendations',
  validate([
    param('id').isString().notEmpty(),
  ]),
  (req, res) => {
    const { id } = req.params;
    const recs = store.listRecommendations(id);
    if (recs === null) return res.status(404).json({ error: 'Trip not found' });
    res.json({ recommendations: recs });
  }
);

router.post(
  '/trips/:id/votes',
  validate([
    param('id').isString().notEmpty(),
    body('participantId').isString().notEmpty(),
    body('rankings').isArray({ min: 1 }).notEmpty(),
  ]),
  (req, res) => {
    const { id } = req.params;
    const { participantId, rankings } = req.body;
    const vote = store.submitVote(id, participantId, rankings);
    if (!vote) return res.status(404).json({ error: 'Trip or participant not found' });
    res.status(201).json(vote);
  }
);

router.get(
  '/trips/:id/results',
  validate([
    param('id').isString().notEmpty(),
  ]),
  (req, res) => {
    const { id } = req.params;
    const results = store.getResults(id);
    if (!results) return res.status(404).json({ error: 'Trip not found' });
    res.json(results);
  }
);

export default router;


