import type { SVGProps } from "react";

export type IconName =
  | "home"
  | "catalog"
  | "learning"
  | "legal"
  | "calendar"
  | "location"
  | "users"
  | "video"
  | "onsite"
  | "remote"
  | "headphones"
  | "lab"
  | "document"
  | "star"
  | "shield"
  | "play"
  | "pause"
  | "fullscreen"
  | "fullscreenExit"
  | "sun"
  | "moon"
  | "search"
  | "filter"
  | "check"
  | "edit"
  | "eye"
  | "trash"
  | "copy"
  | "euro"
  | "clock"
  | "log-out"
  | "plus"
  | "x"
  | "arrowLeft"
  | "download"
  | "share"
  | "check-circle"
  | "lock";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  name: IconName;
};

type IconComponent = (props: SVGProps<SVGSVGElement>) => JSX.Element;

const baseProps: Partial<SVGProps<SVGSVGElement>> = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const createIcon = (children: JSX.Element[]): IconComponent => {
  return ({ width = 20, height = 20, ...props }) => (
    <svg viewBox="0 0 24 24" width={width} height={height} {...baseProps} {...props}>
      {children}
    </svg>
  );
};

const icons: Record<IconName, IconComponent> = {
  home: createIcon([
    <path key="a" d="M3 10.5 12 4l9 6.5" />,
    <path key="b" d="M5 9.5v10.5a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />,
  ]),
  catalog: createIcon([
    <path key="a" d="M5 4h9.5a3.5 3.5 0 0 1 3.5 3.5V20" />,
    <path key="b" d="M5 4v16a2 2 0 0 0 2 2h11" />,
    <path key="c" d="M9 8h6" />,
    <path key="d" d="M9 12h4" />,
  ]),
  learning: createIcon([
    <path key="a" d="m3 8 9-4 9 4-9 4-9-4Z" />,
    <path key="b" d="M6 10v4a6 6 0 0 0 6 6" />,
    <path key="c" d="M18 10v5" />,
  ]),
  legal: createIcon([
    <path key="a" d="M12 4v16" />,
    <path key="b" d="M5 7h14" />,
    <path key="c" d="M7 7 4 12a3 3 0 0 0 6 0Z" />,
    <path key="d" d="M17 7 14 12a3 3 0 0 0 6 0Z" />,
  ]),
  calendar: createIcon([
    <rect key="a" x="3" y="4" width="18" height="17" rx="2" />,
    <path key="b" d="M16 2v4" />,
    <path key="c" d="M8 2v4" />,
    <path key="d" d="M3 10h18" />,
  ]),
  location: createIcon([
    <path key="a" d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />,
    <circle key="b" cx="12" cy="10" r="2.5" />,
  ]),
  users: createIcon([
    <circle key="a" cx="9" cy="8" r="3" />,
    <path key="b" d="M4 20v-1a4 4 0 0 1 4-4h2" />,
    <circle key="c" cx="17" cy="11" r="3" />,
    <path key="d" d="M13 20v-1c0-1.7 1.3-3 3-3h1" />,
  ]),
  video: createIcon([
    <rect key="a" x="3" y="5" width="14" height="14" rx="2" />,
    <path key="b" d="M17 9.5 22 7v10l-5-2.5Z" />,
  ]),
  onsite: createIcon([
    <rect key="a" x="4" y="6" width="16" height="14" rx="2" />,
    <path key="b" d="M12 10v6" />,
    <path key="c" d="M9 13h6" />,
    <path key="d" d="M8 2v4" />,
    <path key="e" d="M16 2v4" />,
  ]),
  remote: createIcon([
    <circle key="a" cx="12" cy="16" r="3" />,
    <path key="b" d="M5 10c2.5-3.5 11.5-3.5 14 0" />,
    <path key="c" d="M2 7c4.5-5.5 15.5-5.5 20 0" />,
  ]),
  headphones: createIcon([
    <path key="a" d="M5 18v-3a7 7 0 0 1 14 0v3" />,
    <rect key="b" x="2" y="15" width="4" height="6" rx="1" />,
    <rect key="c" x="18" y="15" width="4" height="6" rx="1" />,
  ]),
  lab: createIcon([
    <path key="a" d="M9 3v6l-4 7a3 3 0 0 0 3 4h8a3 3 0 0 0 3-4l-4-7V3" />,
    <path key="b" d="M9 12h6" />,
  ]),
  document: createIcon([
    <path key="a" d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />,
    <path key="b" d="M14 3v6h6" />,
    <path key="c" d="M9 13h6" />,
    <path key="d" d="M9 17h4" />,
  ]),
  star: createIcon([
    <path key="a" d="m12 4 2.3 4.7 5.2.8-3.8 3.6.9 5.1L12 15.8 7.4 18.2l.9-5.1-3.8-3.6 5.2-.8Z" />,
  ]),
  shield: createIcon([
    <path key="a" d="M12 3 5 6v6c0 5 7 9 7 9s7-4 7-9V6Z" />,
    <path key="b" d="M9 11.5 11 14l4-5" />,
  ]),
  play: createIcon([<path key="a" d="m9.5 7 7 5-7 5Z" />]),
  pause: createIcon([
    <path key="a" d="M9 7v10" />,
    <path key="b" d="M15 7v10" />,
  ]),
  fullscreen: createIcon([
    <path key="a" d="M8 4H4v4" />,
    <path key="b" d="M4 16v4h4" />,
    <path key="c" d="M20 8V4h-4" />,
    <path key="d" d="M16 20h4v-4" />,
  ]),
  fullscreenExit: createIcon([
    <path key="a" d="M9 9H4V4" />,
    <path key="b" d="M9 15H4v5" />,
    <path key="c" d="M15 9h5V4" />,
    <path key="d" d="M20 15h-5v5" />,
  ]),
  sun: createIcon([
    <circle key="a" cx="12" cy="12" r="4" />,
    <path key="b" d="M12 2v2" />,
    <path key="c" d="M12 20v2" />,
    <path key="d" d="m4.93 4.93 1.41 1.41" />,
    <path key="e" d="m17.66 17.66 1.41 1.41" />,
    <path key="f" d="M2 12h2" />,
    <path key="g" d="M20 12h2" />,
    <path key="h" d="m6.34 17.66-1.41 1.41" />,
    <path key="i" d="m19.07 4.93-1.41 1.41" />,
  ]),
  moon: createIcon([
    <path key="a" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />,
  ]),
  search: createIcon([
    <circle key="a" cx="11" cy="11" r="8" />,
    <path key="b" d="m21 21-4.35-4.35" />,
  ]),
  filter: createIcon([
    <path key="a" d="M22 3H2l8 9.46V19l4 2v-8.54Z" />,
  ]),
  check: createIcon([
    <path key="a" d="M20 6 9 17l-5-5" />,
  ]),
  edit: createIcon([
    <path key="a" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />,
    <path key="b" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />,
  ]),
  eye: createIcon([
    <path key="a" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />,
    <circle key="b" cx="12" cy="12" r="3" />,
  ]),
  trash: createIcon([
    <path key="a" d="M3 6h18" />,
    <path key="b" d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />,
    <path key="c" d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
  ]),
  copy: createIcon([
    <rect key="a" x="9" y="9" width="13" height="13" rx="2" ry="2" />,
    <path key="b" d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />,
  ]),
  euro: createIcon([
    <path key="a" d="M18 6.09a9 9 0 0 1 .2 1.91" />,
    <path key="b" d="M18 6.09A9 9 0 0 0 6 15.91" />,
    <path key="c" d="M12 2a10 10 0 1 0 10 10" />,
    <path key="d" d="M6 12h12" />,
  ]),
  clock: createIcon([
    <circle key="a" cx="12" cy="12" r="10" />,
    <path key="b" d="M12 6v6l4 2" />,
  ]),
  "log-out": createIcon([
    <path key="a" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />,
    <path key="b" d="M16 17l5-5-5-5" />,
    <path key="c" d="M21 12H9" />,
  ]),
  plus: createIcon([
    <path key="a" d="M12 5v14" />,
    <path key="b" d="M5 12h14" />,
  ]),
  x: createIcon([
    <path key="a" d="M18 6 6 18" />,
    <path key="b" d="M6 6l12 12" />,
  ]),
  arrowLeft: createIcon([
    <path key="a" d="M19 12H5" />,
    <path key="b" d="M12 19l-7-7 7-7" />,
  ]),
  download: createIcon([
    <path key="a" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />,
    <path key="b" d="M7 10l5 5 5-5" />,
    <path key="c" d="M12 15V3" />,
  ]),
  share: createIcon([
    <path key="a" d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />,
    <path key="b" d="M16 6l-4-4-4 4" />,
    <path key="c" d="M12 2v13" />,
  ]),
  "check-circle": createIcon([
    <circle key="a" cx="12" cy="12" r="10" />,
    <path key="b" d="m9 12 2 2 4-4" />,
  ]),
  lock: createIcon([
    <rect key="a" x="5" y="11" width="14" height="10" rx="2" />,
    <path key="b" d="M7 11V7a5 5 0 0 1 10 0v4" />,
  ]),
};

export function Icon({ name, size = 18, ...props }: IconProps) {
  const Component = icons[name];
  if (!Component) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  return <Component width={size} height={size} {...props} />;
}

