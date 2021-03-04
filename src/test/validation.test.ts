import request from 'supertest';
import { assert } from 'chai';

import appCreator from '../app';

const app = appCreator();

describe('Test validation logic for users and stores', function () {
  let tokenOne: string;
  let tokenTwo: string;
  let storeId: number;
  it("POST '/api/auth/register', username must be at least 3 characters long", (done) => {
    request(app)
      .post('/api/auth/register')
      .send({
        username: 'Do',
        email: 'mail@example.com',
        password: 'PassworD1',
      })
      .expect(400)
      .then((response) => {
        assert.include(
          response.body.message,
          'username must be between 3 to 30 characters long'
        );
        done();
      })
      .catch((err) => done(err));
  });

  it("POST '/api/auth/register', username can not be more than 30 characters long", (done) => {
    request(app)
      .post('/api/auth/register')
      .send({
        username: 'Some Very Long And Invalid User Name',
        email: 'mail@example.com',
        password: 'PassworD1',
      })
      .expect(400)
      .then((response) => {
        assert.include(
          response.body.message,
          'username must be between 3 to 30 characters long'
        );
        done();
      })
      .catch((err) => done(err));
  });

  it("POST '/api/auth/register', password must be at least 6 characters long", (done) => {
    request(app)
      .post('/api/auth/register')
      .send({
        username: 'Some User',
        email: 'mail@example.com',
        password: 'Pass',
      })
      .expect(400)
      .then((response) => {
        assert.include(
          response.body.message,
          'password must be between 6 to 16 characters long'
        );
        done();
      })
      .catch((err) => done(err));
  });

  it("POST '/api/auth/register', password can not be more than 16 characters long", (done) => {
    request(app)
      .post('/api/auth/register')
      .send({
        username: 'Some User',
        email: 'mail@example.com',
        password: 'VeryLongPassworD1',
      })
      .expect(400)
      .then((response) => {
        assert.include(
          response.body.message,
          'password must be between 6 to 16 characters long'
        );
        done();
      })
      .catch((err) => done(err));
  });

  it("POST '/api/auth/register', email must be a valid email", (done) => {
    request(app)
      .post('/api/auth/register')
      .send({
        username: 'Some User',
        email: 'wrongEmail',
        password: 'PassworD1',
      })
      .expect(400)
      .then((response) => {
        assert.include(response.body.message, 'email must be an email');
        done();
      })
      .catch((err) => done(err));
  });

  it("POST '/api/auth/register', create user with mail@example.com", (done) => {
    request(app)
      .post('/api/auth/register')
      .send({
        username: 'Some User',
        email: 'mail@example.com',
        password: 'PassworD1',
      })
      .expect(201)
      .then((response) => {
        tokenOne = `Bearer ${response.body.token}`;
        done();
      })
      .catch((err) => done(err));
  });

  it("POST '/api/auth/register', email must be unique", (done) => {
    request(app)
      .post('/api/auth/register')
      .send({
        username: 'Some User',
        email: 'mail@example.com',
        password: 'PassworD1',
      })
      .expect(500)
      .then((response) => {
        assert.match(response.body.message, /constraint failed: users\.email/);
        done();
      })
      .catch((err) => done(err));
  });

  it("POST '/api/store', Store name must be at least 10 character long", (done) => {
    request(app)
      .post('/api/store')
      .set('Authorization', tokenOne)
      .send({
        name: 'Store',
      })
      .expect(400)
      .then((response) => {
        assert.include(
          response.body.message,
          'store name must be at least 10 character long'
        );
        done();
      })
      .catch((err) => done(err));
  });

  it("POST '/api/store', only logged in user can create store", (done) => {
    request(app)
      .post('/api/store')
      .send({
        name: 'My Awesome Store',
      })
      .expect(401)
      .then((response) => {
        assert.propertyVal(response.body, 'status', 'fail');
        assert.propertyVal(
          response.body,
          'message',
          'missing authorization token'
        );
        done();
      })
      .catch((err) => done(err));
  });

  it("PATCH '/api/user', only logged in user can update his profile", (done) => {
    request(app)
      .patch(`/api/user`)
      .send({
        username: 'Jane Doe',
        email: 'jane@example.com',
      })
      .expect(401)
      .then((response) => {
        assert.propertyVal(response.body, 'status', 'fail');
        assert.propertyVal(
          response.body,
          'message',
          'missing authorization token'
        );
        done();
      })
      .catch((err) => done(err));
  });

  it("POST '/api/auth/register', create user with mail2@example.com", (done) => {
    request(app)
      .post('/api/auth/register')
      .send({
        username: 'Another User',
        email: 'mail2@example.com',
        password: 'PassworD1',
      })
      .expect(201)
      .then((response) => {
        tokenTwo = `Bearer ${response.body.token}`;
        done();
      })
      .catch((err) => done(err));
  });

  it("POST '/api/store', create store owned by Another User", (done) => {
    request(app)
      .post('/api/store')
      .set('Authorization', tokenTwo)
      .send({
        name: "Another User's Awesome Store",
      })
      .expect(201)
      .then((response) => {
        storeId = response.body.store.id;
        done();
      })
      .catch((err) => done(err));
  });

  it("PATCH '/api/store/:id', only owner can update a store", (done) => {
    request(app)
      .patch(`/api/store/${storeId}`)
      .set('Authorization', tokenOne)
      .send({
        name: 'My Updated Store',
      })
      .expect(403)
      .then((response) => {
        assert.propertyVal(response.body, 'status', 'fail');
        assert.propertyVal(
          response.body,
          'message',
          'you are not allowed to perform that action'
        );
        done();
      })
      .catch((err) => done(err));
  });

  it("DELETE '/api/store/:id', only owner can delete a store", (done) => {
    request(app)
      .delete(`/api/store/${storeId}`)
      .set('Authorization', tokenOne)
      .expect(403)
      .then((response) => {
        assert.propertyVal(response.body, 'status', 'fail');
        assert.propertyVal(
          response.body,
          'message',
          'you are not allowed to perform that action'
        );
        done();
      })
      .catch((err) => done(err));
  });
});
