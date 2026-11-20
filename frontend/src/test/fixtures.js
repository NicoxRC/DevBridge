// Sample data shared by the tests. Override fields per test: makeProject({ slots: 0 }).

export const developer = {
  id: '1', email: 'nico@demo.com', name: 'Nico Rojas', role: 'developer', city: 'Pasto', bio: '',
  level: 'junior', skills: ['React', 'Python'], interests: ['Full Stack'], availabilityHours: 20, github: '',
}

export const organization = {
  id: '2', email: 'techcorp@demo.com', name: 'TechCorp S.A.S.', role: 'organization', city: 'Pasto',
  bio: 'Custom software.', level: null, skills: [], interests: [], availabilityHours: null, github: null,
}

export const makeProject = (overrides = {}) => ({
  id: '7',
  title: 'Inventory API',
  description: 'REST API for a small store.',
  skills: ['Python', 'PostgreSQL'],
  level: 'junior',
  hoursPerWeek: 10,
  durationWeeks: 8,
  modality: 'remote',
  slots: 2,
  mentorName: 'Ana Ruiz',
  status: 'published',
  organization: { id: '2', name: 'TechCorp', city: 'Pasto', bio: '' },
  applicationsCount: 0,
  acceptedCount: 0,
  myApplication: null,
  applications: [],
  ...overrides,
})

export const makeDelivery = (overrides = {}) => ({
  id: '30', title: 'Sprint 1', link: 'https://github.com/nico/inventory', status: 'pending',
  feedback: null, rating: null, createdAt: '2026-11-01', ...overrides,
})

export const makeApplication = (overrides = {}) => ({
  id: '20',
  status: 'submitted',
  message: 'I would love to join.',
  createdAt: '2026-11-01',
  developer: { id: '1', name: 'Nico Rojas', city: 'Pasto', level: 'junior', skills: ['Python'], github: null },
  project: { id: '7', title: 'Inventory API', mentorName: 'Ana Ruiz', durationWeeks: 8, organization: { name: 'TechCorp' } },
  deliveries: [],
  ...overrides,
})

export const apiError = (message) => new Error(message)
