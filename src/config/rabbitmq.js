import amqplib from 'amqplib';
import process from 'process';

let channel;

export const connectRabbitMQ = async () => {
  const conn = await amqplib.connect({
    hostname: process.env.RABBITMQ_HOST,
    port: Number(process.env.RABBITMQ_PORT) || 5672,
    username: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
  });
  channel = await conn.createChannel();
  await channel.assertQueue('application_created', { durable: true });
  console.log('✅ RabbitMQ publisher connected');
};

export const publishApplicationCreated = async (applicationId) => {
  if (!channel) {
    console.warn('RabbitMQ channel not ready');
    return;
  }
  const payload = JSON.stringify({ application_id: applicationId });
  channel.sendToQueue('application_created', Buffer.from(payload), {
    persistent: true,
  });
  console.log(`📤 Published: application_id=${applicationId}`);
};
