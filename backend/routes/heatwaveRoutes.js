const express = require('express');
const router = express.Router();
const {
  getAllHeatwaves,
  getHeatwaveById,
  createHeatwave,
  updateHeatwave,
  deleteHeatwave
} = require('../controllers/heatwaveController');

router.route('/')
  .get(getAllHeatwaves)
  .post(createHeatwave);

router.route('/:id')
  .get(getHeatwaveById)
  .put(updateHeatwave)
  .delete(deleteHeatwave);

module.exports = router;
