import express from 'express';
import auth from '../middleware/auth.js';
const router = express.Router();
import shortUrlController from "../controllers/shortUrlCtrl.js";
// to make the url short
router.post('/short', auth, shortUrlController.shortUrl)
// get the url by it's generated id 
router.get('/:urlId', shortUrlController.getUrlbyId)

export default router