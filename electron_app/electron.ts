import { app, BrowserWindow, Menu } from 'electron';

export function createWindow() {
  // This create the main window for the application
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Menu template
  const menu = Menu.buildFromTemplate([
    {
      label: 'Menu',
      submenu: [
        {
          role: 'quit',
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { role: 'toggleDevTools' },
        { role: 'reload' },
        // { label: 'About' },
      ],
    },
  ]);

  // Sets the menu template as the menu for the application
  Menu.setApplicationMenu(menu);

  // loading the html file
  window.loadFile(`build/index.html`);
}

// Promise that resolve when application is ready
app.whenReady().then(() => {
  // creates the main for the application
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// when the close event occurs calling the quit method on the app object
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
