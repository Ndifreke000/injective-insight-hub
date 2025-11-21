/**
 * RPC Manager - Handles multi-RPC load balancing, health checks, and failover
 */

export interface RPCEndpoint {
    name: string;
    grpcUrl: string;
    restUrl: string;
    isHealthy: boolean;
    lastHealthCheck: number;
    avgResponseTime: number;
    failureCount: number;
    priority: 'primary' | 'secondary';
}

export interface RPCManagerConfig {
    healthCheckInterval: number; // ms
    healthCheckTimeout: number; // ms
    maxFailures: number;
    requestTimeout: number; // ms
}

const DEFAULT_CONFIG: RPCManagerConfig = {
    healthCheckInterval: 30000, // 30 seconds
    healthCheckTimeout: 5000, // 5 seconds
    maxFailures: 3,
    requestTimeout: 5000 // 5 seconds
};

class RPCManager {
    private endpoints: RPCEndpoint[] = [];
    private currentIndex = 0;
    private config: RPCManagerConfig;
    private healthCheckTimer?: NodeJS.Timeout;

    constructor(config: Partial<RPCManagerConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.initializeEndpoints();
        this.startHealthChecks();
    }

    private initializeEndpoints() {
        this.endpoints = [
            {
                name: 'PublicNode',
                grpcUrl: 'injective-grpc.publicnode.com:443',
                restUrl: 'https://injective-rpc.publicnode.com:443',
                isHealthy: true,
                lastHealthCheck: Date.now(),
                avgResponseTime: 700,
                failureCount: 0,
                priority: 'primary'
            },
            {
                name: 'Sentry TM',
                grpcUrl: 'sentry.grpc.injective.network:443',
                restUrl: 'https://sentry.tm.injective.network:443',
                isHealthy: true,
                lastHealthCheck: Date.now(),
                avgResponseTime: 900,
                failureCount: 0,
                priority: 'secondary'
            }
        ];
    }

    /**
     * Get a healthy RPC endpoint using round-robin load balancing
     */
    getHealthyRPC(): RPCEndpoint | null {
        const healthyEndpoints = this.endpoints.filter(ep => ep.isHealthy);

        if (healthyEndpoints.length === 0) {
            console.error('[RPC Manager] No healthy endpoints available');
            // Return the least failed endpoint as last resort
            return this.endpoints.reduce((prev, curr) =>
                prev.failureCount < curr.failureCount ? prev : curr
            );
        }

        // Prefer primary endpoints
        const primaryHealthy = healthyEndpoints.filter(ep => ep.priority === 'primary');
        const candidates = primaryHealthy.length > 0 ? primaryHealthy : healthyEndpoints;

        // Round-robin selection
        const selected = candidates[this.currentIndex % candidates.length];
        this.currentIndex = (this.currentIndex + 1) % candidates.length;

        return selected;
    }

    /**
     * Get RPC by priority (primary or secondary)
     */
    getRPCByPriority(priority: 'primary' | 'secondary'): RPCEndpoint | null {
        const endpoints = this.endpoints.filter(
            ep => ep.priority === priority && ep.isHealthy
        );

        if (endpoints.length === 0) {
            console.warn(`[RPC Manager] No healthy ${priority} endpoints, falling back`);
            return this.getHealthyRPC();
        }

        return endpoints[0];
    }

    /**
     * Execute a request with automatic retry and failover
     */
    async withFallback<T>(
        requestFn: (endpoint: RPCEndpoint) => Promise<T>,
        maxRetries = 2
    ): Promise<T> {
        let lastError: Error | null = null;
        let attempts = 0;

        while (attempts <= maxRetries) {
            const endpoint = this.getHealthyRPC();

            if (!endpoint) {
                throw new Error('No RPC endpoints available');
            }

            try {
                const startTime = Date.now();
                const result = await this.withTimeout(
                    requestFn(endpoint),
                    this.config.requestTimeout
                );

                // Update metrics on success
                const responseTime = Date.now() - startTime;
                this.updateMetrics(endpoint, responseTime, true);

                return result;
            } catch (error) {
                lastError = error as Error;
                this.updateMetrics(endpoint, 0, false);

                console.warn(
                    `[RPC Manager] Request failed on ${endpoint.name}, attempt ${attempts + 1}/${maxRetries + 1}`,
                    error
                );

                attempts++;
            }
        }

        throw lastError || new Error('All RPC requests failed');
    }

    /**
     * Wrap promise with timeout
     */
    private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
        return Promise.race([
            promise,
            new Promise<T>((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
            )
        ]);
    }

    /**
     * Update endpoint metrics and health status
     */
    private updateMetrics(endpoint: RPCEndpoint, responseTime: number, success: boolean) {
        if (success) {
            // Update average response time (exponential moving average)
            endpoint.avgResponseTime =
                endpoint.avgResponseTime * 0.7 + responseTime * 0.3;
            endpoint.failureCount = Math.max(0, endpoint.failureCount - 1);

            // Restore health if previously unhealthy
            if (!endpoint.isHealthy && endpoint.failureCount === 0) {
                endpoint.isHealthy = true;
                console.info(`[RPC Manager] ${endpoint.name} restored to healthy`);
            }
        } else {
            endpoint.failureCount++;

            // Mark unhealthy if failure threshold exceeded
            if (endpoint.failureCount >= this.config.maxFailures) {
                endpoint.isHealthy = false;
                console.error(`[RPC Manager] ${endpoint.name} marked as unhealthy`);
            }
        }
    }

    /**
     * Perform health check on all endpoints
     */
    private async performHealthCheck() {
        console.log('[RPC Manager] Running health checks...');

        const checks = this.endpoints.map(async (endpoint) => {
            try {
                const startTime = Date.now();
                const response = await this.withTimeout(
                    fetch(`${endpoint.restUrl}/health`),
                    this.config.healthCheckTimeout
                );

                const responseTime = Date.now() - startTime;
                endpoint.lastHealthCheck = Date.now();

                if (response.ok) {
                    this.updateMetrics(endpoint, responseTime, true);
                    console.log(`[RPC Manager] ✅ ${endpoint.name} healthy (${responseTime}ms)`);
                } else {
                    this.updateMetrics(endpoint, 0, false);
                    console.warn(`[RPC Manager] ❌ ${endpoint.name} unhealthy (status ${response.status})`);
                }
            } catch (error) {
                this.updateMetrics(endpoint, 0, false);
                console.error(`[RPC Manager] ❌ ${endpoint.name} health check failed`, error);
            }
        });

        await Promise.allSettled(checks);
    }

    /**
     * Start periodic health checks
     */
    private startHealthChecks() {
        // Initial health check
        this.performHealthCheck();

        // Periodic checks
        this.healthCheckTimer = setInterval(
            () => this.performHealthCheck(),
            this.config.healthCheckInterval
        );
    }

    /**
     * Stop health checks (cleanup)
     */
    stopHealthChecks() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = undefined;
        }
    }

    /**
     * Get current status of all endpoints
     */
    getStatus() {
        return this.endpoints.map(ep => ({
            name: ep.name,
            isHealthy: ep.isHealthy,
            avgResponseTime: Math.round(ep.avgResponseTime),
            failureCount: ep.failureCount,
            priority: ep.priority,
            lastHealthCheck: new Date(ep.lastHealthCheck).toISOString()
        }));
    }
}

// Singleton instance
export const rpcManager = new RPCManager();

// Export for testing and manual control
export { RPCManager };
