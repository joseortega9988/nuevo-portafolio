import type { EntrySlug, PortfolioEntry } from './types';

/**
 * THE FIVE PUBLISHED ENTRIES, in the order they appear everywhere: the Home
 * carousel, the Projects grid, and the sitemap.
 *
 * To add a sixth, append an object here and add nothing else — no component
 * imports this list by index or by slug (§B, Open/Closed). To remove one,
 * delete it; the detail route generates its params from this array.
 *
 * Provenance, so nothing here can drift into invention:
 *  · tight-line / theodo-uk — the CV, verbatim outcomes and stack.
 *  · takehome-challenge     — home-challengue-nest README, CLAUDE.md, schema.
 *  · my-time / breast-cancer-detection — the previous portfolio's cardsDB.jsx,
 *    EN and ES copy reused as written.
 */
export const ENTRIES: readonly PortfolioEntry[] = [
  {
    slug: 'tight-line',
    type: 'experience',
    organization: 'Tight Line',
    period: { start: { en: 'Dec 2024', es: 'Dic 2024' }, end: null },
    title: {
      en: 'Full-Stack Developer — Tight Line (Startup)',
      es: 'Desarrollador Full-Stack — Tight Line (Startup)',
    },
    shortDescription: {
      en: 'Automating ETL workflows with AI-powered tooling and restructuring backend logic into high-performance modular services.',
      es: 'Automatización de flujos ETL con herramientas potenciadas por IA y reestructuración de la lógica de backend en servicios modulares de alto rendimiento.',
    },
    developmentAreas: {
      en: 'Back-End, Front-End, Data Engineering, DevOps',
      es: 'Back-End, Front-End, Ingeniería de Datos, DevOps',
    },
    description: {
      en: 'I resolve production incidents using AI-accelerated troubleshooting, develop and integrate scalable APIs alongside responsive reusable web interfaces, and execute data transformation work and third-party integrations. I also document system architecture, business rules and data models, and automate testing and continuous delivery pipelines.',
      es: 'Resuelvo incidentes en producción mediante diagnóstico acelerado con IA, desarrollo e integro APIs escalables junto a interfaces web reutilizables y responsivas, y ejecuto transformación de datos e integraciones con terceros. También documento la arquitectura del sistema, las reglas de negocio y los modelos de datos, y automatizo las pruebas y los pipelines de entrega continua.',
    },
    highlights: [
      {
        en: 'Improved operational efficiency by 35% by automating ETL workflows with AI-powered tooling.',
        es: 'Mejoré la eficiencia operativa en un 35% automatizando flujos ETL con herramientas potenciadas por IA.',
      },
      {
        en: 'Increased scalability by restructuring backend logic into high-performance modular services.',
        es: 'Aumenté la escalabilidad reestructurando la lógica de backend en servicios modulares de alto rendimiento.',
      },
      {
        en: 'Optimized database integrity by resolving record inconsistencies with AI models.',
        es: 'Optimicé la integridad de la base de datos resolviendo inconsistencias de registros con modelos de IA.',
      },
    ],
    technologies: [
      'typescript', 'javascript', 'nodejs', 'nestjs', 'react', 'nextjs', 'aws',
      'claude', 'sql', 'postgresql', 'prisma', 'jest', 'playwright', 'docker',
      'redux', 'graphql', 'cicd',
    ],
  },

  {
    slug: 'theodo-uk',
    type: 'experience',
    organization: 'Theodo UK',
    period: {
      start: { en: 'Jun 2021', es: 'Jun 2021' },
      end: { en: 'Nov 2024', es: 'Nov 2024' },
    },
    title: {
      en: 'Full-Stack Developer — Theodo UK',
      es: 'Desarrollador Full-Stack — Theodo UK',
    },
    shortDescription: {
      en: 'Automating back-office processes and reporting, and managing AWS infrastructure and deployments across client systems.',
      es: 'Automatización de procesos de back-office y reportería, y gestión de infraestructura y despliegues en AWS para sistemas de clientes.',
    },
    developmentAreas: {
      en: 'Back-End, Front-End, Databases, Cloud Infrastructure',
      es: 'Back-End, Front-End, Bases de Datos, Infraestructura Cloud',
    },
    description: {
      en: 'I handled bug fixing and troubleshooting, designed views and stored procedures, and ensured integrity between databases. I managed AWS infrastructure and deployments, created technical documentation and runbooks, and automated manual processes across the team.',
      es: 'Me encargué de la corrección de errores y el diagnóstico de incidencias, diseñé vistas y procedimientos almacenados, y garanticé la integridad entre bases de datos. Gestioné la infraestructura y los despliegues en AWS, elaboré documentación técnica y runbooks, y automaticé procesos manuales del equipo.',
    },
    highlights: [
      {
        en: 'Increased data security by automating backups and updates.',
        es: 'Aumenté la seguridad de los datos automatizando respaldos y actualizaciones.',
      },
      {
        en: 'Optimized operations by automating manual back-office processes.',
        es: 'Optimicé las operaciones automatizando procesos manuales de back-office.',
      },
      {
        en: 'Reduced reporting time from three days to hours by automating data collection.',
        es: 'Reduje el tiempo de reportería de tres días a horas automatizando la recolección de datos.',
      },
    ],
    technologies: [
      'typescript', 'javascript', 'python', 'nodejs', 'nestjs', 'react', 'aws',
      'sql', 'postgresql', 'prisma', 'jest', 'playwright', 'docker', 'bash',
      'redux', 'tensorflow', 'keras', 'cicd',
    ],
  },

  {
    slug: 'takehome-challenge',
    type: 'project',
    title: {
      en: 'Notifications API — Take-Home Challenge',
      es: 'API de Notificaciones — Take-Home Challenge',
    },
    shortDescription: {
      en: 'A NestJS + Prisma REST API with JWT access/refresh authentication and multi-channel notification delivery built on the Strategy pattern.',
      es: 'Una API REST en NestJS + Prisma con autenticación JWT de acceso y refresco, y envío de notificaciones multicanal construido sobre el patrón Strategy.',
    },
    developmentAreas: {
      en: 'Back-End, API Design, Databases, DevOps',
      es: 'Back-End, Diseño de APIs, Bases de Datos, DevOps',
    },
    description: {
      en: 'A REST API built with NestJS 11, Prisma and PostgreSQL, organised into modules separated by responsibility: auth, notifications, users, client and prisma. Authentication issues a short-lived access token and a longer-lived refresh token signed with separate secrets, validated by dedicated Passport strategies; passwords are hashed with bcrypt and never handled outside the auth service. The notifications module exposes full CRUD over a user\'s own notifications and simulates delivery through three channels — email validates the recipient and renders a template, SMS caps content at 160 characters, and push validates the device token and formats the payload. The users module enriches a profile with Pokémon data fetched live from PokeAPI, storing only numeric ids so names are never persisted. The whole stack runs under Docker Compose, is documented with Swagger, and is covered by Jest unit and end-to-end suites wired into CircleCI.',
      es: 'Una API REST construida con NestJS 11, Prisma y PostgreSQL, organizada en módulos separados por responsabilidad: auth, notifications, users, client y prisma. La autenticación emite un token de acceso de corta duración y uno de refresco de mayor duración, firmados con secretos distintos y validados por estrategias de Passport dedicadas; las contraseñas se cifran con bcrypt y nunca se manipulan fuera del servicio de autenticación. El módulo de notificaciones expone un CRUD completo sobre las notificaciones del propio usuario y simula el envío por tres canales: email valida el destinatario y renderiza una plantilla, SMS limita el contenido a 160 caracteres, y push valida el token del dispositivo y da formato al payload. El módulo de usuarios enriquece el perfil con datos de Pokémon obtenidos en vivo desde PokeAPI, guardando solo identificadores numéricos para que los nombres nunca se persistan. Todo el stack corre sobre Docker Compose, está documentado con Swagger y cubierto por pruebas unitarias y end-to-end en Jest integradas en CircleCI.',
    },
    topicsSummary: {
      en: 'The sending logic follows a Strategy pattern: each channel implements a shared NotificationChannelSender interface and is registered through a single dependency-injection token, so adding a fourth channel means writing one class and listing it — no change to the main flow. The API is namespaced under /api/v1, with POST /auth/register, /auth/login, /auth/refresh and /auth/logout; GET /users/profile; POST /client/pokemon/add; and POST, GET, PATCH and DELETE on /notifications.',
      es: 'La lógica de envío sigue un patrón Strategy: cada canal implementa una interfaz común, NotificationChannelSender, y se registra mediante un único token de inyección de dependencias, de modo que añadir un cuarto canal implica escribir una clase y listarla — sin tocar el flujo principal. La API vive bajo /api/v1, con POST /auth/register, /auth/login, /auth/refresh y /auth/logout; GET /users/profile; POST /client/pokemon/add; y POST, GET, PATCH y DELETE sobre /notifications.',
    },
    technologies: [
      'nestjs', 'typescript', 'nodejs', 'prisma', 'postgresql', 'jwt', 'rest',
      'swagger', 'docker', 'jest', 'circleci', 'cicd', 'git',
    ],
    links: [
      { kind: 'github', href: 'https://github.com/joseortega9988/TakeHome-Challengue' },
      {
        kind: 'apiDocs',
        href: 'https://rocky-caverns-91721-40ef535db0e7.herokuapp.com/api/docs/',
      },
    ],
  },

  {
    slug: 'my-time',
    type: 'project',
    title: {
      en: 'Task Management App "MyTime"',
      es: 'Aplicación de Gestión de Tareas "MyTime"',
    },
    shortDescription: {
      en: 'Mobile app for time management and task organization, featuring task creation, priority sorting, progress tracking, scheduling, and educational content. Working on android',
      es: 'Aplicación móvil para gestión del tiempo y organización de tareas, con creación de tareas, orden de prioridades, seguimiento del progreso, programación y contenido educativo. Descargala la App en Android.',
    },
    developmentAreas: {
      en: 'Front-End, Back-End, Mobile Development',
      es: 'Front-End, Back-End, Desarrollo Móvil',
    },
    description: {
      en: 'Your Time is a mobile application designed for efficient time management and task organization. Key features include task creation, priority sorting, due dates, progress tracking, and a calendar view for easy scheduling. Built using React Native, Expo, Tailwind CSS, and Appwrite, the app is available on Android devices and includes educational content for productivity improvement. The app provides a complete system for managing tasks, offering functionalities like task updates, sorting, and custom labels, all in a user-friendly interface. The servers are live, enabling users to experience all features seamlessly on any Android device.',
      es: 'MyTime es una aplicación móvil diseñada para una gestión eficiente del tiempo y organización de tareas. Las características clave incluyen creación de tareas, orden de prioridades, fechas de vencimiento, seguimiento del progreso y una vista de calendario para una fácil programación. Construida usando React Native, Expo, Tailwind CSS y Appwrite, la aplicación está disponible en dispositivos Android e incluye contenido educativo para mejorar la productividad. La aplicación proporciona un sistema completo para gestionar tareas, ofreciendo funcionalidades como actualizaciones de tareas, ordenamiento y etiquetas personalizadas, todo en una interfaz fácil de usar. Los servidores están en vivo, permitiendo a los usuarios experimentar todas las funciones sin problemas en cualquier dispositivo Android.',
    },
    topicsSummary: {
      en: 'The app includes features such as task prioritization, task creation and management, a calendar for scheduling, educational videos for time management techniques, and a profile section for user customization.',
      es: 'La aplicación incluye funciones como priorización de tareas, creación y gestión de tareas, un calendario para programación, videos educativos sobre técnicas de gestión del tiempo y una sección de perfil para personalización del usuario.',
    },
    technologies: ['react-native', 'expo', 'appwrite', 'tailwind', 'jest', 'javascript'],
    images: [
      { src: '/projects/MyTime.png', alt: { en: 'MyTime task list', es: 'Lista de tareas de MyTime' } },
      { src: '/projects/MyTime1.png', alt: { en: 'MyTime calendar view', es: 'Vista de calendario de MyTime' } },
      { src: '/projects/MyTime2.png', alt: { en: 'MyTime task detail', es: 'Detalle de tarea en MyTime' } },
      { src: '/projects/MyTime3.png', alt: { en: 'MyTime profile section', es: 'Sección de perfil en MyTime' } },
    ],
    links: [
      { kind: 'github', href: 'https://github.com/joseortega9988/MyTime' },
      { kind: 'documentation', href: 'https://github.com/joseortega9988/MyTime/blob/main/README.md' },
      { kind: 'apk', href: 'https://drive.google.com/file/d/1loFDiAcy0L9hP6iAwQEiWkkvkYKEAecZ/view?pli=1' },
    ],
  },

  {
    slug: 'breast-cancer-detection',
    type: 'project',
    title: {
      en: 'Breast Cancer Detection with ML',
      es: 'Detección de Cáncer de Mama con ML',
    },
    shortDescription: {
      en: 'Clasifies breast cancer tumors as malignant or benign. It includes data preprocessing, feature scaling, k-fold cross-validation, hold-out validation, and applying machine learning models such as Logistic Regression, SVM, and Random Forest.',
      es: 'Clasifica tumores como malignos o benignos. Incluye preprocesamiento de datos, escalado de características, validación cruzada k-fold, validación hold-out y aplicación de machine learning automático como Regresión Logística, SVM',
    },
    developmentAreas: {
      en: 'Machine Learning, Data Analysis, Databases',
      es: 'Machine Learning, Base de Datos',
    },
    description: {
      en: 'The Breast Cancer Detection project uses machine learning techniques to classify breast cancer tumors as malignant, benign or normal based on diagnostic data. The project is built using Python and involves preprocessing the data, performing exploratory data analysis, and applying machine learning algorithms such as Logistic Regression, Support Vector Machines (SVM), and Random Forest Classifier. The dataset used is from the Wisconsin Breast Cancer Dataset, which contains features calculated from a digitized image of a fine needle aspirate (FNA) of a breast mass. Key processes include feature scaling, model evaluation, hyperparameter tuning, and validation techniques like k-fold cross-validation and hold-out validation. The project aims to provide an effective way to predict the malignancy of breast cancer, improving early diagnosis and treatment outcomes.',
      es: 'El proyecto de Detección de Cáncer de Mama utiliza técnicas de Machine Learning para clasificar tumores de cáncer de mama como malignos, benignos o normales basados en datos de diagnóstico. El proyecto está construido usando Python e involucra preprocesamiento de datos, análisis exploratorio de datos y aplicación de algoritmos de Machine Learning como Regresión Logística, Máquinas de Vectores de Soporte (SVM) y Clasificador de Bosque Aleatorio. El conjunto de datos utilizado es el Wisconsin Breast Cancer Dataset, que contiene características calculadas a partir de una imagen digitalizada de una aspiración con aguja fina (FNA) de una masa mamaria. Los procesos clave incluyen escalado de características, evaluación de modelos, ajuste de hiperparámetros y técnicas de validación como validación cruzada k-fold y validación hold-out. El proyecto tiene como objetivo proporcionar una forma efectiva de predecir la malignidad del cáncer de mama, mejorando el diagnóstico temprano y los resultados del tratamiento.',
    },
    topicsSummary: {
      en: "The project involves analyzing the Wisconsin Breast Cancer Dataset, cleaning and preprocessing the data, performing exploratory data analysis, and building several machine learning models, including Logistic Regression, Support Vector Machines, and Random Forest Classifier, to classify tumors. Validation techniques such as k-fold cross-validation and hold-out validation were used to evaluate the models' performance. The goal is to provide a reliable tool for early breast cancer detection, assisting in better treatment outcomes.",
      es: 'El proyecto involucra analizar el Wisconsin Breast Cancer Dataset, limpiar y preprocesar los datos, realizar análisis exploratorio de datos y construir varios modelos de Machine Learning, incluyendo Regresión Logística, Máquinas de Vectores de Soporte y Clasificador de Bosque Aleatorio, para clasificar tumores. Se utilizaron técnicas de validación como validación cruzada k-fold y validación hold-out para evaluar el rendimiento de los modelos. El objetivo es proporcionar una herramienta confiable para la detección temprana del cáncer de mama, ayudando a mejores resultados de tratamiento.',
    },
    technologies: [
      'python', 'pandas', 'numpy', 'keras', 'tensorflow', 'scikit-learn', 'jupyter',
    ],
    images: [
      { src: '/projects/BreastCancer.png', alt: { en: 'Model evaluation output', es: 'Resultados de evaluación del modelo' } },
      { src: '/projects/BreastCancer1.png', alt: { en: 'Exploratory data analysis plots', es: 'Gráficos de análisis exploratorio de datos' } },
      { src: '/projects/BreastCancer2.png', alt: { en: 'Classifier comparison', es: 'Comparación de clasificadores' } },
    ],
    links: [
      { kind: 'github', href: 'https://github.com/joseortega9988/Machine-Learning-Cancer' },
      { kind: 'documentation', href: 'https://github.com/joseortega9988/Machine-Learning-Cancer/blob/main/README.md' },
    ],
  },
];

const BY_SLUG = new Map(ENTRIES.map((entry) => [entry.slug, entry]));

export function getEntry(slug: string): PortfolioEntry | undefined {
  return BY_SLUG.get(slug as EntrySlug);
}

export const ENTRY_SLUGS: readonly EntrySlug[] = ENTRIES.map((entry) => entry.slug);
