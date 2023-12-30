# C0deine Web Driver

This is an example of building [c0deine](https://github.com/T-Brick/c0deine)
and running it in the browser. Currently to run the webserver you need
[emrun](https://emscripten.org/docs/compiling/Running-html-files-with-emrun.html)
which is distributed via
[emscripten](https://emscripten.org/docs/getting_started/downloads.html). As
well as [lean4](https://lean-lang.org/lean4/doc/setup.html) to compile c0deine.

To setup, run the `./init.sh` script which clones c0deine and compiles it using
lean(this only needs to be ran once). Running `./build.sh` compiles c0deine into
the WebAssembly and copies it into the [c0](c0) directory, which contains the
source for the webpage. Finally, running `./run.sh` should open a window in your
browser in which you can use c0deine to compile c0 code.
