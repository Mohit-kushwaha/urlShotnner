import express from 'express';
const router = express.Router();
import userCtrl from "../controllers/userCtrl.js";

router.post('/register', userCtrl.register)

router.post('/login', userCtrl.login)

router.get('/logout', userCtrl.logout)

router.get('/googleLogin', userCtrl.googleLogin)


export default router