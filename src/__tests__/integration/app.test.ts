import request from 'supertest';
import app from '../../app';

describe('App Endpoints', () => {
  describe('GET /health', () => {
    it('should return status ok with timestamp', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
    });
  });

  describe('GET /api-docs.json', () => {
    it('should return swagger specification as JSON', async () => {
      const response = await request(app).get('/api-docs.json');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body).toHaveProperty('openapi');
      expect(response.body).toHaveProperty('info');
      expect(response.body).toHaveProperty('paths');
    });

    it('should include health endpoint in swagger spec', async () => {
      const response = await request(app).get('/api-docs.json');

      expect(response.body.paths).toHaveProperty('/health');
      expect(response.body.paths['/health']).toHaveProperty('get');
    });
  });

  describe('GET /api-docs', () => {
    it('should serve swagger UI HTML', async () => {
      const response = await request(app).get('/api-docs/');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');

      expect(response.status).toBe(404);
    });
  });
});



