// The work, as content rather than data. Everything a case study needs
// lives here: no API call, no database row, nothing to fail at runtime.
// Adding a project means adding an entry and dropping its images into
// public/work/ - both of which land in the same commit, so the list and
// the case study can never drift apart.
//
// Fields
//   slug      stable id, also used for the deep link
//   name      short label for the collapsed row
//   logo      'wordmark' for our own mark, a path in public/work/ for a
//             client's, or null to fall back to the name as text
//   status    'live' | 'progress' | 'open'  - drives the indicator
//   title     the full sentence shown when the row is open
//   tags      disciplines, shown as chips
//   industry  one short line
//   site      { label, href } or null while there is nothing to link to
//   shots     images for the carousel, in order
//   body      paragraphs, written for a client rather than a developer
//   feedback  { quote, name, role } or null until the client gives one

export const work = [
  {
    slug: 'baumgertner',
    name: 'Baumgertner',
    logo: 'wordmark',
    status: 'live',
    title: 'Baumgertner — brand, portfolio and a self-hosted platform',
    tags: ['Branding', 'Web design', 'Development', 'Hosting'],
    industry: 'Portfolio',
    site: { label: 'baumgertner.fi', href: 'https://baumgertner.fi' },
    shots: [
      '/work/portfolio-1.webp',
      '/work/portfolio-2.webp',
      '/work/portfolio-3.webp',
      '/work/portfolio-4.webp',
    ],
    body: [
      'Built from nothing rather than assembled from a theme: the identity, the interface, the API behind it and the server it runs on.',
      'It runs on its own machine with automatic certificates, nightly backups and monitoring, and every claim made anywhere else on this site can be checked against it.',
    ],
    feedback: null,
  },
  {
    slug: 'pintaparoni',
    name: 'Pintaparoni',
    logo: '/work/pintaparoni.png',
    status: 'progress',
    title: 'Pintaparoni — replacing a template with a site built for the company',
    tags: ['Web design', 'Development'],
    industry: 'Facade and painting',
    site: null,
    shots: [],
    body: [
      'Pintaparoni already had a site. It was a template, it had aged, and it said almost nothing about the work the company actually does or the standard it does it to.',
      'The new one is being built for this company rather than adapted from a layout that was drawn for nobody in particular.',
      'In progress. The case study lands here once it is live.',
    ],
    feedback: null,
  },
  {
    slug: 'marine-electrical',
    name: 'Marine electrical',
    logo: null,
    status: 'progress',
    title: 'A site for a local electrical company working in the marine industry',
    tags: ['Web design', 'Development'],
    industry: 'Marine electrical',
    site: null,
    shots: [],
    body: [
      'A custom site for a local electrical contractor working on boats and marine installations, replacing a presence that told visitors almost nothing about the work.',
      'In progress. The case study lands here once it is live.',
    ],
    feedback: null,
  },
];

export default work;
