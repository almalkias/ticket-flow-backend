import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoriesRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Category already exists');
    }
    const category = this.categoriesRepository.create(dto);
    return this.categoriesRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({ order: { created_at: 'DESC' } });
  }

  async deactivate(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    category.is_active = false;
    return this.categoriesRepository.save(category);
  }

  async findActive(): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
  }
}
