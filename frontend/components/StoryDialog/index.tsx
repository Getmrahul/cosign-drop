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
  const { dialog, storyMode, onStoryClose } = story;
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
        <div className="story-scroll">
          <div className="story-author">
            <Avatar node={author} />
            <span>
              <strong>A note from Rahul</strong>
              <small>ON PEOPLE, TRUST & OPPORTUNITY</small>
            </span>
          </div>
          <h2 id="story-title">
            What the Social <em>Graph Knows?</em>
          </h2>
          <p className="story-lead">
            The social graph is such a powerful thing. It holds so many signals
            that can be useful for hiring, investing, and so much more in the
            startup world.
          </p>
          <div className="story-body">
            <p>
              Wanna hire someone, say Rahul? Just click on his{' '}
              <button
                className="inline-node-link"
                onClick={() => {
                  dialog.current?.close();
                  choose(author.id);
                }}>
                node
              </button>
              . You’ll see his work, the people who vouch for him, and who he’s
              worked with. Those connections can be powerful signals for hiring.
              Or even for investment.
            </p>
            <p>
              And it works the other way too. Wanna work at a company like
              OpenAI? Explore its connections to see whether someone you know
              works there, and who you could reach out to for an introduction. A
              company starts to feel a little closer when you can see the people
              connecting you to it.
            </p>
            <p>
              What I love is that I didn’t have to ask people for testimonials
              to build this. These posts already existed. They came from how
              people naturally interact with each other on X: recommending
              someone, appreciating their work, or talking about building
              together.
            </p>
            <p>
              I used Grok to find and export these posts from X, then checked
              the sources and connected the people and companies into this
              graph. You can follow each connection back to the original source.
            </p>
            <p>
              Even with this limited data, you can see how cool the graph is,
              and how useful it could be. This is how I think about Cosign, and
              it’s the same idea behind{' '}
              <a href="https://bakd.work" target="_blank" rel="noreferrer">
                bakd.work
              </a>
              , my pet project.
            </p>
            <p>
              I believe these signals can be more powerful than a résumé alone.
              Startups already hire through referrals and word of mouth; they
              often don’t have time for multiple rounds of interviews. This
              could help them find real talent faster, filter applications, or
              explore someone’s network before reaching out.
            </p>
            <p className="story-signoff">
              So many possibilities, but I just love this graph &lt;3
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
        </div>
        <div className="story-actions">
          <span>A small world, worth exploring.</span>
          <button
            onClick={() => {
              dialog.current?.close();
              choose('person:rahulmfg');
            }}>
            Explore my connections <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}
