import { Test, TestingModule } from '@nestjs/testing';
import { MySessionController } from './my-session.controller';
import { MySessionService } from './my-session.service';

describe('MySessionController', () => {
  let controller: MySessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MySessionController],
      providers: [MySessionService],
    }).compile();

    controller = module.get<MySessionController>(MySessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
