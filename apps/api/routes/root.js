import { isEmpty } from 'common';

export default async function (fastify) {
  fastify.get('/', async function (request) {
    return {
      params: isEmpty(request.params) ? 'No parameters' : request.params,
      query: isEmpty(request.query) ? 'No query parameters' : request.query,
      body: isEmpty(request.body) ? 'No body' : request.body,
      headers: isEmpty(request.headers) ? 'No headers' : request.headers,
    };
  });
}
