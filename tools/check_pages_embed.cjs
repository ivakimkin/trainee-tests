const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  for(const width of [1280,375]) {
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('https://ivakimkin.github.io/trainee-tests/',route=>route.fulfill({contentType:'text/html',body:fs.readFileSync('docs/index.html','utf8')}));
   const snippet=fs.readFileSync('tilda/github-pages-embed.html','utf8');
   await page.route('https://uralstrateg.ru/embed-check',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0">'+snippet}));
   await page.goto('https://uralstrateg.ru/embed-check');
   const app=page.frameLocator('#ural-tests-embed');
   await app.locator('.ut-card').first().click();
   const quiz=app.frameLocator('iframe');await quiz.locator('#start-stage button').click();
   await quiz.locator('.option-item').first().click();assert(await quiz.locator('#btn-next').isVisible());
   await page.waitForTimeout(300);
   const first=await page.locator('#ural-tests-embed').evaluate(el=>el.style.height);
   await page.waitForTimeout(400);
   assert.equal(await page.locator('#ural-tests-embed').evaluate(el=>el.style.height),first,'height must settle');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.evaluate(()=>window.postMessage({type:'ural-tests-page-height',height:99999},'*'));
   await page.waitForTimeout(50);assert.equal(await page.locator('#ural-tests-embed').evaluate(el=>el.style.height),first);
   page.once('dialog',d=>d.accept());await app.locator('#ut-back').click();
   assert(await app.locator('#ut-menu').isVisible());assert.deepEqual(errors,[]);
   console.log(`${width}px: cross-origin Tilda iframe, nested quiz, stable resizing, rejected forged message, return OK`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
