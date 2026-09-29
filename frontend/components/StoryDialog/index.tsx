import type { GraphData, Node } from '@/types/network';
import type useStoryDialog from '@/hooks/useStoryDialog';
import Avatar from '@/components/Avatar';
export default function StoryDialog({
  data,
  author,
  story,
  onSelect: choose,
}: {
  data: GraphData;
  author: Node;
  story: ReturnType<typeof useStoryDialog>;
  onSelect: (id: string) => void;
}) {
  const { dialog, scroll, storyMode, onStoryClose, pauseStory } = story;
  return (
    <dialog
      ref={dialog}
      id="rahul-story"
      className={`story-modal ${storyMode === 'bubble' ? 'story-bubble' : ''}`}
      onClose={onStoryClose}
      aria-labelledby="story-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            dialog.current?.close();
        }
      }}>
      <div className="story-shell">
        <button
          className="close story-close"
          aria-label="Close about"
          title="Close (Esc)"
          autoFocus
          onClick={() => dialog.current?.close()}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
        <div className="story-scroll" ref={scroll}>
          <div className="story-author">
            <Avatar node={author} />
            <span>
              <strong>A note from Rahul</strong>
              <small>ON PEOPLE, TRUST & OPPORTUNITY</small>
            </span>
          </div>
          <h2 id="story-title">
            What the Social Graph <em>Knows</em>
          </h2>
          <p className="story-lead">
            <strong>
              People already vouch for each other online. Connecting those
              moments reveals a lot.
            </strong>
          </p>
          <div className="story-body">
            <p>
              The social graph is such a powerful thing. There are so many
              useful signals hidden in who we know, who we’ve worked with, and
              what people have said about us.
            </p>
            <p>
              Wanna hire someone, say Rahul? Click on his{' '}
              <button
                className="inline-node-link"
                onClick={() => {
                  pauseStory();
                  choose(author.id);
                }}>
                node
              </button>
              . You can see his work, the people who vouch for him, who he’s
              worked with, and the companies he’s connected to. That can be
              useful for hiring, investing, and a bunch of other things in the
              startup world.
            </p>
            <p>
              It works the other way too. Wanna work at a company like OpenAI?
              Explore its connections. Maybe someone you know works there. Maybe
              someone in your network knows someone there. Suddenly the company
              feels a little closer.
            </p>
            <p>
              The part I find really interesting is that I didn’t have to ask
              anyone for testimonials to build this.
            </p>
            <p>These posts already existed.</p>
            <p>
              People naturally recommend each other on X, appreciate someone’s
              work, talk about things they built together, or tell others they
              should hire someone.
            </p>
            <p>
              I used Grok to find and export some of these posts from X, checked
              the sources, and connected the people and companies into this
              graph. You can follow each connection back to its source.
            </p>
            <p>
              And this is with pretty limited data. Imagine what the graph
              starts looking like when you connect more of these moments.
            </p>
            <p>
              That’s partly how I think about Cosign, and it’s also the idea
              behind{' '}
              <a href="https://bakd.work/" target="_blank" rel="noreferrer">
                bakd.work
              </a>
              , my little pet project.
            </p>
            <p>
              I think these signals can tell you things a résumé alone can’t.
              Startups already hire through referrals and word of mouth all the
              time. A graph like this could help you discover people, filter
              applications, understand someone’s network, or find a path to
              someone you want to meet.
            </p>
            <p>There are so many directions you could take this.</p>
            <p className="story-signoff">
              But mostly, I just love this graph &lt;3
            </p>
          </div>
          <details className="story-sources">
            <summary>
              About the data{' '}
              <span>
                {data.nodes.filter((n) => n.type === 'person').length} people ·{' '}
                {data.nodes.filter((n) => n.type === 'organization').length}{' '}
                companies
              </span>
            </summary>
            <p>
              A curated snapshot · September 29, 2026. Connections link to
              reviewed public sources. “Worked together” includes named projects
              and collaborations; it does not always mean employment. A shared
              company alone does not prove collaboration. Praise is someone’s
              opinion, and a quiet public profile says nothing about a person’s
              ability.
            </p>
          </details>
          <div className="story-actions">
            <span>A small world, worth exploring.</span>
            <button
              onClick={() => {
                dialog.current?.close();
              }}>
              Explore the network <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
