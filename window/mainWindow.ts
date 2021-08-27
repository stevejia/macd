// const { app, BrowserWindow } = require("electron");
// const MenuClass = require("./menu.ts");
// class MainWindow {
//   mainWindow = null;
//   constructor() {
//     // let mainWindow = null;
//     this.makeSingleInstance();
//     //app主进程的事件和方法
//     app.on("ready", () => {
//       this.createWindow();
//     });
//     app.on("window-all-closed", () => {
//       if (process.platform !== "darwin") {
//         app.quit();
//       }
//     });
//     app.on("activate", () => {
//       if (this.mainWindow === null) {
//         this.createWindow();
//       }
//     });
//   }
//   createWindow() {
//     const windowOptions = {
//       width: 1200,
//       height: 900,
//       frame: false,
//       maximizable: true,
//       minimizable: true,
//       movable: true,
//     };
//     this.mainWindow = new BrowserWindow(windowOptions);
//     new MenuClass();
//     this.mainWindow.loadURL("http://localhost:3000/");
//     // mainWindow.loadURL(path.join('file://', __dirname, '/build/index.html'));
//     //接收渲染进程的信息
//     const ipc = require("electron").ipcMain;
//     ipc.on("min", function () {
//       this.mainWindow.minimize();
//     });
//     ipc.on("max", function () {
//       this.mainWindow.maximize();
//     });
//     ipc.on("login", function () {
//       this.mainWindow.maximize();
//     });
//     //判断命令行脚本的第二参数是否含--debug
//     const debug = /--debug/.test(process.argv[2]);
//     //如果是--debug 打开开发者工具，窗口最大化，
//     if (debug) {
//       this.mainWindow.webContents.openDevTools();
//       require("devtron").install();
//     }

//     this.mainWindow.on("closed", () => {
//       this.mainWindow = null;
//     });
//   }
//   makeSingleInstance() {
//     if (process.mas) return;
//     app.requestSingleInstanceLock();
//     app.on("second-instance", () => {
//       if (this.mainWindow) {
//         if (this.mainWindow.isMinimized()) {
//           this.mainWindow.restore();
//         }
//         this.mainWindow.focus();
//       }
//     });
//   }
// }

// module.exports = exports = MainWindow;
