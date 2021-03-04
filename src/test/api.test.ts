import request from 'supertest';
import { assert } from 'chai';
import { createConnection, getConnection } from 'typeorm';

import { User } from '../entity/User';
import { Store } from '../entity/Store';
import appCreator from '../app';

const app = appCreator();

before(() => {
  return createConnection({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [User, Store],
    synchronize: true,
    logging: false,
  });
});

after(() => {
  let conn = getConnection();
  return conn.close();
});

describe('Test CRUD for users and stores', function () {
  let token: string;
  let storeId: number;
  it("POST '/api/auth/register', user can register an account", (done) => {
    request(app)
      .post('/api/auth/register')
      .send({
        username: 'John Doe',
        email: 'john@example.com',
        password: 'PassworD1',
      })
      .expect(201)
      .then((response) => {
        token = `Bearer ${response.body.token}`;
        assert.propertyVal(response.body, 'status', 'success');
        assert.property(response.body, 'token');
        done();
      })
      .catch((err) => done(err));
  });

  it("PATCH '/api/user', user can update his profile", (done) => {
    request(app)
      .patch(`/api/user`)
      .set('Authorization', token)
      .send({
        username: 'Jane Doe',
        email: 'jane@example.com',
      })
      .expect(200)
      .then((response) => {
        assert.propertyVal(response.body, 'status', 'success');
        assert.propertyVal(response.body.user, 'username', 'Jane Doe');
        done();
      })
      .catch((err) => done(err));
  });

  it("POST '/api/auth/login', user can login after profile updated", (done) => {
    request(app)
      .post('/api/auth/login')
      .send({
        email: 'jane@example.com',
        password: 'PassworD1',
      })
      .then((response) => {
        token = `Bearer ${response.body.token}`;
        assert.propertyVal(response.body, 'status', 'success');
        assert.property(response.body, 'token');
        done();
      })
      .catch((err) => done(err));
  });

  it("PATCH '/api/user', user can update his password", (done) => {
    request(app)
      .patch(`/api/user`)
      .set('Authorization', token)
      .send({
        password: 'PassworD2',
      })
      .expect(200)
      .then((response) => {
        assert.propertyVal(response.body, 'status', 'success');
        assert.propertyVal(response.body.user, 'username', 'Jane Doe');
        done();
      })
      .catch((err) => done(err));
  });

  it("POST '/api/auth/login', user can login after password updated", (done) => {
    request(app)
      .post('/api/auth/login')
      .send({
        email: 'jane@example.com',
        password: 'PassworD2',
      })
      .then((response) => {
        token = `Bearer ${response.body.token}`;
        assert.propertyVal(response.body, 'status', 'success');
        assert.property(response.body, 'token');
        done();
      })
      .catch((err) => done(err));
  });

  it("POST '/api/store', logged in user can create store", (done) => {
    request(app)
      .post('/api/store')
      .set('Authorization', token)
      .send({
        name: 'My Awesome Store',
      })
      .expect(201)
      .then((response) => {
        storeId = response.body.store.id;
        assert.propertyVal(response.body, 'status', 'success');
        assert.propertyVal(response.body.store, 'name', 'My Awesome Store');
        done();
      })
      .catch((err) => done(err));
  });

  it("GET '/api/user', get all users along with stores", (done) => {
    request(app)
      .get(`/api/user`)
      .expect(200)
      .then((response) => {
        assert.propertyVal(response.body, 'status', 'success');
        assert.strictEqual(response.body.users.length, 1);
        assert.strictEqual(response.body.users[0].stores.length, 1);
        done();
      })
      .catch((err) => done(err));
  });

  it("GET '/api/user/:id', user can be retrieved by it's Id", (done) => {
    request(app)
      .get(`/api/user/1`)
      .expect(200)
      .then((response) => {
        assert.propertyVal(response.body, 'status', 'success');
        assert.propertyVal(response.body.user, 'username', 'Jane Doe');
        assert.strictEqual(response.body.user.stores.length, 1);
        done();
      })
      .catch((err) => done(err));
  });

  it("GET '/api/user', passwords are not exposed in public API", (done) => {
    request(app)
      .get(`/api/user/1`)
      .expect(200)
      .then((response) => {
        assert.isUndefined(response.body.user.password);
        assert.isUndefined(response.body.user.tempPassword);
        done();
      })
      .catch((err) => done(err));
  });

  it("GET '/api/user', passwords are not exposed in public API", (done) => {
    request(app)
      .get(`/api/user`)
      .expect(200)
      .then((response) => {
        assert.isUndefined(response.body.users[0].password);
        assert.isUndefined(response.body.users[0].tempPassword);
        done();
      })
      .catch((err) => done(err));
  });

  it("PATCH '/api/store/:id', owner can update a store", (done) => {
    request(app)
      .patch(`/api/store/${storeId}`)
      .set('Authorization', token)
      .send({
        name: 'My Updated Store',
      })
      .expect(200)
      .then((response) => {
        assert.propertyVal(response.body, 'status', 'success');
        assert.propertyVal(response.body.store, 'name', 'My Updated Store');
        done();
      })
      .catch((err) => done(err));
  });

  it("GET '/api/store', get all stores", (done) => {
    request(app)
      .get('/api/store')
      .expect(200)
      .then((response) => {
        assert.propertyVal(response.body, 'status', 'success');
        assert.strictEqual(response.body.stores.length, 1);
        done();
      })
      .catch((err) => done(err));
  });

  it("GET '/api/store/:id', a store can be accessed by it's Id", (done) => {
    request(app)
      .get(`/api/store/${storeId}`)
      .expect(200)
      .then((response) => {
        assert.propertyVal(response.body, 'status', 'success');
        assert.property(response.body, 'store');
        done();
      })
      .catch((err) => done(err));
  });

  it("DELETE '/api/store/:id', owner can delete a store", (done) => {
    request(app)
      .delete(`/api/store/${storeId}`)
      .set('Authorization', token)
      .expect(204)
      .then(() => {
        done();
      })
      .catch((err) => done(err));
  });

  it("GET '/api/store/:id', once deleted a store can not be accessed", (done) => {
    request(app)
      .get(`/api/store/${storeId}`)
      .expect(500)
      .then((response) => {
        assert.propertyVal(response.body, 'status', 'error');
        assert.match(response.body.message, /(not found|not find)/gi);
        done();
      })
      .catch((err) => done(err));
  });

  it("DELETE '/api/user/:id', user can delete his account", (done) => {
    request(app)
      .delete(`/api/user/1`)
      .set('Authorization', token)
      .expect(204)
      .then(() => {
        done();
      })
      .catch((err) => done(err));
  });

  it("POST '/api/auth/login', once account is deleted, user can not login", (done) => {
    request(app)
      .post('/api/auth/login')
      .send({
        email: 'jane@example.com',
        password: 'PassworD1',
      })
      .expect(401)
      .then((response) => {
        assert.propertyVal(response.body, 'status', 'fail');
        assert.propertyVal(response.body, 'message', 'invalid credentials');
        done();
      })
      .catch((err) => done(err));
  });
});
