import Network from '@/screens/Network';
import graph from '@/public/graph.json';
import type { GraphData } from '@/types/network';
export default function Page() {
  return <Network data={graph as GraphData} />;
}
