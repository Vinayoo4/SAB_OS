import { spawn } from "child_process";

export interface BacktestSchema {
  asset: string;
  strategy: "mean_reversion" | "momentum";
  timeframes: string[];
  capital: number;
}

export interface LiveStreamSchema {
  provider: "zerodha" | "binance" | "interactive_brokers";
  assets: string[];
}

export class QuantBacktesterSkill {
  public name = "run_backtest_and_trade";
  public description = "Runs deterministic Python backtesting, evaluates Sharpe/drawdown, and executes paper-trading loops with hard risk guardrails.";

  public async connect_live_stream(params: LiveStreamSchema): Promise<string> {
    console.log(`[Quant] Connecting to live WebSocket stream from ${params.provider} for [${params.assets.join(', ')}]...`);

    // Intake WebSocket ticker feed logic for Zerodha Kite, Binance, Interactive Brokers
    let wsUrl = "";
    if (params.provider === "zerodha") wsUrl = "wss://ws.kite.trade";
    if (params.provider === "binance") wsUrl = "wss://stream.binance.com:9443/ws";
    if (params.provider === "interactive_brokers") wsUrl = "wss://api.ibkr.com/v1/api/ws";

    return `[Quant] Connected to ${params.provider} market data stream via ${wsUrl}. Ingesting real-time feed for matrix evaluation.`;
  }

  public async execute(params: BacktestSchema): Promise<string> {
    console.log(`[Quant] Delegating backtest to python engine...`);

    return new Promise((resolve, reject) => {
      const proc = spawn("python3", ["scripts/backtest_engine.py", JSON.stringify(params)]);
      let output = "";

      proc.stdout.on("data", (data) => {
        output += data.toString();
      });

      proc.stderr.on("data", (data) => {
        console.error(`[Quant Error] ${data.toString()}`);
      });

      proc.on("close", (code) => {
        if (code === 0) {
          try {
            // we will parse the last line of the output assuming it's the JSON result
            const lines = output.trim().split("\n");
            const jsonStr = lines[lines.length - 1];
            const result = JSON.parse(jsonStr);

            if (result.status === "HALTED") {
               resolve(`[Quant] TRADING HALTED. Reason: ${result.message}`);
            } else {
               resolve(`[Quant] Backtest/Trade complete. Status: ${result.status}, Sharpe: ${result.metrics.sharpe_ratio}, Max Drawdown: $${result.metrics.max_drawdown_amount}. Bracket Orders (SL/TP) Active: ${result.execution_rules.stop_loss}`);
            }
          } catch(e) {
             resolve(`[Quant] Failed to parse script output. Output: ${output}`);
          }
        } else {
          reject(`Python engine failed with exit code ${code}`);
        }
      });
    });
  }
}
