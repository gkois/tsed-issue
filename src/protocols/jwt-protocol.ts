import { Inject, Req } from '@tsed/common';
import { Unauthorized } from '@tsed/exceptions';
import { Arg, OnVerify, Protocol } from '@tsed/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { User } from 'src/data/user';
import { secret } from 'src/secret';
import { AuthService } from 'src/services/auth-service';

@Protocol<StrategyOptions>({
  name: 'jwt',
  useStrategy: Strategy,
  settings: {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret,
    issuer: secret,
    audience: secret
  }
})
export class JwtProtocol implements OnVerify {
  @Inject()
  service: AuthService;

  async $onVerify(@Req() _req: Req, @Arg(0) jwtPayload: any): Promise<User> {
    const user = await this.service.find(jwtPayload.sub);

    if (user === undefined) {
      throw new Unauthorized('401');
    }

    return user;
  }
}
