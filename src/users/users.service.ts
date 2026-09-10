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
    currentUser: User,
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

    const agent = this.usersRepository.create({
      firebase_uid: firebaseUser.uid,
      email: dto.email,
      full_name: dto.full_name,
      role: UserRole.AGENT,
      organization: { id: currentUser.organization.id },
    });

    const saved = await this.usersRepository.save(agent);

    return { ...saved, passwordResetLink };
  }

  async deactivateAgent(id: number, currentUser: User): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        id,
        role: UserRole.AGENT,
        organization: { id: currentUser.organization.id },
      },
    });

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

  async findAllAgents(currentUser: User): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        role: UserRole.AGENT,
        organization: { id: currentUser.organization.id },
      },
      order: { created_at: 'DESC' },
    });
  }
}
