import { test } from 'node:test';
import { build } from '../helper.js';

test('default root route', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: '/',
  });
  t.assert.deepStrictEqual(JSON.parse(res.payload), {
    params: {},
    query: {},
    body: 'No body',
    headers: {
      'user-agent': 'lightMyRequest',
      host: 'localhost:80',
    },
  });
});

// inject callback style:
//
// test('default root route', (t) => {
//   t.plan(2)
//   const app = await build(t)
//
//   app.inject({
//     url: '/'
//   }, (err, res) => {
//     t.error(err)
//     assert.deepStrictEqual(JSON.parse(res.payload), { root: true })
//   })
// })
