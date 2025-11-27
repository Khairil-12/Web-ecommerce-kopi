class AuthSystem {
  constructor() {
    this.baseUrl = "/api";
  }

  async checkAuth() {
    try {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const currentUser = localStorage.getItem("currentUser");

      if (isLoggedIn && currentUser) {
        return {
          success: true,
          user: JSON.parse(currentUser),
        };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error("Auth check error:", error);
      return { success: false };
    }
  }

  // Login user
  async login(username, password) {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        localStorage.setItem("userName", data.user.username);
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Terjadi kesalahan jaringan" };
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, message: "Terjadi kesalahan jaringan" };
    }
  }

  // Logout user
  async logout() {
    try {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");

      return { success: true, message: "Logout berhasil!" };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, message: "Terjadi kesalahan" };
    }
  }

  async updateAuthUI() {
    const auth = await this.checkAuth();
    const userInfo = document.getElementById("userInfo");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const userName = document.getElementById("userName");
    const userGreeting = document.getElementById("userGreeting");

    if (auth.success && auth.user) {
      if (userInfo) {
        userInfo.textContent = `Hello, ${auth.user.username}`;
        userInfo.style.display = "inline";
      }
      if (loginBtn) loginBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "inline";
      if (userName) userName.textContent = auth.user.username;
      if (userGreeting)
        userGreeting.textContent = `Selamat datang, ${auth.user.username}!`;

      localStorage.setItem("userName", auth.user.username);
      localStorage.setItem("userEmail", auth.user.email);
    } else {
      if (userInfo) userInfo.style.display = "none";
      if (loginBtn) loginBtn.style.display = "inline";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (userName) {
        const storedName = localStorage.getItem("userName");
        userName.textContent = storedName || "Guest";
      }
      if (userGreeting) userGreeting.textContent = "Selamat datang, Guest!";
    }
  }

  protectRoute() {
    this.checkAuth().then((auth) => {
      if (!auth.success) {
        window.location.href = "/login.html";
      }
    });
  }

  getCurrentUser() {
    const userData = localStorage.getItem("currentUser");
    return userData ? JSON.parse(userData) : null;
  }
}

const auth = new AuthSystem();

document.addEventListener("DOMContentLoaded", function () {
  auth.updateAuthUI();
});

window.authSystem = auth;

window.checkLogin = function () {
  return auth.checkAuth();
};

window.logoutUser = function () {
  auth.logout().then((result) => {
    if (result.success) {
      window.location.href = "/login.html";
    }
  });
};
