// auth.js - Authentication System for Kopi Prima
class AuthSystem {
  constructor() {
    this.baseUrl = "/api";
    this.init();
  }

  init() {
    console.log("AuthSystem initialized");
  }

  // Check current authentication status
  async checkAuth() {
    try {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const currentUser = localStorage.getItem("currentUser");
      const userRole = localStorage.getItem("userRole"); // Tambahkan ini

      console.log("checkAuth called:", { isLoggedIn, currentUser, userRole });

      // Validate if data exists and is valid
      if (isLoggedIn === "true" && currentUser) {
        try {
          const user = JSON.parse(currentUser);
          if (user && user.username && user.username.trim() !== "") {
            console.log("✅ User authenticated:", user.username);
            return {
              success: true,
              user: user,
            };
          }
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }

      console.log("❌ No valid authentication found");
      return { success: false };
    } catch (error) {
      console.error("Auth check error:", error);
      return { success: false };
    }
  }

  // Login user
  async login(username, password, role = "customer") {
    try {
      console.log("Attempting login for:", username, "Role:", role);

      // Simulate API response for demo
      // In production, replace with actual API call
      const mockUsers = [
        {
          id: 1,
          username: "admin",
          password: "admin123",
          role: "admin",
          email: "admin@kopiprima.co.id",
          name: "Admin User",
        },
        {
          id: 2,
          username: "john",
          password: "john123",
          role: "customer",
          email: "john@example.com",
          name: "John Doe",
        },
        {
          id: 3,
          username: "sarah",
          password: "sarah123",
          role: "customer",
          email: "sarah@example.com",
          name: "Sarah Smith",
        },
      ];

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const user = mockUsers.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        // Store authentication data
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("userName", user.name || user.username);
        localStorage.setItem("userEmail", user.email || "");
        localStorage.setItem("userRole", user.role || "customer");
        localStorage.setItem("loginTimestamp", Date.now().toString());

        // Set flag for showing notification
        sessionStorage.setItem("justLoggedIn", "true");

        console.log("✅ Login successful, user data stored");

        // Trigger UI update
        this.updateAuthUI();

        return {
          success: true,
          message: "Login berhasil!",
          user: user,
          redirectUrl: "index.html",
        };
      } else {
        return {
          success: false,
          message: "Username atau password salah",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Terjadi kesalahan jaringan. Coba lagi nanti.",
      };
    }
  }

  // Register user
  async register(userData) {
    try {
      console.log("Registering user:", userData.username);

      // Simulate API response for demo
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if username already exists (in demo)
      const existingUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      );
      const exists = existingUsers.some(
        (u) => u.username === userData.username
      );

      if (exists) {
        return {
          success: false,
          message: "Username sudah digunakan",
        };
      }

      // Add new user
      const newUser = {
        id: existingUsers.length + 1,
        ...userData,
        role: "customer",
        createdAt: new Date().toISOString(),
      };

      existingUsers.push(newUser);
      localStorage.setItem("registeredUsers", JSON.stringify(existingUsers));

      return {
        success: true,
        message: "Registrasi berhasil! Silakan login.",
        user: newUser,
      };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        message: "Terjadi kesalahan jaringan. Coba lagi nanti.",
      };
    }
  }

  // Logout user - TANPA REDIRECT KE LOGIN
  async logout() {
    try {
      console.log("Logging out user...");

      // Get username before clearing for logging
      const currentUser = this.getCurrentUser();
      const username = currentUser ? currentUser.username : "Unknown";

      // Clear ALL authentication data from localStorage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole"); // Tambahkan ini
      localStorage.removeItem("loginTimestamp");

      // Clear sessionStorage as well
      sessionStorage.clear();

      // Clear any auth-related cookies
      this.clearAuthCookies();

      console.log(`✅ User "${username}" logged out successfully`);
      console.log("✅ All auth data cleared from storage");

      // Force UI update
      this.updateAuthUI();

      return {
        success: true,
        message: "Logout berhasil! Anda sekarang dalam mode Guest.",
        username: username,
      };
    } catch (error) {
      console.error("Logout error:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat logout.",
      };
    }
  }

  // Clear authentication cookies
  clearAuthCookies() {
    try {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name =
          eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

        // Clear auth-related cookies
        if (
          name.includes("auth") ||
          name.includes("session") ||
          name.includes("token")
        ) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      }
    } catch (error) {
      console.error("Error clearing cookies:", error);
    }
  }

  // Update UI based on authentication status - DIPERBAIKI
  async updateAuthUI() {
    try {
      const auth = await this.checkAuth();
      console.log("updateAuthUI - auth status:", auth);

      const userInfo = document.getElementById("userInfo");
      const loginBtn = document.getElementById("loginBtn");
      const logoutBtn = document.getElementById("logoutBtn");
      const userName = document.getElementById("userName");
      const userGreeting = document.getElementById("userGreeting");

      if (auth.success && auth.user) {
        // User is logged in
        console.log("Setting UI to logged in state for:", auth.user.username);

        // Update semua elemen UI
        if (userInfo) {
          userInfo.textContent = `Halo, ${
            auth.user.name || auth.user.username
          }`;
          userInfo.classList.remove("d-none");
        }

        // Sembunyikan tombol login
        if (loginBtn) {
          loginBtn.classList.add("d-none");
        }

        // Tampilkan tombol logout
        if (logoutBtn) {
          logoutBtn.classList.remove("d-none");
        }

        // Update nama user di hero section
        if (userName) {
          userName.textContent = auth.user.name || auth.user.username;
        }

        if (userGreeting) {
          userGreeting.textContent = `Selamat datang, ${
            auth.user.name || auth.user.username
          }!`;
        }

        // Tambahkan nama ke localStorage untuk konsistensi
        localStorage.setItem("userName", auth.user.name || auth.user.username);
      } else {
        // User is not logged in (Guest)
        console.log("Setting UI to guest state");

        if (userInfo) {
          userInfo.textContent = "";
          userInfo.classList.add("d-none");
        }

        // Tampilkan tombol login
        if (loginBtn) {
          loginBtn.classList.remove("d-none");
          loginBtn.textContent = "Login";
          loginBtn.href = "login.html";
        }

        // Sembunyikan tombol logout
        if (logoutBtn) {
          logoutBtn.classList.add("d-none");
        }

        if (userName) {
          userName.textContent = "Guest";
        }

        if (userGreeting) {
          userGreeting.textContent = "Selamat datang, Guest!";
        }

        // Ensure localStorage is clean
        this.ensureCleanStorage();
      }

      console.log("UI update complete");
    } catch (error) {
      console.error("Error updating auth UI:", error);
    }
  }

  // Ensure localStorage is clean when user is not authenticated
  ensureCleanStorage() {
    try {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (isLoggedIn !== "true") {
        // Clear any residual auth data
        localStorage.removeItem("currentUser");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        localStorage.removeItem("loginTimestamp");
      }
    } catch (error) {
      console.error("Error ensuring clean storage:", error);
    }
  }

  // Protect routes - redirect to login if not authenticated
  protectRoute(requiredRole = null) {
    this.checkAuth().then((auth) => {
      if (!auth.success) {
        console.log("Route protected - redirecting to login");
        window.location.href = "login.html";
      } else if (requiredRole && auth.user.role !== requiredRole) {
        // Check role permission
        console.log("Insufficient permissions - redirecting");
        window.location.href = "index.html";
      }
    });
  }

  // Get current user data
  getCurrentUser() {
    try {
      const userData = localStorage.getItem("currentUser");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    return isLoggedIn === "true";
  }

  // Get user's name
  getUserName() {
    const user = this.getCurrentUser();
    return user ? user.name || user.username : "Guest";
  }

  // Get user's role
  getUserRole() {
    return localStorage.getItem("userRole") || "customer";
  }

  // Validate session (check if login is still valid)
  validateSession() {
    try {
      const loginTimestamp = localStorage.getItem("loginTimestamp");
      if (!loginTimestamp) return false;

      const loginTime = parseInt(loginTimestamp);
      const currentTime = Date.now();
      const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      // Check if session is expired
      if (currentTime - loginTime > sessionDuration) {
        console.log("Session expired, auto logging out...");
        this.logout(); // Auto logout tanpa redirect
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating session:", error);
      return false;
    }
  }

  // Get auth status for debugging
  getAuthStatus() {
    return {
      isLoggedIn: localStorage.getItem("isLoggedIn"),
      currentUser: this.getCurrentUser(),
      userName: localStorage.getItem("userName"),
      userRole: localStorage.getItem("userRole"),
      loginTimestamp: localStorage.getItem("loginTimestamp"),
    };
  }
}

// Create global auth instance
const auth = new AuthSystem();

// Initialize auth system when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded - initializing auth...");

  // Validate session on page load
  auth.validateSession();

  // Update UI
  auth.updateAuthUI();

  // Setup event listeners untuk logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async function (e) {
      e.preventDefault();
      const result = await auth.logout();
      if (result.success) {
        // Show notification if notification system exists
        if (typeof showLogoutNotification === "function") {
          showLogoutNotification();
        }
        // Redirect ke index.html setelah logout
        window.location.href = "index.html";
      }
    });
  }
});

// Make auth system globally accessible
window.authSystem = auth;

// Global helper functions
window.checkLogin = function () {
  return auth.checkAuth();
};

// Logout function yang benar
window.logoutUser = async function () {
  const result = await auth.logout();
  if (result.success) {
    console.log("Logout successful");
    // Redirect ke halaman utama
    window.location.href = "index.html";
  }
  return result;
};

window.getCurrentUser = function () {
  return auth.getCurrentUser();
};

window.getAuthStatus = function () {
  return auth.getAuthStatus();
};

// Helper untuk check jika user adalah admin
window.isAdmin = function () {
  return auth.getUserRole() === "admin";
};

// Export for module systems (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = AuthSystem;
}
