import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { SelfEditingEngine } from "./self_editing_engine";
import { unlink } from "node:fs/promises";
import { existsSync } from "node:fs";

describe("SelfEditingEngine", () => {
    const engine = new SelfEditingEngine();
    const testFilePath = "modules/skills/test_skill.ts";
    const testContent = "export const test_skill = () => true;";

    afterAll(async () => {
        if (existsSync(testFilePath)) {
            await unlink(testFilePath);
        }
    });

    it("should write a new skill file successfully", async () => {
        const success = await engine.writeSkill(testFilePath, testContent);
        expect(success).toBe(true);
        expect(existsSync(testFilePath)).toBe(true);
    });

});
