import { Body, Controller, Post } from '@nestjs/common';
import { AiMealPlanService } from './ai-meal-plan.service';
import type { CreateMealPlanDto } from './dto/create-meal-plan.dto';

@Controller('ai/meal-plan')
export class AiMealPlanController {
  constructor(private readonly aiMealPlanService: AiMealPlanService) {}

  @Post()
  create(@Body() body: CreateMealPlanDto) {
    return this.aiMealPlanService.generateMealPlan(body);
  }
}
