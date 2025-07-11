import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

// Only run bootstrap if main.ts is executed directly (e.g. node dist/main.js)
// This prevents bootstrap from running automatically when imported for tests.
if (require.main === module) {
  void bootstrap();
}

// Export bootstrap for testing or other programmatic uses if needed.
export { bootstrap };
