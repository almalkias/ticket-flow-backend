import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './organization.entity';
import { User, UserRole } from '../users/user.entity';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgsRepository: Repository<Organization>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async register(dto: RegisterOrganizationDto): Promise<Organization> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.admin_email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const org = this.orgsRepository.create({ name: dto.org_name });
    const savedOrg = await this.orgsRepository.save(org);

    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email: dto.admin_email,
        password: dto.admin_password,
        emailVerified: true,
      });
    } catch {
      await this.orgsRepository.remove(savedOrg);
      throw new ConflictException('Email already in use');
    }

    const user = this.usersRepository.create({
      firebase_uid: firebaseUser.uid,
      email: dto.admin_email,
      full_name: dto.admin_full_name,
      role: UserRole.ADMIN,
      organization: savedOrg,
    });
    await this.usersRepository.save(user);

    return savedOrg;
  }
}
