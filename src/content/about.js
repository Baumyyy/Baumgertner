// The person behind the work. Structure lives here, prose lives in the
// language files - the wording has to exist in both languages, the links
// do not.
//
//   portrait  a path in public/about/ once there is a photo, or null.
//             While it is null the slot draws the mark at exactly the
//             size and shape the photo will take, so adding the file
//             later changes nothing else on the page.
//   socials   in the order they should read. `handle` is what is shown;
//             `label` names the platform for a screen reader.

export const about = {
  portrait: null,

  socials: [
    {
      id: 'github',
      label: 'GitHub',
      handle: '@baumyyy',
      href: 'https://github.com/baumyyy',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      handle: 'Anthony Baumgertner',
      href: 'https://www.linkedin.com/in/anthony-baumgertner-65548742a/',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      handle: '@baumgertnerr',
      href: 'https://www.instagram.com/baumgertnerr/',
    },
  ],
};

export default about;
