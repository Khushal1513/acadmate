const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com/api' 
  : 'http://localhost:5000/api';

class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      let data;
      
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON, use status text
        if (!response.ok) {
          const error = new Error(response.statusText || 'Something went wrong');
          error.status = response.status;
          throw error;
        }
        return { message: 'Success' };
      }
      
      if (!response.ok) {
        const error = new Error(data.message || data.error || 'Something went wrong');
        error.status = response.status;
        error.data = data;
        throw error;
      }
      
      return data;
    } catch (error) {
      // Re-throw with status if it's a response error
      if (error.status) {
        throw error;
      }
      throw new Error(error.message || 'Network error');
    }
  }

  static async sendOTP(email) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  static async verifyOTP(email, otp) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  static async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async login(credentials) {
  return this.request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}


  static async getProfile() {
    return this.request('/auth/profile');
  }

   static async sendReminderEmail(email, eventTitle, eventDate) {
    return this.request('/reminder/send', {
      method: 'POST',
      body: JSON.stringify({ email, eventTitle, eventDate }),
    });
  }

}

export default ApiService;