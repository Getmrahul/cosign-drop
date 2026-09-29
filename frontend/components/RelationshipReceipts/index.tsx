import type { CSSProperties } from 'react';
import type { Node, Edge, Source } from '@/types/network';
import PersonLink from '@/components/PersonLink';
import { TYPES, groupReceipts } from '@/utils/relationships';
import { prettyDate } from '@/utils/format';
export default function RelationshipReceipts({
  list,
  selected,
  nodeMap,
  sources,
  onSelect: choose,
}: {
  list: Edge[];
  selected: string;
  nodeMap: Map<string, Node>;
  sources: Map<string, Source>;
  onSelect: (id: string) => void;
}) {
  return groupReceipts(list).map((group) => {
    const e = group[0],
      author = nodeMap.get(e.source)!;
    const recipients = [...new Set(group.map((edge) => edge.target))].map(
      (id) => nodeMap.get(id)!,
    );
    const source = sources.get(e.source_ids[0]);
    const verb =
      e.type === 'career_support'
        ? 'Credits'
        : e.type === 'vouch'
          ? 'Vouches for'
          : e.type === 'worked_with'
            ? 'Collaborated with'
            : 'Praises';
    const category =
      e.type === 'career_support'
        ? 'Career support'
        : e.type === 'vouch'
          ? 'Vouch'
          : e.type === 'worked_with'
            ? 'Worked together'
            : 'Praise';
    const showRecipients = e.source === selected;
    const recipientLabel =
      e.type === 'vouch'
        ? `Vouched for by ${author.name}`
        : e.type === 'praise'
          ? `Praised by ${author.name}`
          : e.type === 'career_support'
            ? `Credited by ${author.name}`
            : `Collaborated with ${author.name}`;
    return (
      <article
        className="receipt"
        key={e.id}
        data-edge-ids={group.map((edge) => edge.id).join(' ')}
        tabIndex={-1}>
        <div className="receipt-author receipt-people">
          {showRecipients ? (
            recipients.map((recipient) => (
              <div key={recipient.id}>
                {
                  <PersonLink
                    node={recipient}
                    subtitle={recipientLabel}
                    onSelect={choose}
                  />
                }
              </div>
            ))
          ) : (
            <PersonLink
              node={author}
              subtitle="Author of this post"
              onSelect={choose}
            />
          )}
        </div>
        {!showRecipients && (
          <p className="receipt-context">
            {verb}{' '}
            {recipients.map((recipient, i) => (
              <span key={recipient.id}>
                {i > 0 ? ', ' : ''}
                <button onClick={() => choose(recipient.id)}>
                  {recipient.name}
                </button>
              </span>
            ))}
          </p>
        )}
        {source?.excerpt && (
          <div className="quote-panel">
            <span className="quote-attribution">{author.name} said</span>
            <blockquote>“{source.excerpt}”</blockquote>
          </div>
        )}
        {e.type === 'worked_with' && e.context && (
          <p className="receipt-context-note">{e.context}</p>
        )}
        <div className="receipt-meta">
          <span
            className="receipt-type"
            style={{ '--color': TYPES[e.type].color } as CSSProperties}>
            <i />
            {category}
          </span>
          {source && (
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              title="Read the original post">
              {prettyDate(source.date)} · X ↗
            </a>
          )}
        </div>
      </article>
    );
  });
}
