import { Module } from '@nestjs/common';
import { AiMealPlanController } from './ai-meal-plan.controller';
import { AiMealPlanService } from './ai-meal-plan.service';

@Module({
  controllers: [AiMealPlanController],
  providers: [AiMealPlanService],
})
export class AiMealPlanModule {}
