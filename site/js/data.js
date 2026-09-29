// Single source of truth for all site content: the game, the card binder and the Quick CV.
// Pure data, no DOM access, so it can be imported by Node tests too. See docs/CONTENT.md.

const gh = (repo) => `https://github.com/jpamies/${repo}`;

export const profile = {
  name: 'Jordi Pàmies',
  handle: 'jpamies',
  title: 'Solutions Engineer @ Microsoft',
  location: 'Barcelona, Catalonia',
  since: 2002,
  tagline: 'Two decades turning complex infrastructure into things that just work.',
  summary:
    'Solutions engineer with 20+ years in tech and more than a decade focused on cloud-native ' +
    'infrastructure, containers and automation. From CTO and SRE manager to Senior Solutions Architect at ' +
    'AWS — where I was part of the core team that launched the AWS Spain Region and became a Kubernetes / EKS ' +
    'subject-matter expert — and now Solutions Engineer at Microsoft. I love demystifying complex migrations ' +
    'and running workshops and hackathons.',
  education: 'Universitat Politècnica de Catalunya (UPC)',
  languages: ['Català', 'Español', 'English'],
  links: [
    { id: 'github', label: 'GitHub', url: 'https://github.com/jpamies' },
    { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/jpamies/' },
  ],
};

export const types = {
  ops: { label: 'Ops' },
  cloud: { label: 'Cloud' },
  kube: { label: 'Kubernetes' },
  ai: { label: 'AI' },
  iac: { label: 'IaC' },
  reliability: { label: 'Reliability' },
  leadership: { label: 'Leadership' },
  iot: { label: 'IoT' },
  code: { label: 'Code' },
  football: { label: 'Football' },
  kids: { label: 'Kids' },
  legend: { label: 'Legend' },
};

export const rarities = {
  common: { label: 'Common', symbol: '●' },
  rare: { label: 'Rare', symbol: '★' },
  holo: { label: 'Holo Rare', symbol: '★★' },
  secret: { label: 'Secret', symbol: '✦' },
  legendary: { label: 'Legendary', symbol: '♛' },
};

// Certifications are shown as "gym badges" on the Trainer Card and in the CV.
export const badges = [
  { id: 'aws-ai', name: 'AWS Certified AI Practitioner', short: 'AI', year: 2025, color: 'teal' },
  { id: 'aws-devops-pro', name: 'AWS Certified DevOps Engineer – Professional', short: 'DOP', year: 2022, color: 'purple' },
  { id: 'aws-sa-pro', name: 'AWS Certified Solutions Architect – Professional', short: 'SAP', year: 2021, color: 'gold' },
  { id: 'aws-sysops', name: 'AWS Certified SysOps Administrator – Associate', short: 'SOA', year: 2021, color: 'blue' },
  { id: 'aws-sa', name: 'AWS Certified Solutions Architect – Associate', short: 'SAA', year: 2020, color: 'orange' },
  { id: 'aws-dev', name: 'AWS Certified Developer – Associate', short: 'DVA', year: null, color: 'green' },
  { id: 'mongodb', name: 'M101P MongoDB for Developers', short: 'MDB', year: 2012, color: 'leaf' },
];

// Career chapters and project hubs. Each one is a building on the map (see js/engine/world.js).
// Career `roles` feed the Quick CV timeline, newest chapter last.
export const places = [
  {
    id: 'upc',
    kind: 'education',
    chapter: 'Prologue',
    name: 'UPC Campus',
    period: 'Studies',
    logos: ['upc'],
    summary:
      'Where the adventure begins: Universitat Politècnica de Catalunya · BarcelonaTech, the technical ' +
      'university of Catalonia.',
    roles: [
      {
        title: 'Studies',
        company: 'Universitat Politècnica de Catalunya (UPC) · BarcelonaTech',
        period: null,
        points: ['The engineering foundations behind everything that came next.'],
      },
    ],
    cards: ['student'],
  },
  {
    id: 'origins',
    kind: 'career',
    chapter: 'Chapter I',
    name: 'IT Crew HQ',
    period: '2002 – 2005',
    logos: ['elisava', 'sabadell', 'tsystems'],
    summary:
      'The side-quest years: campus networks, a bank merger and the Parliament of Catalonia. Where I learned ' +
      'that every migration is a people problem first.',
    roles: [
      {
        title: 'IT Department',
        company: 'T-Systems · Parlament de Catalunya',
        period: 'Apr 2004 – Nov 2005',
        points: [
          'IT support and infrastructure for members and staff of the Parliament of Catalonia.',
          'Windows servers, Active Directory, backups and critical systems for legislative sessions.',
        ],
      },
      {
        title: 'IT Department',
        company: 'Banco Sabadell (Banco Atlántico)',
        period: 'Nov 2003 – Apr 2004',
        points: [
          'Large-scale migration of hundreds of branch offices and ATMs from Windows NT to Windows 2000.',
          'Automated deployments to keep rollouts consistent in a highly regulated environment.',
        ],
      },
      {
        title: 'IT Department',
        company: 'ELISAVA',
        period: 'Nov 2002 – Nov 2003',
        points: ['Campus LAN/WAN, Active Directory, Windows, Linux and Mac workstations, backups.'],
      },
    ],
    skills: [
      { name: 'Windows Server / AD', level: 80 },
      { name: 'Networking', level: 70 },
      { name: 'Migrations', level: 75 },
    ],
    cards: ['helpdesk'],
  },
  {
    id: 'admira',
    kind: 'career',
    chapter: 'Chapter II',
    name: 'Admira Signage Tower',
    period: '2005 – 2015',
    logos: ['admira'],
    summary:
      'Ten years and ten months as CTO & Principal Software Engineer at a digital signage & IoT company. ' +
      'Screens everywhere, APIs everywhere — and Google Glass arriving at the office in 2014.',
    roles: [
      {
        title: 'CTO & Principal Software Engineer',
        company: 'Admira Digital Networks',
        period: 'Jan 2005 – Oct 2015',
        points: [
          'High-availability, distributed and API-based systems for digital signage & IoT.',
          'Led teams across mobile, web and desktop products (Node.js, PHP, Java, C#, MySQL, MongoDB).',
          'Scaled on AWS (EC2, ELB, S3, RDS, Route 53) with DevOps and continuous delivery.',
          'SmartCities LAB with Ficosa, Intel, JCDecaux and Telefónica: the “Smartquesina” smart bus stop and Smart Taxi.',
        ],
      },
    ],
    skills: [
      { name: 'Leadership', level: 85 },
      { name: 'Distributed systems', level: 85 },
      { name: 'Node.js / PHP', level: 85 },
      { name: 'IoT', level: 80 },
    ],
    cards: ['cto', 'smart-city', 'tinkerer'],
  },
  {
    id: 'costaisa',
    kind: 'career',
    chapter: 'Chapter III',
    name: 'COSTAISA Workshop',
    period: '2015 – 2016',
    logos: ['costaisa'],
    summary: 'Back to the keyboard as a backend engineer, with Docker before Docker was cool.',
    roles: [
      {
        title: 'Backend Engineer',
        company: 'COSTAISA',
        period: 'Oct 2015 – Jul 2016',
        points: [
          'Jenkins CI with Docker and Puppet modules.',
          'Application and system logs with Elasticsearch + Logstash + Kibana.',
          'WebRTC video streaming, PHP APIs with Doctrine and Node.js.',
        ],
      },
    ],
    skills: [
      { name: 'Docker', level: 80 },
      { name: 'CI / Jenkins', level: 80 },
      { name: 'ELK', level: 70 },
    ],
    cards: ['backend'],
  },
  {
    id: 'madcollective',
    kind: 'career',
    chapter: 'Chapter IV',
    name: 'SRE Lighthouse',
    period: '2016 – 2020',
    logos: ['madcollective'],
    summary:
      'Infrastructure & SRE Manager at Mad Collective: leading sysadmins, DBAs and SREs through a full DevOps ' +
      'transformation.',
    roles: [
      {
        title: 'Infrastructure Manager — SRE Manager',
        company: 'Mad Collective',
        period: 'Jul 2016 – Feb 2020',
        points: [
          'Led the IT team of system administrators, DBAs and SREs; empowered dev teams.',
          'DevOps transformation and infrastructure & architecture modernisation.',
          'Terraform, Packer, Ansible, Kubernetes, and Go / Python components.',
        ],
      },
    ],
    skills: [
      { name: 'SRE', level: 90 },
      { name: 'Terraform', level: 90 },
      { name: 'Kubernetes', level: 80 },
      { name: 'Go / Python', level: 75 },
    ],
    cards: ['sre'],
  },
  {
    id: 'aws',
    kind: 'career',
    chapter: 'Chapter V',
    name: 'Region eu-south-2',
    period: '2020 – 2026',
    logos: ['aws'],
    summary:
      'Six years as Senior Solutions Architect at Amazon Web Services: containers & modernisation SME, ' +
      'enterprise migrations and part of the core team that launched the AWS Spain Region.',
    roles: [
      {
        title: 'Senior Solutions Architect',
        company: 'Amazon Web Services (AWS)',
        period: 'Feb 2020 – Jan 2026',
        points: [
          'Recognised SME for Containers & Modernisation: enterprise adoption of Amazon EKS, ECS and Kubernetes.',
          'AWS Spain Region launch — core technical team, coordinating with multiple AWS service teams.',
          'Regular speaker at AWS Summits, Cloud Expo and meetups; Containers BlackBelt partner enablement.',
          'Led large-scale hackathons and enterprise migrations with the MAP methodology (hybrid & multi-cloud).',
        ],
      },
    ],
    skills: [
      { name: 'AWS', level: 95 },
      { name: 'EKS / Kubernetes', level: 95 },
      { name: 'Migrations', level: 90 },
      { name: 'Public speaking', level: 85 },
    ],
    badges: ['aws-sa', 'aws-sysops', 'aws-sa-pro', 'aws-devops-pro', 'aws-ai', 'aws-dev'],
    cards: ['region-builder', 'eks-sage', 'automode'],
  },
  {
    id: 'microsoft',
    kind: 'career',
    chapter: 'Chapter VI',
    name: 'Microsoft Campus',
    period: '2026 – now',
    logos: ['microsoft'],
    summary:
      'The current chapter: Solutions Engineer at Microsoft in Barcelona — cloud computing on Azure and ' +
      'AI-assisted engineering with GitHub Copilot.',
    roles: [
      {
        title: 'Solutions Engineer',
        company: 'Microsoft',
        period: 'Feb 2026 – present',
        points: [
          'Cloud computing and Microsoft Azure solution engineering.',
          'Building AI-powered tooling on top of the GitHub Copilot SDK (Kubepilot, Aegis).',
        ],
      },
    ],
    skills: [
      { name: 'Azure', level: 85 },
      { name: 'GitHub Copilot', level: 90 },
      { name: 'AI engineering', level: 80 },
    ],
    cards: ['solutions-engineer'],
  },
  {
    id: 'harbor',
    kind: 'projects',
    name: 'Kube Harbor',
    summary:
      'Where containers get shipped: open-source operators, CLIs and a community Terraform module with ' +
      'more than half a million downloads.',
    cards: ['tf-certificate', 'kubepilot', 'aegis'],
  },
  {
    id: 'stadium',
    kind: 'projects',
    name: 'Stadium',
    summary: 'Football is serious business. Apps built for friends, family and way too many World Cup nights.',
    cards: ['wc-fantasy', 'stickers', 'party-watch'],
  },
  {
    id: 'library',
    kind: 'projects',
    name: 'Kids Library',
    summary: 'Projects built for (and tested by) the toughest users of all: kids.',
    cards: ['kids-guide', 'storyverse'],
  },
];

export const cards = [
  {
    id: 'student',
    name: 'UPC Student',
    type: 'code',
    rarity: 'common',
    hp: 40,
    icon: 'cap',
    moves: [
      { name: 'All-Nighter', dmg: 20, text: 'Exam tomorrow. Coffee today.' },
      { name: 'Compile & Pray', dmg: 30, text: 'It worked on the lab machine.' },
    ],
    weakness: 'Exam season ×2',
    resistance: 'Sleep −20',
    flavor: 'Universitat Politècnica de Catalunya · BarcelonaTech. Level 1 of a long adventure.',
    links: {},
  },
  {
    id: 'helpdesk',
    name: 'IT Rookie',
    type: 'ops',
    rarity: 'common',
    hp: 50,
    icon: 'desk',
    moves: [
      { name: 'Turn It Off and On', dmg: 20, text: 'Works more often than it should.' },
      { name: 'NT → 2000', dmg: 40, text: 'Migrates hundreds of bank branches and ATMs.' },
    ],
    weakness: 'Printers ×2',
    resistance: 'Blue screens −20',
    flavor: 'First steps: ELISAVA, Banco Sabadell and the Parliament of Catalonia (2002–2005).',
    links: {},
  },
  {
    id: 'cto',
    name: 'The CTO',
    type: 'leadership',
    rarity: 'holo',
    hp: 120,
    icon: 'tv',
    moves: [
      { name: 'Build the Team', dmg: 50, text: 'Every project gets +1 level.' },
      { name: 'Screens Everywhere', dmg: 70, text: 'Distributed digital signage at scale.' },
    ],
    weakness: 'Endless meetings ×2',
    resistance: 'Scope creep −30',
    flavor: 'CTO & Principal Software Engineer at Admira Digital Networks for almost 11 years.',
    links: {},
  },
  {
    id: 'smart-city',
    name: 'Smartquesina',
    type: 'iot',
    rarity: 'rare',
    hp: 80,
    icon: 'busstop',
    moves: [
      { name: 'Smart Bus Stop', dmg: 40, text: 'SmartCities LAB with Intel, JCDecaux, Telefónica & Ficosa.' },
      { name: 'Smart Taxi', dmg: 40, text: 'Screens on wheels.' },
    ],
    weakness: 'Vandals ×2',
    resistance: 'Rain −20',
    flavor: 'The first project of SmartCities LAB, a Barcelona idea lab of tech companies.',
    links: {},
  },
  {
    id: 'tinkerer',
    name: 'The Tinkerer',
    type: 'iot',
    rarity: 'common',
    hp: 60,
    icon: 'chip',
    moves: [
      { name: 'Ok Glass', dmg: 20, text: 'Google Glass prototypes, 2014.' },
      { name: 'GPIO Poke', dmg: 30, text: 'Raspberry Pi + Telegram + Xively hacks.' },
    ],
    weakness: 'EC2 micro instances ×2',
    resistance: 'Boredom −30',
    flavor: 'Blogged in 2014 about Glass, Raspberry Pi and why JIRA does not fit in a micro instance.',
    links: {},
  },
  {
    id: 'backend',
    name: 'Backend Engineer',
    type: 'code',
    rarity: 'common',
    hp: 70,
    icon: 'server',
    moves: [
      { name: 'Dockerize', dmg: 30, text: 'Jenkins CI inside containers, 2015.' },
      { name: 'ELK Vision', dmg: 40, text: 'See every log line at once.' },
    ],
    weakness: 'Legacy PHP ×2',
    resistance: 'Works on my machine −30',
    flavor: 'Backend Engineer at COSTAISA: Docker, Puppet, ELK, WebRTC and Node.js.',
    links: {},
  },
  {
    id: 'sre',
    name: 'The SRE',
    type: 'reliability',
    rarity: 'holo',
    hp: 120,
    icon: 'lighthouse',
    moves: [
      { name: 'Terraform Plan', dmg: 50, text: 'Infrastructure as code, reviewed like code.' },
      { name: 'DevOps Transformation', dmg: 80, text: 'Heals the whole org.' },
    ],
    weakness: '3 a.m. pages ×2',
    resistance: 'Outages −40',
    flavor: 'Infrastructure & SRE Manager at Mad Collective: Terraform, Packer, Ansible, Kubernetes.',
    links: {},
  },
  {
    id: 'region-builder',
    name: 'Region Builder',
    type: 'cloud',
    rarity: 'holo',
    hp: 140,
    icon: 'cloud',
    moves: [
      { name: 'Launch eu-south-2', dmg: 90, text: 'A whole AWS Region appears in Spain.' },
      { name: 'MAP Migration', dmg: 60, text: 'Enterprise workloads move to the cloud.' },
    ],
    weakness: 'Mainframes ×2',
    resistance: 'Latency −50',
    flavor: 'Core technical team of the AWS Europe (Spain) Region launch.',
    links: {},
  },
  {
    id: 'eks-sage',
    name: 'EKS Sage',
    type: 'kube',
    rarity: 'holo',
    hp: 150,
    icon: 'helm',
    moves: [
      { name: 'Containers BlackBelt', dmg: 60, text: 'Partner enablement, level expert.' },
      { name: 'Karpenter Surge', dmg: 80, text: 'Nodes appear exactly when needed.' },
    ],
    weakness: 'YAML indentation ×2',
    resistance: 'CrashLoopBackOff −40',
    flavor: 'Recognised Subject Matter Expert for Containers & Modernisation at AWS.',
    links: {},
  },
  {
    id: 'automode',
    name: 'EKS Auto Mode',
    type: 'kube',
    rarity: 'rare',
    hp: 110,
    icon: 'gear',
    moves: [
      { name: 'DEV308 Live Demo', dmg: 70, text: 'AWS Summit Madrid 2025, level 300.' },
      { name: 'Scale to Zero', dmg: 50, text: 'Costs vanish when traffic does.' },
    ],
    weakness: 'Conference Wi-Fi ×2',
    resistance: 'Node patching −60',
    flavor: 'Talk + demo repo for “Automate your Kubernetes cluster with Amazon EKS Auto Mode”.',
    links: { repo: gh('aws-summit-automode-demo') },
  },
  {
    id: 'solutions-engineer',
    name: 'Solutions Engineer',
    type: 'ai',
    rarity: 'holo',
    hp: 160,
    icon: 'windows',
    moves: [
      { name: 'Copilot Pair', dmg: 80, text: 'Code at the speed of thought.' },
      { name: 'Azure Landing', dmg: 70, text: 'Well-architected from day one.' },
    ],
    weakness: 'None (yet)',
    resistance: 'Vendor lock-in −30',
    flavor: 'Current form. Evolved from Senior Solutions Architect in February 2026.',
    links: {},
  },
  {
    id: 'kubepilot',
    name: 'Kubepilot',
    type: 'ai',
    rarity: 'holo',
    hp: 120,
    icon: 'robot',
    moves: [
      { name: 'Cluster Audit', dmg: 50, text: '6 analyzers, ~29 checks per namespace.' },
      { name: 'Copilot Remedy', dmg: 80, text: 'Proposes safe fixes. Detect-only by default.' },
    ],
    weakness: 'cluster-admin RBAC ×2',
    resistance: 'Failing Deployments −50',
    flavor: 'Kubernetes operator that audits cluster health and asks GitHub Copilot for remediations. Go.',
    links: { repo: gh('kubepilot') },
  },
  {
    id: 'aegis',
    name: 'Aegis',
    type: 'cloud',
    rarity: 'rare',
    hp: 110,
    icon: 'shield',
    moves: [
      { name: 'WAF Scan', dmg: 50, text: 'Scores a repo against Azure Well-Architected.' },
      { name: 'Bicep Forge', dmg: 70, text: 'Generates IaC, pipelines and docs.' },
    ],
    weakness: 'Unbounded budgets ×2',
    resistance: 'Lock-in −40',
    flavor: 'aegisctl: minimum-cost Azure architecture advisor powered by GitHub Copilot. Go.',
    links: { repo: gh('aegisctl') },
  },
  {
    id: 'tf-certificate',
    name: 'Terraform ACM Module',
    type: 'iac',
    rarity: 'holo',
    hp: 150,
    icon: 'lock',
    moves: [
      { name: '500K+ Downloads', dmg: 90, text: 'Pulled half a million times from the Terraform Registry.' },
      { name: 'DNS Validate', dmg: 50, text: 'Certificates + Route 53 validation, zero clicks.' },
    ],
    weakness: 'Expired certs ×2',
    resistance: 'Manual toil −50',
    flavor: 'Open-source community module since 2018: create and validate TLS certificates with Terraform.',
    links: { repo: gh('terraform-aws-certificate'), live: 'https://registry.terraform.io/modules/jpamies/certificate/aws' },
  },
  {
    id: 'wc-fantasy',
    name: 'WC Fantasy 2026',
    type: 'football',
    rarity: 'holo',
    hp: 120,
    icon: 'trophy',
    moves: [
      { name: 'Snake Draft', dmg: 50, text: '12 picks. Friendships tested.' },
      { name: 'Live Scoring', dmg: 70, text: 'Fed by its own 48-team World Cup simulator.' },
    ],
    weakness: 'Penalty shoot-outs ×2',
    resistance: 'Offside −20',
    flavor: 'Fantasy football for the 2026 World Cup. FastAPI + PostgreSQL + vanilla JS.',
    links: { repo: gh('wc-fantasy-draft'), live: 'https://fantasy.jpamies.com' },
  },
  {
    id: 'stickers',
    name: 'Sticker Album',
    type: 'football',
    rarity: 'rare',
    hp: 90,
    icon: 'album',
    moves: [
      { name: 'Got It!', dmg: 30, text: 'Tap a sticker to collect it.' },
      { name: 'Swap Duplicates', dmg: 60, text: 'Share your album with friends.' },
    ],
    weakness: 'The last missing sticker ×2',
    resistance: 'Duplicates −30',
    flavor: 'Interactive tracker for the Panini LALIGA 2026-27 collection.',
    links: { repo: gh('laliga-stickers-tracker'), live: 'https://stickers.laliga.jpamies.com/' },
  },
  {
    id: 'party-watch',
    name: 'Party Watch',
    type: 'football',
    rarity: 'common',
    hp: 60,
    icon: 'party',
    moves: [
      { name: 'Pick Matches', dmg: 20, text: 'Build your watch-list.' },
      { name: 'Invite Friends', dmg: 40, text: 'Every game becomes a party.' },
    ],
    weakness: 'Extra time ×2',
    resistance: 'Time zones −20',
    flavor: 'Plan World Cup watch parties with friends. React + TypeScript.',
    links: { repo: gh('world-cup-party-watch') },
  },
  {
    id: 'kids-guide',
    name: 'Monster Guide',
    type: 'kids',
    rarity: 'holo',
    hp: 100,
    icon: 'book',
    moves: [
      { name: '1025 Entries', dmg: 60, text: 'Every creature, by number or by colour.' },
      { name: 'Trilingual', dmg: 40, text: 'Català, Español, English + printable PDFs.' },
    ],
    weakness: 'Bedtime ×2',
    resistance: 'Tiny fingers −40',
    flavor: 'Kid-friendly Pokémon guide built for my own little trainers.',
    links: { repo: gh('pokemon'), live: 'https://jpamies.github.io/pokemon/' },
  },
  {
    id: 'storyverse',
    name: 'StoryVerse',
    type: 'kids',
    rarity: 'common',
    hp: 70,
    icon: 'story',
    moves: [
      { name: 'Once Upon a Pod', dmg: 30, text: 'Personalised illustrated tales.' },
      { name: 'Microservice Magic', dmg: 40, text: 'Scales across AZs while you read.' },
    ],
    weakness: '“One more story” ×2',
    resistance: 'Plot holes −20',
    flavor: 'Custom tales for kids — and a microservices showcase for EKS Auto Mode.',
    links: { repo: gh('storyverse') },
  },
  {
    id: 'layla',
    name: 'Layla',
    type: 'iot',
    rarity: 'secret',
    hp: 50,
    icon: 'dog',
    moves: [
      { name: 'Bark Alert', dmg: 30, text: 'Sends a Telegram message. Neighbours relieved.' },
      { name: 'Loyal Follow', dmg: 99, text: 'Follows you everywhere.' },
    ],
    weakness: 'Doorbells ×2',
    resistance: 'Rain −10',
    flavor: 'The very good dog behind the 2014 Raspberry Pi bark-detector hack.',
    hint: 'A very good dog is wandering the grass west of town. Say hi!',
    links: {},
  },
  {
    id: 'shiny',
    name: 'Shiny Jordi',
    type: 'legend',
    rarity: 'secret',
    hp: 999,
    icon: 'star',
    moves: [
      { name: '↑↑↓↓←→←→BA', dmg: 30, text: '+30 lives. Classic.' },
      { name: 'Palette Swap', dmg: 99, text: 'Now in gold.' },
    ],
    weakness: 'None',
    resistance: 'Everything −99',
    flavor: 'Only true retro gamers ever find this one.',
    hint: 'Old-school cheat codes still work around here… ↑↑↓↓…',
    links: {},
  },
  {
    id: 'legend',
    name: 'Jordi Pàmies',
    type: 'legend',
    rarity: 'legendary',
    hp: 240,
    icon: 'hero',
    moves: [
      { name: 'Demystify', dmg: 90, text: 'Complex migrations become simple plans.' },
      { name: 'Let’s Talk', dmg: 120, text: 'Opens LinkedIn. It’s super effective!' },
    ],
    weakness: 'Football on TV ×2',
    resistance: 'Complexity −60',
    flavor: 'Awarded for visiting every place in Barcelona Tech Coast. Thanks for playing!',
    hint: 'Visit every building in town to earn it.',
    links: { live: 'https://www.linkedin.com/in/jpamies/' },
  },
];

export const npcs = [
  {
    id: 'guide',
    name: 'Guide',
    x: 21,
    y: 18,
    look: 'guide',
    lines: [
      'Benvingut! Welcome to Barcelona Tech Coast.',
      'This town is Jordi’s career: every building is a chapter or a set of projects.',
      'Walk into a door to enter. Each place hands you collectible cards.',
      'Follow the Career Road: the Prologue is the UPC campus up north-west, Chapter I starts in the south-west and the story ends at the Microsoft Campus.',
      'Arrows or WASD to move, ENTER to talk, M for menu. On a phone, just tap where you want to go.',
    ],
  },
  {
    id: 'dev',
    name: 'Dev',
    x: 30,
    y: 12,
    look: 'dev',
    wander: true,
    lines: ['I deployed on a Friday.', 'The SRE Lighthouse is still blinking at me.'],
  },
  {
    id: 'recruiter',
    name: 'Recruiter',
    x: 14,
    y: 13,
    look: 'recruiter',
    wander: true,
    lines: ['In a hurry? Press C or open the menu for the Quick CV.', 'Same content, zero gameplay. No judgement.'],
  },
  {
    id: 'kid',
    name: 'Little Trainer',
    x: 36,
    y: 24,
    look: 'kid',
    wander: true,
    lines: ['Have you visited the Kids Library?', 'It has ALL 1025 monsters. In three languages!'],
  },
  {
    id: 'layla',
    name: 'Layla',
    x: 9,
    y: 19,
    look: 'dog',
    wander: true,
    card: 'layla',
    lines: ['Woof! Woof!', 'Layla wants to join your adventure.'],
  },
];

export const signs = [
  { id: 'welcome', x: 19, y: 17, text: 'BARCELONA TECH COAST — population: 1 engineer, many side projects.' },
  { id: 'road', x: 9, y: 27, text: 'CAREER ROAD — Chapter I starts here, 2002. Keep walking north.' },
  { id: 'sagrada', x: 39, y: 9, text: 'Sagrada Família: under construction since 1882. Like every side project.' },
  { id: 'harbor', x: 29, y: 28, text: 'KUBE HARBOR — where containers ship. Mind the YAML.' },
];

export const cardById = Object.fromEntries(cards.map((c) => [c.id, c]));

// Accessible names for the pixel-art logos drawn in js/engine/logos.js.
export const logoNames = {
  upc: 'Universitat Politècnica de Catalunya',
  elisava: 'ELISAVA',
  sabadell: 'Banco Sabadell',
  tsystems: 'T-Systems',
  admira: 'Admira',
  costaisa: 'COSTAISA',
  madcollective: 'Mad Collective',
  aws: 'Amazon Web Services',
  microsoft: 'Microsoft',
};
export const placeById = Object.fromEntries(places.map((p) => [p.id, p]));
export const badgeById = Object.fromEntries(badges.map((b) => [b.id, b]));
