var path = require('path');
var parse = require('./path-parser');
var verquire_dir =  process.env.VERQUIRE_DIR || (path.join(__dirname, '..', '_verquire'));
var verquire_list;

try {
    verquire_list = require(path.join(verquire_dir, 'packages.json'));
} catch (e) {
    verquire_list = {};
}

var collector = process.env.VERQUIRE_DEBUG ? create_collector() : undefined;
var old_require = module.constructor.prototype.require;
module.constructor.prototype.require = function verquire(name) {
    var loc = parse(name);
    var old_path;
    // touch this only if we have a version string
    if (loc.version) {
        old_path = this.paths;
        this.paths = [ path.join(verquire_dir, loc.module, loc.version, 'node_modules') ];
        // so far so good
        name = loc.module;
    }

    var result, error;
    try {
        result = old_require.apply(this, [ name ]);
    }
    catch (e) {
        error = e;
    }
    if (old_path) {
        this.paths = old_path;
    }
    if (loc.version) {
        name = loc.module;
    }
    if (error) {
        if (match && error instanceof Error) {
            error.message = 'Cannot find module ' + match[0] + ': ' + error.message;
        }
        collector && collector(name, error);
        throw error;
    }
    return result;
};

module.constructor.prototype.require.__verquire = true;

exports.list = function (name) {
    return verquire_list[name] || [];
};

exports.resolve = function(nameOrfullPath){
  // returns the path
  console.log('requiring', nameOrfullPath);
  var match = nameOrfullPath.match(/^([^\@]+)\@(.+)\/(*.)/);
  var fixedPath = path.join(verquire_dir, match[1], match[2], 'node_modules', match[3]);
  console.log('fixed it to', fixedPath);
  return require.resolve(fixedPath);
}

exports.modules = verquire_list;

function create_collector() {
    return function ga(name, e) {
        console.log({
            error: "FAILED_REQUIRE",
            module: name,
            error: e instanceof Error ? (e.stack || e.message || e.toString()) : e.toString()
        });
    }
}
