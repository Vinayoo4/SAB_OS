export type ModelTier = 'Tier0' | 'Tier1' | 'Tier2' | 'Tier3';

export interface RouteResult {
  tier: ModelTier;
  targetModel: string;
  reasoning: string;
}

export class ModelRouter {
  public static routeTask(taskDescription: string, complexityScore: number): RouteResult {
    // Tier 0: Deterministic / Regex / Math
    if (complexityScore === 0) {
      return {
        tier: 'Tier0',
        targetModel: 'local_code',
        reasoning: 'Deterministic task requiring 0 tokens.'
      };
    }

    // Tier 1: Fast SLM (e.g. Gemini Flash, Claude Haiku)
    if (complexityScore <= 3) {
      return {
        tier: 'Tier1',
        targetModel: 'gemini-flash',
        reasoning: 'Low complexity. Requires fast intent classification.'
      };
    }

    // Tier 2: Frontier LLM (e.g. Claude 3.5 Sonnet, GPT-4o)
    if (complexityScore <= 8) {
      return {
        tier: 'Tier2',
        targetModel: 'claude-3-5-sonnet',
        reasoning: 'High depth required for architecture/compliance design.'
      };
    }

    // Tier 3: Local Vision
    return {
      tier: 'Tier3',
      targetModel: 'florence-2',
      reasoning: 'Visual coordinate detection offloaded locally.'
    };
  }
}
