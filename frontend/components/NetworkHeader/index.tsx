import type { Node } from '@/types/network';
import { useState, type ReactNode } from 'react';
import Avatar from '@/components/Avatar';
export default function NetworkHeader({
  author,
  storyOpen,
  storyMode,
  toggleStory,
  search,
}: {
  author: Node;
  storyOpen: boolean;
  storyMode: 'modal' | 'bubble';
  toggleStory: () => void;
  search: ReactNode;
}) {
  const [noteRead, setNoteRead] = useState(false);
  return (
    <header>
      {search}
      <button
        className={'story-launcher' + (noteRead ? '' : ' has-unread-note')}
        aria-label="What the Social Graph Knows — a note from Rahul"
        aria-expanded={storyOpen && storyMode === 'bubble'}
        aria-controls="rahul-story"
        onClick={() => {
          setNoteRead(true);
          toggleStory();
        }}>
        <Avatar node={author} />
        {!noteRead && (
          <span className="note-notification" aria-hidden="true">
            1
          </span>
        )}
        <span className="launcher-bubble">
          <strong>A note from Rahul</strong>
          <small>
            <span className="launcher-title">What the Social Graph Knows</span>
            <span aria-hidden="true">↗</span>
          </small>
        </span>
      </button>
      <div className="heading">
        <h1>
          The Network<span>.</span>
        </h1>
        <p>Good people know good people.</p>
      </div>
    </header>
  );
}
