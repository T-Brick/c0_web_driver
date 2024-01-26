
/* Memory that will be imported in WASM runtime */
const memory = new WebAssembly.Memory({ initial: 1 });
const stdout = document.getElementById("output");

/* Tracking how many times a label is entered */
var labelMap = {};
const maxEnterLabel = 10000000;

/* Utility for parsing strings out of C0's memory */
const c0_parse_str = function(address) {
  const bytes = new Uint8Array(memory.buffer.slice(address | 0));
  var i = 0;
  var msg = "";
  while(i < bytes.length && bytes[i] !== undefined && bytes[i] !== 0) {
    msg += String.fromCharCode(bytes[i])
    i += 1;
  }
  return msg;
}

const c0_result = function(res) {
  console.log(res);
  document.getElementById('result').value = res;
}

const c0_log = function(str, newline) {
  stdout.value += str;
  stdout.scrollTop = stdout.scrollHeight; // focus on bottom
}

const c0_abort = function(sig) {
  if(sig == 6) return c0_result("assertion failure");
  if(sig == 12) return c0_result("memory error");
  if(sig == 8) return c0_result("Division by zero");
  c0_result("abort: " + (sig | 0));
}

const c0_debug = function(lbl) {
  if(labelMap[lbl + ""] === undefined) {
    labelMap[lbl + ""] = 1;
  } else {
    labelMap[lbl + ""] = labelMap[lbl + ""] + 1;
  }
  if(labelMap[lbl + ""] > maxEnterLabel) {
    c0_log("Exceeded timeout, killing program!");
    console.log("Exceeded maximum label entry on " + lbl);
    return 1;
  }
  return 0;
}

/* Required imports */
const c0_imports = {
  c0deine: {
    memory: memory,
    result: res => { c0_result((res | 0)) },
    abort:  sig => { c0_abort(sig | 0) },
    error:  str => { c0_result("error: \"" + c0_parse_str(str) + "\""); },
    debug:  lbl => { setTimeout(() => {}, 0);
                     return c0_debug(lbl);
                   }
  },
  conio: {
    print:    str => { c0_log(c0_parse_str(str)); },
    println:  str => { c0_log(c0_parse_str(str) + "\n"); },
    flush:    ()  => { console.flush(); },
    eof:      ()  => { c0_log("TODO: eof unimplemented!"); },
    readline: ()  => { c0_log("TODO: readline unimplemented!"); },
  }
};


const c0_run = function(bytes) {
  const wasm = new WebAssembly.Module(bytes);
  labelMap = {};

  try {
    const instance = new WebAssembly.Instance(wasm, c0_imports);
  } catch(e) {
    if(e.message.startsWith("Division by zero")) {
      c0_abort(8);
    } else {
      console.log(e.message + "");
    }
  }
}
