import Avatar from '@/components/Avatar';
import type { Node } from '@/types/network';
export default function PersonLink({
  node,
  subtitle,
  onSelect,
}: {
  node: Node;
  subtitle?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <button className="person-link" onClick={() => onSelect(node.id)}>
      <Avatar key={node.id} node={node} />
      <span>
        <strong>{node.name}</strong>
        {subtitle && <small>{subtitle}</small>}
      </span>
    </button>
  );
}
