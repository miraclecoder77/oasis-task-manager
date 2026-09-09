import app from './app.js';

const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];
const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  process.stderr.write(
    `Missing required environment variables: ${missing.join(', ')}\n` +
      'Copy .env.example to .env and fill it in.\n'
  );
  process.exit(1);
}

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  process.stdout.write(`API listening on http://localhost:${port}\n`);
});
