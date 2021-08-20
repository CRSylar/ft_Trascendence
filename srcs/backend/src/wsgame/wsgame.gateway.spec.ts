import { Test, TestingModule } from '@nestjs/testing';
import { WsgameGateway } from './wsgame.gateway';

describe('WsgameGateway', () => {
  let gateway: WsgameGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WsgameGateway],
    }).compile();

    gateway = module.get<WsgameGateway>(WsgameGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
