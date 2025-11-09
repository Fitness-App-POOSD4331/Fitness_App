export const mockAuthToken = 'mock-auth-token-12345';

export const mockUser = {
  id: 'user123',
  email: 'test@example.com',
  displayName: 'Test User',
  userName: 'testuser',
  role: 'user',
  weight: 70,
  height: 175,
  age: 25,
  sex: 'male',
  bmi: 22.9
};

export const mockAdminUser = {
  ...mockUser,
  id: 'admin123',
  email: 'admin@example.com',
  displayName: 'Admin User',
  userName: 'adminuser',
  role: 'admin'
};

export const mockRun = {
  id: 'run123',
  userId: 'user123',
  date: '2024-01-15',
  distance: 5.2,
  duration: 28,
  calories: 312,
  pace: 5.4,
  location: 'Central Park',
  notes: 'Great morning run'
};

export const mockRuns = [
  mockRun,
  {
    id: 'run456',
    userId: 'user123',
    date: '2024-01-12',
    distance: 8.5,
    duration: 45,
    calories: 510,
    pace: 5.3,
    location: 'Riverside Trail'
  },
  {
    id: 'run789',
    userId: 'user123',
    date: '2024-01-10',
    distance: 4.6,
    duration: 25,
    calories: 280,
    pace: 5.4,
    location: 'City Loop'
  }
];

export function mockFetchResponse(data: any, success: boolean = true) {
  return {
    ok: success,
    status: success ? 200 : 400,
    json: async () => ({
      success,
      ...data
    }),
    text: async () => JSON.stringify({ success, ...data }),
    headers: new Headers(),
    redirected: false,
    statusText: success ? 'OK' : 'Bad Request',
    type: 'basic' as ResponseType,
    url: '',
    clone: function() { return this; },
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData()
  } as Response;
}