// imports
importScripts('js/sw-utils.js');


const STATIC_CACHE    = 'static-v1';
const DYNAMIC_CACHE   = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';


const APP_SHELL = [
    '/',
    'index.html',
    'sw.js',
    'css/styles.css',
    'css/posts.css',
    'css/animate.css',
    'js/app.js',
    'js/sw-utils.js',
    'img/icons/colimdo.png',
    'img/icons/icon-72x72.png',
    'img/icons/icon-96x96.png',
    'img/icons/icon-128x128.png',
    'img/icons/icon-144x144.png',
    'img/icons/icon-152x152.png',
    'img/icons/icon-192x192.png',
    'img/icons/icon-384x384.png',
    'img/icons/icon-512x512.png',
    'img/icons/logo_colimdo.png',
    'img/icons/logo-colimdo.png'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css',
    'https://cdn.jsdelivr.net/npm/vue/dist/vue.js',
    'https://unpkg.com/axios/dist/axios.min.js',
];



self.addEventListener('install', e => {

    const cacheStatic = caches.open( STATIC_CACHE )
    .then(cache =>cache.addAll( APP_SHELL ));

    const cacheInmutable = caches.open( INMUTABLE_CACHE )
    .then(cache =>cache.addAll( APP_SHELL_INMUTABLE ));



    e.waitUntil( Promise.all([ cacheStatic, cacheInmutable ])  );

});


self.addEventListener('activate', e => {

    const respuesta = caches.keys().then( keys => {

        keys.forEach( key => {

            if (  key !== STATIC_CACHE && key.includes('static') ) {
                return caches.delete(key);
            }

            if (  key !== DYNAMIC_CACHE && key.includes('dynamic') ) {
                return caches.delete(key);
            }

        });

    });

    e.waitUntil( respuesta );

});

function limpiarCache( cacheName, numeroItems ) {


    caches.open( cacheName )
        .then( cache => {

            return cache.keys()
                .then( keys => {
                    
                    if ( keys.length > numeroItems ) {
                        cache.delete( keys[0] )
                            .then( limpiarCache(cacheName, numeroItems) );
                    }
                });

            
        });
}



self.addEventListener( 'fetch', e => {
      // 2- Cache with Network Fallback
    const respuesta = caches.match( e.request )
        .then( res => {

            if ( res ) return res;

            // No existe el archivo
            // tengo que ir a la web
       


            return fetch( e.request ).then( newResp => {
          
                caches.open( DYNAMIC_CACHE )
                    .then( cache => {
                        cache.put( e.request, newResp );
                        limpiarCache( DYNAMIC_CACHE, 50 );
                    });

                return newResp.clone();
            });


        });




    e.respondWith( respuesta );

});


