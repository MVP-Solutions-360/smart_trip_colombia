# Ejemplos de Uso - API de Autenticación

## Ejemplos Prácticos

### 1. Flujo Completo de Autenticación

```javascript
class AuthAPI {
    constructor(baseUrl = '/api/v1') {
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem('auth_token');
    }

    // Login
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.data.token;
                localStorage.setItem('auth_token', this.token);
                return data.data;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    // Verificar si está autenticado
    async checkAuth() {
        try {
            const response = await fetch(`${this.baseUrl}/api/check`);
            const data = await response.json();
            return data.authenticated;
        } catch (error) {
            return false;
        }
    }

    // Obtener información del usuario
    async getMe() {
        if (!this.token) {
            throw new Error('No hay token de autenticación');
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/me`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            throw error;
        }
    }

    // Logout
    async logout() {
        if (!this.token) {
            return;
        }

        try {
            await fetch(`${this.baseUrl}/api/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            this.token = null;
            localStorage.removeItem('auth_token');
        }
    }

    // Refrescar token
    async refreshToken() {
        if (!this.token) {
            throw new Error('No hay token de autenticación');
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/refresh`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.data.token;
                localStorage.setItem('auth_token', this.token);
                return data.data;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error al refrescar token:', error);
            throw error;
        }
    }
}

// Uso
const auth = new AuthAPI();

// Login
auth.login('usuario@ejemplo.com', 'contraseña123')
    .then(user => {
        console.log('Usuario logueado:', user);
    })
    .catch(error => {
        console.error('Error de login:', error.message);
    });
```

### 2. Manejo de Errores Específicos

```javascript
async function handleLogin(email, password) {
    try {
        const response = await fetch('/api/v1/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Login exitoso
            return data.data;
        } else {
            // Manejar errores específicos
            switch (data.error_code) {
                case 'INVALID_CREDENTIALS':
                    throw new Error('Email o contraseña incorrectos');
                case 'EMAIL_NOT_VERIFIED':
                    throw new Error('Debe verificar su email antes de continuar');
                case 'VALIDATION_ERROR':
                    throw new Error('Datos inválidos: ' + Object.values(data.errors).flat().join(', '));
                default:
                    throw new Error(data.message || 'Error desconocido');
            }
        }
    } catch (error) {
        if (error.name === 'TypeError') {
            throw new Error('Error de conexión con el servidor');
        }
        throw error;
    }
}
```

### 3. Interceptor para Requests Automáticos

```javascript
class APIClient {
    constructor(baseUrl = '/api/v1') {
        this.baseUrl = baseUrl;
        this.token = localStorage.getItem('auth_token');
    }

    // Interceptor para agregar token automáticamente
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Accept': 'application/json',
            ...options.headers
        };

        // Agregar token si existe
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            
            // Si el token expiró, intentar refrescar
            if (response.status === 401 && this.token) {
                try {
                    await this.refreshToken();
                    // Reintentar con nuevo token
                    config.headers['Authorization'] = `Bearer ${this.token}`;
                    return await fetch(url, config);
                } catch (refreshError) {
                    // Si no se puede refrescar, redirigir al login
                    this.logout();
                    window.location.href = '/login';
                    throw refreshError;
                }
            }

            return response;
        } catch (error) {
            console.error('Error en request:', error);
            throw error;
        }
    }

    // Métodos HTTP
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Métodos de autenticación
    async login(email, password) {
        const response = await this.post('/api/login', { email, password });
        const data = await response.json();

        if (data.success) {
            this.token = data.data.token;
            localStorage.setItem('auth_token', this.token);
        }

        return data;
    }

    async logout() {
        if (this.token) {
            try {
                await this.post('/api/logout');
            } catch (error) {
                console.error('Error en logout:', error);
            }
        }

        this.token = null;
        localStorage.removeItem('auth_token');
    }

    async refreshToken() {
        const response = await this.post('/api/refresh');
        const data = await response.json();

        if (data.success) {
            this.token = data.data.token;
            localStorage.setItem('auth_token', this.token);
        }

        return data;
    }
}

// Uso
const api = new APIClient();

// Login
api.login('usuario@ejemplo.com', 'contraseña123')
    .then(data => {
        if (data.success) {
            console.log('Usuario logueado:', data.data.user);
        }
    });

// Hacer requests autenticados
api.get('/user/profile')
    .then(response => response.json())
    .then(data => console.log('Perfil:', data));
