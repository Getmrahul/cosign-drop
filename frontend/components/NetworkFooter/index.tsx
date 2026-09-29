import type { GraphData } from '@/types/network';
export default function NetworkFooter({
  data,
  onAbout,
}: {
  data: GraphData;
  onAbout: () => void;
}) {
  return (
    <footer>
      <span>
        <span className="tiny-dot" />
        <span>
          {data.nodes.filter((n) => n.type === 'person').length} people{' '}
          <b className="mx-1 font-normal">·</b>{' '}
          {data.nodes.filter((n) => n.type === 'organization').length} companies
        </span>
      </span>
      <span className="instructions">
        Drag to explore <b>·</b> Two-finger scroll to pan <b>·</b> Pinch to zoom
      </span>
      <div className="story-entry">
        <button className="about-entry" onClick={onAbout}>
          About this network
        </button>
      </div>
    </footer>
  );
}
