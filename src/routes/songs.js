const express = require('express');
const router = express.Router();

const songController = require('../app/controllers/SongController');

router.get('/create', songController.create);
router.post('/store', songController.store);
router.get('/:id/edit', songController.edit);
router.put('/:id', songController.update);
router.patch('/:id/restore', songController.restore);
router.delete('/:id/soft', songController.delete);
router.delete('/:id/force', songController.forceDelete);
router.get('/:slug', songController.show);
// router.get('/:slug', songController.search);

module.exports = router;
