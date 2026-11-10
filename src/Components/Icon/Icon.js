import React from 'react';

// Small stroke icon set (24px grid, currentColor) so colour/size follow the surrounding text
// instead of per-icon `fill` overrides. All icons are decorative; give the control a label.
const PATHS = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  cart: <><path d="M3 4h2.5l2 11h10.5l2-8H6.5" /><circle cx="9" cy="19" r="1.2" /><circle cx="17" cy="19" r="1.2" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  user: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" /></>,
  filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
  chevronLeft: <><path d="m14.5 6-6 6 6 6" /></>,
  chevronRight: <><path d="m9.5 6 6 6-6 6" /></>,
  chevronDown: <><path d="m6 9.5 6 6 6-6" /></>,
  check: <><path d="m5 12.5 4.5 4.5L19 7.5" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  minus: <><path d="M5 12h14" /></>,
  trash: <><path d="M5 7h14M10 7V4.5h4V7M7 7l1 12.5h8L17 7" /></>,
  alert: <><path d="M12 4 3 19.5h18L12 4Z" /><path d="M12 10v4.5M12 17v.2" /></>,
};

const Icon = ({ name, size = 20, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    {PATHS[name]}
  </svg>
);

export default Icon;
