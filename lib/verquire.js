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

module.constructor.prototype.require = function verquire(modulePath) {
    return old_require(resolve(modulePath));
};

module.constructor.prototype.require.__verquire = true;

exports.list = function (name) {
    return verquire_list[name] || [];
};

function resolve(query){
  // returns the path
  var originalQuery = query;
  var loc = parse(query);
  // now simply re-write the url in verquire form
  // and pass it to resolver.
  if( loc.version ){
    var parts = [verquire_dir, loc.module, loc.version, 'node_modules', loc.module];
    if( loc.path ) parts.push(loc.path);
    query = path.join.apply(path, parts);
  }

  try{
    return require.resolve(query);
  }catch(error){
    if (error instanceof Error) {
        error.message = 'Cannot find module \'' + originalQuery + '\'';
    }
    collector && collector(name, error);
    throw error;
  }
}

exports.resolve = resolve;
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
