const CACHE_NAME = "ants-v4.9";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./privacidad.html",
  "./style.css",
  "./app.js",
  "./i18n.js",
  "./premium.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./ant.png",
  "./guardar.mp3",
  "./xlsx.full.min.js",
  "./chart.umd.min.js",
  "./firma.svg"
];

// Instalar
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activar
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// Cache-first: si ya lo tenemos guardado, lo servimos al instante
// y recién después buscamos una versión nueva en segundo plano.
// La app arranca sin esperar la red; la actualización, si la hay,
// queda lista para el próximo arranque.
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") return;

  // Ignoramos esquemas raros (extensiones del navegador, etc.)
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(

    caches.match(event.request).then(cacheada => {

      const desdeLaRed = fetch(event.request)
        .then(respuesta => {

          if (respuesta && respuesta.ok) {

            const copia = respuesta.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, copia);
            });

          }

          return respuesta;

        })
        .catch(() => cacheada);

      // Si está en caché sale ya; si no, esperamos la red.
      return cacheada || desdeLaRed;

    })

  );

});
