var assert = require('assert');
var path = require('path');
var test_versions_dir = process.env.VERQUIRE_DIR = path.join(__dirname, '..', 'test_versions');
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



describe('resolve', function(){

    it('works for foo@1.0.0', function(){
      assert.equal(verquire.resolve('foo@1.0.0'), path.join(test_versions_dir, 'foo/1.0.0/node_modules/foo/index.js'));
    });

    it('fails for foo@3.0.0', function () {
        try {
            verquire.resolve('foo@3.0.0');
            throw new Error('Unexpected success');
        } catch (e) {
            assert.equal(e.message, 'Cannot find module \'foo@3.0.0\'');
        }
    });


    it('fails for foo', function () {
        try {
            verquire.resolve('foo');
            throw new Error('Unexpected success');
        } catch (e) {
            assert.equal(e.message, 'Cannot find module \'foo\'');
        }
    });


    it('fails for bar', function () {
        try {
            verquire.resolve('bar');
            throw new Error('Unexpected success');
        }
        catch (e) {
            assert.equal(e.message, 'Cannot find module \'foo\'');
        }
    });


    it('works for foo@1.0.0/not_index', function(){
      assert.equal(verquire.resolve('foo@1.0.0/not_index'), path.join(test_versions_dir, 'foo/1.0.0/node_modules/foo/not_index.js'));
    });

    it('works for foo@2.0.0-alpha', function(){
      assert.equal(verquire.resolve('foo@2.0.0-alpha'), path.join(test_versions_dir, 'foo/2.0.0-alpha/node_modules/foo/index.js'));
    });

    it('works for @bazorg/lorem@1.0.0', function(){
      assert.equal(verquire.resolve('@bazorg/lorem@1.0.0'), path.join(test_versions_dir, '@bazorg/lorem/1.0.0/node_modules/@bazorg/lorem/index.js'));
    });

    it('works for @bazorg/lorem@1.0.0/ipsum', function(){
      assert.equal(verquire.resolve('@bazorg/lorem@1.0.0/ipsum'), path.join(test_versions_dir, '@bazorg/lorem/1.0.0/node_modules/@bazorg/lorem/ipsum.js'));
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

    it('works for an foo@1.0.0/not_index', function(){
        assert.equal(require('foo@1.0.0/not_index').version, 'not_index');
    });

    it('works for @bazorg/lorem@1.0.0', function(){
        assert.equal(require('@bazorg/lorem@1.0.0').version, '@bazorg/lorem');
    });

    it('works for @bazorg/lorem@1.0.0/ipsum', function(){
        assert.equal(require('@bazorg/lorem@1.0.0/ipsum').version, 'ipsum');
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
        } catch (e) {
            assert.equal(e.message, 'Cannot find module \'foo@3.0.0\'');
        }
    });

    it('fails for foo', function () {
        try {
            require('foo');
            throw new Error('Unexpected success');
        } catch (e) {
            assert.equal(e.message, 'Cannot find module \'foo\'');
        }
    });

    it('fails for bar', function () {
        try {
            require('bar');
            throw new Error('Unexpected success');
        }
        catch (e) {
            assert.equal(e.message, 'Cannot find module \'bar\'');
        }
    });

});
