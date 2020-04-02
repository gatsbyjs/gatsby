/*
  Copyright (C) 2014, Daishi Kato <daishi@axlight.com>
  Copyright (C) 2014, Etienne Rossignon
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in th
      documentation and/or other materials provided with the distributio

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
  A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
  HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
  OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/* global BenchmarkSuite: false */

var vm = require('vm');
var fs = require('fs');
var path = require('path');
var os = require('os');

GLOBAL.print = function(str) {
  console.log(str);
};

GLOBAL.read = function(a, b) {
  var a = path.normalize(a);
  var c = fs.readFileSync(a);
  if (!c && a != path.resolve(a)) {
    a = path.join(__dirname, '..', 'src', a);
    c = fs.readFileSync(a);
  }
  if (c && !b) {
    c = c.toString();
  }
  return c;
};

function load(filename) {
  vm.runInThisContext(fs.readFileSync(filename, 'utf8'), filename);
}

var base_dir = __dirname + '/octane/';

load(base_dir + 'base.js');
load(base_dir + 'richards.js');
load(base_dir + 'deltablue.js');
load(base_dir + 'crypto.js');
load(base_dir + 'raytrace.js');
load(base_dir + 'earley-boyer.js');
load(base_dir + 'regexp.js');
load(base_dir + 'splay.js');
load(base_dir + 'navier-stokes.js');
load(base_dir + 'pdfjs.js');
load(base_dir + 'mandreel.js');
load(base_dir + 'gbemu-part1.js');
load(base_dir + 'gbemu-part2.js');
load(base_dir + 'code-load.js');
load(base_dir + 'box2d.js');
load(base_dir + 'zlib.js');
load(base_dir + 'zlib-data.js');
load(base_dir + 'typescript.js');
load(base_dir + 'typescript-input.js');
load(base_dir + 'typescript-compiler.js');


var success = true;

function PrintResult(name, result) {
  print((name + '                      ').substr(0, 20) + ': ' + result);
}

function PrintError(name, error) {
  PrintResult(name, error);
  success = false;
}

function PrintScore(score) {
  if (success) {
    print('----');
    print('Score (version ' + BenchmarkSuite.version + '): ' + score);
  }
}

BenchmarkSuite.config.doWarmup = undefined;
BenchmarkSuite.config.doDeterministic = undefined;

function run() {
  console.log('    hostname     :', os.hostname());
  console.log('    node version :', process.version);
  console.log('      V8 version :', process.versions['v8']);
  console.log(' platform & arch :', process.platform, process.arch);
  console.log('');
  console.log(' config :', require('util').inspect(process.config, {
    colors: true,
    depth: 10
  }));
  console.log('');
  BenchmarkSuite.RunSuites({
    NotifyResult: PrintResult,
    NotifyError: PrintError,
    NotifyScore: PrintScore
  });
  console.log(' duration ', process.uptime(), ' seconds');
}

module.exports = {
  suites: BenchmarkSuite.suites,
  run: run
};
