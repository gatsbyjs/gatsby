// Copyright 2013 the Octane Benchmark project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
//       copyright notice, this list of conditions and the following
//       disclaimer in the documentation and/or other materials provided
//       with the distribution.
//     * Neither the name of Google Inc. nor the names of its
//       contributors may be used to endorse or promote products derived
//       from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var typescript = new BenchmarkSuite('Typescript', [255011322], [
  new Benchmark("Typescript",
                false,
                true,
                5,
                runTypescript,
                setupTypescript,
                tearDownTypescript,
                null,
                1)
]);


function setupTypescript() {
}


function tearDownTypescript() {
  compiler_input = null;
}


var parseErrors = [];


function runTypescript() {
  var compiler = createCompiler();
  compiler.addUnit(compiler_input, "compiler_input.ts");
  parseErrors = [];
  compiler.reTypeCheck();
  compiler.emit({
           createFile: function (fileName) { return outfile; },
           fileExists: function (path) { return false; },
           directoryExists: function (path) { return false; },
           resolvePath: function (path) { return path; }
  });
  
  if (parseErrors.length != 192 && parseErrors.length != 193) {
    throw new Error("Parse errors.");
  }
  compiler = null;
}

var outfile = {
  checksum: -412589664, 
  cumulative_checksum: 0,
  Write: function (s) { this.Verify(s); },
  WriteLine: function (s) { this.Verify(s + "\n"); },
  Close: function () {
    if (this.checksum != this.cumulative_checksum) {
      throw new Error("Wrong checksum.");
    }
    this.cumulative_checksum = 0;
  },
  Verify: function (s) {
    for(var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      this.cumulative_checksum = (this.cumulative_checksum << 1) ^ c;
    }
  }
};


var outerr = {
  checksum: 0,
  cumulative_checksum: 0,
  Write: function (s) { this.Verify(s); },
  WriteLine: function (s) { this.Verify(s + "\n"); },
  Close: function () {
    if (this.checksum != this.cumulative_checksum) {
      throw new Error("Wrong checksum.");
    }
    this.cumulative_checksum = 0;
  },
  Verify: function (s) {
    for(var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      this.cumulative_checksum = (this.cumulative_checksum << 1) ^ c;
    }
  }
};


function createCompiler() {
  var settings = new TypeScript.CompilationSettings();
  settings.codeGenTarget = TypeScript.CodeGenTarget.ES5;
  var compiler = new TypeScript.TypeScriptCompiler(
      outerr, new TypeScript.NullLogger, settings);
  compiler.setErrorCallback(function (start, len, message) { 
    parseErrors.push({ start: start, len: len, message: message }); 
  });
  compiler.parser.errorRecovery = true;
  compiler.typeCheck();
  return compiler
}


// The two files accompanying this benchmark contain a modified version of the
// Typescript compiler. They can be generated using the following instructions
// with the code available at:
//    http://typescript.codeplex.com/SourceControl/changeset/view/258e00903a9e
//
// 1) Copy the compiler from $TYPESCRIPT/bin/tsc.js to typescript-compiler.js
// 2) Remove the call to the batch compiler from the last line of tsc.js
// 3) Add this code after line 7963 (fix for Mozilla Firefox):
//    if (this.currentToken === undefined)
//      this.currentToken = this.scanner.scan();
// 4) Add this code after line 9142 (fix for Mozilla Firefox):
//    if (this.currentToken === undefined) {
//      this.currentToken = this.scanner.scan();
//      continue;
//    }
// 5) Generate the Typescript compiler input using the following command:
//    $ cat $TYPESCRIPT/src/compiler/*.ts | iconv -c -f utf8 -t ascii \
//      | dos2unix > /tmp/compiler_input
// 6) Run the following Python script to generate the reformatted input:
//    $ python script.py > typescript-input.js
//
// #!/usr/bin/env python
// import re;
// def escape_and_format(data, varname):
//   data = data.replace("\\", "\\\\").replace("\"", "\\\"")
//          .replace("\n", "\\n");
//   data = "var " + varname + " = \"" + data + "\""
//   print data; 
// result = open("/tmp/compiler_input", 'r');
// escape_and_format(result.read(), "compiler_input")
//
// The following is the original copyright notice present in the Typescript
// compiler source at the time this benchmark was generated:
//
/* *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved. 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0  
 
THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, 
MERCHANTABLITY OR NON-INFRINGEMENT. 
 
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
