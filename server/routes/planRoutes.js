import express from 'express';
import { createPlan, getHistory, deleteHistory, saveExistingPlan } from '../controllers/planController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/plan', optionalAuth, createPlan);
router.get('/history', protect, getHistory);
router.post('/history/save', protect, saveExistingPlan);
router.delete('/history/:id', protect, deleteHistory);

export default router;
