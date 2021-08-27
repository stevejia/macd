// const path = require("path");

// const MainWindowClass = require("./window/mainWindow.ts");
// const mainWin = new MainWindowClass();

// module.exports = mainWin.mainWindow;

// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  //   mainWindow.loadFile('index.html')
  mainWindow.loadURL("http://localhost:3000/");
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  const menuTemplate = [
    {
      label: "Edit App",
      submenu: [
        {
          label: "Undo",
        },
        {
          label: "Redo",
        },
      ],
    },
    {
      label: "View App",
      submenu: [
        {
          label: "Reload",
        },
        {
          label: "Toggle Full Screen",
        },
      ],
    },
  ];
  const appMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(appMenu);
  //判断命令行脚本的第二参数是否含--debug
  console.log(process.argv);

  const debug = /--debug/.test(process.argv[2]);
  //如果是--debug 打开开发者工具，窗口最大化，
  if (debug) {
    mainWindow.webContents.openDevTools();
    require("devtron").install();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.