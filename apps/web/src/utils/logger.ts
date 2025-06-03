type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = process.env.NODE_ENV === 'development';

// Define minimum log level (could also come from environment)
const minimumLogLevel: LogLevel = isDevelopment ? 'debug' : 'info';

// Map log levels to numeric values for comparison
const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

// Log only if the level is equal to or higher than the minimum level
const shouldLog = (level: LogLevel): boolean => {
    return LOG_LEVEL_VALUES[level] >= LOG_LEVEL_VALUES[minimumLogLevel];
};

const logger = {
    debug: (...args: unknown[]) => {
        if (shouldLog('debug')) console.debug('[DEBUG]', ...args);
    },
    info: (...args: unknown[]) => {
        if (shouldLog('info')) console.info('[INFO]', ...args);
    },
    warn: (...args: unknown[]) => {
        if (shouldLog('warn')) console.warn('[WARN]', ...args);
    },
    error: (...args: unknown[]) => {
        if (shouldLog('error')) console.error('[ERROR]', ...args);
    },
    // Add a method to log at a specific level
    log: (level: LogLevel, ...args: unknown[]) => {
        if (shouldLog(level)) {
            switch (level) {
                case 'debug':
                    console.debug(`[${level.toUpperCase()}]`, ...args);
                    break;
                case 'info':
                    console.info(`[${level.toUpperCase()}]`, ...args);
                    break;
                case 'warn':
                    console.warn(`[${level.toUpperCase()}]`, ...args);
                    break;
                case 'error':
                    console.error(`[${level.toUpperCase()}]`, ...args);
                    break;
            }
        }
    }
};

export default logger;