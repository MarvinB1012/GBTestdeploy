import { msalSingleton, loginRequest } from '../authConfig';

export function registerGuard(router) {
  router.beforeEach(async (to, from, next) => {
    try {
      const instance = await msalSingleton.getInstance();
      const accounts = instance.getAllAccounts();
      const isAuthenticated = accounts.length > 0;

      if (to.meta.requiresAuth) {
        if (isAuthenticated) {
          try {
            await instance.acquireTokenSilent({
              ...loginRequest,
              account: accounts[0]
            });
            return next();
          } catch (error) {
            sessionStorage.setItem('loginRedirect', to.fullPath);
            await instance.loginRedirect(loginRequest);
            return;
          }
        } else {
          sessionStorage.setItem('loginRedirect', to.fullPath);
          await instance.loginRedirect(loginRequest);
          return;
        }
      }

      if (to.path === '/login' && isAuthenticated) {
        return next('/room');
      }
      
      next();
    } catch (error) {
      console.error('Navigation guard error:', error);
      next('/login');
    }
  });
}