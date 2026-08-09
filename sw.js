const CACHE_NAME =
  'control-escolar-v1';


const ARCHIVOS =
  [
    './consulta.html',
    './manifest.webmanifest',
    './icon-192.png',
    './icon-512.png'
  ];


/*
=================================================
INSTALACIÓN
=================================================
*/

self.addEventListener(
  'install',
  event => {

    event.waitUntil(

      caches
        .open(
          CACHE_NAME
        )
        .then(
          cache =>
            cache.addAll(
              ARCHIVOS
            )
        )

    );


    self.skipWaiting();

  }
);


/*
=================================================
ACTIVACIÓN
=================================================
*/

self.addEventListener(
  'activate',
  event => {

    event.waitUntil(

      caches
        .keys()
        .then(
          nombres => {

            return Promise.all(

              nombres
                .filter(
                  nombre =>
                    nombre !==
                    CACHE_NAME
                )
                .map(
                  nombre =>
                    caches.delete(
                      nombre
                    )
                )

            );

          }
        )

    );


    self.clients.claim();

  }
);


/*
=================================================
SOLICITUDES
=================================================
*/

self.addEventListener(
  'fetch',
  event => {

    if (
      event.request.method !==
      'GET'
    ) {

      return;

    }


    const url =
      new URL(
        event.request.url
      );


    /*
    No interceptamos Apps Script
    ni recursos externos.
    */

    if (
      url.origin !==
      self.location.origin
    ) {

      return;

    }


    event.respondWith(

      fetch(
        event.request
      )

        .then(
          respuesta => {

            const copia =
              respuesta.clone();


            caches
              .open(
                CACHE_NAME
              )
              .then(
                cache =>
                  cache.put(
                    event.request,
                    copia
                  )
              );


            return respuesta;

          }
        )

        .catch(
          async () => {

            const cache =
              await caches.match(
                event.request
              );


            if (cache) {

              return cache;

            }


            if (
              event.request.mode ===
              'navigate'
            ) {

              return caches.match(
                './consulta.html'
              );

            }

          }
        )

    );

  }
);
