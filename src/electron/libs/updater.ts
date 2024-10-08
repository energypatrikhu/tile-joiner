import { app } from 'electron';
import electronUpdater from 'electron-updater';
import { sleep } from './utils.js';
const { autoUpdater } = electronUpdater;

export class Updater {
  private enabled = true;

  private mainWindow: Electron.BrowserWindow;
  private appVersion: string;

  constructor(mainWindow: Electron.BrowserWindow, appVersion: string) {
    this.mainWindow = mainWindow;
    this.appVersion = appVersion;

    autoUpdater.on('update-downloaded', async () => {
      this.mainWindow.webContents.send('update', { message: 'Update downloaded, restarting in 3 seconds...' });

      await sleep(3000);

      autoUpdater.quitAndInstall(true, true);
      app.exit();
    });
  }

  async check() {
    if (!this.enabled) return false;

    setTimeout(this.autoRunChecker, 60 * 60 * 1000);
    return await this.checker('startup');
  }

  async checker(mode: 'automatic' | 'startup') {
    switch (mode) {
      case 'startup': {
        if (this.appVersion !== (await autoUpdater.checkForUpdates())?.updateInfo.version) {
          return true;
        }
        break;
      }
      case 'automatic': {
        if (this.appVersion !== (await autoUpdater.checkForUpdatesAndNotify())?.updateInfo.version) {
          return true;
        }
        break;
      }
    }

    return false;
  }

  async autoRunChecker() {
    await this.checker('automatic');
    setTimeout(this.autoRunChecker, 60 * 60 * 1000);
  }
}
