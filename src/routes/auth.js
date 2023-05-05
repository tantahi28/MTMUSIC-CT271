const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../app/controllers/AuthController');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authMiddlewares = require('../middlewares/AuthMiddlewares');

router.get('/login', authMiddlewares.isAuth, authController.getLogin);
router.get('/register', authMiddlewares.isAuth, authController.getRegister);
router.get('/google', authController.google);
router.post('/store', authController.register);
router.post('/logging', authController.login);
router.get('/logout', authMiddlewares.loggedin, authController.logout);
router.delete('/:id/delete', authController.delete);
router.patch('/:id/restore', authController.restore);
router.delete('/:id/force', authController.forceDelete);
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
);

module.exports = router;
