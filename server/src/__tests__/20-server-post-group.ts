import type { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

import type { Db } from '../db';
import { initDb } from '../db';
import { initServer } from '../server';
import { signJwt } from './helpers/sign-jwt';
import { updateGroup } from '../controllers/group';

jest.mock('../controllers/group');

describe('Server [POST] /api/groups', () => {
  const group = {
    id: 'Uj5SAS740',
    name: 'Super Group #1',
  };
  const newName = 'Awesome Group #1';
  const updatedGroup = { name: newName, id: group.id };

  let cookieValue: string;
  let server: FastifyInstance;
  let db: Db;
  let log: Console['log'];

  beforeAll(async () => {
    log = console.log;
    db = await initDb();
    server = await initServer(db, '9200');

    console.log = () => undefined;

    await db.User.create({
      id: 'TD0sIeaoz',
      email: 'person.one@example.com',
      firstName: 'Person1',
      lastName: 'One',
      role: 'user',
      groupId: 'YLBqxvCCm',
    });
    await db.User.create({
      id: 'Ul2Zrv1BX',
      email: 'person.two@example.com',
      firstName: 'Person2',
      lastName: 'Two',
      role: 'admin',
      groupId: 'MTpZEtFhN',
    });
    await db.Group.create(group);
  });

  afterAll(async () => {
    await db?.terminate();
    server.close();

    console.log = log;
  });

  describe('Unauthorized user', () => {
    beforeEach(async () => {
      cookieValue = await signJwt(
        { id: 'TD0sIeaoz', role: 'user' },
        process.env.JWT_SECRET
      );
    });

    afterEach(() => {
      cookieValue = undefined;
    });

    it('should respond with 401/invalid', async () => {
      const response = await fetch('http://localhost:9200/api/groups', {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(updatedGroup),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.status).toBe('invalid');
    });
  });

  describe('Authorized user', () => {
    beforeEach(async () => {
      cookieValue = await signJwt(
        { id: 'Ul2Zrv1BX', role: 'admin' },
        process.env.JWT_SECRET
      );
    });

    afterEach(() => {
      cookieValue = undefined;
    });

    it('should respond with 400/error on failure', async () => {
      (updateGroup as jest.Mock).mockResolvedValueOnce(false);

      const response = await fetch('http://localhost:9200/api/groups', {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(updatedGroup),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
    });

    it('should respond with 400/invalid on Sequel Validation Error', async () => {
      (updateGroup as jest.Mock).mockRejectedValueOnce(
        Object.assign(new Error('nope'), { name: 'SequelizeValidationError' })
      );

      const response = await fetch('http://localhost:9200/api/groups', {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(updatedGroup),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('invalid');
    });

    it('should respond with 500/error on general error', async () => {
      (updateGroup as jest.Mock).mockRejectedValueOnce(new Error('nope'));

      const response = await fetch('http://localhost:9200/api/groups', {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(updatedGroup),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.status).toBe('error');
    });

    it('should respond with 200/ok on success', async () => {
      (updateGroup as jest.Mock).mockImplementationOnce(
        jest.requireActual('../controllers/group').updateGroup
      );

      const response = await fetch('http://localhost:9200/api/groups', {
        method: 'POST',
        headers: {
          cookie: `login=${cookieValue}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(updatedGroup),
      });
      const data = await response.json();
      const result = await db.Group.findByPk(group.id);

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(result.name).toBe(newName);
    });
  });
});