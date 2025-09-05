import { performance } from 'perf_hooks';

class QueryProfiler {
    constructor() {
        this.queries = new Map();
        this.isEnabled = process.env.NODE_ENV === 'development';
    }

    startQuery(queryName, params = {}) {
        if (!this.isEnabled) return null;
        
        const queryId = `${queryName}_${Date.now()}_${Math.random()}`;
        this.queries.set(queryId, {
            name: queryName,
            params,
            startTime: performance.now(),
            memoryStart: process.memoryUsage()
        });
        
        return queryId;
    }

    endQuery(queryId, result = null) {
        if (!this.isEnabled || !queryId) return;
        
        const query = this.queries.get(queryId);
        if (!query) return;
        
        const endTime = performance.now();
        const memoryEnd = process.memoryUsage();
        
        const duration = endTime - query.startTime;
        const memoryDiff = {
            rss: memoryEnd.rss - query.memoryStart.rss,
            heapUsed: memoryEnd.heapUsed - query.memoryStart.heapUsed,
            heapTotal: memoryEnd.heapTotal - query.memoryStart.heapTotal
        };
        
        // Log slow queries (> 100ms)
        if (duration > 100) {
            console.warn(`🐌 Slow Query Detected:`, {
                name: query.name,
                duration: `${duration.toFixed(2)}ms`,
                params: query.params,
                memoryDiff,
                resultSize: result ? JSON.stringify(result).length : 0
            });
        }
        
        // Log to performance metrics (could be sent to monitoring service)
        this.logPerformanceMetric({
            queryName: query.name,
            duration,
            memoryUsage: memoryDiff,
            timestamp: new Date().toISOString(),
            params: query.params
        });
        
        this.queries.delete(queryId);
    }

    logPerformanceMetric(metric) {
        // In production, this could send to APM tools like New Relic, DataDog, etc.
        if (process.env.NODE_ENV === 'development') {
            console.log(`📊 Query Performance:`, metric);
        }
    }

    // Decorator for automatic query profiling
    profile(queryName) {
        return (target, propertyKey, descriptor) => {
            const originalMethod = descriptor.value;
            
            descriptor.value = async function(...args) {
                const queryId = profiler.startQuery(queryName, { args: args.length });
                try {
                    const result = await originalMethod.apply(this, args);
                    profiler.endQuery(queryId, result);
                    return result;
                } catch (error) {
                    profiler.endQuery(queryId);
                    throw error;
                }
            };
            
            return descriptor;
        };
    }

    // Wrap Prisma queries for automatic profiling
    wrapPrismaClient(prisma) {
        if (!this.isEnabled) return prisma;
        
        const originalQuery = prisma.$queryRaw;
        const originalTransaction = prisma.$transaction;
        
        prisma.$queryRaw = (...args) => {
            const queryId = this.startQuery('prisma.$queryRaw', { query: args[0] });
            return originalQuery.apply(prisma, args).finally(() => {
                this.endQuery(queryId);
            });
        };
        
        prisma.$transaction = (queries) => {
            const queryId = this.startQuery('prisma.$transaction', { queries: queries.length });
            return originalTransaction.apply(prisma, [queries]).finally(() => {
                this.endQuery(queryId);
            });
        };
        
        return prisma;
    }

    // Get performance stats
    getStats() {
        return {
            activeQueries: this.queries.size,
            isEnabled: this.isEnabled
        };
    }

    // Manual query timing for critical sections
    async time(queryName, fn, params = {}) {
        const queryId = this.startQuery(queryName, params);
        try {
            const result = await fn();
            this.endQuery(queryId, result);
            return result;
        } catch (error) {
            this.endQuery(queryId);
            throw error;
        }
    }
}

// Export singleton instance
export const profiler = new QueryProfiler();

// Utility function for timing database operations
export async function timeQuery(queryName, queryFn, params = {}) {
    return profiler.time(queryName, queryFn, params);
}

// Performance monitoring middleware for API routes
export function performanceMiddleware(req, res, next) {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    
    res.on('finish', () => {
        const endTime = performance.now();
        const endMemory = process.memoryUsage();
        const duration = endTime - startTime;
        
        if (duration > 500) { // Log slow API requests > 500ms
            console.warn(`🐌 Slow API Request:`, {
                method: req.method,
                url: req.url,
                duration: `${duration.toFixed(2)}ms`,
                statusCode: res.statusCode,
                memoryUsage: {
                    rss: endMemory.rss - startMemory.rss,
                    heapUsed: endMemory.heapUsed - startMemory.heapUsed
                }
            });
        }
    });
    
    if (next) next();
}

export default profiler;
