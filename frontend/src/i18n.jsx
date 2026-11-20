import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'devbridge_lang'
export const LANGUAGES = ['en', 'es']

const en = {
  common: {
    loading: 'Loading…',
    weeks: '{n} weeks',
    hoursWeek: '{n} h/week',
    slots: '{n} slots',
    toBeAssigned: 'To be assigned',
    viewDetails: 'View details',
    match: '{n}% match',
    email: 'Email',
    password: 'Password',
    fullName: 'Full name',
    orgName: 'Organization name',
  },
  level: { student: 'Student', recent_graduate: 'Recent graduate', junior: 'Junior (0-2 years)' },
  modality: { remote: 'Remote', on_site: 'On-site', hybrid: 'Hybrid' },
  status: {
    submitted: 'Submitted', accepted: 'Accepted', rejected: 'Rejected', pending: 'Pending review',
    approved: 'Approved', changes_requested: 'Changes requested', published: 'Published', closed: 'Closed',
  },
  nav: {
    myProjects: 'My projects', dashboard: 'Dashboard', postProject: 'Post project', explore: 'Explore projects',
    myProfile: 'My profile', login: 'Log in', signup: 'Sign up', logout: '↩ Log out',
    orgRole: 'Company / institution', devRole: 'Junior developer', language: 'Language',
  },
  authShell: {
    title1: 'Your profile is your', title2: 'new résumé.',
    subtitle: 'Companies will find you — not the other way around.',
    b1t: 'Verifiable certificates', b1d: 'Every project generates real proof of experience',
    b2t: 'Smart matching', b2d: 'We connect you with projects that fit your profile',
    b3t: 'Dedicated mentor', b3d: 'A senior developer guides you through the whole process',
    b4t: 'Free for devs', b4d: 'No cost until you land your first job',
  },
  landing: {
    goDashboard: 'Go to my dashboard', start: 'Get started for free',
    pill: 'Tech internship platform for juniors',
    title1: 'Your first tech job,', title2: 'with real experience.',
    lead: 'We connect junior developers with real company projects, supervised by mentors. Gain verifiable experience and land your first job.',
    ctaDev: "I'm a junior developer", ctaOrg: "I'm a company or institution",
    note: 'Free for devs · You can explore projects without signing up',
    matchTitle: 'Smart matching', matchDesc: 'We recommend projects based on your skills, level and availability.',
    reviewTitle: 'Deliveries reviewed by mentors', reviewDesc: 'Every sprint gets feedback and a rating.',
    statProjects: 'Published projects', statOrgs: 'Partner organizations',
    statSupervised: 'Supervised projects', statCost: 'Cost for developers',
  },
  login: {
    title: 'Log in', subtitle: 'Welcome back to DevBridge', submitting: 'Logging in…', submit: 'Log in',
    noAccount: "Don't have an account?", signup: 'Sign up',
  },
  register: {
    title: 'Create your account', step: 'Step 1 of 2 · Account', dev: "I'm a developer",
    org: "I'm a company / institution", password: 'Password (at least 8 characters)',
    consent: 'I authorize the processing of my personal data in accordance with Law 1581 of 2012 and the DevBridge privacy policy.',
    submitting: 'Creating account…', submit: 'Continue →', hasAccount: 'Already have an account?', login: 'Log in',
  },
  dashboard: {
    hello: 'Hi, {name}! 👋', subtitle: 'Here is your summary for today',
    addSkillsBefore: 'Add your skills in', addSkillsAfter: 'to get recommendations.',
    active: 'Active projects', applications: 'Applications', approved: 'Approved deliveries', avg: 'Average rating',
    myApps: 'My applications and projects', noApps: 'You have not applied to any project yet.',
    mentor: 'Mentor: {name}', deliveries: '{n} deliveries · {a} approved',
    recommended: '✦ Recommended for you', recommendedDesc: 'Based on your skills, level and availability',
    calculating: 'Calculating…', noRecs: 'No recommendations for now.',
  },
  explore: {
    available: '{n} projects available', search: '🔍 Search projects…', allTech: 'All technologies',
    anyLevel: 'Any level', anyModality: 'Any modality', loading: 'Loading projects…', empty: 'No projects match those filters.',
  },
  newProject: {
    subtitle: 'Describe the real project a junior developer will work on under supervision',
    projectTitle: 'Project title', titlePlaceholder: 'E-commerce REST API', description: 'Description',
    tech: 'Required technologies', level: 'Required level', modality: 'Modality', duration: 'Duration (weeks)',
    commitment: 'Commitment (hours per week)', slots: 'Slots', mentor: 'Assigned mentor',
    mentorPlaceholder: "Senior developer's name",
  },
  org: {
    approve: 'Approve', requestChanges: 'Request changes', feedbackPlaceholder: 'Feedback for the developer',
    send: 'Submit', subtitle: 'Manage your projects, applications and deliveries', newProject: '+ Post project',
    published: 'Published projects', toReview: 'Applications to review', interns: 'Developers in internship',
    deliveriesToReview: 'Deliveries to review', empty: 'You have not posted any projects yet.',
    filled: '{a}/{s} slots filled', view: 'View', close: 'Close', reopen: 'Reopen',
    applications: 'Applications ({n})', noApplications: 'No applications yet.', accept: 'Accept', reject: 'Reject',
    viewDelivery: 'view delivery',
  },
  profile: {
    complete: 'Complete your profile', orgSubtitle: 'Information visible to developers',
    devSubtitle: 'This information helps us find the right projects for you', city: 'City',
    orgDescription: 'Organization description', level: 'Experience level', availability: 'Availability (hours per week)',
    githubPlaceholder: 'https://github.com/username', skills: 'Technical skills (select the ones you know)',
    interests: 'What kind of projects are you interested in?', about: 'About you (optional)',
    aboutPlaceholder: 'I want to gain real experience working on company projects…', saved: '✓ Changes saved',
    saveContinue: 'Save and continue →', save: 'Save changes',
  },
  project: {
    notFound: 'Project not found', back: '← Back to projects', level: 'Level: {v}', duration: 'Duration: {n} weeks',
    commitment: 'Commitment: {n} h/week', openSlots: 'Open slots: {f} of {s}', sprintDeliveries: 'Sprint deliveries',
    sprintDesc: 'Share your repository link each sprint so your mentor can review it.',
    noDeliveries: 'You have not submitted any deliveries yet.', viewLink: 'view link',
    deliveryPlaceholder: 'E.g.: Sprint 1 – Products module', submitDelivery: 'Submit delivery', mentor: 'Project mentor',
    interested: 'Interested in this project?', createAccount: 'Create a free account to apply.', signup: 'Sign up',
    orgNote: 'Organizations manage their projects from their dashboard.', apply: 'Apply to this project',
    applyPlaceholder: 'Tell the company why you are interested (optional)', noSlots: 'No slots left',
    applyBtn: 'Apply →', yourApp: 'Your application', willReview: 'The organization will review your profile soon.',
  },
  errors: {},
}

