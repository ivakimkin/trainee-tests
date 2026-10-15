"""Wrap generated Pages HTML in a simple client-side password prompt."""
from pathlib import Path
import hashlib
import json
import secrets

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / 'tools/password-gate.json'
if not CONFIG.exists():
    password = secrets.token_urlsafe(10)
    salt = secrets.token_hex(16)
    CONFIG.write_text(json.dumps({'salt':salt,'digest':hashlib.sha256((salt+password).encode()).hexdigest()},indent=2)+'\n')
    private = Path('/workspace/trainee-tests-password.txt')
    private.write_text('Адрес: https://ivakimkin.github.io/trainee-tests/\nПароль: '+password+'\n')
    private.chmod(0o600)
config=json.loads(CONFIG.read_text())
page=ROOT/'docs/index.html'
source=page.read_text().replace('<section id="ural-tests" lang="ru">','<section id="ural-tests" lang="ru" hidden>')
gate='''
<style>
body{margin:0;background:#0f172a;color:#f1f5f9;font:16px/1.6 system-ui,sans-serif}
[hidden]{display:none!important}
#access-gate{max-width:420px;margin:12vh auto;padding:28px;background:#1e293b;border:1px solid #475569;border-radius:16px;box-sizing:border-box}
#access-gate h1{font-size:28px;line-height:1.2;margin:10px 0 18px}
#access-gate label{display:block;margin:16px 0 8px}
#access-gate input,#access-gate button,#access-logout{font:inherit;box-sizing:border-box;border-radius:8px;padding:12px}
#access-gate input{width:100%;background:#0f172a;color:#fff;border:1px solid #64748b}
#access-gate button{width:100%;margin-top:16px;background:#2563eb;color:#fff;border:0;cursor:pointer}
#access-gate input:focus-visible,#access-gate button:focus-visible,#access-logout:focus-visible{outline:3px solid #f59e0b;outline-offset:3px}
#access-error{color:#fca5a5;min-height:26px;margin:8px 0 0}
#access-logout{display:block;margin:16px 16px 0 auto;background:#1e293b;color:#fff;border:1px solid #64748b;cursor:pointer}
@media(max-width:480px){#access-gate{margin:40px 16px}}
</style>
<div id="access-gate">
<div style="color:#f59e0b;font-size:13px;letter-spacing:.12em">УРАЛСТРАТЕГ · ОБУЧЕНИЕ</div>
<h1>Вход в тестирование</h1>
<p>Введите пароль, чтобы открыть тесты.</p>
<form id="access-form">
<label for="access-password">Пароль</label>
<input id="access-password" type="password" autocomplete="current-password" required aria-describedby="access-error">
<p id="access-error" role="alert"></p>
<button type="submit">Войти</button>
</form>
<noscript>Для входа и прохождения тестов включите JavaScript.</noscript>
</div>
<button id="access-logout" type="button" hidden>Выйти</button>
'''
script='''<script>
(function(){
const config=__CONFIG__;
const key='ural-tests-access-'+config.digest;
const gate=document.getElementById('access-gate'),tests=document.getElementById('ural-tests'),logout=document.getElementById('access-logout');
function unlock(){gate.hidden=true;tests.hidden=false;logout.hidden=false;document.getElementById('ut-heading').focus();}
try{if(sessionStorage.getItem(key)==='yes')unlock();}catch(e){}
document.getElementById('access-form').addEventListener('submit',async function(event){
 event.preventDefault();const button=this.querySelector('button');button.disabled=true;
 const input=document.getElementById('access-password'),error=document.getElementById('access-error');
 try{
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(config.salt+input.value));
  const digest=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
  if(digest!==config.digest){error.textContent='Неверный пароль. Попробуйте ещё раз.';input.select();return;}
  input.value='';error.textContent='';try{sessionStorage.setItem(key,'yes');}catch(e){}unlock();
 }catch(e){error.textContent='Не удалось выполнить вход. Откройте страницу через HTTPS и повторите.';}
 finally{button.disabled=false;}
});
logout.addEventListener('click',function(){try{sessionStorage.removeItem(key);}catch(e){}location.reload();});
})();
</script>'''.replace('__CONFIG__',json.dumps(config))
source=source.replace('<section id="ural-tests"',gate+'<section id="ural-tests"',1).replace('</body>',script+'</body>')
page.write_text(source)
print('Password gate built. Plaintext password is outside the repository.')
