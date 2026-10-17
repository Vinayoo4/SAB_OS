export interface FssaiCheckSchema {
  business_name: string;
  annual_turnover: number;
}

export interface LmpcCheckSchema {
  product_name: string;
  labels_present: string[];
}

export class FoodSafetyComplianceSkill {
  public name = "check_food_safety_compliance";
  public description = "Evaluates FSSAI licensing tier and LMPC Packaged Commodity Label rules.";

  public async evaluate_fssai(params: FssaiCheckSchema): Promise<string> {
    const threshold_basic = 1200000; // ₹12 Lakh
    let license_tier = "Central/State License Required";

    if (params.annual_turnover <= threshold_basic) {
      license_tier = "Basic FSSAI Registration";
    }

    return `FSSAI Tier for ${params.business_name}: ${license_tier}`;
  }

  public async evaluate_lmpc(params: LmpcCheckSchema): Promise<string> {
    const mandatory_labels = [
      "manufacturer_details",
      "net_weight",
      "mrp",
      "manufacturing_date",
      "expiry_date",
      "customer_care",
      "ingredients",
      "vegetarian_mark",
      "nutritional_info"
    ];

    const missing_labels = mandatory_labels.filter(label => !params.labels_present.includes(label));

    if (missing_labels.length === 0) {
      return `LMPC Compliance for ${params.product_name}: PASSED (All 9 declarations present)`;
    } else {
      return `LMPC Compliance for ${params.product_name}: FAILED. Missing: ${missing_labels.join(', ')}`;
    }
  }
}
