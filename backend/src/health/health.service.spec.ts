import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns ok status payload', () => {
    const service = new HealthService();
    expect(service.getHealth()).toEqual({ status: 'ok' });
  });
});
