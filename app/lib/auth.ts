const user = { username: 'admin', password: 'admin123', nama: 'Administrator', role: 'admin' };

export function validateLogin(username: string, password: string) {
  return username === user.username && password === user.password ? user : null;
}
