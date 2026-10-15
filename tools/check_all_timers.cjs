const {chromium}=require('playwright');const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{await Promise.all([1280,375].flatMap(width=>[0,1,2,3].map(async index=>{
 const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.route('https://ivakimkin.github.io/trainee-tests/',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('docs/index.html','utf8')}));
 await page.goto('https://ivakimkin.github.io/trainee-tests/');await page.locator('#access-password').fill('Inform');await page.locator('#access-form button').click();await page.locator('.ut-card').nth(index).click();const frame=page.frames()[1];
 await frame.waitForSelector('.variant-toolbar');assert(await frame.locator('#question-timer').isHidden());
 await frame.locator('button:visible').filter({hasText:'НАЧАТЬ ТЕСТ'}).click();
 assert.equal(await frame.locator('#question-timer').innerText(),'12');
 assert(await frame.evaluate(()=>getComputedStyle(document.getElementById('question-timer')).fontSize===getComputedStyle(document.querySelector('.variant-toolbar span')).fontSize));
 await frame.waitForFunction(()=>document.getElementById('question-timer').textContent==='10');
 await frame.evaluate(()=>document.querySelector('.option-item[data-original-id="'+quizData[0].c+'"]').click());
 const frozen=await frame.locator('#question-timer').innerText();assert.equal(await frame.evaluate(()=>score),1);
 await page.waitForTimeout(300);assert.equal(await frame.locator('#question-timer').innerText(),frozen);
 await frame.evaluate(()=>document.getElementById('btn-next').click());assert.equal(await frame.locator('#question-timer').innerText(),'12');
 await frame.waitForFunction(()=>document.getElementById('question-timer').textContent==='00',{},{timeout:16000});
 assert.equal(await frame.evaluate(()=>score),1);assert(await frame.locator('.timeout-feedback').isVisible());assert.equal(await frame.locator('.option-item.correct').count(),1);
 await frame.evaluate(()=>document.querySelector('.option-item.correct').click());assert.equal(await frame.evaluate(()=>score),1);assert.equal(await frame.locator('.hint-box').count(),1);
 assert(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const count=await frame.evaluate(()=>quizData.length);
 await frame.evaluate(()=>{document.getElementById('btn-next').click();for(let i=2;i<quizData.length;i++){const q=quizData[i];document.querySelector('.option-item[data-original-id="'+q.c+'"]').click();document.getElementById('btn-next').click();}});
 assert.equal(await frame.locator('#score-text').innerText(),`${count-1} / ${count}`);assert(await frame.locator('#question-timer').isHidden());assert(await frame.locator('#rec-list-container li').count()>0);
 await frame.evaluate(()=>document.querySelector('#result-stage button').click());await page.locator('#access-gate').waitFor({state:'visible'});assert.deepEqual(errors,[]);
 console.log(`${width}px quiz ${index+1}: countdown, stop, reset, timeout, blocked late answer, ${count-1}/${count}, recommendations, password retry OK`);
 }finally{await page.close();}
})));}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
