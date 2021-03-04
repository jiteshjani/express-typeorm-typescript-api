import request from 'supertest';
import { assert } from 'chai';

import appCreator from '../app';

const app = appCreator();

// 1. Public route
describe('Test if the app is running', () => {
  it("GET '/', to see Hello World", (done) => {
    request(app)
      .get('/')
      .expect('Content-Type', /text\/html/)
      .expect(200)
      .then((response) => {
        assert.strictEqual(response.text, 'Hello World');
        done();
      })
      .catch((err) => done(err));
  });
});
