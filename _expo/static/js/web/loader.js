(function () {
  var base = "/learning-hub/_expo/static/js/web/";
  function b64ToU8(b64) {
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  function u8ToBinaryString(bytes) {
    var out = "";
    var CHUNK = 0x8000;
    for (var i = 0; i < bytes.length; i += CHUNK) {
      out += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + CHUNK, bytes.length)));
    }
    return out;
  }
  function loadName(name) {
    // Prefer verified 2KB shards when present: name.s0 .. name.s5
    return fetch(base + name + ".s0", { cache: "force-cache" }).then(function (r0) {
      if (r0.ok) {
        return r0.text().then(function (t0) {
          var acc = [t0.replace(/\s+/g, "")];
          var p = Promise.resolve();
          for (var s = 1; s <= 5; s++) {
            (function (s) {
              p = p.then(function () {
                return fetch(base + name + ".s" + s, { cache: "force-cache" })
                  .then(function (r) {
                    if (!r.ok) throw new Error("missing shard " + name + ".s" + s);
                    return r.text();
                  })
                  .then(function (t) { acc.push(t.replace(/\s+/g, "")); });
              });
            })(s);
          }
          return p.then(function () { return acc.join(""); });
        });
      }
      return fetch(base + name, { cache: "force-cache" }).then(function (r) {
        if (!r.ok) throw new Error("missing " + name + " (" + r.status + ")");
        return r.text();
      }).then(function (t) { return t.replace(/\s+/g, ""); });
    });
  }
  fetch(base + "chunks.json", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (names) {
      return names.reduce(function (p, name) {
        return p.then(function (acc) {
          return loadName(name).then(function (t) { acc.push(t); return acc; });
        });
      }, Promise.resolve([]));
    })
    .then(function (parts) {
      var bytes = b64ToU8(parts.join(""));
      if (typeof DecompressionStream === "function") {
        var ds = new DecompressionStream("gzip");
        var stream = new Blob([bytes]).stream().pipeThrough(ds);
        return new Response(stream).arrayBuffer().then(function (ab) {
          return u8ToBinaryString(new Uint8Array(ab));
        });
      }
      throw new Error("DecompressionStream not supported");
    })
    .then(function (code) {
      var s = document.createElement("script");
      s.text = code;
      document.body.appendChild(s);
    })
    .catch(function (err) {
      var root = document.getElementById("root");
      if (root) root.textContent = "Failed to load app: " + err;
      console.error(err);
    });
})();
