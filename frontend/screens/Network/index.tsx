'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  const story = useStoryDialog(graph.selected);
  const { reframeOverview } = graph;
  useLayoutEffect(() => {
    reframeOverview();
  }, [story.storyOpen, story.storyMode, reframeOverview]);
  const [introComplete, setIntroComplete] = useState(false);
  const introInterrupted = useRef(false);
  const { openStory } = story;
  useEffect(() => {
    if (!graph.ready) return;
    const timer = window.setTimeout(() => {
      setIntroComplete(true);
      if (!introInterrupted.current) openStory('bubble');
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [graph.ready, openStory]);
  function skipIntro() {
    introInterrupted.current = true;
    setIntroComplete(true);
  }
  const { selected, selectedNode, ready, visibleEdges, choose, closeCard } =
    graph;
  const author = graph.nodeMap.get('person:rahulmfg')!;
  useNetworkShortcuts(story.dialog, graph.search, closeCard, graph.setQuery);
  useNetworkTool(choose, graph.nodeMap);
  return (
    <main
      className="workspace"
      data-intro={introComplete ? 'complete' : ready ? 'running' : 'waiting'}
      onPointerDownCapture={skipIntro}
      onKeyDownCapture={skipIntro}>
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
