import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../dist/',import.meta.url));
const port=Number(process.env.PORT??8000);
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('PORT must be an integer from 1 to 65535');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8','.woff2':'font/woff2','.pdf':'application/pdf'};
const server=http.createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://localhost');
  const pathname=decodeURIComponent(url.pathname);
  let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root)) {res.writeHead(403);res.end();return;}
  if(pathname.endsWith('/'))file=path.join(file,'index.html');
  if(!path.extname(file))file+='.html';
  let body,status=200;
  try {body=await fs.readFile(file);}catch {status=404;file=path.join(root,'404.html');body=await fs.readFile(file);}
  res.writeHead(status,{'Content-Type':types[path.extname(file)]??'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
  res.end(req.method==='HEAD'?undefined:body);
 }catch {res.writeHead(400);res.end('Bad request');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}/`));
process.on('SIGTERM',()=>server.close());
process.on('SIGINT',()=>server.close());
