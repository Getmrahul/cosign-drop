'use client';
import { useEffect, useState } from 'react';
import type { GraphData } from '@/types/network';
import useNetworkGraph from '@/hooks/useNetworkGraph';
import useNetworkShortcuts from '@/hooks/useNetworkShortcuts';
import useNetworkTool from '@/hooks/useNetworkTool';
import useStoryDialog from '@/hooks/useStoryDialog';
import NetworkHeader from '@/components/NetworkHeader';
import NetworkFooter from '@/components/NetworkFooter';
import NetworkSearch from '@/components/NetworkSearch';
import NetworkGraph from '@/components/NetworkGraph';
import NetworkControls from '@/components/NetworkControls';
import ProfileCard from '@/components/ProfileCard';
import StoryDialog from '@/components/StoryDialog';
export default function Network({ data }: { data: GraphData }) {
  const graph = useNetworkGraph(data);
  const story = useStoryDialog();
  const [introComplete, setIntroComplete] = useState(false);
  useEffect(() => {
    if (!graph.ready) return;
    const timer = window.setTimeout(() => setIntroComplete(true), 3200);
    return () => window.clearTimeout(timer);
  }, [graph.ready]);
  const { selected, selectedNode, ready, visibleEdges, choose, closeCard } =
    graph;
  const author = graph.nodeMap.get('person:rahulmfg')!;
  useNetworkShortcuts(story.dialog, graph.search, closeCard, graph.setQuery);
  useNetworkTool(choose, graph.nodeMap);
  return (
    <main
      className="workspace"
      data-intro={introComplete ? 'complete' : ready ? 'running' : 'waiting'}
      onPointerDownCapture={() => setIntroComplete(true)}
      onKeyDownCapture={() => setIntroComplete(true)}>
      <NetworkHeader
        author={author}
        storyOpen={story.storyOpen}
        storyMode={story.storyMode}
        toggleStory={story.toggleStory}
        search={
          <NetworkSearch
            search={graph.search}
            query={graph.query}
            setQuery={graph.setQuery}
            found={graph.found}
            onSelect={choose}
          />
        }
      />
      <section
        className={'graph-area' + (selected ? ' has-selection' : '')}
        aria-label="Interactive professional network">
        {selected && (
          <button className="back-network" onClick={closeCard}>
            ← Back to network
          </button>
        )}
        <div className="network-status" role="status">
          {ready
            ? `${visibleEdges.length} connections in view`
            : 'Arranging the network…'}
        </div>
        <NetworkGraph data={data} graph={graph} introComplete={introComplete} />
        <NetworkControls
          filters={graph.filters}
          setFilters={graph.setFilters}
          view={graph.view}
          zoomAt={graph.zoomAt}
          closeCard={closeCard}
          fit={graph.fit}
        />
        {selectedNode && (
          <ProfileCard
            key={selectedNode.id}
            node={selectedNode}
            evidenceFocus={graph.evidenceFocus}
            edges={graph.edges}
            nodeMap={graph.nodeMap}
            sources={graph.sources}
            onSelect={choose}
            onClose={closeCard}
          />
        )}
      </section>
      <NetworkFooter data={data} onAbout={() => story.openStory('modal')} />
      <StoryDialog
        data={data}
        author={author}
        story={story}
        onSelect={choose}
      />
    </main>
  );
}
