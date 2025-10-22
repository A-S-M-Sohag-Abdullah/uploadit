import { Router } from 'express';
import {
  createComment,
  getVideoComments,
  getCommentReplies,
  deleteComment,
  updateComment,
} from '../controllers/commentController';
import { protect } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - videoId
 *             properties:
 *               content:
 *                 type: string
 *               videoId:
 *                 type: string
 *               parentCommentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       401:
 *         description: Not authorized
 */
router.post('/', protect, createComment);

/**
 * @swagger
 * /api/comments/video/{videoId}:
 *   get:
 *     summary: Get comments for a video
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 */
router.get('/video/:videoId', getVideoComments);

/**
 * @swagger
 * /api/comments/{commentId}/replies:
 *   get:
 *     summary: Get replies for a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Replies retrieved successfully
 */
router.get('/:commentId/replies', getCommentReplies);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Not authorized
 */
router.put('/:id', protect, updateComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Not authorized
 */
router.delete('/:id', protect, deleteComment);

export default router;