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
var collector = process.env.VERQUIRE_GA ? create_collector() : undefined;
var old_require = module.constructor.prototype.require;


module.constructor.prototype.require = function(name) {
    var match = name.match(/^([^\@]+)\@(.+)$/);
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
    if (error) {
        if (match && error instanceof Error) {
            error.message = 'Cannot find module ' + match[0] + ': ' + error.message;
        }
        if (collector) {
            collector(name, match, error);
        }
        throw error;
    }
    return result;
};

exports.list = function (name) {
    return verquire_list[name] || [];
};

exports.modules = verquire_list;

function create_collector() {
    var http = require('http');
    var url = require('url');
    var id = process.env.VERQUIRE_GA;

    return function ga(name, match, e) {
        var event = {
            v: 1,
            tid: id,
            sc: 'start',
            t: 'event',
            cid: '11111111-1111-1111-1111-111111111111',
            ea: (e.message || e.toString()).substring(0, 255),
            ec: 'FAILED_REQUIRE',
            el: match ? match[0] : name
        };

        // Form-url-encode the event data.

        var data = url.format({ query: event }).substring(1);

        // Send the Google Analytics request, do not wait for response.

        var greq = http.request({
            hostname: 'www.google-analytics.com',
            port: 80,
            path: '/collect',
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }, function (gres) {
            gres.on('data', function () {});
            gres.on('end', function () {});
        });

        greq.write(data);
        greq.end();
    }
}
