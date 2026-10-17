import { describe, expect, it } from "bun:test";
import { QuantBacktesterSkill } from "../modules/skills/trading/quant_backtester";

describe("Quantitative Trading Node & Risk Safeguards", () => {

    it("should parse backtest result from python script", async () => {
        const skill = new QuantBacktesterSkill();
        const res = await skill.execute({ asset: "BTC", strategy: "momentum", timeframes: ["1m", "5m"], capital: 25000 });

        // Either it succeeds or halts based on the random generator in the python script.
        const isValidResponse = res.includes("Backtest/Trade complete") || res.includes("TRADING HALTED");
        expect(isValidResponse).toBe(true);
    });

    it("should mock live connection correctly", async () => {
        const skill = new QuantBacktesterSkill();
        const res = await skill.connect_live_stream({ provider: "zerodha", assets: ["RELIANCE", "HDFCBANK"] });

        expect(res).toContain("Connected to zerodha");
    });
});
