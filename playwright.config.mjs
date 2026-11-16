import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./tests',
 fullyParallel:true,
 workers:2,
 reporter:'list',
 use:{baseURL:'http://127.0.0.1:18766',browserName:'chromium',channel:process.env.PLAYWRIGHT_CHANNEL||'chrome'},
 webServer:{command:'node tools/serve-site.mjs',url:'http://127.0.0.1:18766',env:{PORT:'18766'},reuseExistingServer:false},
});
