import { useEffect } from 'react';

var DEFAULT_TITLE = 'Baumgertner | Custom websites, designed and built in Turku';
var DEFAULT_DESCRIPTION = 'Custom-built websites for businesses that refuse to look templated. Design, code, hosting and launch — one person, one point of contact.';

export var usePageMeta = function(title, description) {
  useEffect(function() {
    document.title = title || DEFAULT_TITLE;

    var metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || DEFAULT_DESCRIPTION);
    }

    return function() {
      document.title = DEFAULT_TITLE;
      if (metaDescription) {
        metaDescription.setAttribute('content', DEFAULT_DESCRIPTION);
      }
    };
  }, [title, description]);
};
