const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  for(const width of [1280,375]) {
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[]; page.on('pageerror',e=>errors.push(e.message));
   await page.goto(process.env.TEST_URL || 'http://127.0.0.1:8000/tilda/preview.html');
   if(await page.locator('#access-gate').count()) {
    const password=process.env.TEST_PASSWORD || fs.readFileSync('/workspace/trainee-tests-password.txt','utf8').split('Пароль: ')[1].trim();
    await page.locator('#access-password').fill(password);await page.locator('#access-form button').click();
    await page.locator('#ural-tests').waitFor({state:'visible'});
   }
   assert.equal(await page.locator('.ut-card').count(),4);
   for(let index=0;index<4;index++) {
    await page.locator('.ut-card').nth(index).click();
    const frame=page.frames()[1]; await frame.waitForSelector('.quiz-container');
    const count=await frame.evaluate(()=>quizData.length);
    for(const correct of [true,false]) {
     const result=await frame.evaluate(({correct})=>{
      const start=document.querySelector('#welcome-stage,#start-stage');
      if(start&&getComputedStyle(start).display!=='none')start.querySelector('button').click();
      for(let i=0;i<quizData.length;i++) {
       const q=quizData[i]; const answer=q.a[correct?q.c:(q.c+1)%q.a.length];
       const option=Array.from(document.querySelectorAll('.option-item')).find(el=>el.innerText===answer);
       if(!option)throw Error('Missing answer');option.click();
       if(!document.getElementById('feedback-container').innerText.trim())throw Error('Missing feedback');
       document.getElementById('btn-next').click();
      }
      const output={score:document.getElementById('score-text').innerText,visible:getComputedStyle(document.getElementById('result-stage')).display!=='none',recs:document.querySelectorAll('#rec-list-container li').length};
      document.querySelector('#result-stage button').click();return output;
     },{correct});
     assert.equal(result.score,`${correct?count:0} / ${count}`);assert(result.visible);if(!correct)assert(result.recs>0);
    }
    // Keyboard can answer the restarted first question.
    if(await frame.locator('#game-stage').isHidden())await frame.locator('button:visible').first().click();
    await frame.locator('.option-item').first().focus();await page.keyboard.press('Enter');
    assert(await frame.locator('#btn-next').isVisible());
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    // Reject forged resize events.
    const height=await page.locator('iframe').evaluate(el=>el.style.height);
    await page.evaluate(()=>window.postMessage({type:'ural-quiz-height',height:99999},'*'));
    await page.waitForTimeout(100);
    assert.notEqual(await page.locator('iframe').evaluate(el=>el.style.height),'100007px');
    page.once('dialog',d=>d.dismiss());await page.locator('#ut-back').click();assert(await page.locator('#ut-player').isVisible());
    page.once('dialog',d=>d.accept());await page.locator('#ut-back').click();assert(await page.locator('#ut-menu').isVisible());
    assert.equal(await page.locator('iframe').count(),0);
    console.log(`${width}px quiz ${index+1}: ${count*2} answers, scoring, recommendations, restart, keyboard, return OK`);
   }
   if(width===1280)await page.screenshot({path:'tilda/desktop.png',fullPage:true});
   else await page.screenshot({path:'tilda/mobile.png',fullPage:true});
   assert.deepEqual(errors,[]);await page.close();
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
