import fs from 'fs';
import path from 'path';
import { LoggingService } from './loggingService';
import { AppSettings } from '../types/app';

export class SettingsService {
  private readonly settingsPath = path.join(process.cwd(), 'backend', 'config', 'app.json');
  private readonly logger = new LoggingService();

  public readSettings(): AppSettings {
    if (!fs.existsSync(this.settingsPath)) {
      return {};
    }

    return JSON.parse(fs.readFileSync(this.settingsPath, 'utf8')) as AppSettings;
  }

  public writeSettings(settings: AppSettings): AppSettings {
    fs.mkdirSync(path.dirname(this.settingsPath), { recursive: true });
    fs.writeFileSync(this.settingsPath, JSON.stringify(settings, null, 2));
    this.logger.log({ timestamp: new Date().toISOString(), user: 'admin', action: 'update-settings', duration: 0, result: 'success' });
    return settings;
  }
}
