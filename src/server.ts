import '@tsed/ajv';
import '@tsed/passport';
import '@tsed/platform-express';
import '@tsed/swagger';
import { TypeORMService } from '@tsed/typeorm';

import { AfterRoutesInit, BeforeRoutesInit, PlatformApplication } from '@tsed/common';
import { Configuration, Inject } from '@tsed/di';
import { json, urlencoded } from 'body-parser';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import methodOverride from 'method-override';
import { AuthController } from './controllers/auth-controller';
import { JwtProtocol } from './protocols/jwt-protocol';
import { User } from './data/user';

const rootDir = __dirname;

@Configuration({
  rootDir,

  acceptMimes: ['application/json', 'application/octet-stream'],

  logger: {
    debug: false,
    logRequest: true,
    requestFields: ['reqId', 'method', 'url', 'headers', 'query', 'params', 'duration']
  },

  mount: { '/api': [AuthController] },

  imports: [JwtProtocol],

  passport: {
    userInfoModel: User
  },

  typeorm: [
    {
      name: 'default',
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [User],
      synchronize: true,
      logging: false
    }
  ],

  swagger: [
    {
      path: '/api/swagger',
      showExplorer: true,
      specVersion: '3.0.3',
      spec: {
        components: {
          securitySchemes: {
            Bearer: {
              type: 'http',
              description: 'JWT Bearer token',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        },
        security: [
          {
            Bearer: []
          }
        ]
      }
    }
  ]
})
export class Server implements BeforeRoutesInit, AfterRoutesInit {
  @Inject()
  app: PlatformApplication;

  @Inject()
  typeORMService: TypeORMService;

  public async $beforeRoutesInit(): Promise<void> {
    this.app
      .use(cors())
      .use(cookieParser())
      .use(compress({}))
      .use(methodOverride())
      .use(json())
      .use(
        urlencoded({
          extended: true
        })
      );
  }

  public async $afterRoutesInit(): Promise<void> {
    const connection = this.typeORMService.connectionManager.get('default');

    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        { id: 1, username: 'admin', password: 'admin' },
        { id: 2, username: 'user', password: 'user' }
      ])
      .execute();
    // $log.info(this.typeORMService.get());
  }
}
