import { Router } from 'express';
import {
  uploadVideo,
  getVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  getUserVideos,
} from '../controllers/videoController';
import { protect, optionalAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * /api/videos/upload:
 *   post:
 *     summary: Upload a new video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - video
 *               - title
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: string
 *               privacy:
 *                 type: string
 *                 enum: [public, private, unlisted]
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 *       401:
 *         description: Not authorized
 */
router.post(
  '/upload',
  protect,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  uploadVideo
);

/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: Get all videos
 *     tags: [Videos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Videos retrieved successfully
 */
router.get('/', optionalAuth, getVideos);

/**
 * @swagger
 * /api/videos/user/{userId}:
 *   get:
 *     summary: Get user's videos
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User videos retrieved successfully
 */
router.get('/user/:userId', optionalAuth, getUserVideos);

/**
 * @swagger
 * /api/videos/{id}:
 *   get:
 *     summary: Get video by ID
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video retrieved successfully
 *       404:
 *         description: Video not found
 */
router.get('/:id', optionalAuth, getVideoById);

/**
 * @swagger
 * /api/videos/{id}:
 *   put:
 *     summary: Update video
 *     tags: [Videos]
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               privacy:
 *                 type: string
 *     responses:
 *       200:
 *         description: Video updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Video not found
 */
router.put('/:id', protect, updateVideo);

/**
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     summary: Delete video
 *     tags: [Videos]
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
 *         description: Video deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Video not found
 */
router.delete('/:id', protect, deleteVideo);

export default router;