(function () {
  var base = "/learning-hub/_expo/static/js/web/";
  var root = document.getElementById("root");
  function status(msg) {
    if (root) root.textContent = msg;
    console.log(msg);
  }
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
  status("Loading Learning Hub…");
  fetch(base + "chunks.json?v=live2", { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("chunks.json " + r.status);
      return r.json();
    })
    .then(function (names) {
      return Promise.all(
        names.map(function (name) {
          return fetch(base + name + "?v=live2", { cache: "force-cache" }).then(function (r) {
            if (!r.ok) throw new Error("missing " + name + " (" + r.status + ")");
            return r.text();
          });
        })
      );
    })
    .then(function (parts) {
      var b64 = parts.join("").replace(/\s+/g, "");
      var bytes = b64ToU8(b64);
      if (typeof DecompressionStream !== "function") {
        throw new Error("This browser cannot decompress the app bundle");
      }
      var ds = new DecompressionStream("gzip");
      var stream = new Blob([bytes]).stream().pipeThrough(ds);
      return new Response(stream).arrayBuffer();
    })
    .then(function (ab) {
      var code = u8ToBinaryString(new Uint8Array(ab));
      var s = document.createElement("script");
      s.text = code;
      document.body.appendChild(s);
    })
    .catch(function (err) {
      status("Failed to load app: " + err);
      console.error(err);
    });
})();
