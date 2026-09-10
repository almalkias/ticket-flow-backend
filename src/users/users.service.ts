import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { CreateAgentDto } from './dto/create-agent.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async createAgent(
    dto: CreateAgentDto,
  ): Promise<User & { passwordResetLink: string }> {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const firebaseUser = await admin.auth().createUser({
      email: dto.email,
      emailVerified: false,
    });

    const passwordResetLink = await admin
      .auth()
      .generatePasswordResetLink(dto.email);

    const user = this.usersRepository.create({
      firebase_uid: firebaseUser.uid,
      email: dto.email,
      full_name: dto.full_name,
      role: UserRole.AGENT,
    });

    const saved = await this.usersRepository.save(user);

    return { ...saved, passwordResetLink };
  }

  async deactivateAgent(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.AGENT) {
      throw new ForbiddenException('Can only deactivate agents');
    }

    await admin.auth().revokeRefreshTokens(user.firebase_uid);

    user.is_active = false;
    return this.usersRepository.save(user);
  }

  async findAllAgents(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: UserRole.AGENT },
      order: { created_at: 'DESC' },
    });
  }
}