const es = {
  common: {
    loading: 'Cargando…',
    weeks: '{n} semanas',
    hoursWeek: '{n} h/semana',
    slots: '{n} cupos',
    toBeAssigned: 'Por asignar',
    viewDetails: 'Ver detalle',
    match: '{n}% afinidad',
    email: 'Correo electrónico',
    password: 'Contraseña',
    fullName: 'Nombre completo',
    orgName: 'Nombre de la organización',
  },
  level: { student: 'Estudiante', recent_graduate: 'Recién graduado', junior: 'Junior (0-2 años)' },
  modality: { remote: 'Remoto', on_site: 'Presencial', hybrid: 'Híbrido' },
  status: {
    submitted: 'Enviada', accepted: 'Aceptada', rejected: 'Rechazada', pending: 'Pendiente de revisión',
    approved: 'Aprobada', changes_requested: 'Con ajustes', published: 'Publicado', closed: 'Cerrado',
  },
  nav: {
    myProjects: 'Mis proyectos', dashboard: 'Dashboard', postProject: 'Publicar proyecto', explore: 'Explorar proyectos',
    myProfile: 'Mi perfil', login: 'Iniciar sesión', signup: 'Crear cuenta', logout: '↩ Cerrar sesión',
    orgRole: 'Empresa / institución', devRole: 'Desarrollador junior', language: 'Idioma',
  },
  authShell: {
    title1: 'Tu perfil es tu', title2: 'nueva hoja de vida.',
    subtitle: 'Las empresas te encontrarán a ti — no al revés.',
    b1t: 'Certificados verificables', b1d: 'Cada proyecto genera evidencia real de experiencia',
    b2t: 'Matching inteligente', b2d: 'Te conectamos con proyectos ideales para tu perfil',
    b3t: 'Mentor dedicado', b3d: 'Un senior te guía durante todo el proceso',
    b4t: 'Gratuito para devs', b4d: 'Sin costo hasta conseguir tu primer empleo',
  },
  landing: {
    goDashboard: 'Ir a mi panel', start: 'Empezar gratis',
    pill: 'Plataforma de internado tech para juniors',
    title1: 'Tu primer empleo', title2: 'tech, con experiencia real.',
    lead: 'Conectamos desarrolladores junior con proyectos reales de empresas, supervisados por mentores. Gana experiencia verificable y consigue tu primer empleo.',
    ctaDev: 'Soy desarrollador junior', ctaOrg: 'Soy empresa o institución',
    note: 'Gratis para devs · Puedes explorar proyectos sin registrarte',
    matchTitle: 'Matching inteligente', matchDesc: 'Te recomendamos proyectos según tus habilidades, nivel y disponibilidad.',
    reviewTitle: 'Entregas revisadas por mentores', reviewDesc: 'Cada sprint recibe retroalimentación y calificación.',
    statProjects: 'Proyectos publicados', statOrgs: 'Organizaciones aliadas',
    statSupervised: 'Proyectos supervisados', statCost: 'Costo para desarrolladores',
  },
  login: {
    title: 'Iniciar sesión', subtitle: 'Bienvenido de nuevo a DevBridge', submitting: 'Ingresando…', submit: 'Ingresar',
    noAccount: '¿No tienes cuenta?', signup: 'Regístrate',
  },
  register: {
    title: 'Crea tu cuenta', step: 'Paso 1 de 2 · Cuenta', dev: 'Soy desarrollador',
    org: 'Soy empresa / institución', password: 'Contraseña (mínimo 8 caracteres)',
    consent: 'Autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012 y la política de privacidad de DevBridge.',
    submitting: 'Creando cuenta…', submit: 'Continuar →', hasAccount: '¿Ya tienes cuenta?', login: 'Inicia sesión',
  },
  dashboard: {
    hello: '¡Hola, {name}! 👋', subtitle: 'Aquí está tu resumen de hoy',
    addSkillsBefore: 'Completa tus habilidades en', addSkillsAfter: 'para recibir recomendaciones.',
    active: 'Proyectos activos', applications: 'Postulaciones', approved: 'Entregas aprobadas', avg: 'Calificación promedio',
    myApps: 'Mis postulaciones y proyectos', noApps: 'Aún no te has postulado a ningún proyecto.',
    mentor: 'Mentor: {name}', deliveries: '{n} entregas · {a} aprobadas',
    recommended: '✦ Recomendados para ti', recommendedDesc: 'Según tus habilidades, nivel y disponibilidad',
    calculating: 'Calculando…', noRecs: 'No hay recomendaciones por ahora.',
  },
  explore: {
    available: '{n} proyectos disponibles', search: '🔍 Buscar proyecto…', allTech: 'Todas las tecnologías',
    anyLevel: 'Cualquier nivel', anyModality: 'Cualquier modalidad', loading: 'Cargando proyectos…', empty: 'No hay proyectos con esos filtros.',
  },
  newProject: {
    subtitle: 'Describe el proyecto real que un desarrollador junior realizará con supervisión',
    projectTitle: 'Título del proyecto', titlePlaceholder: 'API REST para E-commerce', description: 'Descripción',
    tech: 'Tecnologías requeridas', level: 'Nivel requerido', modality: 'Modalidad', duration: 'Duración (semanas)',
    commitment: 'Dedicación (horas por semana)', slots: 'Cupos', mentor: 'Mentor asignado',
    mentorPlaceholder: 'Nombre del desarrollador senior',
  },
  org: {
    approve: 'Aprobar', requestChanges: 'Pedir ajustes', feedbackPlaceholder: 'Retroalimentación para el desarrollador',
    send: 'Enviar', subtitle: 'Gestiona tus proyectos, postulaciones y entregas', newProject: '+ Publicar proyecto',
    published: 'Proyectos publicados', toReview: 'Postulaciones por revisar', interns: 'Desarrolladores en internado',
    deliveriesToReview: 'Entregas por revisar', empty: 'Aún no has publicado proyectos.',
    filled: '{a}/{s} cupos ocupados', view: 'Ver', close: 'Cerrar', reopen: 'Reabrir',
    applications: 'Postulaciones ({n})', noApplications: 'Todavía no hay postulaciones.', accept: 'Aceptar', reject: 'Rechazar',
    viewDelivery: 'ver entrega',
  },
  profile: {
    complete: 'Completa tu perfil', orgSubtitle: 'Información visible para los desarrolladores',
    devSubtitle: 'Esta información nos ayuda a encontrar proyectos ideales para ti', city: 'Ciudad',
    orgDescription: 'Descripción de la organización', level: 'Nivel de experiencia', availability: 'Disponibilidad (horas por semana)',
    githubPlaceholder: 'https://github.com/usuario', skills: 'Habilidades técnicas (selecciona las que manejas)',
    interests: '¿Qué tipo de proyectos te interesan?', about: 'Sobre ti (opcional)',
    aboutPlaceholder: 'Quiero ganar experiencia real trabajando en proyectos de empresas…', saved: '✓ Cambios guardados',
    saveContinue: 'Guardar y continuar →', save: 'Guardar cambios',
  },
  project: {
    notFound: 'Proyecto no encontrado', back: '← Volver a proyectos', level: 'Nivel: {v}', duration: 'Duración: {n} semanas',
    commitment: 'Dedicación: {n} h/semana', openSlots: 'Cupos libres: {f} de {s}', sprintDeliveries: 'Entregas por sprint',
    sprintDesc: 'Comparte el enlace de tu repositorio en cada sprint para que tu mentor lo revise.',
    noDeliveries: 'Aún no has registrado entregas.', viewLink: 'ver enlace',
    deliveryPlaceholder: 'Ej.: Sprint 1 – Módulo de productos', submitDelivery: 'Entregar avance', mentor: 'Mentor del proyecto',
    interested: '¿Te interesa este proyecto?', createAccount: 'Crea tu cuenta gratis para postularte.', signup: 'Registrarme',
    orgNote: 'Las organizaciones gestionan sus proyectos desde su panel.', apply: 'Postúlate a este proyecto',
    applyPlaceholder: 'Cuéntale a la empresa por qué te interesa (opcional)', noSlots: 'Sin cupos',
    applyBtn: 'Postularme →', yourApp: 'Tu postulación', willReview: 'La organización revisará tu perfil pronto.',
  },
  // The API answers in English; these map its messages to Spanish.
  errors: {
    'You must be logged in.': 'Debes iniciar sesión.',
    'You do not have permission for this action.': 'No tienes permiso para esta acción.',
    'You must authorize the processing of personal data (Law 1581 of 2012).': 'Debes autorizar el tratamiento de datos personales (Ley 1581 de 2012).',
    'Invalid role.': 'Rol no válido.',
    'Password must be at least 8 characters long.': 'La contraseña debe tener mínimo 8 caracteres.',
    'An account with that email already exists.': 'Ya existe una cuenta con ese correo.',
    'Incorrect email or password.': 'Correo o contraseña incorrectos.',
    'Title, description and at least one technology are required.': 'Título, descripción y al menos una tecnología son obligatorios.',
    'Project not found.': 'Proyecto no encontrado.',
    'The project is not available.': 'El proyecto no está disponible.',
    'You have already applied to this project.': 'Ya te postulaste a este proyecto.',
    'Application not found.': 'Postulación no encontrada.',
    'There are no slots left in this project.': 'No quedan cupos disponibles en este proyecto.',
    'You can only submit deliveries for projects where you were accepted.': 'Solo puedes entregar avances en proyectos donde fuiste aceptado.',
    'The link must be a valid URL (http/https).': 'El enlace debe ser una URL válida (http/https).',
    'Delivery not found.': 'Entrega no encontrada.',
    'Provide a status, a comment and a rating from 1 to 5.': 'Indica el estado, un comentario y una calificación de 1 a 5.',
  },
}

