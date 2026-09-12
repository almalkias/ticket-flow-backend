import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async createAgent(dto: CreateAgentDto, currentUser: User): Promise<User> {
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

    const agent = this.usersRepository.create({
      firebase_uid: firebaseUser.uid,
      email: dto.email,
      full_name: dto.full_name,
      role: UserRole.AGENT,
      organization: { id: currentUser.organization.id },
    });

    return this.usersRepository.save(agent);
  }

  async updateAgent(
    id: number,
    dto: UpdateAgentDto,
    currentUser: User,
  ): Promise<User> {
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

    if (!dto.is_active) {
      await admin.auth().revokeRefreshTokens(user.firebase_uid);
    }

    user.is_active = dto.is_active;
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
