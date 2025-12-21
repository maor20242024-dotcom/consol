
export interface CrmConfig {
    endpoint: string;
    apiKey: string;
}

export interface CrmLead {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    source?: string;
}

export class CrmService {
    private config: CrmConfig;

    constructor() {
        this.config = {
            endpoint: process.env.IMPERIUM_CRM_ENDPOINT || process.env.CRM_ENDPOINT || "",
            apiKey: process.env.IMPERIUM_CRM_API_KEY || process.env.CRM_API_KEY || "",
        };
    }

    private get headers() {
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.config.apiKey}`,
            "X-API-Key": this.config.apiKey, // Support both common patterns
        };
    }

    /**
     * Validates if CRM is configured
     */
    public get isConfigured(): boolean {
        return !!(this.config.endpoint && this.config.apiKey);
    }

    /**
     * Generic fetch wrapper for CRM endpoints
     */
    private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        if (!this.isConfigured) {
            throw new Error("CRM Integration not configured. Missing Endpoint or API Key.");
        }

        const url = `${this.config.endpoint.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.headers,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`CRM Error (${response.status}): ${errorBody}`);
        }

        return response.json();
    }

    /**
     * Get Projects
     * Fetches the list of active projects from the CRM.
     */
    public async getProjects() {
        return this.request<any[]>("/projects");
    }

    /**
     * Push Lead
     * Sends a new lead to the CRM.
     */
    public async createLead(lead: CrmLead) {
        return this.request("/leads", {
            method: "POST",
            body: JSON.stringify(lead),
        });
    }
}

export const crmService = new CrmService();
