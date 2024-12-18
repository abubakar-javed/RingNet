const express = require('express');
const router = express.Router();
const {
  getAllTsunamis,
  getTsunamiById,
  createTsunami,
  updateTsunami,
  deleteTsunami
} = require('../controllers/tsunamiController');

router.route('/')
  .get(getAllTsunamis)
  .post(createTsunami);

router.route('/:id')
  .get(getTsunamiById)
  .put(updateTsunami)
  .delete(deleteTsunami);

module.exports = router;
