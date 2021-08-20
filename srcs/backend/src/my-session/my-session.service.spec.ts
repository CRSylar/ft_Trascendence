import { Test, TestingModule } from '@nestjs/testing';
import { MySessionService } from './my-session.service';

describe('MySessionService', () => {
  let service: MySessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MySessionService],
    }).compile();

    service = module.get<MySessionService>(MySessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
