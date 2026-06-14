import 'dotenv/config';
import express from 'express';
import errorHandler from './middlewares/errorHandler.js';
import process from 'process';

// ? 1. Import Services
import UsersService from './services/postgres/UsersService.js';
import AuthenticationsService from './services/postgres/AuthenticationsService.js';

// ? 2. Import Token Manager
import TokenManager from './tokenize/TokenManager.js';

// ?  3. Import Validators
import UsersValidator from './validator/users/index.js';
import AuthenticationsValidator from './validator/authentications/index.js';

// ?  4. Import API Profile
import createUsersApi from './api/users/index.js';
import createAuthenticationsApi from './api/authentications/index.js';
import createProfileApi from './api/profile/index.js';

// ? 5. Import API Companies
import CompaniesService from './services/postgres/CompaniesService.js';
import CompaniesValidator from './validator/companies/index.js';
import createCompaniesApi from './api/companies/index.js';

// ? 6. Import API Categories
import CategoriesService from './services/postgres/CategoriesService.js';
import CategoriesValidator from './validator/categories/index.js';
import createCategoriesApi from './api/categories/index.js';

// ? 7. Import API Jobs
import JobsService from './services/postgres/JobsService.js';
import JobsValidator from './validator/jobs/index.js';
import createJobsApi from './api/jobs/index.js';

// ? 8. Import API Applications
import ApplicationsService from './services/postgres/ApplicationsService.js';
import ApplicationsValidator from './validator/applications/index.js';
import createApplicationsApi from './api/applications/index.js';

// ? 9. Import API Bookmarks
import BookmarksService from './services/postgres/BookmarksService.js';
import BookmarksValidator from './validator/bookmarks/index.js';
import createBookmarksApi from './api/bookmarks/index.js';

// ? 10. Import API Documents
import DocumentsService from './services/postgres/DocumentsService.js';
import createDocumentsApi from './api/documents/index.js';

// ? RabbitMQ
import { connectRabbitMQ } from './config/rabbitmq.js';

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

app.use(express.json());

// Inisialisasi Service
const usersService = new UsersService();
const authenticationsService = new AuthenticationsService();
const companiesService = new CompaniesService();
const categoriesService = new CategoriesService();
const jobsService = new JobsService();
const applicationsService = new ApplicationsService();
const bookmarksService = new BookmarksService();
const documentsService = new DocumentsService();


// Registrasi API Modul
app.use('/users', createUsersApi(usersService, UsersValidator));

app.use(
  '/authentications',
  createAuthenticationsApi(
    authenticationsService,
    usersService,
    TokenManager,
    AuthenticationsValidator
  )
);

app.use('/profile', createProfileApi(usersService, applicationsService, bookmarksService));
app.use('/companies', createCompaniesApi(companiesService, CompaniesValidator));
app.use('/categories', createCategoriesApi(categoriesService, CategoriesValidator));
app.use('/jobs', createJobsApi(jobsService, JobsValidator));
app.use('/applications', createApplicationsApi(applicationsService, ApplicationsValidator));
app.use('/bookmarks', createBookmarksApi(bookmarksService, BookmarksValidator));
app.use('/documents', createDocumentsApi(documentsService));

app.get('/', (req, res) => {
    res.send({ message: 'OpenJob RESTful API V1 is running with ES Modules!' });
});

app.use((req,res) => {
  res.status(404).json({
    status: 'failed',
    message: 'Halaman atau endpoint tidak ditemukan',
  })
})

app.use(errorHandler);

const start = async () => {
    await connectRabbitMQ();
    app.listen(port, host, () => {
        console.log(`Server berjalan pada http://${host}:${port}`);
    });
};

start();