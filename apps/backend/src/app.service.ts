import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; timestamp: string } {
    return {
      message: 'Welcome to Batdongsan API',
      timestamp: new Date().toISOString(),
    };
  }
}

