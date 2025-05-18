import amqp from 'amqplib';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from '../schema/notificationSchema.js';
// Import your sendEmail/sendSms/sendInApp functions
// import { sendEmail, sendSms, sendInApp } from '../utils/sendNotification.js';

dotenv.config();

const notificationTypes = ['email', 'sms', 'in-app'];

const senders = {
  email: async (data) => {
    // await sendEmail(data); // Uncomment and implement this
    return true; // Simulate success
  },
  sms: async (data) => {
    // await sendSms(data);
    return true;
  },
  'in-app': async (data) => {
    // await sendInApp(data);
    return true;
  }
};

async function startConsumer() {
  await mongoose.connect(process.env.CONNECTION_STRING);
  console.log('Connected to MongoDB');

  const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
  const connection = await amqp.connect(rabbitUrl);
  const channel = await connection.createChannel();
  console.log('Connected to RabbitMQ');

  for (const type of notificationTypes) {
    const queueName = `notification_${type}`;
    await channel.assertQueue(queueName, {
      durable: true,
      arguments: { 'x-max-priority': 5 }
    });

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          // 1. Store as pending
          const notif = await Notification.create({
            userId: data.userId,
            type: data.type,
            message: data.message,
            status: 'pending',
            error: null,
            // Add more fields if needed
          });

          // 2. Try to send notification
          let sendResult = false, sendError = null;
          if (senders[type]) {
            try {
              sendResult = await senders[type](data);
            } catch (err) {
              sendResult = false;
              sendError = err.message || String(err);
            }
          } else {
            sendError = 'Unknown notification type';
          }

          // 3. Update status based on send result
          if (sendResult) {
            await Notification.findByIdAndUpdate(notif._id, { status: 'sent', error: null });
            console.log(`Notification sent and updated for user: ${data.userId}, type: ${data.type}`);
          } else {
            await Notification.findByIdAndUpdate(notif._id, { status: 'failed', error: sendError });
            console.error('Failed to send notification:', sendError);
          }

          channel.ack(msg);
        } catch (err) {
          console.error('Consumer error:', err);
          channel.nack(msg, false, false); // Optionally dead-letter or drop
        }
      }
    }, { noAck: false });

    console.log(`Consumer started for queue: ${queueName}`);
  }
}

startConsumer().catch(console.error);