const {chromium}=require('playwright');const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{for(const width of [1280,375]){
 const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://ivakimkin.github.io/trainee-tests/',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('docs/index.html','utf8')}));
 await page.goto('https://ivakimkin.github.io/trainee-tests/');
 for(let index=0;index<4;index++)for(const correct of [true,false]){
  await page.locator('#access-password').fill(process.env.TEST_PASSWORD||fs.readFileSync('/workspace/trainee-tests-password.txt','utf8').split('Пароль: ')[1].trim());
  await page.locator('#access-form button').click();await page.locator('.ut-card').nth(index).click();
  const frame=page.frames()[1];await frame.waitForSelector('.variant-toolbar');assert(await page.locator('#ut-back').isHidden());assert.equal(await frame.locator('#variant-back').count(),0);
  if(correct){await page.waitForTimeout(80);await page.screenshot({path:`tilda/quiz-${index+1}-intro-${width}.png`,fullPage:true});}
  await frame.locator('button:visible').filter({hasText:'НАЧАТЬ ТЕСТ'}).click();
  assert((await frame.locator('.variant-toolbar').boundingBox()).y<80);
  assert(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(correct){await page.waitForTimeout(80);await page.screenshot({path:`tilda/quiz-${index+1}-question-${width}.png`,fullPage:true});}
  const count=await frame.evaluate(()=>quizData.length);
  for(let i=0;i<count;i++){
   await frame.evaluate(({i,correct})=>{
    const q=quizData[i],answer=q.a[correct?q.c:(q.c+1)%q.a.length];
    const option=Array.from(document.querySelectorAll('.option-item')).find(el=>el.innerText===answer);
    if(!option)throw Error('Expected answer missing');option.click();
    if(!document.getElementById('feedback-container').innerText.trim())throw Error('Missing feedback');
    document.getElementById('btn-next').click();
   },{i,correct});
  }
  assert.equal(await frame.locator('#score-text').innerText(),`${correct?count:0} / ${count}`);
  if(!correct)assert(await frame.locator('#rec-list-container li').count()>0);
  await frame.evaluate(()=>document.querySelector('#result-stage button').click());await page.locator('#access-gate').waitFor({state:'visible'});assert(await page.locator('#ural-tests').isHidden());
  await page.reload();assert(await page.locator('#access-gate').isVisible());
  console.log(`${width}px quiz ${index+1}: ${correct?'correct':'incorrect'} ${count} answers, result, password on retry and reload OK`);
 }
 assert.deepEqual(errors,[]);await page.close();
}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
