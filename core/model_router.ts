export type ModelTier = 'Tier0' | 'Tier1' | 'Tier2' | 'Tier3';

export interface RouteResult {
  tier: ModelTier;
  targetModel: string;
  reasoning: string;
  costEstimateTokens: number;
}

export class ModelRouter {
  private openRouterApiKey: string | undefined;
  private monidApiKey: string | undefined;
  private monidBaseUrl: string | undefined;

  constructor() {
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY;
    this.monidApiKey = process.env.MONID_API_KEY;
    this.monidBaseUrl = process.env.MONID_BASE_URL;
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
      const targetModel = this.monidApiKey ? 'monid_fast' : (this.openRouterApiKey ? 'google/gemini-flash-1.5' : 'http://localhost:11434/llama3');
      return {
        tier: 'Tier1',
        targetModel,
        reasoning: 'Low complexity. Requires fast intent classification.',
        costEstimateTokens: 150
      };
    }

    // Tier 2: Frontier LLM (e.g. Claude 3.5 Sonnet, GPT-4o)
    if (complexityScore <= 8) {
      if (this.monidApiKey) {
        return {
          tier: 'Tier2',
          targetModel: 'monid_frontier',
          reasoning: 'High depth required for architecture/compliance design (Monid).',
          costEstimateTokens: 2000
        };
      }

      if (!this.openRouterApiKey) {
         console.warn("[Router] No OPENROUTER_API_KEY found, falling back to local tier 1.");
         return {
           tier: 'Tier1',
           targetModel: 'http://localhost:11434/llama3',
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
