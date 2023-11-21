cmd_Release/obj.target/lmdb/src/v8-functions.o := c++ -o Release/obj.target/lmdb/src/v8-functions.o ../src/v8-functions.cpp '-DNODE_GYP_MODULE_NAME=lmdb' '-DUSING_UV_SHARED=1' '-DUSING_V8_SHARED=1' '-DV8_DEPRECATION_WARNINGS=1' '-DV8_DEPRECATION_WARNINGS' '-DV8_IMMINENT_DEPRECATION_WARNINGS' '-D_GLIBCXX_USE_CXX11_ABI=1' '-D_DARWIN_USE_64_BIT_INODE=1' '-D_LARGEFILE_SOURCE' '-D_FILE_OFFSET_BITS=64' '-DOPENSSL_NO_PINSHARED' '-DOPENSSL_THREADS' '-DMDB_MAXKEYSIZE=0' '-DNAPI_DISABLE_CPP_EXCEPTIONS' '-DENABLE_V8_API=1' '-DBUILDING_NODE_EXTENSION' -I/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node -I/Users/jgantunes/Library/Caches/node-gyp/18.6.0/src -I/Users/jgantunes/Library/Caches/node-gyp/18.6.0/deps/openssl/config -I/Users/jgantunes/Library/Caches/node-gyp/18.6.0/deps/openssl/openssl/include -I/Users/jgantunes/Library/Caches/node-gyp/18.6.0/deps/uv/include -I/Users/jgantunes/Library/Caches/node-gyp/18.6.0/deps/zlib -I/Users/jgantunes/Library/Caches/node-gyp/18.6.0/deps/v8/include -I../node_modules/node-addon-api -I../dependencies/lz4/lib -I../dependencies/lmdb/libraries/liblmdb  -O3 -gdwarf-2 -mmacosx-version-min=10.15 -arch arm64 -Wall -Wendif-labels -W -Wno-unused-parameter -std=gnu++17 -stdlib=libc++ -fno-rtti -fno-exceptions -fno-strict-aliasing -MMD -MF ./Release/.deps/Release/obj.target/lmdb/src/v8-functions.o.d.raw   -c
Release/obj.target/lmdb/src/v8-functions.o: ../src/v8-functions.cpp \
  ../src/lmdb-js.h ../node_modules/node-addon-api/napi.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/node_api.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/js_native_api.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/js_native_api_types.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/node_api_types.h \
  ../node_modules/node-addon-api/napi-inl.h \
  ../node_modules/node-addon-api/napi-inl.deprecated.h \
  ../dependencies/lmdb/libraries/liblmdb/lmdb.h \
  ../dependencies/lz4/lib/lz4.h \
  ../dependencies/lmdb/libraries/liblmdb/chacha8.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/cppgc/common.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8config.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-array-buffer.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-local-handle.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-internal.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-version.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-object.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-maybe.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-persistent-handle.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-weak-callback-info.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-primitive.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-data.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-value.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-traced-handle.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-container.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-context.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-snapshot.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-date.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-debug.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-script.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-message.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-exception.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-extension.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-external.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-function.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-function-callback.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-template.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-memory-span.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-initialization.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-callbacks.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-isolate.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-embedder-heap.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-microtask.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-statistics.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-promise.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-unwinder.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-embedder-state-scope.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-platform.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-json.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-locker.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-microtask-queue.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-primitive-object.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-proxy.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-regexp.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-typed-array.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-value-serializer.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-wasm.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/node.h \
  /Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/node_version.h \
  ../src/../dependencies/v8/v8-fast-api-calls.h
../src/v8-functions.cpp:
../src/lmdb-js.h:
../node_modules/node-addon-api/napi.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/node_api.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/js_native_api.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/js_native_api_types.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/node_api_types.h:
../node_modules/node-addon-api/napi-inl.h:
../node_modules/node-addon-api/napi-inl.deprecated.h:
../dependencies/lmdb/libraries/liblmdb/lmdb.h:
../dependencies/lz4/lib/lz4.h:
../dependencies/lmdb/libraries/liblmdb/chacha8.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/cppgc/common.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8config.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-array-buffer.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-local-handle.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-internal.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-version.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-object.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-maybe.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-persistent-handle.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-weak-callback-info.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-primitive.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-data.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-value.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-traced-handle.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-container.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-context.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-snapshot.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-date.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-debug.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-script.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-message.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-exception.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-extension.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-external.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-function.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-function-callback.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-template.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-memory-span.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-initialization.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-callbacks.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-isolate.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-embedder-heap.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-microtask.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-statistics.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-promise.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-unwinder.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-embedder-state-scope.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-platform.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-json.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-locker.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-microtask-queue.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-primitive-object.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-proxy.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-regexp.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-typed-array.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-value-serializer.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/v8-wasm.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/node.h:
/Users/jgantunes/Library/Caches/node-gyp/18.6.0/include/node/node_version.h:
../src/../dependencies/v8/v8-fast-api-calls.h:
