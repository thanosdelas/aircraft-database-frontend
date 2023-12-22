import { reactive } from 'vue'

export const store = reactive({
  authentication: {
    loggedIn: false
  }
});
