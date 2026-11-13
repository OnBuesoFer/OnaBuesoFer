/** Minimal 1.5px-stroke icon set (decorative — always paired with a text label). */
type Name = 'email' | 'linkedin' | 'github' | 'instagram' | 'arrow-ne' | 'arrow-down' | 'arrow-up' | 'arrow-left' | 'arrow-right' | 'play' | 'pause' | 'restart' | 'sound' | 'mute' | 'close';

const paths: Record<Name, string> = {
  email: 'M3 5.5h18v13H3zM3 6l9 7 9-7',
  linkedin: 'M4 9h3.5v11H4zM5.75 4.2a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8zM10 9h3.3v1.6c.6-1 1.9-1.9 3.8-1.9 3.6 0 3.9 2.4 3.9 5.2V20h-3.5v-5.4c0-1.4-.1-2.9-1.9-2.9-1.9 0-2.1 1.4-2.1 2.8V20H10z',
  github: 'M12 3.5a8.6 8.6 0 0 0-2.7 16.7c.4.1.6-.2.6-.4v-1.6c-2.4.5-2.9-1-2.9-1-.4-1-1-1.3-1-1.3-.8-.5.1-.5.1-.5.9.1 1.3.9 1.3.9.8 1.3 2 1 2.5.7.1-.6.3-1 .6-1.2-1.9-.2-3.9-1-3.9-4.3 0-.9.3-1.7.9-2.3-.1-.2-.4-1.1.1-2.3 0 0 .7-.2 2.4.9a8.2 8.2 0 0 1 4.3 0c1.6-1.1 2.4-.9 2.4-.9.5 1.2.2 2.1.1 2.3.5.6.9 1.4.9 2.3 0 3.3-2 4-3.9 4.3.3.3.6.8.6 1.6v2.4c0 .2.2.5.6.4A8.6 8.6 0 0 0 12 3.5z',
  instagram: 'M4 4h16v16H4zM12 8.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6zM16.8 6.6h.01',
  'arrow-ne': 'M7 17 17 7M8 7h9v9',
  'arrow-down': 'M12 4v16M5 13l7 7 7-7',
  'arrow-up': 'M12 20V4M5 11l7-7 7 7',
  'arrow-left': 'M20 12H4M11 5l-7 7 7 7',
  'arrow-right': 'M4 12h16M13 5l7 7-7 7',
  play: 'M7 4.5v15l12-7.5z',
  pause: 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z',
  restart: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4 4v4.5h4.5',
  sound: 'M4 9.5h4l5-4v13l-5-4H4zM16.5 9a4 4 0 0 1 0 6M18.8 6.5a7.5 7.5 0 0 1 0 11',
  mute: 'M4 9.5h4l5-4v13l-5-4H4zM16.5 9.5l5 5M21.5 9.5l-5 5',
  close: 'M5 5l14 14M19 5 5 19',
};

const filled: Partial<Record<Name, true>> = { linkedin: true, github: true, play: true, pause: true };

export function Icon({ name, size = 18 }: { name: Name; size?: number }) {
  const fill = filled[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false"
      fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'}
      strokeWidth={1.5} strokeLinecap="square" strokeLinejoin="miter">
      <path d={paths[name]} />
    </svg>
  );
}
