import { ModelRouter } from "./model_router";
import { EpistemicMemoryEngine } from "./memory_engine";
import { SelfEditingEngine } from "./self_editing_engine";

export class Orchestrator {
  private memoryEngine: EpistemicMemoryEngine;
  private selfEditingEngine: SelfEditingEngine;
  private modelRouter: ModelRouter;

  constructor() {
    this.memoryEngine = new EpistemicMemoryEngine();
    this.selfEditingEngine = new SelfEditingEngine();
    this.modelRouter = new ModelRouter();
  }

  public async startServer(port: number = 8080) {
    console.log(`[Orchestrator] Starting background HTTP/WebSocket server on port ${port}...`);

    Bun.serve({
      port,
      fetch(req, server) {
        if (server.upgrade(req)) {
          return; // do not return a Response
        }

        const url = new URL(req.url);
        if (url.pathname === "/dispatch") {
          return new Response("Task Dispatched", { status: 200 });
        }
        return new Response("SAB-OS Orchestrator", { status: 200 });
      },
      websocket: {
        open(ws) {
          console.log(`[WebSocket] Franchise POS Connected`);
          ws.send(JSON.stringify({ type: "SYNC_ACK", message: "Connected to SAB-OS" }));
        },
        message(ws, message) {
          console.log(`[WebSocket] Received from POS: ${message}`);
          try {
            const data = JSON.parse(message as string);
            if (data.type === "TRANSACTION_SYNC") {
              console.log(`[WebSocket] Syncing ${data.transactions.length} offline transactions...`);
              // Archive offline transactions in memory engine
              ws.send(JSON.stringify({ type: "SYNC_SUCCESS", count: data.transactions.length }));
            }
          } catch(e) {
            console.error(`[WebSocket] Error parsing message:`, e);
          }
        },
        close(ws) {
          console.log(`[WebSocket] Franchise POS Disconnected`);
        }
      }
    });
  }

  public scheduleTask(taskDescription: string, complexityScore: number) {
    const route = this.modelRouter.routeTask(taskDescription, complexityScore);
    console.log(`[Orchestrator] Task routed to ${route.tier}: ${route.targetModel} (Cost Estimate: ${route.costEstimateTokens} tokens)`);

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
}
