import { Test, TestingModule } from '@nestjs/testing';
import { WsgameService } from './wsgame.service';

describe('WsgameService', () => {
  let service: WsgameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WsgameService],
    }).compile();

    service = module.get<WsgameService>(WsgameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
