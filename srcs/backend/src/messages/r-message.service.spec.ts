import { Test, TestingModule } from '@nestjs/testing';
import { RMessageService } from './r-message.service';

describe('RMessageService', () => {
  let service: RMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RMessageService],
    }).compile();

    service = module.get<RMessageService>(RMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
