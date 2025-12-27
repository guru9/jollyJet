import { container } from 'tsyringe';
import logger from '../shared/logger';

// Initialize DI container
export const initializeDIContainer = () => {
  logger.info('Initializing DI container...');
};

export default container;



