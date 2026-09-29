import { useEffect } from 'react';
import type { Node } from '@/types/network';
export default function useNetworkTool(
  choose: (id: string) => void,
  nodeMap: Map<string, Node>,
) {
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (tool: unknown, options: unknown) => unknown;
        };
      }
    ).modelContext;
    if (!context) return;
    const controller = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: 'explore_network_node',
            title: 'Explore a network node',
            description:
              'Select a person or company and show its public connections and source receipts.',
            inputSchema: {
              type: 'object',
              properties: { nodeId: { type: 'string' } },
              required: ['nodeId'],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: true },
            execute: (input: unknown) => {
              const id = (input as { nodeId?: unknown })?.nodeId;
              if (typeof id !== 'string' || !nodeMap.has(id))
                throw new Error('Unknown nodeId');
              choose(id);
              return { selected: nodeMap.get(id)?.name, nodeId: id };
            },
          },
          { signal: controller.signal },
        ),
      ).catch(() => {});
    } catch {
      // Optional browser integration must not block graph exploration.
    }
    return () => controller.abort();
  }, [choose, nodeMap]);
}
