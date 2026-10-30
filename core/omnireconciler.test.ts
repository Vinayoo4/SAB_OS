import { describe, expect, it } from "bun:test";
import { GstReconcilerSkill } from "../modules/skills/finance/gst_reconciler";
import { FoodSafetyComplianceSkill } from "../modules/skills/finance/food_safety";
import { CscServicesSkill } from "../modules/skills/finance/csc_services";

describe("Omnichannel Taxation & Compliance Skills", () => {

    it("should calculate correct GST and TDS amounts", async () => {
        const skill = new GstReconcilerSkill();
        const res = await skill.execute({
            marketplace: "amazon",
            month: "Oct",
            year: 2024,
            total_sales: 100000,
            annual_turnover_inr: 50_00_000,
            business_type: "goods",
            state_category: "regular"
        });
        expect(res).toContain("Section 52 GST TCS (0.5%): ₹500.00");
        expect(res).toContain("Section 194O TDS (0.1%): ₹100.00");
        expect(res).toContain("Section 44AD Presumptive Profit (6%): ₹6000.00");
    });

    it("should properly evaluate FSSAI tier", async () => {
        const skill = new FoodSafetyComplianceSkill();
        const basicRes = await skill.evaluate_fssai({ business_name: "Test", annual_turnover: 1000000 });
        expect(basicRes).toContain("Basic FSSAI Registration");

        const centralRes = await skill.evaluate_fssai({ business_name: "Test", annual_turnover: 1500000 });
        expect(centralRes).toContain("Central/State License Required");
    });

    it("should reject VLE onboarding if missing certificates", async () => {
        const skill = new CscServicesSkill();
        const res = await skill.onboard_vle({ applicant_name: "John", has_tec_certificate: false, has_iibf_certificate: true });
        expect(res).toContain("Telecentre Entrepreneur Course (TEC) certificate is missing");
    });
});
