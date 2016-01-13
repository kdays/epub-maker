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

if (!fs.existsSync(exports.rootDir + path.sep + "data" + path.sep)) {
    console.log("NOT FOUND DATA DIR! ..try to create!");
    fs.mkdirSync(exports.rootDir + path.sep + "data" + path.sep);
}

exports.settingsPath = path.resolve( exports.rootDir, 'data', 'settings.json' );
exports.cachePath = path.resolve( exports.root, 'data', 'cache.json' );

exports.wikiApiServer = "";