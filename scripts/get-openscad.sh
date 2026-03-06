#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
VENDOR_DIR=$SCRIPT_DIR/../src/vendor/openscad-wasm
WASM_BASE_URL=https://raw.githubusercontent.com/mikekuniavsky/openscad-wasm-debug/main/test-server/tests

mkdir -p $VENDOR_DIR

curl -L "$WASM_BASE_URL/openscad.js" -o "$VENDOR_DIR/openscad.js"
curl -L "$WASM_BASE_URL/openscad.wasm" -o "$VENDOR_DIR/openscad.wasm"
