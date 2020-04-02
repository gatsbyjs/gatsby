# benchmark-octane

Octane benchmark for Node.js

- This provides [Octane 2.0](http://code.google.com/p/octane-benchmark/) benchmark to nodeJS.

## How to use

##### using github

    $ git clone https://github.com/dai-shi/benchmark-octane.git
    $ cd benchmark-octane
    $ node run.js

##### using npm

    $ npm install benchmark-octane -g
    $ benchmark-octane

This wil produce a output like this:

        hostname     : XXXXXXXXX
        node version : v0.10.28
          V8 version : 3.14.5.9
     platform & arch : win32 x64

     config : { target_defaults:
       { cflags: [],
         default_configuration: 'Release',
         defines: [],
         include_dirs: [],
         libraries: [] },
      variables:
       { clang: 0,
         host_arch: 'ia32',
         node_install_npm: true,
         node_prefix: '',
         node_shared_cares: false,
         node_shared_http_parser: false,
         node_shared_libuv: false,
         node_shared_openssl: false,
         node_shared_v8: false,
         node_shared_zlib: false,
         node_tag: '',
         node_unsafe_optimizations: 0,
         node_use_dtrace: false,
         node_use_etw: true,
         node_use_openssl: true,
         node_use_perfctr: true,
         node_use_systemtap: false,
         target_arch: 'x64',
         v8_enable_gdbjit: 0,
         v8_no_strict_aliasing: 1,
         v8_use_snapshot: true,
         visibility: '' } }

    Richards            : 15822
    DeltaBlue           : 19842
    Crypto              : 20628
    RayTrace            : 18592
    EarleyBoyer         : 33527
    RegExp              : 4141
    Splay               : 5756
    SplayLatency        : 13120
    NavierStokes        : 23299
    PdfJS               : 14409
    Mandreel            : 16551
    MandreelLatency     : 20600
    Gameboy             : 23542
    CodeLoad            : 16937
    Box2D               : 13821
    zlib                : 20537
    Typescript          : 22330
    ----
    Score (version 9): 16202
     duration  40  seconds


##### Authors

- the V8 project authors
- Daishi Kato
- Etienne Rossignon
