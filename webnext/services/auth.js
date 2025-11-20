export const mockLogin = async (email, password) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: '1',
        email,
        name: email.split('@')[0],
        token: 'mock-token-' + Math.random().toString(36),
      });
    }, 500);
  });
};

export const mockRegister = async (name, email, password) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: '2',
        email,
        name,
        token: 'mock-token-' + Math.random().toString(36),
      });
    }, 500);
  });
};

export const mockLogout = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 300);
  });
};
