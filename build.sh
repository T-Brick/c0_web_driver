#!/bin/bash
cd c0deine
lake exe cache get
lake build
lake build wasm_builder

.lake/build/bin/wasm_builder web

cp .lake/build/wasm/c0deine.js ../c0/c0deine.js
cp .lake/build/wasm/c0deine.worker.js ../c0/c0deine.worker.js
cp .lake/build/wasm/c0deine.wasm ../c0/c0deine.wasm

