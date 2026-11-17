const http = require("http"),
  fs = require("fs/promises"),
  path = require("path");
const PORT = 2225,
  DB = path.join(__dirname, "data", "db.json");
const DIRS = ["main", "styles", "scripts", "assets"];
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

let q = Promise.resolve();
const lock = fn => (q = q.then(fn, fn));

const load = async () => {
  try {
    return JSON.parse(await fs.readFile(DB, "utf8"));
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    return { ostatnie_id: 0, formularze: [] };
  }
};
const save = async d => {
  await fs.mkdir(path.dirname(DB), { recursive: true });
  await fs.writeFile(DB, JSON.stringify(d, null, 2));
};
const send = (res, code, obj) => {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
};
const body = req =>
  new Promise(ok => {
    let s = "";
    req
      .on("data", c => {
        s += c;
        if (s.length > 1e5) {
          req.destroy();
          ok({});
        }
      })
      .on("end", () => {
        try {
          ok(JSON.parse(s));
        } catch {
          ok({});
        }
      });
  });
const t = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const sel = (v, placeholder) =>
  (v = t(v, 100)) && v !== placeholder ? v : null;

const srv = http.createServer(async (req, res) => {
  try {
    const p = new URL(req.url, "http://x").pathname,
      m = req.method;

    if (p.startsWith("/api/formularze")) {
      if (p === "/api/formularze" && m === "GET")
        return send(res, 200, (await load()).formularze);

      if (p === "/api/formularze" && m === "POST") {
        const b = await body(req),
          tytul = t(b.tytul, 150),
          opis = t(b.opis, 5000),
          email = t(b.email, 200);
        if (!tytul || !opis)
          return send(res, 400, { ok: false, blad: "Podaj tytuł i opis." });
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          return send(res, 400, { ok: false, blad: "Nieprawidłowy e-mail." });
        const f = await lock(async () => {
          const d = await load(),
            id = (d.ostatnie_id = (d.ostatnie_id || 0) + 1);
          const nowy = {
            id,
            numer: "#" + id,
            data: new Date().toISOString(),
            rodzaj_problemu: sel(b.rodzaj_problemu, "Rodzaj problemu"),
            skala_problemu: sel(b.skala_problemu, "Skala problemu"),
            wiele_osob: b.wiele_osob === true,
            zdalnie: b.zdalnie === true,
            tytul,
            opis,
            email: email || null,
          };
          d.formularze.push(nowy);
          await save(d);
          return nowy;
        });
        return send(res, 201, { ok: true, formularz: f });
      }

      const id = +p.split("/")[3];
      if (m === "DELETE" && id) {
        const ok = await lock(async () => {
          const d = await load(),
            n = d.formularze.length;
          d.formularze = d.formularze.filter(f => f.id !== id);
          if (d.formularze.length === n) return false;
          await save(d);
          return true;
        });
        return send(
          res,
          ok ? 200 : 404,
          ok ? { ok } : { ok, blad: "Nie znaleziono." },
        );
      }
      return send(res, 404, { ok: false, blad: "Nieznany adres API." });
    }

    // pliki statyczne: / -> main/index.html, /baza.html -> main/baza.html
    const parts = decodeURIComponent(p).split("/").filter(Boolean);
    if (!parts.length) parts.push("index.html");
    const file = path.resolve(
      __dirname,
      DIRS.includes(parts[0]) ? "" : "main",
      ...parts,
    );
    if (!DIRS.some(d => file.startsWith(path.join(__dirname, d) + path.sep)))
      return res.writeHead(403).end("403");
    try {
      const data = await fs.readFile(file);
      res.writeHead(200, {
        "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
      });
      res.end(data);
    } catch {
      res.writeHead(404).end("404");
    }
  } catch (e) {
    console.error(e.message);
    send(res, 500, { ok: false, blad: "Błąd serwera." });
  }
});

srv.on("error", e => {
  console.error(e.code === "EADDRINUSE" ? `Port ${PORT} jest zajęty.` : e);
  process.exit(1);
});

load()
  .then(save)
  .then(() =>
    srv.listen(PORT, () => console.log(`Działa: http://localhost:${PORT}`)),
  );
