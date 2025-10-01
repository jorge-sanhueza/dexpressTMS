// services/devTokenService.ts (in your frontend)
export const devTokenService = {
  // Simple base64 encoding for development - NOT secure for production!
  createDevToken(user: any): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      tenant_id: user.tenant_id,
      permissions: user.permissions,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    }));
    const signature = btoa('dev-signature');
    
    return `${header}.${payload}.${signature}`;
  },

  // Update your login to use this
  async loginWithDevToken(email: string, password: string) {
    // Your existing login logic
    const response = await fetch('/api/auth/test-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const loginData = await response.json();
    
    // Create a dev token instead of using the Auth0 token
    const devToken = this.createDevToken(loginData.user);
    
    // Store the dev token
    localStorage.setItem('access_token', devToken);
    localStorage.setItem('user', JSON.stringify(loginData.user));
    
    return { ...loginData, access_token: devToken };
  }
};