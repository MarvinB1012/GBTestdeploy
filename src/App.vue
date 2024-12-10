<script>
import Navbar from './components/Navbar.vue';
import { useRoute, useRouter } from 'vue-router';
import { msalInstance } from './authConfig';

export default {
  name: 'App',
  components: {
    Navbar
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    return { route, router };
  },
  mounted() {
    msalInstance.handleRedirectPromise()
      .then((response) => {
        if (response) {
          // Successfully logged in
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            msalInstance.setActiveAccount(accounts[0]);
            // Get redirect path or default to /room
            const redirectPath = sessionStorage.getItem('loginRedirect') || '/room';
            sessionStorage.removeItem('loginRedirect');
            this.router.push(redirectPath);
          }
        }
      })
      .catch(error => {
        console.error('Failed to handle redirect:', error);
        this.router.push('/login');
      });

    // Check if we have an active account
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
    }
  }
}
</script>

<template>
  <navbar v-if="!route.meta.hideNavbar"/>
  <RouterView />
</template>

<style>
  #app {
    padding-top: 100px;
    max-height: 100vh;
    max-width: 100vw;
    display: flex;
    flex-direction: column;
  }
  #app:has(.login-view){
    padding-top: 0;
  }
</style>






