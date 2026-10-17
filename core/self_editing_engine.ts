import { spawn } from "child_process";

export class SelfEditingEngine {
  public async writeSkill(filePath: string, content: string): Promise<boolean> {
    try {
      await Bun.write(filePath, content);
      return true;
    } catch (e) {
      console.error(`[SelfEdit] Failed to write skill to ${filePath}:`, e);
      return false;
    }
  }

  public runTests(): Promise<boolean> {
    return new Promise((resolve) => {
      const proc = spawn("bun", ["test"], { stdio: "inherit" });
      proc.on("close", (code) => {
        if (code === 0) {
          console.log("[SelfEdit] Tests passed. New skill is verified.");
          resolve(true);
        } else {
          console.error("[SelfEdit] Tests failed. Rollback required.");
          resolve(false);
        }
      });
    });
  }
}
