import json
import sys
import random

def run_backtest(params):
    asset = params.get("asset", "UNKNOWN")
    timeframes = params.get("timeframes", ["1m", "3m", "5m"])
    capital = params.get("capital", 25000)

    print(f"[Quant Sandbox] Initializing strategy for {asset} on {', '.join(timeframes)}")

    # Paper-trading hard cap logic
    max_daily_drawdown_limit = 0.02 * capital # 2% daily drawdown

    print(f"[Quant Sandbox] 2% Daily Drawdown Hard Cap Set: ${max_daily_drawdown_limit:.2f}")

    # Dummy mock trading loop results
    win_rate = random.uniform(45.0, 75.0)
    simulated_drawdown = random.uniform(0.5, 3.5) * (capital / 100)

    result = {
        "status": "success",
        "asset": asset,
        "capital_allocated": capital,
        "metrics": {
            "sharpe_ratio": round(random.uniform(0.8, 2.5), 2),
            "win_rate": round(win_rate, 2),
            "max_drawdown_amount": round(simulated_drawdown, 2)
        },
        "execution_rules": {
            "stop_loss": True,
            "take_profit": True
        }
    }

    if simulated_drawdown > max_daily_drawdown_limit:
        result["status"] = "HALTED"
        result["message"] = "Daily drawdown limit exceeded. Trading halted."

    return result

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            params = json.loads(sys.argv[1])
            res = run_backtest(params)
            print(json.dumps(res))
        except Exception as e:
            print(json.dumps({"status": "error", "message": str(e)}))
    else:
        # Default mock run
        res = run_backtest({"asset": "BTC/USDT", "capital": 25000})
        print(json.dumps(res))
