const express = require('express');
const router = express.Router();

const meController = require('../app/controllers/MeController');
const authMiddlewares = require('../middlewares/AuthMiddlewares');

router.get('/stored/songs', authMiddlewares.loggedin, meController.storedSongs);
router.get(
    '/stored/accounts',
    authMiddlewares.loggedin,
    meController.storedAccounts,
);
router.get('/trash/songs', authMiddlewares.loggedin, meController.trashSongs);
router.get(
    '/trash/accounts',
    authMiddlewares.loggedin,
    meController.trashAccounts,
);

module.exports = router;
