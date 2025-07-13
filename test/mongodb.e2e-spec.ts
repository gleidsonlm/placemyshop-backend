import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { INestApplication } from '@nestjs/common';

describe('MongoDB Connection (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Inject Mongoose connection
    connection = moduleFixture.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    if (connection) {
      await connection.close();
    }
    if (app) {
      await app.close();
    }
  });

  it('should connect to MongoDB', () => {
    expect(connection.readyState).toBe(1); // 1 means connected
  });
});
