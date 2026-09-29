export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join('')
    .toUpperCase();
export const shortName = (name: string) =>
  name.length > 21 ? name.slice(0, 19) + '…' : name;
export const prettyDate = (s?: string) =>
  s
    ? new Date(s + 'T12:00:00Z').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Public profile';
