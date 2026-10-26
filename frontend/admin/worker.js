// Cloudflare Worker to serve KhanhMelody Admin frontend
// Upload dist/ files to R2 first, then use this worker to serve them

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Serve from R2 bucket
    const bucket = env.KHANHMELODY_BUCKET;
    
    // Try to get file from R2
    let objectKey = url.pathname === '/' ? '/index.html' : url.pathname;
    if (!objectKey.startsWith('/')) {
      objectKey = '/' + objectKey;
    }
    
    // Remove leading slash for R2
    const r2Key = objectKey.substring(1) || 'index.html';
    
    try {
      const object = await bucket.get(r2Key);
      
      if (object === null) {
        // File not found, serve index.html for SPA routing
        const indexObject = await bucket.get('index.html');
        if (indexObject) {
          return new Response(indexObject.body, {
            headers: {
              'Content-Type': 'text/html;charset=UTF-8',
              'Cache-Control': 'public, max-age=3600',
            },
          });
        }
        return new Response('Not Found', { status: 404 });
      }
      
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('Cache-Control', 'public, max-age=3600');
      
      return new Response(object.body, { headers });
    } catch (e) {
      return new Response('Error: ' + e.message, { status: 500 });
    }
  },
};
