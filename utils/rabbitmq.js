import amqp from 'amqplib';

let channel;

const createRabbitMQChannel = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    console.log('RabbitMQ connected and channel created');
  } catch (err) {
    console.error('Failed to connect to RabbitMQ', err);
    process.exit(1);
  }
}

const getRabbitMQChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized. Call createRabbitMQChannel() first.');
  }
  return channel;
}

export {
  getRabbitMQChannel,
  createRabbitMQChannel,
};