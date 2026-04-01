/**
 * CRMConnector - Servicio de integración con CRM MVP Solutions 365
 * Gestiona la autenticación Sanctum y el consumo de endpoints de la API v1.
 */
class CRMConnector {
    constructor() {
        // En desarrollo local con Vite, usamos el Proxy para evitar CORS
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        // Base URL dinámica: usa el proxy si estamos en un puerto de Vite (ej: 5173, 5174)
        const isVite = window.location.port !== '' && window.location.port !== '80' && window.location.port !== '443';
        
        if (isVite) {
            this.baseUrl = '/api/v1'; // Usa el proxy de vite.config.js para evitar CORS
        } else if (isLocal) {
            this.baseUrl = 'http://127.0.0.1:8000/api/v1'; // Conexión directa al backend artisan desde Apache
        } else {
            this.baseUrl = 'https://mvpsolutions365.com/api/v1'; // Configuración de producción
        }

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
            credentials: 'include'
        };

        console.log(`--- API REQ ---: ${options.method || 'GET'} ${url}`);

        try {
            const response = await fetch(url, config);
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

    async loginUser(email, password) {
        const response = await this._request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        const token = response.token || response.data?.token || response.access_token || response.data?.access_token;
        if (token) localStorage.setItem(this.tokenKey, token.trim());
        return response;
    }

    async loginClient(email, password) {
        const response = await this._request('/client/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        const token = response.token || response.data?.token || response.access_token || response.data?.access_token;
        if (token) localStorage.setItem(this.clientTokenKey, token.trim());
        return response;
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.clientTokenKey);
    }

    // --- 2. CONSUMO DE DATOS PAQUETES ---

    async getPublicPackages(filters = {}) {
        const queryParams = new URLSearchParams({
            status: 'active',
            only_active_schedules: true,
            ...filters
        });
        return await this._request(`/packages?${queryParams.toString()}`, { method: 'GET' });
    }

    async getPublicDestinations() {
        return await this._request('/packages/destinations', { method: 'GET' });
    }

    async getPackageDetail(id) {
        return await this._request(`/packages/${id}?only_active_schedules=true`, { method: 'GET' });
    }

    async getPublicSchedule(id) {
        return await this._request(`/packages/schedules/${id}`, { method: 'GET' });
    }
}

const crm = new CRMConnector();
window.CRM = crm;