```

### 4. React Hook para Autenticación

```javascript
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('auth_token'));

    const api = new APIClient();

    // Verificar autenticación al cargar
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const response = await api.get('/api/me');
                    const data = await response.json();
                    
                    if (data.success) {
                        setUser(data.data);
                    } else {
                        setToken(null);
                        localStorage.removeItem('auth_token');
                    }
                } catch (error) {
                    setToken(null);
                    localStorage.removeItem('auth_token');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [token]);

    const login = async (email, password) => {
        try {
            const data = await api.login(email, password);
            
            if (data.success) {
                setUser(data.data.user);
                setToken(data.data.token);
                return { success: true };
            } else {
                return { success: false, error: data.message };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
        setToken(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
}

// Componente de Login
function LoginForm() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await login(email, password);
        
        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
            />
            {error && <div className="error">{error}</div>}
            <button type="submit">Iniciar Sesión</button>
        </form>
    );
}

// Componente protegido
function ProtectedComponent() {
    const { user, isAuthenticated, logout } = useAuth();

    if (!isAuthenticated) {
        return <div>Debe iniciar sesión</div>;
    }

    return (
        <div>
            <h1>Bienvenido, {user.name}</h1>
            <p>Email: {user.email}</p>
            <p>Tipo: {user.user_type}</p>
            <button onClick={logout}>Cerrar Sesión</button>
        </div>
    );
}
```

### 5. Ejemplo con Vue.js

```javascript
// store/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('auth_token'),
        loading: false
    }),

    getters: {
        isAuthenticated: (state) => !!state.user,
        userType: (state) => state.user?.user_type
    },

    actions: {
        async login(email, password) {
            this.loading = true;
            
            try {
                const response = await fetch('/api/v1/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    this.user = data.data.user;
                    this.token = data.data.token;
                    localStorage.setItem('auth_token', this.token);
                    return { success: true };
                } else {
                    return { success: false, error: data.message };
                }
            } catch (error) {
                return { success: false, error: error.message };
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            if (this.token) {
                try {
                    await fetch('/api/v1/api/logout', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.token}`,
                            'Accept': 'application/json'
                        }
                    });
                } catch (error) {
                    console.error('Error en logout:', error);
                }
            }

            this.user = null;
            this.token = null;
            localStorage.removeItem('auth_token');
        },

        async checkAuth() {
            if (!this.token) return false;

            try {
                const response = await fetch('/api/v1/api/me', {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Accept': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.success) {
                    this.user = data.data;
                    return true;
                } else {
                    this.logout();
                    return false;
                }
            } catch (error) {
                this.logout();
                return false;
            }
        }
    }
})
```

### 6. Testing con Jest

```javascript
// auth.test.js
import { AuthAPI } from './auth-api';

describe('AuthAPI', () => {
    let authAPI;

    beforeEach(() => {
        authAPI = new AuthAPI();
        localStorage.clear();
    });

    test('debe hacer login exitoso', async () => {
        // Mock fetch
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve({
                success: true,
                data: {
                    user: { id: 1, name: 'Test User', email: 'test@example.com' },
                    token: 'test-token'
                }
            })
        });

        const result = await authAPI.login('test@example.com', 'password123');

        expect(result.user.email).toBe('test@example.com');
        expect(localStorage.getItem('auth_token')).toBe('test-token');
    });

    test('debe manejar error de credenciales', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve({
                success: false,
                message: 'Credenciales incorrectas',
                error_code: 'INVALID_CREDENTIALS'
            })
        });

        await expect(authAPI.login('test@example.com', 'wrong-password'))
            .rejects.toThrow('Credenciales incorrectas');
    });

    test('debe hacer logout correctamente', async () => {
        localStorage.setItem('auth_token', 'test-token');
        authAPI.token = 'test-token';

        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve({ success: true })
        });

        await authAPI.logout();

        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(authAPI.token).toBeNull();
    });
});
```

## Consideraciones de Implementación

1. **Manejo de Tokens**: Siempre guarde el token de forma segura y verifique su validez.
2. **Refresh Automático**: Implemente lógica para refrescar tokens automáticamente.
3. **Manejo de Errores**: Implemente manejo de errores específicos para cada código de error.
4. **Seguridad**: Nunca exponga tokens en logs o consola en producción.
5. **Validación**: Valide datos en el frontend antes de enviarlos a la API.

---

**Nota**: Estos ejemplos son para propósitos educativos. En producción, implemente validaciones adicionales y manejo de errores más robusto.
