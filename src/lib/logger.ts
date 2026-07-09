type LogData = Record<string, unknown> | undefined;

export const logger = {
  info: (event: string, data?: LogData) => {
    console.log(JSON.stringify({ level: "info", event, ...data, ts: new Date().toISOString() }));
  },
  warn: (event: string, data?: LogData) => {
    console.warn(JSON.stringify({ level: "warn", event, ...data, ts: new Date().toISOString() }));
  },
  error: (event: string, data?: LogData) => {
    console.error(JSON.stringify({ level: "error", event, ...data, ts: new Date().toISOString() }));
  },
};
