var fs = require( 'fs' );
var path = require( 'path' );
var packageJson = require( '../package.json' );

exports.name = packageJson.name;
exports.root = path.resolve( path.join( __dirname, '../..' ) );

var rootDir = exports.root;
if (process.platform == 'darwin') {
    rootDir = "/tmp/akari/";
}
exports.rootDir = rootDir;
exports.isMac = process.platform == 'darwin';

var needCheckDir = [
    exports.rootDir + path.sep,
    exports.rootDir + path.sep + "data" + path.sep
];

for (var i = 0; i < needCheckDir.length; i++) {
    if (!fs.existsSync(needCheckDir[i])) {
        console.log("try create: " + needCheckDir);
        fs.mkdirSync(needCheckDir[i]);
    }
}

exports.settingsPath = path.resolve( exports.rootDir, 'data', 'settings.json' );
exports.cachePath = path.resolve( exports.root, 'data', 'cache.json' );

exports.wikiApiServer = "";