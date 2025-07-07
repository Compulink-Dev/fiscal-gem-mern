// types/auth.d.ts or in your context file
interface Tenant {
    _id: string;
    // other tenant properties...
  }
  
  interface User {
    // other user properties...
    tenant: string | Tenant; // This is what's causing your error
  }