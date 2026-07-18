import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import type {
  CreateMealPlanDto,
  GeneratedMealPlanDto,
} from './dto/create-meal-plan.dto';

@Injectable()
export class AiMealPlanService {
  private readonly provider = process.env.AI_PROVIDER ?? 'openai';
  private readonly apiKey = process.env.AI_API_KEY;
  private readonly model = process.env.AI_MODEL ?? 'gpt-4o-mini';
  private readonly baseUrl =
    process.env.AI_BASE_URL ?? 'https://api.openai.com/v1/chat/completions';
  private readonly azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  private readonly azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  private readonly azureApiVersion =
    process.env.AZURE_OPENAI_API_VERSION ?? '2024-10-21';

  async generateMealPlan(input: CreateMealPlanDto): Promise<GeneratedMealPlanDto> {
    if (!input?.childInfo || !input?.mealSettings || !Array.isArray(input?.fridgeItems)) {
      throw new BadRequestException('요청 형식이 올바르지 않습니다.');
    }
    if (!this.apiKey) {
      throw new ServiceUnavailableException(
        'AI 설정이 누락되었습니다. 관리자에게 문의해주세요.',
      );
    }

    const prompt = this.buildPrompt(input);
    const response = await fetch(this.resolveUrl(), {
      method: 'POST',
      headers: this.resolveHeaders(),
      body: JSON.stringify(this.resolveRequestBody(prompt)),
    });

    if (!response.ok) {
      throw new BadGatewayException(
        'AI 식단 생성에 실패했습니다. 잠시 후 다시 시도해주세요.',
      );
    }

    const data = await response.json();
    const content = this.extractContent(data);
    const parsed = this.parseAiJson(content);

    return {
      shoppingList: Array.isArray(parsed.shoppingList)
        ? parsed.shoppingList.filter((item): item is string => typeof item === 'string')
        : [],
      menus: Array.isArray(parsed.menus)
        ? parsed.menus
            .filter(
              (item): item is { day: number; menu: string } =>
                typeof item?.day === 'number' && typeof item?.menu === 'string',
            )
            .map((item) => ({ day: item.day, menu: item.menu }))
        : [],
    };
  }

  private resolveUrl(): string {
    if (this.isResponsesApi()) {
      return this.baseUrl;
    }

    if (this.provider !== 'azure-openai') {
      return this.baseUrl;
    }

    if (!this.azureEndpoint || !this.azureDeployment) {
      throw new ServiceUnavailableException(
        'Azure OpenAI 설정이 누락되었습니다. 관리자에게 문의해주세요.',
      );
    }

    const endpoint = this.azureEndpoint.replace(/\/$/, '');
    return `${endpoint}/openai/deployments/${this.azureDeployment}/chat/completions?api-version=${this.azureApiVersion}`;
  }

  private resolveHeaders(): Record<string, string> {
    if (this.isResponsesApi() || this.provider === 'azure-openai') {
      return {
        'Content-Type': 'application/json',
        'api-key': this.apiKey ?? '',
      };
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  private resolveRequestBody(prompt: string): Record<string, unknown> {
    if (this.isResponsesApi()) {
      return {
        model: this.model,
        input: prompt,
      };
    }

    const messages = [
      {
        role: 'system',
        content: '너는 유아용 식단 보조 도우미다. 반드시 JSON 문자열만 반환한다.',
      },
      { role: 'user', content: prompt },
    ];

    if (this.provider === 'azure-openai') {
      return { messages };
    }

    return {
      temperature: 0.4,
      messages,
      model: this.model,
    };
  }

  private buildPrompt(input: CreateMealPlanDto): string {
    const fridgeText =
      input.fridgeItems.length > 0
        ? input.fridgeItems
            .map((item) => `${item.name}(${item.quantity}, ${item.status})`)
            .join(', ')
        : '없음';

    return [
      '아래 정보를 바탕으로 아이 식단을 추천해줘.',
      `생년월일: ${input.childInfo.birthDate || '미입력'}`,
      `좋아하는 음식: ${input.childInfo.likedFoods || '없음'}`,
      `못먹는 음식: ${input.childInfo.dislikedFoods || '없음'}`,
      `알러지: ${input.childInfo.allergies || '없음'}`,
      `요청 일수: ${input.mealSettings.daysForMeal || '1'}일`,
      `사용 가능 재료: ${input.mealSettings.ingredients || '없음'}`,
      `냉장고 재고: ${fridgeText}`,
      '규칙: 알러지는 반드시 제외, 못먹는 음식은 가능하면 제외.',
      '응답 JSON 형식: {"shoppingList":["..."],"menus":[{"day":1,"menu":"..."}]}',
    ].join('\n');
  }

  private parseAiJson(content: unknown): {
    shoppingList?: unknown[];
    menus?: Array<{ day: number; menu: string }>;
  } {
    if (typeof content !== 'string' || content.trim().length === 0) {
      return {};
    }

    const trimmed = content.trim();
    try {
      return JSON.parse(trimmed);
    } catch {
      const match = trimmed.match(/\{[\s\S]*\}/);
      if (!match) {
        return {};
      }
      try {
        return JSON.parse(match[0]);
      } catch {
        return {};
      }
    }
  }

  private extractContent(data: unknown): string | undefined {
    if (this.isResponsesApi()) {
      if (typeof (data as { output_text?: unknown })?.output_text === 'string') {
        return (data as { output_text: string }).output_text;
      }

      const output = (data as { output?: unknown[] })?.output;
      if (!Array.isArray(output)) {
        return undefined;
      }

      for (const item of output) {
        const content = (item as { content?: unknown[] })?.content;
        if (!Array.isArray(content)) {
          continue;
        }

        for (const entry of content) {
          if (typeof (entry as { text?: unknown })?.text === 'string') {
            return (entry as { text: string }).text;
          }
        }
      }

      return undefined;
    }

    const choices = (data as { choices?: unknown[] })?.choices;
    const firstChoice = Array.isArray(choices) ? choices[0] : undefined;
    const message = (firstChoice as { message?: { content?: unknown } })?.message;
    const content = message?.content;
    return typeof content === 'string' ? content : undefined;
  }

  private isResponsesApi(): boolean {
    return this.baseUrl.includes('/responses');
  }
}
