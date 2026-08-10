import { useEffect } from 'react';

var DEFAULT_TITLE = 'Anthony Baumgertner | Software Engineer & Project Manager';
var DEFAULT_DESCRIPTION = 'Portfolio of Anthony Baumgertner - Software Engineering student, Project Manager, and Developer based in Turku, Finland.';

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
