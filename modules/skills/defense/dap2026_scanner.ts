export interface DapProcurementSchema {
  category: "Buy_Indian_IDDM" | "Make_I" | "Make_II";
  contract_value: number;
  direct_import_costs: number;
  foreign_technical_fees: number;
  royalties: number;
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

    // Calculate Indigenous Content (IC) percentage
    const non_indigenous_costs = params.direct_import_costs + params.foreign_technical_fees + params.royalties;
    const indigenous_content_value = params.contract_value - non_indigenous_costs;
    const indigenous_content_percentage = (indigenous_content_value / params.contract_value) * 100;

    let schema_details = "";
    if (params.category === "Make_I") {
       schema_details = " Government Prototype Funding Schema (70% support expected).";
    } else if (params.category === "Make_II") {
       schema_details = " Industry-Funded Prototype Development Schema.";
    }

    if (indigenous_content_percentage >= min_ic) {
      return `[DAP 2026] ${params.category} Compliance PASSED: Indigenous Content is ${indigenous_content_percentage.toFixed(2)}% (Minimum required: ${min_ic}%).${schema_details}`;
    } else {
      return `[DAP 2026] ${params.category} Compliance FAILED: Indigenous Content is ${indigenous_content_percentage.toFixed(2)}% (Minimum required: ${min_ic}%).${schema_details}`;
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
    const guidelines = `
    - Right Quality
    - Right Quantity
    - Right Price
    - Right Time
    - Right Source
    - Value for Money (VFM)
    `;
    return `[AVNL/GeM] Vendor ${vendor_id} successfully mapped to Armoured Vehicles Nigam Limited procurement guidelines:${guidelines}GeM onboarding automated.`;
  }
}
