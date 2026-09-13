import { createContext } from 'react';

// The contact panel is opened from six places - the navbar link, the
// navbar button, the hero, the services close, the work close and the
// sticky button - which sit at four different depths of the tree. A
// context is the alternative to threading the same callback through
// every component in between.
export var ContactPanelContext = createContext({
  isOpen: false,
  open: function() {},
  close: function() {},
});
