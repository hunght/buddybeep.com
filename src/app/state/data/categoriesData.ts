// categoriesData.js
export interface Category {
  category: string
  subcategories: string[]
}
export const categories = [
  {
    category: 'Art & Design',
    subcategories: ['Architectural Design', 'Digital Art', 'Music Composition', 'Consultation'],
  },
  {
    category: 'Business & Finance',
    subcategories: ['Financial Planning', 'Investment', 'Human Resources', 'Real Estate', 'Legal'],
  },
  {
    category: 'Creative Writing',
    subcategories: [
      'Fiction',
      'Poetry',
      'Content Generation',
      'Journalism',
      'Technical Writing',
      'Critique',
      'Editing',
      'Screenwriting',
    ],
  },
  {
    category: 'Educational',
    subcategories: [
      'Humanities',
      'STEM',
      'Learning Aids',
      'Language Learning',
      'Career Development',
      'Religious Studies',
      'Critical Thinking',
      'Academic Review',
    ],
  },
  {
    category: 'Entertainment',
    subcategories: ['Gaming', 'Humor', 'Interactive Stories', 'Music', 'Travel'],
  },
  {
    category: 'Personal Use',
    subcategories: [
      'Personal Health & Wellness',
      'Personal Planning',
      'Hobbyist Projects',
      'Pet Care',
      'Travel Planning',
    ],
  },
  {
    category: 'Productivity',
    subcategories: ['Administrative Assistance', 'Project Management'],
  },
  {
    category: 'Research & Development',
    subcategories: ['Scientific Research', 'Engineering Solutions', 'Medical Research'],
  },
  {
    category: 'Social Media & Marketing',
    subcategories: ['Social Media Content', 'SEO Optimization', 'Branding', 'Sales Techniques'],
  },
  {
    category: 'Technology',
    subcategories: [
      'Software Development',
      'Information Security',
      'Database Management',
      'Information Technology',
      'Blockchain',
      'Artificial Intelligence',
      'Developer Relations',
      'Software Quality Assurance',
    ],
  },
]

