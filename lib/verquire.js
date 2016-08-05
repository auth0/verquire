var path = require('path');
var verquire_dir = 
    process.env.VERQUIRE_DIR || (path.join(__dirname, '..', '_verquire'));
var verquire_list;
try {
    verquire_list = require(path.join(verquire_dir, 'packages.json'));
}
catch (e) {
    verquire_list = {};
}
var collector = process.env.VERQUIRE_DEBUG ? create_collector() : undefined;
var old_require = module.constructor.prototype.require;

module.constructor.prototype.require = function(name) {
    var match = name.match(/^(\@?[^\@]+)\@(.+)$/);
    var old_path;
    if (match) {
        old_path = this.paths;
        this.paths = [ path.join(verquire_dir, match[1], match[2], 'node_modules') ];
        name = match[1];
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
    if (match) {
        name = match[0];
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
