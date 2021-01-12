import { Service } from '@tsed/di';
import { User } from 'src/data/user';
import { UserRepository } from 'src/data/user-repository';

@Service()
export class AuthService {
  constructor(private readonly repository: UserRepository) {}

  public async find(username: string): Promise<User | undefined> {
    return this.repository.findOne({ where: { username } });
  }

  public async getAll(): Promise<User[] | undefined> {
    return this.repository.find();
  }
}
