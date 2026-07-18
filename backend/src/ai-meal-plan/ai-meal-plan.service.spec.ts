import { AiMealPlanService } from './ai-meal-plan.service';

describe('AiMealPlanService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.AI_PROVIDER;
    delete process.env.AI_API_KEY;
    delete process.env.AI_MODEL;
    delete process.env.AI_BASE_URL;
    delete process.env.AZURE_OPENAI_ENDPOINT;
    delete process.env.AZURE_OPENAI_DEPLOYMENT;
    delete process.env.AZURE_OPENAI_API_VERSION;
  });

  it('builds prompt with allergy as hard rule and disliked foods as soft rule', async () => {
    process.env.AI_API_KEY = 'test-key';
    process.env.AI_MODEL = 'test-model';
    process.env.AI_BASE_URL = 'https://example.com/v1/chat/completions';

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                shoppingList: ['두부', '당근'],
                menus: [
                  { day: 1, menu: '두부 스크램블' },
                  { day: 2, menu: '당근 볶음밥' },
                ],
              }),
            },
          },
        ],
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const service = new AiMealPlanService();
    await service.generateMealPlan({
      childInfo: {
        birthDate: '2020-01-01',
        dislikedFoods: '가지',
        likedFoods: '계란',
        allergies: '땅콩',
      },
      mealSettings: {
        daysForMeal: '2',
        ingredients: '두부, 당근',
      },
      fridgeItems: [{ name: '두부', quantity: '1모', status: 'fresh' }],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    const prompt = requestBody.messages[1].content as string;

    expect(prompt).toContain('알러지는 반드시 제외');
    expect(prompt).toContain('못먹는 음식은 가능하면 제외');
  });

  it('returns normalized result shape even when ai response omits fields', async () => {
    process.env.AI_API_KEY = 'test-key';
    process.env.AI_MODEL = 'test-model';
    process.env.AI_BASE_URL = 'https://example.com/v1/chat/completions';

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                menus: [{ day: 1, menu: '계란찜' }],
              }),
            },
          },
        ],
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const service = new AiMealPlanService();
    const result = await service.generateMealPlan({
      childInfo: {
        birthDate: '2020-01-01',
        dislikedFoods: '',
        likedFoods: '계란',
        allergies: '',
      },
      mealSettings: {
        daysForMeal: '1',
        ingredients: '계란',
      },
      fridgeItems: [],
    });

    expect(result.shoppingList).toEqual([]);
    expect(result.menus).toEqual([{ day: 1, menu: '계란찜' }]);
  });

  it('uses azure-openai endpoint and api-key header when provider is azure-openai', async () => {
    process.env.AI_PROVIDER = 'azure-openai';
    process.env.AI_API_KEY = 'azure-key';
    process.env.AZURE_OPENAI_ENDPOINT = 'https://example-aoai.openai.azure.com';
    process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt4omini';
    process.env.AZURE_OPENAI_API_VERSION = '2024-10-21';

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                shoppingList: ['감자'],
                menus: [{ day: 1, menu: '감자국' }],
              }),
            },
          },
        ],
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const service = new AiMealPlanService();
    await service.generateMealPlan({
      childInfo: {
        birthDate: '2020-01-01',
        dislikedFoods: '',
        likedFoods: '감자',
        allergies: '우유',
      },
      mealSettings: {
        daysForMeal: '1',
        ingredients: '감자',
      },
      fridgeItems: [],
    });

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    const options = fetchMock.mock.calls[0][1] as {
      headers: Record<string, string>;
      body: string;
    };
    const body = JSON.parse(options.body);

    expect(calledUrl).toBe(
      'https://example-aoai.openai.azure.com/openai/deployments/gpt4omini/chat/completions?api-version=2024-10-21',
    );
    expect(options.headers['api-key']).toBe('azure-key');
    expect(options.headers.Authorization).toBeUndefined();
    expect(body.model).toBeUndefined();
    expect(body.temperature).toBeUndefined();
  });

  it('uses responses endpoint payload and parses output_text when ai base url ends with /responses', async () => {
    process.env.AI_API_KEY = 'response-key';
    process.env.AI_BASE_URL = 'https://kid.services.ai.azure.com/openai/v1/responses';
    process.env.AI_MODEL = 'gpt-5.4-nano';

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        output_text: JSON.stringify({
          shoppingList: ['계란', '우유 대체 두유'],
          menus: [{ day: 1, menu: '계란찜' }],
        }),
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const service = new AiMealPlanService();
    const result = await service.generateMealPlan({
      childInfo: {
        birthDate: '2020-01-01',
        dislikedFoods: '',
        likedFoods: '계란',
        allergies: '우유',
      },
      mealSettings: {
        daysForMeal: '1',
        ingredients: '계란',
      },
      fridgeItems: [],
    });

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    const options = fetchMock.mock.calls[0][1] as {
      headers: Record<string, string>;
      body: string;
    };
    const body = JSON.parse(options.body);

    expect(calledUrl).toBe(
      'https://kid.services.ai.azure.com/openai/v1/responses',
    );
    expect(options.headers['api-key']).toBe('response-key');
    expect(options.headers.Authorization).toBeUndefined();
    expect(body.input).toContain('알러지는 반드시 제외');
    expect(body.model).toBe('gpt-5.4-nano');
    expect(result.shoppingList).toEqual(['계란', '우유 대체 두유']);
    expect(result.menus).toEqual([{ day: 1, menu: '계란찜' }]);
  });
});
