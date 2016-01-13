var app = require( 'app' );  // Module to control application life.
var BrowserWindow = require( 'browser-window' );  // Module to create native browser window.
var ipc = require( 'ipc' );
var path = require( 'path' );
var env = require( './lib/env.js' );
var Menu = require("menu");


// global variable
var APP_NAME = env.name;
//var INDEX = 'file://' + __dirname + "/index.html";
var INDEX = 'file://' + path.join( __dirname, 'index.html' );

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on( 'window-all-closed', function () {
    /*if ( process.platform != 'darwin' )
     app.quit();*/

    app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on( 'ready', appReady );

function appReady () {

    mainWindow = new BrowserWindow({
        'width': 1028,
        'height': 604,
        'resizable': true,
        'accept-first-mouse': true,
        'title': APP_NAME,
        'show': false,
        'frame': true,
        'transparent': false
    });

    mainWindow.loadUrl( INDEX );
    //mainWindow.openDevTools(); // remove this

    mainWindow.webContents.on( 'did-finish-load', function () {
        mainWindow.show();
        mainWindow.setTitle( APP_NAME );
    });

    // Create the Application's main menu
    var template = [{
        label: "应用",
        submenu: [
            { label: '调试', click: function() {
                mainWindow.openDevTools();
            }},
            
            {type: 'separator'},
            
            { label: "退出", accelerator: "Command+Q", click: function() { app.quit(); }}
        ]}, {
        label: "编辑",
        submenu: [
            { label: "撤销", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "重复", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "剪切", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "复制", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "粘贴", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "全选ww", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));

    mainWindow.on( 'closed', function () {
        mainWindow = null;
    });
}

ipc.on( 'open-dev', function ( event ) {
    event.returnValue = true;
    mainWindow.webContents.openDevTools();
});

ipc.on( 'app-quit', function ( event ) {
    event.returnValue = true;
    mainWindow.close();
});

ipc.on( 'app-minimize', function ( event ) {
    event.returnValue = true;
    mainWindow.minimize();
});

ipc.on('get-clipboard', function(event, arg) {
    var clipboard = require('clipboard');
    
    if (arg.type == "text") {
        event.returnValue = clipboard.readText();
    } else {
        event.returnValue = clipboard.readHtml();
    }
    
});

ipc.on('open-folderdialog', function(event, arg) {
    var dialog = require("dialog");
    var got = dialog.showOpenDialog(mainWindow, {
        'properties': ['openDirectory'],
        'title': '选择文件夹'
    });


    if (!got) {
        got = false;
    }

    event.returnValue = got;
});

ipc.on('open-filedialog', function(event, arg) {
    var dialog = require("dialog");
    var got = dialog.showOpenDialog(mainWindow, {
        'properties': ['openFile', 'multiSelections'],
        'title': '选择文件',
        'filters': [
            { name: 'Files', extensions: arg.types }
        ]
    });

    if (!got) {
        got = false;
    }

    event.returnValue = got;
});

ipc.on('open-savedialog', function(event, arg) {
    var dialog = require("dialog");
    var got = dialog.showSaveDialog(mainWindow, {
        'title': "保存" 
    });
    
    if (!got)   got =false;

    event.returnValue = got;
});