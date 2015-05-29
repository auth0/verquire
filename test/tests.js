var assert = require('assert');

process.env.VERQUIRE_DIR = require('path').join(__dirname, '..', 'test_versions');
process.env.VERQUIRE_GA = 'UA-37952868-5';
var verquire = require('../');

describe('require', function () {

    it('works for native modules', function () {
        assert.equal(require('assert'), assert);
    });

    it('works for foo@1.0.0', function () {
        assert.equal(require('foo@1.0.0').version, '1.0.0');
    });

    it('works for foo@2.0.0-alpha', function () {
        assert.equal(require('foo@2.0.0-alpha').version, '2.0.0-alpha');
    });

    it('lists available versions of foo', function () {
        var f = verquire.list('foo');
        assert.ok(Array.isArray(f));
        assert.equal(f.length, 2);
        assert.equal(f[0], '1.0.0');
        assert.equal(f[1], '2.0.0-alpha');
    });

    it('lists no versions of bar', function () {
        var f = verquire.list('bar');
        assert.ok(Array.isArray(f));
        assert.equal(f.length, 0);
    });

    it('fails for foo@3.0.0', function () {
        try {
            require('foo@3.0.0');
            throw new Error('Unexpected success');
        }
        catch (e) {
            assert.ok(e.message.match(/Cannot find module foo/));
        }
    });

    it('fails for foo', function () {
        try {
            require('foo');
            throw new Error('Unexpected success');
        }
        catch (e) {
            assert.ok(e.message.match(/Cannot find module/));
        }
    });

    it('fails for bar', function () {
        try {
            require('bar');
            throw new Error('Unexpected success');
        }
        catch (e) {
            assert.ok(e.message.match(/Cannot find module/));
        }
    });

});
