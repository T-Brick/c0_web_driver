// Based on the emscripten minimal shell template
var statusElement = document.getElementById('status');
var progressElement = document.getElementById('progress');
var compileElement = document.getElementById('compile');
var resultElement = document.getElementById('result');

const printConsole = (function() {
  var element = document.getElementById('output');
  if (element) element.value = ''; // clear browser cache
  return function(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    if(text.startsWith("!wasm-dump: ")) {
      c0_result("running...");

      var str_bytes = text.split(" ");
      str_bytes.shift();
      var bytes = []
      for(let b of str_bytes) {
        bytes.push(parseInt("0x" + b, 16));
      }
      c0_run(new Uint8Array(bytes));
    } else {
      if (element) {
        element.value += text + "\n";
        element.scrollTop = element.scrollHeight; // focus on bottom
      }
    }
  };
});

var initModule = function() {
  return {
    // noInitialRun: true,
    // noExitRuntime: true,
    print: printConsole(),
    printErr: printConsole(),
    setStatus: (text) => {
      if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
      if (text === Module.setStatus.last.text) return;
      var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
      var now = Date.now();
      if (m && now - Module.setStatus.last.time < 30) return; // if this is a progress update, skip it if too soon
      Module.setStatus.last.time = now;
      Module.setStatus.last.text = text;
      if (m) {
        text = m[1];
        progressElement.value = parseInt(m[2])*100;
        progressElement.max = parseInt(m[4])*100;
        progressElement.hidden = false;
        compileElement.style.visibility = "hidden";
        resultElement.style.visibility = "hidden";
      } else {
        progressElement.value = null;
        progressElement.max = null;
        progressElement.hidden = true;
        compileElement.style.visibility = "visible";
        resultElement.style.visibility = "visible";
      }
      statusElement.innerHTML = text;
    },
    totalDependencies: 0,
    monitorRunDependencies: (left) => {
      this.totalDependencies = Math.max(this.totalDependencies, left);
      Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
    }
  };
};

function save() {
  var src = encodeURIComponent(document.getElementById("c0src").value);
  document.cookie = "prog=" + src;
  c0_log("Program saved!\n");
}

function load() {
  var src = blank;
  var load_from = document.getElementById('load_from').value;
  if(load_from === "saved") {
    src = document.cookie;
    if(src.startsWith("prog=")) {
      src = src.substring(5);
      src = decodeURIComponent(src);
    }
  } else if (load_from === "hello_world") {
    src = hello_world;
  } else if (load_from === "exp") {
    src = exp;
  }
  document.getElementById("c0src").value = src;
  c0_log("Program loaded!\n");
}

function compile() {
  c0_result("compiling...");
  Module=initModule();

  const verbose = document.getElementById('verbose').checked;
  const only_typecheck = document.getElementById('tc-only').checked;
  const unsafe = document.getElementById('unsafe').checked;
  const unsafe_assert = document.getElementById('unsafe-assert').checked;
  const dump_tst = document.getElementById('dump-tst').checked;
  const dump_ir = document.getElementById('dump-ir').checked;
  const dump_cfg = document.getElementById('dump-cfg').checked;
  const dump_wat = document.getElementById('dump-wat').checked;

  var args = ["--cl-program", "--dump-wasm", "-e", "wasm"];
  args.push("-x");
  args.push(document.getElementById('lang').value);

  if(only_typecheck) args.push("-t");
  if(verbose) args.push("-v");
  if(unsafe) args.push("--unsafe");
  if(unsafe_assert) args.push("--unsafe-assert-check");
  if(dump_tst) args.push("--dump-tst");
  if(dump_ir) args.push("--dump-ir");
  if(dump_cfg) args.push("--dump-cfg");
  if(dump_wat) args.push("--dump-wat");

  var src = "" + document.getElementById("c0src").value;
  src = src.replaceAll("\\n", "\\\\\\n");
  src = src.replaceAll("\n", "\\n");
  args.push(src);

  Module["arguments"] = args;
  setTimeout(() => {
    c0deine(Module).then((instance) => {
      if(only_typecheck) {
        if(verbose){
          c0_result("");
        } else if(document.getElementById("output").value === '') {
          c0_result("Typechecks!");
        } else {
          c0_result("Typecheck failure :(");
        }
      }
    });
  }, 0);
}

var Module = initModule();
Module.setStatus('');
window.onerror = () => {
  Module.setStatus('Exception thrown, see JavaScript console');
  // spinnerElement.style.display = 'none';
  Module.setStatus = (text) => {
    if (text) console.error('[post-exception status] ' + text);
  };
};
document.getElementById("c0src").value = hello_world;
