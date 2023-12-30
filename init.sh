#!/bin/bash
rm -rf c0deine

git clone https://github.com/T-Brick/c0deine
cd c0deine
lake exe cache get
lake build
lake build wasm_builder
