import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { User } from '../users/user.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto, currentUser: User): Promise<Category> {
    const existing = await this.categoriesRepository.findOne({
      where: {
        name: dto.name,
        organization: { id: currentUser.organization.id },
      },
    });
    if (existing) {
      throw new ConflictException('Category already exists');
    }
    const category = this.categoriesRepository.create({
      ...dto,
      organization: { id: currentUser.organization.id },
    });
    return this.categoriesRepository.save(category);
  }

  async findAll(currentUser: User): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { organization: { id: currentUser.organization.id } },
      order: { created_at: 'DESC' },
    });
  }

  async deactivate(id: number, currentUser: User): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id, organization: { id: currentUser.organization.id } },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    category.is_active = false;
    return this.categoriesRepository.save(category);
  }

  async findActive(orgUuid: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { is_active: true, organization: { uuid: orgUuid } },
      order: { name: 'ASC' },
    });
  }
}
