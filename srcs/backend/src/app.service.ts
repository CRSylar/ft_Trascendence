import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private static dispatcher : Map<string, Array<(payload:any) => void> > = new Map<string, Array<(payload:any) => void> >()

    add(name:string, callback: (payload: any) => void) {
      if (!AppService.dispatcher[name])
          AppService.dispatcher[name] = new Array<(payload:any) => void>();
        AppService.dispatcher[name].push(callback);
    }

    exec(name:string, payload:any){
      if (AppService.dispatcher[name])
        AppService.dispatcher[name].forEach( (callback) => callback(payload))
    }
}
