import ApplicationsHandler from './handler.js';
import routes from './routes.js';

const createApplicationsApi = (service, validator) => {
  const applicationsHandler = new ApplicationsHandler(service, validator);
  return routes(applicationsHandler);
};

export default createApplicationsApi;