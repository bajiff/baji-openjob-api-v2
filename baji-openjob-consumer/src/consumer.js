import 'dotenv/config';
import amqplib from 'amqplib';
import nodemailer from 'nodemailer';
import pool from './postgres/pool.js';
import process from 'process';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const startConsumer = async () => {
  const conn = await amqplib.connect({
    hostname: process.env.RABBITMQ_HOST,
    port: Number(process.env.RABBITMQ_PORT) || 5672,
    username: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
  });

  const channel = await conn.createChannel();
  await channel.assertQueue('application_created', { durable: true });
  channel.prefetch(1);

  console.log('🐇 Consumer aktif, menunggu pesan...');

  channel.consume('application_created', async (msg) => {
    if (!msg) return;

    const { application_id } = JSON.parse(msg.content.toString());
    console.log(`📥 Menerima: application_id=${application_id}`);

    try {
      // Query: cari pemilik job (owner) dan data pelamar
      const result = await pool.query(
        `SELECT
            applicant.email AS applicant_email,
            applicant.fullname AS applicant_name,
            owner.email AS owner_email
         FROM applications a
         JOIN users applicant ON applicant.id = a.user_id
         JOIN jobs j ON j.id = a.job_id
         JOIN companies c ON c.id = j.company_id
         JOIN users owner ON owner.id = c.user_id
         WHERE a.id = $1`,
        [application_id]
      );

      if (result.rows.length === 0) {
        console.warn(`Application ${application_id} tidak ditemukan di DB`);
        channel.ack(msg);
        return;
      }

      const { applicant_email, applicant_name, owner_email } = result.rows[0];
      const apply_date = new Date();

      await transporter.sendMail({
        from: `"OpenJob Notification" <${process.env.MAIL_USER}>`,
        to: owner_email,
        subject: '📩 Ada pelamar baru untuk lowongan Anda!',
        html: `
          <h2>Notifikasi Lamaran Baru</h2>
          <p>Seseorang telah melamar ke lowongan Anda di OpenJob:</p>
          <ul>
            <li><strong>Nama Pelamar:</strong> ${applicant_name}</li>
            <li><strong>Email Pelamar:</strong> ${applicant_email}</li>
            <li><strong>Tanggal Melamar:</strong> ${new Date(apply_date).toLocaleString('id-ID')}</li>
          </ul>
          <p>Silakan login ke OpenJob untuk meninjau lamaran ini.</p>
        `,
      });

      console.log(`✅ Email notifikasi terkirim ke ${owner_email}`);
      channel.ack(msg);
    } catch (err) {
      console.error('❌ Consumer error:', err.message);
      channel.nack(msg, false, false);
    }
  });
};

startConsumer().catch(console.error);
