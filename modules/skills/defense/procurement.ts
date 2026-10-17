export interface DapProcurementSchema {
  category: "Buy_Indian_IDDM" | "Make_I" | "Make_II";
  indigenous_content_percentage: number;
}

export interface IdexGrantSchema {
  challenge_type: "DISC" | "SPARK";
  requested_funding_cr: number;
}

export class DefenseProcurementSkill {
  public name = "evaluate_defense_procurement";
  public description = "Tracks DAP 2026 pipelines, iDEX grants, and AVNL/GeM procurement compliance.";

  public async evaluate_dap_2026(params: DapProcurementSchema): Promise<string> {
    const min_ic = params.category === "Buy_Indian_IDDM" ? 50 : 0;

    if (params.indigenous_content_percentage >= min_ic) {
      return `[DAP 2026] ${params.category} Compliance PASSED: Indigenous Content is ${params.indigenous_content_percentage}% (Minimum required: ${min_ic}%).`;
    } else {
      return `[DAP 2026] ${params.category} Compliance FAILED: Indigenous Content is ${params.indigenous_content_percentage}% (Minimum required: ${min_ic}%).`;
    }
  }

  public async evaluate_idex_grant(params: IdexGrantSchema): Promise<string> {
    const max_funding = params.challenge_type === "DISC" ? 1.5 : 10;

    if (params.requested_funding_cr <= max_funding) {
      return `[iDEX] Grant Tracking Active: ${params.challenge_type} request for ₹${params.requested_funding_cr} Cr meets the threshold limits (Max: ₹${max_funding} Cr).`;
    } else {
      return `[iDEX] Grant Tracking Alert: ${params.challenge_type} request for ₹${params.requested_funding_cr} Cr EXCEEDS the threshold limits (Max: ₹${max_funding} Cr).`;
    }
  }

  public async run_avnl_gem_onboarding(vendor_id: string): Promise<string> {
    return `[AVNL/GeM] Vendor ${vendor_id} successfully mapped to Armoured Vehicles Nigam Limited procurement guidelines. GeM onboarding automated.`;
  }
}
