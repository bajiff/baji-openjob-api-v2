import JobsHandler from './handler.js';
import routes from './routes.js';

const createJobsApi = (service, validator) => {
  const jobsHandler = new JobsHandler(service, validator);
  return routes(jobsHandler);
};

export default createJobsApi;