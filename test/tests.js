var assert = require('assert');

process.env.VERQUIRE_DIR = require('path').join(__dirname, '..', 'test_versions');
process.env.VERQUIRE_GA = 'UA-37952868-5';
var verquire = require('../');
var parse = require('../lib/path-parser');

describe('path-parser', function(){
    it('works with simple modules', function(){
        var loc = parse('foo');
        assert.equal(loc.module, 'foo');
        assert.equal(loc.version, undefined);
        assert.equal(loc.path, undefined);
    });

    it('works with modules with subversion', function(){
        var loc = parse('foo@2.0.0');
        assert.equal(loc.module, 'foo');
        assert.equal(loc.version, '2.0.0');
        assert.equal(loc.path, undefined);
    });

    it('works with @scoped modules with subversion', function(){
        var loc = parse('@org/foo@2.0.0');
        assert.equal(loc.module, '@org/foo');
        assert.equal(loc.version, '2.0.0');
        assert.equal(loc.path, undefined);
    });

    it('works with native modules with subversion and long path', function(){
        var loc = parse('foo@2.0.0/bar/baz');
        assert.equal(loc.module, 'foo');
        assert.equal(loc.version, '2.0.0');
        assert.equal(loc.path, '/bar/baz');
    });

    it('works with @scoped modules with subversion and long path', function(){
        var loc = parse('@org/foo@2.0.0/bar/baz');
        assert.equal(loc.module, '@org/foo');
        assert.equal(loc.version, '2.0.0');
        assert.equal(loc.path, '/bar/baz');
    });
});

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

    it('works for an arbitrary file', function(){
        assert.equal(require('foo@1.0.0/not_index').version, 'not_index');
    });

    it('works for @scoped module', function(){
        assert.equal(require('@barorg/lorem@1.0.0').version, 'not_index');
    });

    it('works for an arbitrary file in @scoped module', function(){
        assert.equal(require('@barorg/lorem@1.0.0/ipsum').version, 'ipsum');
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


describe('resolve', function(){
    it("works for foo@1.0.0", function(){
      assert.equal(verquire.resolve('foo@1.0.0'), '');
    });
});
