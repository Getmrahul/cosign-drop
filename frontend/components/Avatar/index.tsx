import { useState } from 'react';
import type { Node } from '@/types/network';
import { initials } from '@/utils/format';
export default function Avatar({
  node,
  size = 'small',
}: {
  node: Node;
  size?: 'small' | 'hero';
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={size === 'hero' ? 'hero-avatar' : 'small-initials'}>
      {node.image_url && !failed ? (
        <img
          src={node.image_url}
          alt=""
          onError={() => setFailed(true)}
          draggable={false}
        />
      ) : (
        initials(node.name)
      )}
    </span>
  );
}
