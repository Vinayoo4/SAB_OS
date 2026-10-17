import { ModelRouter } from "./model_router";
import { EpistemicMemoryEngine } from "./memory_engine";
import { SelfEditingEngine } from "./self_editing_engine";

export class Orchestrator {
  private memoryEngine: EpistemicMemoryEngine;
  private selfEditingEngine: SelfEditingEngine;

  constructor() {
    this.memoryEngine = new EpistemicMemoryEngine();
    this.selfEditingEngine = new SelfEditingEngine();
  }

  public async startServer(port: number = 8080) {
    console.log(`[Orchestrator] Starting background HTTP server on port ${port}...`);

    Bun.serve({
      port,
      fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/dispatch") {
          return new Response("Task Dispatched", { status: 200 });
        }
        return new Response("SAB-OS Orchestrator", { status: 200 });
      },
    });
  }

  public scheduleTask(taskDescription: string, complexityScore: number) {
    const route = ModelRouter.routeTask(taskDescription, complexityScore);
    console.log(`[Orchestrator] Task routed to ${route.tier}: ${route.targetModel}`);

    // Memory fetch integration example
    const flash = this.memoryEngine.getMemoryFlash('general');
    if (flash.length > 0) {
      console.log(`[Orchestrator] Memory Flash: ${JSON.stringify(flash)}`);
    }

    // Task execution logic would be here

    // Post-execution archive
    this.memoryEngine.archiveSession({
      session_id: Date.now().toString(),
      domain: 'general',
      key_decisions: `Task handled via ${route.targetModel}`,
      semantic_tags: 'task, executed'
    });
  }
}

// Example usage
if (import.meta.main) {
  const orchestrator = new Orchestrator();
  orchestrator.startServer();
  orchestrator.scheduleTask("Analyze financial statements", 7);
}
