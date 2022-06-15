const request = require('supertest');
//require('@babel/polyfill');
const { server } = require('../index.js');

//test default route (index)
describe('server', () => {
    describe('get /', () => {
      it('should return a 200', async () => {
        await request(server).get('/').then((res) => {
          expect(res.statusCode).toBe(200);
        });
      });
    });
  });