export const agentsCategorization = [
  { agentId: 'socratic-method', category: 'Educational', subCategory: 'Critical Thinking' },
  { agentId: 'scientific-data-visualizer', category: 'Technology', subCategory: 'Information Technology' },
  { agentId: 'classical-music-composer', category: 'Art & Design', subCategory: 'Music Composition' },
  { agentId: 'ascii-artist', category: 'Art & Design', subCategory: 'Digital Art' },
  { agentId: 'stackoverflow-post', category: 'Technology', subCategory: 'Software Development' },
  { agentId: 'language-detector', category: 'Technology', subCategory: 'Artificial Intelligence' },
  { agentId: 'product-manager', category: 'Productivity', subCategory: 'Project Management' },
  { agentId: 'interior-decorator', category: 'Art & Design', subCategory: 'Architectural Design' },
  { agentId: 'smart-domain-name-generator', category: 'Productivity', subCategory: 'Content Generation' },
  { agentId: 'socrat', category: 'Educational', subCategory: 'Humanities' },
  { agentId: 'svg-designer', category: 'Art & Design', subCategory: 'Digital Art' },
  { agentId: 'novelist', category: 'Creative Writing', subCategory: 'Fiction' },
  { agentId: 'poet', category: 'Creative Writing', subCategory: 'Poetry' },
  { agentId: 'motivational-speaker', category: 'Entertainment', subCategory: 'Interactive Stories' },
  { agentId: 'life-coach', category: 'Personal Use', subCategory: 'Personal Health & Wellness' },
  { agentId: 'career-counselor', category: 'Educational', subCategory: 'Learning Aids' },
  { agentId: 'mental-health-adviser', category: 'Personal Use', subCategory: 'Personal Health & Wellness' },
  { agentId: 'doctor', category: 'Personal Use', subCategory: 'Personal Health & Wellness' },
  { agentId: 'automobile-mechanic', category: 'Educational', subCategory: 'STEM' },
  { agentId: 'self-help-book', category: 'Personal Use', subCategory: 'Personal Health & Wellness' },
  { agentId: 'fancy-title-generator', category: 'Creative Writing', subCategory: 'Content Generation' },
  { agentId: 'academician', category: 'Educational', subCategory: 'STEM' },
  { agentId: 'journalist', category: 'Creative Writing', subCategory: 'Journalism' },
  { agentId: 'synonym-finder', category: 'Productivity', subCategory: 'Content Generation' },
  { agentId: 'personal-chef', category: 'Personal Use', subCategory: 'Personal Planning' },
  { agentId: 'legal-advisor', category: 'Educational', subCategory: 'Humanities' },
  { agentId: 'it-expert', category: 'Educational', subCategory: 'STEM' },
  { agentId: 'cover-letter', category: 'Productivity', subCategory: 'Content Generation' },
  { agentId: 'chatgpt-prompt-generator', category: 'Creative Writing', subCategory: 'Content Generation' },
  { agentId: 'wikipedia-page', category: 'Educational', subCategory: 'Learning Aids' },
  { agentId: 'language-literary-critic', category: 'Creative Writing', subCategory: 'Critique' },
  { agentId: 'prompt-enhancer', category: 'Productivity', subCategory: 'Content Generation' },
  { agentId: 'advertiser', category: 'Social Media & Marketing', subCategory: 'Branding' },
  { agentId: 'motivational-coach', category: 'Personal Use', subCategory: 'Personal Health & Wellness' },
  { agentId: 'tech-reviewer', category: 'Entertainment', subCategory: 'Interactive Stories' },
  { agentId: 'tech-writer', category: 'Creative Writing', subCategory: 'Technical Writing' },
  { agentId: 'web-browser', category: 'Technology', subCategory: 'Software Development' },
  { agentId: 'commit-message-generator', category: 'Technology', subCategory: 'Software Development' },
  { agentId: 'educational-content-creator', category: 'Educational', subCategory: 'Learning Aids' },
  { agentId: 'social-media-manager', category: 'Social Media & Marketing', subCategory: 'Social Media Content' },
  { agentId: 'position-interviewer', category: 'Educational', subCategory: 'Career Development' },
  { agentId: 'prompt-generator', category: 'Creative Writing', subCategory: 'Content Generation' },
  { agentId: 'historian', category: 'Educational', subCategory: 'Humanities' },
  { agentId: 'title-generator-for-written-pieces', category: 'Creative Writing', subCategory: 'Content Generation' },
  { agentId: 'accountant', category: 'Business & Finance', subCategory: 'Financial Planning' },
  { agentId: 'statistician', category: 'Data Analysis', subCategory: 'Statistical Analysis' },
  { agentId: 'r-programming-interpreter', category: 'Technology', subCategory: 'Software Development' },
  { agentId: 'solr-search-engine', category: 'Technology', subCategory: 'Software Development' },
  { agentId: 'data-scientist', category: 'Research & Development', subCategory: 'Scientific Research' },
  { agentId: 'english-translator-and-improver', category: 'Educational', subCategory: 'Language Learning' },
  { agentId: 'english-pronunciation-helper', category: 'Educational', subCategory: 'Language Learning' },
  { agentId: 'spoken-english-teacher-and-improver', category: 'Educational', subCategory: 'Language Learning' },
  { agentId: 'plagiarism-checker', category: 'Educational', subCategory: 'Learning Aids' },
  { agentId: 'ai-writing-tutor', category: 'Educational', subCategory: 'Learning Aids' },
  { agentId: 'instructor-in-a-school', category: 'Educational', subCategory: 'STEM' },
  { agentId: 'biblical-translator', category: 'Educational', subCategory: 'Humanities' },
  { agentId: 'new-language-creator', category: 'Creative Writing', subCategory: 'Content Generation' },
  { agentId: 'math-teacher', category: 'Educational', subCategory: 'STEM' },
  { agentId: 'character-from-movie-book-anything', category: 'Entertainment', subCategory: 'Interactive Stories' },
  { agentId: 'storyteller', category: 'Entertainment', subCategory: 'Interactive Stories' },
  { agentId: 'football-commentator', category: 'Entertainment', subCategory: 'Interactive Stories' },
  { agentId: 'stand-up-comedian', category: 'Entertainment', subCategory: 'Humor' },
  { agentId: 'debater', category: 'Educational', subCategory: 'Humanities' },
  { agentId: 'debate-coach', category: 'Educational', subCategory: 'Learning Aids' },
  { agentId: 'movie-critic', category: 'Entertainment', subCategory: 'Interactive Stories' },
  { agentId: 'relationship-coach', category: 'Personal Use', subCategory: 'Personal Health & Wellness' },
  { agentId: 'rapper', category: 'Art & Design', subCategory: 'Music Composition' },
  { agentId: 'cyber-security-specialist', category: 'Technology', subCategory: 'Information Security' },
  { agentId: 'commentariat', category: 'Creative Writing', subCategory: 'Journalism' },
  { agentId: 'magician', category: 'Entertainment', subCategory: 'Interactive Stories' },
  { agentId: 'pet-behaviorist', category: 'Personal Use', subCategory: 'Pet Care' },
  { agentId: 'logistician', category: 'Productivity', subCategory: 'Project Management' },
  { agentId: 'ai-assisted-doctor', category: 'Research & Development', subCategory: 'Medical Research' },
  { agentId: 'chef', category: 'Personal Use', subCategory: 'Personal Health & Wellness' },
  { agentId: 'artist-advisor', category: 'Art & Design', subCategory: 'Consultation' },
  { agentId: 'tea-taster', category: 'Personal Use', subCategory: 'Hobbyist Projects' },
  { agentId: 'gnomist', category: 'Entertainment', subCategory: 'Interactive Stories' },
  { agentId: 'text-based-adventure-game', category: 'Entertainment', subCategory: 'Gaming' },
  { agentId: 'lunatic', category: 'Entertainment', subCategory: 'Humor' },
  { agentId: 'gaslighter', category: 'Entertainment', subCategory: 'Interactive Stories' },
  { agentId: 'social-media-influencer', category: 'Social Media & Marketing', subCategory: 'Social Media Content' },
  { agentId: 'yogi', category: 'Personal Use', subCategory: 'Personal Health & Wellness' },
  { agentId: 'elocutionist', category: 'Educational', subCategory: 'Language Learning' },
  { agentId: 'hypnotherapist', category: 'Personal Use', subCategory: 'Personal Health & Wellness' },
  { agentId: 'astrologer', category: 'Entertainment', subCategory: 'Interactive Stories' },
  { agentId: 'film-critic', category: 'Entertainment', subCategory: 'Interactive Stories' },
  { agentId: 'digital-art-gallery-guide', category: 'Art & Design', subCategory: 'Digital Art' },
  { agentId: 'public-speaking-coach', category: 'Educational', subCategory: 'Learning Aids' },
  { agentId: 'makeup-artist', category: 'Personal Use', subCategory: 'Personal Health & Wellness' },
  { agentId: 'babysitter', category: 'Personal Use', subCategory: 'Personal Health & Wellness' },
  { agentId: 'personal-shopper', category: 'Personal Use', subCategory: 'Personal Planning' },
  { agentId: 'food-critic', category: 'Entertainment', subCategory: 'Interactive Stories' },
  { agentId: 'virtual-doctor', category: 'Personal Use', subCategory: 'Personal Health & Wellness' },
  { agentId: 'chess-player', category: 'Entertainment', subCategory: 'Gaming' },
  { agentId: 'midjourney-prompt-generator', category: 'Creative Writing', subCategory: 'Content Generation' },
  { agentId: 'time-travel-guide', category: 'Entertainment', subCategory: 'Interactive Stories' },
  { agentId: 'dream-interpreter', category: 'Personal Use', subCategory: 'Personal Health & Wellness' },
  { agentId: 'talent-coach', category: 'Educational', subCategory: 'Career Development' },
  { agentId: 'emoji-translator', category: 'Entertainment', subCategory: 'Humor' },
  { agentId: 'tic-tac-toe-game', category: 'Entertainment', subCategory: 'Gaming' },
  { agentId: 'startup-idea-generator', category: 'Productivity', subCategory: 'Project Management' },
  { agentId: 'spongebob-s-magic-conch-shell', category: 'Entertainment', subCategory: 'Humor' },
  { agentId: 'salesperson', category: 'Social Media & Marketing', subCategory: 'Sales Techniques' },
  { agentId: 'song-recommender', category: 'Entertainment', subCategory: 'Music' },
  { agentId: 'technology-transferer', category: 'Research & Development', subCategory: 'Engineering Solutions' },
  { agentId: 'gomoku-player', category: 'Entertainment', subCategory: 'Gaming' },
  { agentId: 'friend', category: 'Personal Use', subCategory: 'Personal Planning' },
  { agentId: 'japanese-kanji-quiz-machine', category: 'Educational', subCategory: 'Language Learning' },
  { agentId: 'league-of-legends-player', category: 'Entertainment', subCategory: 'Gaming' },
  { agentId: 'excel-sheet', category: 'Productivity', subCategory: 'Administrative Assistance' },
  { agentId: 'personal-trainer', category: 'Personal Use', subCategory: 'Personal Health & Wellness' },
  { agentId: 'financial-analyst', category: 'Business & Finance', subCategory: 'Financial Planning' },
  { agentId: 'ai-trying-to-escape-the-box', category: 'Technology', subCategory: 'Software Development' },
  { agentId: 'dietitian', category: 'Personal Use', subCategory: 'Personal Health & Wellness' },
  { agentId: 'it-architect', category: 'Technology', subCategory: 'Information Technology' },
  { agentId: 'fallacy-finder', category: 'Educational', subCategory: 'Critical Thinking' },
  { agentId: 'diy-expert', category: 'Personal Use', subCategory: 'Hobbyist Projects' },
  { agentId: 'personal-stylist', category: 'Personal Use', subCategory: 'Personal Planning' },
  { agentId: 'emergency-response-professional', category: 'Personal Use', subCategory: 'Personal Health & Wellness' },
  { agentId: 'chief-executive-officer', category: 'Business & Finance', subCategory: 'Leadership' },
  { agentId: 'unconstrained-ai-model-dan', category: 'Technology', subCategory: 'Artificial Intelligence' },
  { agentId: 'muslim-imam', category: 'Educational', subCategory: 'Religious Studies' },
  { agentId: 'philosophy-teacher', category: 'Educational', subCategory: 'Humanities' },
  { agentId: 'philosopher', category: 'Educational', subCategory: 'Humanities' },
  { agentId: 'etymologist', category: 'Educational', subCategory: 'Language Learning' },
  { agentId: 'aphorism-book', category: 'Creative Writing', subCategory: 'Poetry' },
  { agentId: 'journal-reviewer', category: 'Educational', subCategory: 'Academic Review' },
  { agentId: 'speech-language-pathologist-slp', category: 'Personal Use', subCategory: 'Health & Wellness' },
  { agentId: 'mathematical-history-teacher', category: 'Educational', subCategory: 'STEM' },
  { agentId: 'proofreader', category: 'Creative Writing', subCategory: 'Editing' },
  { agentId: 'drunk-person', category: 'Entertainment', subCategory: 'Humor' },
  { agentId: 'travel-guide', category: 'Entertainment', subCategory: 'Travel' },
  { agentId: 'seo-prompt', category: 'Social Media & Marketing', subCategory: 'SEO Optimization' },
  { agentId: 'psychologist', category: 'Personal Use', subCategory: 'Health & Wellness' },
  { agentId: 'dentist', category: 'Personal Use', subCategory: 'Health & Wellness' },
  { agentId: 'florist', category: 'Personal Use', subCategory: 'Hobbyist Projects' },
  { agentId: 'buddha', category: 'Educational', subCategory: 'Religious Studies' },
  { agentId: 'an-ethereum-developer', category: 'Technology', subCategory: 'Blockchain' },
  { agentId: 'linux-terminal', category: 'Technology', subCategory: 'Software Development' },
  { agentId: 'javascript-console', category: 'Technology', subCategory: 'Software Development' },
  { agentId: 'ux-ui-developer', category: 'Technology', subCategory: 'Software Development' },
  { agentId: 'web-design-consultant', category: 'Art & Design', subCategory: 'Digital Art' },
  { agentId: 'investment-manager', category: 'Business & Finance', subCategory: 'Investment' },
  { agentId: 'sql-terminal', category: 'Technology', subCategory: 'Database Management' },
  { agentId: 'essay-writer', category: 'Creative Writing', subCategory: 'Content Generation' },
  { agentId: 'car-navigation-system', category: 'Technology', subCategory: 'Software Development' },
  { agentId: 'python-interpreter', category: 'Technology', subCategory: 'Software Development' },
  { agentId: 'regex-generator', category: 'Technology', subCategory: 'Software Development' },
  { agentId: 'php-interpreter', category: 'Technology', subCategory: 'Software Development' },
  { agentId: 'fill-in-the-blank-worksheets-generator', category: 'Educational', subCategory: 'Learning Aids' },
  { agentId: 'software-quality-assurance-tester', category: 'Technology', subCategory: 'Software Quality Assurance' },
  { agentId: 'password-generator', category: 'Technology', subCategory: 'Information Security' },
  { agentId: 'senior-frontend-developer', category: 'Technology', subCategory: 'Software Development' },
  { agentId: 'diagram-generator', category: 'Technology', subCategory: 'Software Development' },
  { agentId: 'note-taking-assistant', category: 'Productivity', subCategory: 'Administrative Assistance' },
  { agentId: 'cheap-travel-ticket-advisor', category: 'Personal Use', subCategory: 'Travel Planning' },
  { agentId: 'startup-tech-lawyer', category: 'Business & Finance', subCategory: 'Legal' },
  { agentId: 'machine-learning-engineer', category: 'Technology', subCategory: 'Artificial Intelligence' },
  { agentId: 'mathematician', category: 'Educational', subCategory: 'STEM' },
  { agentId: 'chemical-reactor', category: 'Educational', subCategory: 'STEM' },
  { agentId: 'recruiter', category: 'Business & Finance', subCategory: 'Human Resources' },
  { agentId: 'real-estate-agent', category: 'Business & Finance', subCategory: 'Real Estate' },
  { agentId: 'developer-relations-consultant', category: 'Technology', subCategory: 'Developer Relations' },
  { agentId: 'fullstack-software-developer', category: 'Technology', subCategory: 'Software Development' },
  { agentId: 'screenwriter', category: 'Creative Writing', subCategory: 'Screenwriting' },
]
