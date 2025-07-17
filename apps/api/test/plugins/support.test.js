import { test } from 'node:test';

import Fastify from 'fastify';
import Support from '../../plugins/support.js';

test('support works standalone', async (t) => {
  const fastify = Fastify();
  fastify.register(Support);

  await fastify.ready();
  t.assert.equal(fastify.someSupport(), 'hugs');
});

// You can also use plugin with opts in fastify v2
//
// test('support works standalone', (t) => {
//   t.plan(2)
//   const fastify = Fastify()
//   fastify.register(Support)
//
//   fastify.ready((err) => {
//     t.error(err)
//     assert.equal(fastify.someSupport(), 'hugs')
//   })
// })
