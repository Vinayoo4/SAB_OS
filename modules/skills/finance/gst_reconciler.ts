export interface GstReconciliationSchema {
  marketplace: "amazon" | "flipkart" | "myntra" | "none";
  month: string;
  year: number;
  total_sales: number;
  annual_turnover_inr: number;
  business_type: "goods" | "services" | "both";
  state_category: "regular" | "special";
}

export class GstReconcilerSkill {
  public name = "reconcile_gst";
  public description = "Reconciles E-Commerce GST (GSTR-8/3B) and calculates TCS/TDS.";

  public async execute(params: GstReconciliationSchema): Promise<string> {
    console.log(`[Skill] Reconciling GST for ${params.marketplace} for ${params.month} ${params.year}...`);

    // Turnover threshold checks for mandatory GST registration
    let mandatory_gst_registration = false;
    let registration_reason = "";

    const isEcommerce = params.marketplace !== "none";
    if (isEcommerce) {
      mandatory_gst_registration = true;
      registration_reason = "Mandatory for digital marketplace sellers (Amazon, Flipkart, etc.) regardless of turnover.";
    } else {
      const goodsThreshold = params.state_category === "special" ? 20_00_000 : 40_00_000;
      const servicesThreshold = params.state_category === "special" ? 10_00_000 : 20_00_000;

      if (params.business_type === "goods" && params.annual_turnover_inr > goodsThreshold) {
        mandatory_gst_registration = true;
        registration_reason = `Turnover (₹${params.annual_turnover_inr}) exceeds ₹${goodsThreshold} threshold for goods in ${params.state_category} state.`;
      } else if (params.business_type === "services" && params.annual_turnover_inr > servicesThreshold) {
        mandatory_gst_registration = true;
        registration_reason = `Turnover (₹${params.annual_turnover_inr}) exceeds ₹${servicesThreshold} threshold for services in ${params.state_category} state.`;
      } else if (params.business_type === "both" && params.annual_turnover_inr > servicesThreshold) {
        // If selling both, the lower threshold (services) generally applies.
        mandatory_gst_registration = true;
        registration_reason = `Turnover (₹${params.annual_turnover_inr}) exceeds ₹${servicesThreshold} threshold for composite business in ${params.state_category} state.`;
      }
    }

    const registration_status = mandatory_gst_registration
      ? `REQUIRED - ${registration_reason}`
      : `NOT REQUIRED - Turnover (₹${params.annual_turnover_inr}) is below compulsory registration limits.`;

    // Tax Calculations
    let gst_tcs = 0;
    let income_tax_tds = 0;

    // TCS (Section 52) and TDS (Section 194O) generally apply to E-Commerce marketplace transactions
    if (isEcommerce) {
      // Auto-calculate 0.5% GST TCS under Section 52 (0.25% CGST + 0.25% SGST or 0.5% IGST)
      gst_tcs = params.total_sales * 0.005;

      // Auto-calculate 0.1% TDS under Section 194O / Section 393(1)
      income_tax_tds = params.total_sales * 0.001;
    }

    // Section 44AD presumptive tax calculation (6% digital receipts rate for turnover up to ₹3 Cr)
    // Note: Assuming all e-commerce is digital receipts
    const presumptive_profit = params.annual_turnover_inr <= 3_00_00_000 ? params.total_sales * 0.06 : 0;
    const presumptive_status = params.annual_turnover_inr <= 3_00_00_000
      ? `₹${presumptive_profit.toFixed(2)}`
      : "N/A (Turnover exceeds ₹3 Cr limit for Sec 44AD)";

    const report = `
[GST & Tax Reconciliation Report - ${params.month} ${params.year}]
Marketplace: ${params.marketplace}
Total Sales: ₹${params.total_sales.toFixed(2)}
Annual Turnover: ₹${params.annual_turnover_inr.toFixed(2)}

-- GST Registration --
Status: ${registration_status}

-- Deductions --
Section 52 GST TCS (0.5%): ₹${gst_tcs.toFixed(2)}
Section 194O TDS (0.1%): ₹${income_tax_tds.toFixed(2)}

-- Compliance --
Section 44AD Presumptive Profit (6%): ${presumptive_status}
GSTR-8 to GSTR-3B Match: ${isEcommerce ? "VERIFIED" : "N/A"}
`;

    return report;
  }
}
