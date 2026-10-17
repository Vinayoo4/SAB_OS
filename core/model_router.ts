export type ModelTier = 'Tier0' | 'Tier1' | 'Tier2' | 'Tier3';

export interface RouteResult {
  tier: ModelTier;
  targetModel: string;
  reasoning: string;
  costEstimateTokens: number;
}

export class ModelRouter {
  private openRouterApiKey: string | undefined;

  constructor() {
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY;
  }

  public routeTask(taskDescription: string, complexityScore: number): RouteResult {
    // Tier 0: Deterministic / Regex / Math
    if (complexityScore === 0) {
      return {
        tier: 'Tier0',
        targetModel: 'local_code',
        reasoning: 'Deterministic task requiring 0 tokens.',
        costEstimateTokens: 0
      };
    }

    // Tier 1: Fast SLM (e.g. Gemini Flash, Claude Haiku, Local Llama 3)
    if (complexityScore <= 3) {
      return {
        tier: 'Tier1',
        targetModel: this.openRouterApiKey ? 'google/gemini-flash-1.5' : 'local_llama_3',
        reasoning: 'Low complexity. Requires fast intent classification.',
        costEstimateTokens: 150
      };
    }

    // Tier 2: Frontier LLM (e.g. Claude 3.5 Sonnet, GPT-4o)
    if (complexityScore <= 8) {
      if (!this.openRouterApiKey) {
         console.warn("[Router] No OPENROUTER_API_KEY found, falling back to local tier 1.");
         return {
           tier: 'Tier1',
           targetModel: 'local_llama_3',
           reasoning: 'Fallback to local due to missing API key.',
           costEstimateTokens: 500
         };
      }
      return {
        tier: 'Tier2',
        targetModel: 'anthropic/claude-3.5-sonnet',
        reasoning: 'High depth required for architecture/compliance design.',
        costEstimateTokens: 2000
      };
    }

    // Tier 3: Local Vision
    return {
      tier: 'Tier3',
      targetModel: 'florence-2',
      reasoning: 'Visual coordinate detection offloaded locally.',
      costEstimateTokens: 0
    };
  }
}
