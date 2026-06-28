import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Task } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TASK_EVENTS, TaskDeletedPayload } from './tasks.types';
import { TasksGateway } from './tasks.gateway';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksGateway: TasksGateway,
  ) {}

  async findAll(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, taskId: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (task.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return task;
  }

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        userId,
      },
    });

    this.tasksGateway.emitToUser(userId, TASK_EVENTS.CREATED, task);
    return task;
  }

  async update(
    userId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<Task> {
    await this.findOne(userId, taskId);

    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: dto,
    });

    this.tasksGateway.emitToUser(userId, TASK_EVENTS.UPDATED, task);
    return task;
  }

  async remove(userId: string, taskId: string): Promise<TaskDeletedPayload> {
    await this.findOne(userId, taskId);
    await this.prisma.task.delete({ where: { id: taskId } });

    const payload: TaskDeletedPayload = { id: taskId, userId };
    this.tasksGateway.emitToUser(userId, TASK_EVENTS.DELETED, payload);
    return payload;
  }
}
