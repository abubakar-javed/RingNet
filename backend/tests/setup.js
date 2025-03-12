// This prevents any module not found errors
jest.mock('../../controllers/authController', () => ({}), { virtual: true });
jest.mock('../../controllers/earthquakeController', () => ({}), { virtual: true });
jest.mock('../../controllers/floodController', () => ({}), { virtual: true });
jest.mock('../../controllers/weatherController', () => ({}), { virtual: true });

jest.mock('../../models/User', () => ({}), { virtual: true });
jest.mock('../../models/EarthquakeData', () => ({}), { virtual: true });
jest.mock('../../models/FloodData', () => ({}), { virtual: true });

jest.mock('axios', () => ({}), { virtual: true });
jest.mock('bcryptjs', () => ({}), { virtual: true });
jest.mock('jsonwebtoken', () => ({}), { virtual: true }); 