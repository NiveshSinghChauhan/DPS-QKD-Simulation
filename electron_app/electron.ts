import { app, BrowserWindow } from 'electron';
import { join } from 'path';

export function createWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  window.loadFile(`build/index.html`);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
