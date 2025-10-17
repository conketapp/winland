import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(_authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(_email: string, _password: string): Promise<any> {
    // This strategy is deprecated in Model B (we use OTP + JWT)
    // Keep for compatibility but not used
    throw new UnauthorizedException('Use OTP authentication or admin login');
  }
}
