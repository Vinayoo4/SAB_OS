import { spawn } from "child_process";

export interface CctvStreamSchema {
  feed_url: string;
}

export class CctvSurveillanceSkill {
  public name = "cctv_surveillance";
  public description = "Connects to IP cameras, runs local Python vision loss prevention logic, and triggers hardware alarms on anomalies.";

  public async analyze_stream(params: CctvStreamSchema): Promise<string> {
    console.log(`[Security] Delegating CCTV analysis to python engine for feed: ${params.feed_url}...`);

    return new Promise((resolve, reject) => {
      const proc = spawn("python3", ["scripts/cctv_analyzer.py", JSON.stringify(params)]);
      let output = "";

      proc.stdout.on("data", (data) => {
        output += data.toString();
      });

      proc.stderr.on("data", (data) => {
        console.error(`[CCTV Error] ${data.toString()}`);
      });

      proc.on("close", async (code) => {
        if (code === 0) {
          try {
            const lines = output.trim().split("\n");
            const jsonStr = lines[lines.length - 1];
            const result = JSON.parse(jsonStr);

            if (result.status === "alert" && result.event === "RUNNER_DETECTED") {
               // Hit the orchestrator bridge to trigger alarms globally
               try {
                 await fetch("http://localhost:8080/api/security/alert", {
                   method: "POST",
                   headers: { "Content-Type": "application/json" },
                   body: JSON.stringify(result)
                 });
                 resolve(`[Security] RUNNER_DETECTED alert dispatched to Orchestrator.`);
               } catch(err) {
                 resolve(`[Security] RUNNER_DETECTED locally but Orchestrator is unreachable.`);
               }
            } else {
               resolve(`[Security] Analysis complete. Status: ${result.status}`);
            }
          } catch(e) {
             resolve(`[Security] Failed to parse script output. Output: ${output}`);
          }
        } else {
          reject(`Python engine failed with exit code ${code}`);
        }
      });
    });
  }
}