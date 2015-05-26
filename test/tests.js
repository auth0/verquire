var assert = require('assert');

process.env.VERQUIRE_DIR = require('path').join(__dirname, '..', 'test_versions');
process.env.VERQUIRE_GA = 'UA-37952868-5';
require('../');

describe('require', function () {

    it('works for native modules', function () {
        assert.equal(require('assert'), assert);
    });

    it('works for foo@1.0.0', function () {
        assert.equal(require('foo@1.0.0').version, '1.0.0');
    });

    it('works for foo@2.0.0', function () {
        assert.equal(require('foo@2.0.0').version, '2.0.0');
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

    it('waits for GA flush', function (done) {
        setTimeout(done, 1000);
    });
});