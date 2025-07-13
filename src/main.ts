import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { PermissionsGuard } from './permissions/permissions.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use the app's Reflector instance for the global guard
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new PermissionsGuard(reflector));

  await app.listen(process.env.PORT ?? 3000);
}

// Only run bootstrap if main.ts is executed directly (e.g. node dist/main.js)
// This prevents bootstrap from running automatically when imported for tests.
if (require.main === module) {
  void bootstrap();
}

// Export bootstrap for testing or other programmatic uses if needed.
export { bootstrap };
