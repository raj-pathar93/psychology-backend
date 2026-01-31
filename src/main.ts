import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('Creating NestJS application...');
  const app = await NestFactory.create(AppModule);
  console.log('Application created, enabling CORS...');
  app.enableCors({
    origin: ['http://localhost:5173', 'https://www.manahvigyan.com'],
  });
  console.log('Starting server on port:', process.env.PORT ?? 3000);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`✅ Server is now listening on http://localhost:${port}!`);
}
bootstrap().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

