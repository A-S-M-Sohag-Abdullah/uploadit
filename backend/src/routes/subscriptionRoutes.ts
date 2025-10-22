import { Router } from 'express';
import {
  toggleSubscription,
  getSubscriptionStatus,
  getMySubscriptions,
  getChannelSubscribers,
} from '../controllers/subscriptionController';
import { protect } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/subscriptions/{channelId}:
 *   post:
 *     summary: Toggle subscription to a channel
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription toggled successfully
 *       401:
 *         description: Not authorized
 */
router.post('/:channelId', protect, toggleSubscription);

/**
 * @swagger
 * /api/subscriptions/{channelId}/status:
 *   get:
 *     summary: Check subscription status
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription status retrieved successfully
 *       401:
 *         description: Not authorized
 */
router.get('/:channelId/status', protect, getSubscriptionStatus);

/**
 * @swagger
 * /api/subscriptions/my-subscriptions:
 *   get:
 *     summary: Get user's subscriptions
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscriptions retrieved successfully
 *       401:
 *         description: Not authorized
 */
router.get('/my-subscriptions', protect, getMySubscriptions);

/**
 * @swagger
 * /api/subscriptions/channel/{channelId}/subscribers:
 *   get:
 *     summary: Get channel's subscribers
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscribers retrieved successfully
 */
router.get('/channel/:channelId/subscribers', getChannelSubscribers);

export default router;