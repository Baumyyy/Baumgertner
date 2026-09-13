import React, { useState, useCallback, useMemo } from 'react';
import { ContactPanelContext } from './contactPanelContextObject';

export var ContactPanelProvider = function({ children }) {
  var state = useState(false);
  var isOpen = state[0];
  var setIsOpen = state[1];

  // setIsOpen is stable, but it reaches here through array indexing so
  // the lint rule cannot see that. Listing it costs nothing.
  var open = useCallback(function() { setIsOpen(true); }, [setIsOpen]);
  var close = useCallback(function() { setIsOpen(false); }, [setIsOpen]);

  // Memoised, or every consumer re-renders on each render of the app
  // even when the panel has not moved.
  var value = useMemo(function() {
    return { isOpen: isOpen, open: open, close: close };
  }, [isOpen, open, close]);

  return (
    <ContactPanelContext.Provider value={value}>
      {children}
    </ContactPanelContext.Provider>
  );
};

export default ContactPanelProvider;
