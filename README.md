# OpenSCAD Web GUI

This project uses [`openscad-wasm`](https://github.com/openscad/openscad-wasm) under the hood to
build an editor for OpenSCAD that is capable of loading `.scad` files from other servers.

It is capable of rendering and exporting your creations. There is also a naive implementation of a
visual customizer.

# Dev

```bash
git clone https://github.com/seasick/openscad-web-gui
npm i
npm run serve # Run a webserver and rebuild on file changes
# npm run lint
# npm run test
```

# Credit

This app wouldn't be possible without the work of

- [OpenSCAD](https://openscad.org/)
- [openscad-wasm](https://github.com/openscad/openscad-wasm)
- [openscad-playground](https://github.com/openscad/openscad-playground)
