import asyncHandler from 'express-async-handler';
import User from '../schema/userSchema.js';
import { getRabbitMQChannel } from '../utils/rabbitmq.js';

const getPriorityAndCategory = (message) => {
  if (/otp|verify|validation/i.test(message)) return { priority: 1, category: 'otp' };
  if (/payment|bill|transaction/i.test(message)) return { priority: 2, category: 'payment' };
  return { priority: 3, category: 'others' };
};

const mapTypeToQueue = (type) => {
  if (type === 'mail' || type === 'email') return 'email';
  if (type === 'sms') return 'sms';
  if (type === 'in-app') return 'in-app';
  return type;
};

const createNotification = asyncHandler(async (req, res) => {
  // Accept either a single object or an array of objects
  const notifications = Array.isArray(req.body) ? req.body : [req.body];
  const channel = await getRabbitMQChannel();
  const results = [];

  for (const item of notifications) {
    const { username, type, message } = item;

    if (!username || !type || !message) {
      results.push({ success: false, error: 'username, type, and message are required', item });
      continue;
    }

    const user = await User.findOne({ username });
    if (!user) {
      results.push({ success: false, error: 'User not found', item });
      continue;
    }

    const { priority, category } = getPriorityAndCategory(message);
    const payload = {
      userId: user._id,
      username: user.username,
      type: mapTypeToQueue(type),
      message,
      priority,
      category,
      status: 'pending',
      createdAt: new Date(),
    };

    const queueType = mapTypeToQueue(type);
    const queueName = `notification_${queueType}`;

    await channel.assertQueue(queueName, { durable: true, maxPriority: 5 });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      priority,
    });

    results.push({ success: true, queue: queueName, username, type });
  }

  res.status(202).json({ message: 'Notifications processed', results });
});

export default createNotification;