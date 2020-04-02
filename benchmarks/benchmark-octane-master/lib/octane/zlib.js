// Copyright 2013 the V8 project authors. All rights reserved.
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

new BenchmarkSuite('zlib', [152815148], [
  new Benchmark('zlib', false, true, 10,
    runZlib, undefined, tearDownZlib, null, 3)]);

// Generate 100kB pseudo-random bytes (compressed 25906 bytes) and
// compress/decompress them 60 times.
var zlibEval = eval;
function runZlib() {
  if (typeof Ya != "function") {
    InitializeZlibBenchmark();
  }
  Ya(["1"]);
}

function tearDownZlib() {
  delete $;
  delete $a;
  delete Aa;
  delete Ab;
  delete Ba;
  delete Bb;
  delete C;
  delete Ca;
  delete Cb;
  delete D;
  delete Da;
  delete Db;
  delete Ea;
  delete Eb;
  delete F;
  delete Fa;
  delete Fb;
  delete G;
  delete Ga;
  delete Gb;
  delete Ha;
  delete Hb;
  delete I;
  delete Ia;
  delete Ib;
  delete J;
  delete Ja;
  delete Jb;
  delete Ka;
  delete Kb;
  delete L;
  delete La;
  delete Lb;
  delete Ma;
  delete Mb;
  delete Module;
  delete N;
  delete Na;
  delete Nb;
  delete O;
  delete Oa;
  delete Ob;
  delete P;
  delete Pa;
  delete Pb;
  delete Q;
  delete Qa;
  delete Qb;
  delete R;
  delete Ra;
  delete Rb;
  delete S;
  delete Sa;
  delete Sb;
  delete T;
  delete Ta;
  delete Tb;
  delete U;
  delete Ua;
  delete Ub;
  delete V;
  delete Va;
  delete Vb;
  delete W;
  delete Wa;
  delete Wb;
  delete X;
  delete Xa;
  delete Y;
  delete Ya;
  delete Z;
  delete Za;
  delete ab;
  delete ba;
  delete bb;
  delete ca;
  delete cb;
  delete da;
  delete db;
  delete ea;
  delete eb;
  delete fa;
  delete fb;
  delete ga;
  delete gb;
  delete ha;
  delete hb;
  delete ia;
  delete ib;
  delete j;
  delete ja;
  delete jb;
  delete k;
  delete ka;
  delete kb;
  delete la;
  delete lb;
  delete ma;
  delete mb;
  delete n;
  delete na;
  delete nb;
  delete oa;
  delete ob;
  delete pa;
  delete pb;
  delete qa;
  delete qb;
  delete r;
  delete ra;
  delete rb;
  delete sa;
  delete sb;
  delete t;
  delete ta;
  delete tb;
  delete u;
  delete ua;
  delete ub;
  delete v;
  delete va;
  delete vb;
  delete w;
  delete wa;
  delete wb;
  delete x;
  delete xa;
  delete xb;
  delete ya;
  delete yb;
  delete z;
  delete za;
  delete zb;
}
