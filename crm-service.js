/**
 * CRMConnector - Servicio de integración con CRM MVP Solutions 365
 * Gestiona la autenticación Sanctum y el consumo de endpoints de la API v1.
 */
class CRMConnector {
    constructor() {
        // En desarrollo local con Vite, usamos el Proxy para evitar CORS
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        // Restauramos /v1 en la base para que todas las rutas lo tengan por defecto
        this.baseUrl = isLocal ? '/api/v1' : 'https://mvpsolutions365.com/api/v1';

        console.log(`>>> CRM SERVICE LOADED V6 (Base: ${this.baseUrl}) <<<`);

        this.tokenKey = 'crm_auth_token';
        this.clientTokenKey = 'crm_client_token';
        this.slug = 'smart-trip-colombia'; // Slug por defecto para la agencia
    }

    /**
     * Helper privado para realizar peticiones fetch con los headers correctos
     */
    async _request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const rawToken = localStorage.getItem(this.tokenKey) || localStorage.getItem(this.clientTokenKey);
        const token = rawToken ? rawToken.trim() : null;

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers: { ...headers, ...options.headers },
            // Cambiamos a 'include' por si el servidor usa cookies de sesión junto al token
            credentials: 'include'
        };

        console.log(`--- API REQ V7 ---: ${options.method || 'GET'} ${url}`);
        if (token) console.log(`--- TOKEN SENT ---: ${token.substring(0, 15)}...`);

        try {
            const response = await fetch(url, config);

            // Intentar leer la respuesta como texto primero para evitar errores de parseo
            const responseText = await response.text();
            let data = {};

            try {
                data = responseText ? JSON.parse(responseText) : {};
            } catch (e) {
                console.error("La respuesta no es un JSON válido:", responseText);
                throw {
                    status: response.status,
                    message: `Error del servidor (no JSON): ${responseText.substring(0, 100)}...`
                };
            }

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.message || 'Error en la petición al CRM',
                    errors: data.errors
                };
            }

            return data;
        } catch (error) {
            console.error(`CRM Error (${endpoint}):`, error);
            throw error;
        }
    }

    // --- 1. GESTIÓN DE AUTENTICACIÓN ---

    /**
     * Login de Usuario Administrativo
     */
    async loginUser(email, password) {
        try {
            const response = await this._request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            console.log(">>> FULL CRM LOGIN RESPONSE:", JSON.stringify(response));

            // Extraer token de múltiples niveles posibles
            const token = response.token || (response.data && response.data.token) ||
                response.access_token || (response.data && response.data.access_token);

            // Extraer datos de usuario si vienen en el login
            const userData = response.user || response.data?.user || response.data;

            if (token) {
                localStorage.setItem(this.tokenKey, token.trim());
                response.token = token.trim();

                // Guardamos el perfil inmediatamente para que el dashboard no dependa de /me
                if (userData && userData.name) {
                    localStorage.setItem('crm_user_profile', JSON.stringify(userData));
                    console.log(">>> Perfil de usuario guardado localmente:", userData.name);
                }
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Login de Cliente
     */
    async loginClient(email, password) {
        try {
            const response = await this._request('/client/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            console.log("Respuesta de Login de Cliente:", response);

            const token = response.token || (response.data && response.data.token) ||
                response.access_token || (response.data && response.data.access_token);

            if (token) {
                localStorage.setItem(this.clientTokenKey, token);
                response.token = token;
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener perfil del usuario actual (Sanctum)
     */
    async getMe() {
        return await this._request('/auth/me');
    }

    /**
     * Cerrar Sesión y limpiar rastro
     */
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.clientTokenKey);
        // Intentar limpiar cookies para evitar que Sanctum las use en lugar del Bearer
        document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        console.log("Sesión y cookies del navegador limpiadas.");
    }

    /**
     * Verificar si la sesión sigue activa
     */
    async checkAuth() {
        try {
            return await this._request('/auth/check', { method: 'GET' });
        } catch (error) {
            this.logout();
            return false;
        }
    }

    /**
     * Cerrar sesión y limpiar tokens
     */
    logout() {
        console.log("CRM Logout called");
        console.trace();
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.clientTokenKey);
    }

    // --- 2. CONSUMO DE DATOS ---

    /**
     * Obtener información pública de la agencia
     */
    async getAgencyInfo(slug = this.slug) {
        return await this._request(`/agency/${slug}`, { method: 'GET' });
    }

    /**
     * Listar paquetes turísticos de la agencia
     */
    async getPackages(slug = this.slug) {
        return await this._request(`/agency/${slug}/packages`, { method: 'GET' });
    }

    /**
     * Enviar nueva solicitud de cotización (Leads)
     */
    async sendQuotation(quotationData) {
        return await this._request('/quotation', {
            method: 'POST',
            body: JSON.stringify(quotationData)
        });
    }

    /**
     * Crear una tarea o consulta (Recordatorios)
     */
    async createTask(taskData) {
        return await this._request('/task', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    }
}

// Exportar instancia única para uso global
const crm = new CRMConnector();
window.CRM = crm; // Disponible globalmente en el navegador