export const DICTIONARIES = { en, es }

function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (LANGUAGES.includes(saved)) return saved
  } catch { /* storage unavailable */ }
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLanguage)

  useEffect(() => { document.documentElement.lang = lang }, [lang])

  const setLang = useCallback((next) => {
    setLangState(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* storage unavailable */ }
  }, [])

  // t('section.key', { var: value }) → translated string with {var} placeholders filled in.
  const t = useCallback((key, vars = {}) => {
    const lookup = (dict) => key.split('.').reduce((o, k) => o?.[k], dict)
    const text = lookup(DICTIONARIES[lang]) ?? lookup(en) ?? key
    return text.replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? `{${v}}`)
  }, [lang])

  const translateError = useCallback((msg) => DICTIONARIES[lang].errors[msg] || msg, [lang])

  return (
    <I18nContext.Provider value={{ lang, setLang, t, translateError }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => useContext(I18nContext)

export function LanguageSwitch({ dark }) {
  const { lang, setLang, t } = useI18n()
  return (
    <div className={`lang-switch ${dark ? 'lang-switch-dark' : ''}`} role="group" aria-label={t('nav.language')}>
      {LANGUAGES.map((l) => (
        <button key={l} type="button" className={lang === l ? 'on' : ''} aria-pressed={lang === l} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
