import { useContext } from 'react';
import { ContactPanelContext } from './contactPanelContextObject';

export var useContactPanel = function() {
  return useContext(ContactPanelContext);
};
