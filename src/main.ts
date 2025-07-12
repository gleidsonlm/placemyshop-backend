import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('PlaceMyShop Backend API')
    .setDescription('A backend API for a SaaS platform helping liberal professionals and SMB offices manage their online presence and client interactions.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('roles', 'Role management endpoints')
    .addTag('businesses', 'Business management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}

// Only run bootstrap if main.ts is executed directly (e.g. node dist/main.js)
// This prevents bootstrap from running automatically when imported for tests.
if (require.main === module) {
  void bootstrap();
}

// Export bootstrap for testing or other programmatic uses if needed.
export { bootstrap };
