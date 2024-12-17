const express = require('express');
const router = express.Router();
const {
  getAllHazards,
  getHazardById,
  createHazard,
  updateHazard,
  deleteHazard
} = require('../controllers/generalHazardController');

router.get('/', getAllHazards);
router.get('/:id', getHazardById);
router.post('/', createHazard);
router.put('/:id', updateHazard);
router.delete('/:id', deleteHazard);

module.exports = router;
