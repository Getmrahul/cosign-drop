import { useRef } from 'react';
import useEvidenceFocus from '@/hooks/useEvidenceFocus';
import { getNodeRelationships } from '@/utils/relationships';
import type { Node, Edge, Source, EvidenceFocus } from '@/types/network';
import Avatar from '@/components/Avatar';
import PersonLink from '@/components/PersonLink';
import RelationshipReceipts from '@/components/RelationshipReceipts';
export default function ProfileCard({
  node: selectedNode,
  edges,
  nodeMap,
  sources,
  onSelect: choose,
  onClose: closeCard,
  evidenceFocus,
}: {
  evidenceFocus: EvidenceFocus | null;
  node: Node;
  edges: Edge[];
  nodeMap: Map<string, Node>;
  sources: Map<string, Source>;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const selected = selectedNode.id;
  const scrollRef = useRef<HTMLDivElement>(null);
  useEvidenceFocus(scrollRef, evidenceFocus);
  const { affiliations, received, given, support, creditedBy, worked } =
    getNodeRelationships(edges, selected);

  return (
    <aside
      className="detail-card"
      aria-label={`${selectedNode.name} details`}
      key={selectedNode.id}>
      <button
        className="close detail-close"
        aria-label="Close details"
        title="Close details (Esc)"
        onClick={closeCard}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
      <div className="card-scroll" ref={scrollRef}>
        <div className="card-top">
          <div className="eyebrow">
            {selectedNode.type === 'person'
              ? 'PEOPLE OF THE NETWORK'
              : 'PLACES PEOPLE CONNECT'}
          </div>
        </div>
        <div className="card-identity">
          <Avatar node={selectedNode} size="hero" />
          <h2>{selectedNode.name}</h2>
          {selectedNode.profile_url && (
            <a
              className="handle"
              href={selectedNode.profile_url}
              target="_blank"
              rel="noreferrer">
              @{selectedNode.handle}
            </a>
          )}
          {selectedNode.bio &&
            selectedNode.bio_verification_status === 'source_reviewed' && (
              <p className="bio">{selectedNode.bio}</p>
            )}
          {selectedNode.type === 'organization' && (
            <p className="bio">
              {affiliations.length}{' '}
              {affiliations.length === 1 ? 'person' : 'people'} in this network.
              Explore the people and work connected to {selectedNode.name}.
            </p>
          )}
          {selectedNode.profile_url && (
            <a
              className="profile-link"
              href={selectedNode.profile_url}
              target="_blank"
              rel="noreferrer">
              View X profile
            </a>
          )}
        </div>
        {affiliations.length > 0 && (
          <section className="card-section">
            <h3 className="section-label">
              {selectedNode.type === 'person'
                ? 'WORK & AFFILIATIONS'
                : 'PEOPLE & AFFILIATIONS'}{' '}
              <span>{affiliations.length}</span>
            </h3>
            {affiliations.map((e) => {
              const n = nodeMap.get(
                e.source === selected ? e.target : e.source,
              )!;
              return (
                <div
                  className="relation-row"
                  key={e.id}
                  data-edge-ids={e.id}
                  tabIndex={-1}>
                  <PersonLink
                    node={n}
                    subtitle={e.role ?? 'Affiliated'}
                    onSelect={choose}
                  />
                  {sources.get(e.source_ids[0]) && (
                    <a
                      className="pill"
                      href={sources.get(e.source_ids[0])!.url}
                      target="_blank"
                      rel="noreferrer"
                      title="Read affiliation source">
                      {e.temporal_status === 'historical'
                        ? 'Previously'
                        : e.temporal_status === 'current'
                          ? 'Current'
                          : 'Source'}
                    </a>
                  )}
                </div>
              );
            })}
          </section>
        )}
        {received.length > 0 && (
          <section className="card-section">
            <h3 className="section-label">
              VOUCHES & PRAISE RECEIVED <span>{received.length}</span>
            </h3>
            <RelationshipReceipts
              list={received}
              selected={selected}
              nodeMap={nodeMap}
              sources={sources}
              onSelect={choose}
            />
          </section>
        )}
        {given.length > 0 && (
          <section className="card-section">
            <h3 className="section-label">
              VOUCHES & PRAISE GIVEN <span>{given.length}</span>
            </h3>
            <RelationshipReceipts
              list={given}
              selected={selected}
              nodeMap={nodeMap}
              sources={sources}
              onSelect={choose}
            />
          </section>
        )}
        {worked.length > 0 && (
          <section className="card-section">
            <h3 className="section-label">
              WORKED TOGETHER <span>{worked.length}</span>
            </h3>
            <RelationshipReceipts
              list={worked}
              selected={selected}
              nodeMap={nodeMap}
              sources={sources}
              onSelect={choose}
            />
          </section>
        )}
        {support.length > 0 && (
          <section className="card-section">
            <h3 className="section-label">
              PEOPLE WHO OPENED DOORS{' '}
              <span>{new Set(support.map((e) => e.target)).size}</span>
            </h3>
            <RelationshipReceipts
              list={support}
              selected={selected}
              nodeMap={nodeMap}
              sources={sources}
              onSelect={choose}
            />
          </section>
        )}
        {creditedBy.length > 0 && (
          <section className="card-section">
            <h3 className="section-label">
              OPENED DOORS{' '}
              <span>{new Set(creditedBy.map((e) => e.source)).size}</span>
            </h3>
            <RelationshipReceipts
              list={creditedBy}
              selected={selected}
              nodeMap={nodeMap}
              sources={sources}
              onSelect={choose}
            />
          </section>
        )}
        {!affiliations.length &&
          !received.length &&
          !given.length &&
          !support.length &&
          !creditedBy.length && (
            <section className="card-section">
              <p className="card-hint">
                No source-reviewed connections yet in this snapshot. Visit the
                public profile to learn more.
              </p>
            </section>
          )}
      </div>
    </aside>
  );
}
