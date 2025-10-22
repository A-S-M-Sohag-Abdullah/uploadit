import { Router } from 'express';
import { toggleLike, getLikeStatus } from '../controllers/likeController';
import { protect } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/likes/video/{videoId}:
 *   post:
 *     summary: Toggle like/dislike on a video
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [like, dislike]
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *       401:
 *         description: Not authorized
 */
router.post('/video/:videoId', protect, toggleLike);

/**
 * @swagger
 * /api/likes/video/{videoId}/status:
 *   get:
 *     summary: Get user's like status for a video
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like status retrieved successfully
 *       401:
 *         description: Not authorized
 */
router.get('/video/:videoId/status', protect, getLikeStatus);

export default router;