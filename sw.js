// Service worker simples: sempre tenta a internet primeiro (você nunca fica preso numa versão velha)
// e só usa a cópia guardada se estiver sem conexão. Não mexe em Supabase nem Mercado Pago.
const V = "wk-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  if (new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(r)
      .then((res) => {
        if (res.ok) { const c = res.clone(); caches.open(V).then((ch) => ch.put(r, c)); }
        return res;
      })
      .catch(() => caches.match(r).then((m) => m || caches.match("./")))
  );
});
