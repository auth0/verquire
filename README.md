Verquire: versioned require
===

This module intercepts `require` to support a syntax which allows loading of a specific version of a Node.js module. 

## Getting started

Install: 

```
npm i verquire
```

Use: 

```javascript
require('verquire');

// no changes in loading of native modules
var url = require('url'); 

// no changes in loading of non-versioned user modules
var bar = require('bar'); 

// load version 1.2.3 of foo; see below
var foo = require('foo@1.2.3'); 
```

## Setup and configuration

The *verquire* module redirects requests for specific module versions to a dedicated directory structure. The directory is identified with `VERQUIRE_DIR` environment variable, or the `_verquire` subdirectory of the install location of the *verquire* module by default. The structure of this directory must follow this pattern:

```
<VERQUIRE_DIR>
  foo
    1.0.0
      node_modules
        foo
    1.2.3
      node_modules
        foo
    2.0.0
      node_modules
        foo
  bar
    2.1.3
      node_modules
        bar
  ...
```

Each leaf directory must contain dependency module closure of the respective versioned module. For example, `<VERQUIRE_DIR>/foo/1.0.0` can be created and populated a priori as follows:

```
mkdir -p <VERQUIRE_DIR>/foo/1.0.0
cd <VERQUIRE_DIR>/foo/1.0.0
npm i foo@1.0.0
```

## Analytics

The *verquire* module can optionally track failed module load attempts using Google Measurement Protocol. If the `VERQUIRE_GA` environment variable is set, every failed module request will cause a measurement protocol event to be sent to the specified GA property. The event category will be set to `FAILED_REQUIRE`, the event label to the name of the module that failed resolution (including version, if any), and the event action to the first 255 characters of the error message thrown by `require`. 

## Not supported

* No attempt is made to optimize disk space by reusing modules on disk.
* Only exact match of the full module version is supported. No support for semver matching.
