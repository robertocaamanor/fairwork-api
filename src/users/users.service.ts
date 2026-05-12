import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const DEFAULT_USERS: Array<{
  username: string;
  password: string;
  isAdmin: boolean;
  canSendToN8n: boolean;
}> = [
  {
    username: 'admin',
    password: 'admin123',
    isAdmin: true,
    canSendToN8n: true,
  },
  {
    username: 'demo',
    password: 'demo123',
    isAdmin: false,
    canSendToN8n: false,
  },
];

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultUsers();
  }

  async ensureDefaultUsers(): Promise<void> {
    for (const user of DEFAULT_USERS) {
      const existing = await this.userRepository.findOne({
        where: { username: user.username },
      });

      if (existing) {
        continue;
      }

      const passwordHash = await hash(user.password, 10);
      await this.userRepository.save(
        this.userRepository.create({
          username: user.username,
          passwordHash,
          isAdmin: user.isAdmin,
          canSendToN8n: user.canSendToN8n,
          isActive: true,
        }),
      );
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ order: { username: 'ASC' } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username: username.trim().toLowerCase() },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.findByUsername(createUserDto.username);
    if (existing) {
      throw new ConflictException('Ya existe un usuario con ese nombre');
    }

    const passwordHash = await hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      username: createUserDto.username,
      passwordHash,
      isAdmin: createUserDto.isAdmin ?? false,
      canSendToN8n:
        createUserDto.isAdmin === true
          ? true
          : (createUserDto.canSendToN8n ?? false),
      isActive: createUserDto.isActive ?? true,
    });

    return this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existing = await this.findByUsername(updateUserDto.username);
      if (existing && existing.id !== id) {
        throw new ConflictException('Ya existe un usuario con ese nombre');
      }
      user.username = updateUserDto.username;
    }

    if (updateUserDto.password) {
      user.passwordHash = await hash(updateUserDto.password, 10);
    }

    if (updateUserDto.isAdmin !== undefined) {
      user.isAdmin = updateUserDto.isAdmin;
      if (updateUserDto.isAdmin) {
        user.canSendToN8n = true;
      }
    }

    if (updateUserDto.canSendToN8n !== undefined && !user.isAdmin) {
      user.canSendToN8n = updateUserDto.canSendToN8n;
    }

    if (updateUserDto.isActive !== undefined) {
      user.isActive = updateUserDto.isActive;
    }

    return this.userRepository.save(user);
  }

  sanitize(user: User) {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}