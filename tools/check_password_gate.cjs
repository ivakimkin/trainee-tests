const {chromium}=require('playwright');const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
const password=fs.readFileSync('/workspace/trainee-tests-password.txt','utf8').split('Пароль: ')[1].trim();
assert(!fs.readFileSync('docs/index.html','utf8').includes(password));
for(const width of [1280,375]){
const p=await b.newPage({viewport:{width,height:900}});await p.route('https://ivakimkin.github.io/trainee-tests/',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('docs/index.html','utf8')}));
await p.goto('https://ivakimkin.github.io/trainee-tests/');assert(await p.locator('#ural-tests').isHidden());
await p.locator('#access-password').fill('incorrect');await p.locator('#access-form button').click();await p.locator('#access-error').filter({hasText:'Неверный пароль'}).waitFor();assert(await p.locator('#ural-tests').isHidden());
await p.locator('#access-password').fill(password);await p.locator('#access-form button').click();await p.locator('#ural-tests').waitFor({state:'visible'});assert.equal(await p.locator('.ut-card').count(),4);
await p.reload();assert(await p.locator('#access-gate').isHidden());
await p.locator('.ut-card').first().click();const f=p.frameLocator('#ut-frame-slot iframe');await f.locator('#start-stage button').click();await f.locator('.option-item').first().click();assert(await f.locator('#btn-next').isVisible());
assert.equal(await p.locator('#access-logout').count(),0);await p.evaluate(()=>sessionStorage.clear());await p.reload();await p.locator('#access-gate').waitFor({state:'visible'});assert(await p.locator('#ural-tests').isHidden());
await p.screenshot({path:`tilda/password-${width}.png`,fullPage:true});console.log(width+'px: wrong/correct password, session, quiz, no logout button OK');await p.close();
}
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
