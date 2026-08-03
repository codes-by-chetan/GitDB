import { Request, Response } from 'express';
import { SettingsService } from '../services/settingsService';

export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  public getSettings = (_req: Request, res: Response): void => {
    res.json({ success: true, message: 'Settings retrieved', data: this.settingsService.readSettings() });
  };

  public saveSettings = (req: Request, res: Response): void => {
    const settings = this.settingsService.writeSettings(req.body as Record<string, unknown>);
    res.json({ success: true, message: 'Settings updated', data: settings });
  };
}
