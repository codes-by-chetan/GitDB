export interface AppSettings {
  repository?: string;
  branch?: string;
  clonePath?: string;
  autoPull?: boolean;
  autoPush?: boolean;
  pullInterval?: number;
  pushInterval?: number;
  logLevel?: string;
}
