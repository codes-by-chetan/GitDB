import fs from 'fs';
import path from 'path';

export interface LogEntry {
  timestamp: string;
  user: string;
  action: string;
  duration: number;
  result: string;
  error?: string;
}

export class LoggingService {
  private readonly logsDir = path.join(process.cwd(), 'backend', 'logs');

  public log(entry: LogEntry): void {
    fs.mkdirSync(this.logsDir, { recursive: true });
    const fileName = `${new Date().toISOString().slice(0, 10)}.log`;
    const line = JSON.stringify(entry);
    fs.appendFileSync(path.join(this.logsDir, fileName), `${line}\n`);
  }
}
