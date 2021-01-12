import { BodyParams, Controller, Get, MulterOptions, MultipartFile, PlatformMulterFile, Post, Req } from '@tsed/common';
import { Unauthorized } from '@tsed/exceptions';
import { Authenticate } from '@tsed/passport';
import { Default, Returns } from '@tsed/schema';
import AppRootPath from 'app-root-path';
import path from 'path';
import jwt from 'jsonwebtoken';
import { User } from 'src/data/user';
import { secret } from 'src/secret';
import { AuthService } from 'src/services/auth-service';

@Controller('/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Get()
  @(Returns(200, Array).Of(User))
  public async getAll(): Promise<User[]> {
    const users = await this.service.getAll();

    return users || [];
  }

  @Post('/login')
  @Returns(200, String)
  public async login(
    @Default('admin') @BodyParams('username') username: string,
    @Default('admin') @BodyParams('password') password: string
  ): Promise<string> {
    const user = await this.service.find(username);

    if (user === undefined || user.password !== password) {
      throw new Unauthorized('401');
    }

    const now = new Date();
    const iat = Math.floor(now.getTime() / 1000);

    return jwt.sign(
      {
        iss: secret,
        aud: secret,
        iat,
        exp: iat + 300,
        sub: username
      },
      secret
    );
  }

  @Post('/upload')
  @Authenticate('jwt')
  @MulterOptions({ dest: path.resolve(AppRootPath.path, 'upload') })
  public async upload(
    @Req('user') user: User,
    @MultipartFile('file') file: PlatformMulterFile,
    @BodyParams('name') name: string,
    @BodyParams('age') age: number
  ): Promise<string> {
    return `autheticated user ${user.username} with nickname ${name} of age ${age} uploaded file ${file.originalname} as ${file.filename} with size ${file.size}`;
  }
}
