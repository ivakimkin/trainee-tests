"""Build the self-contained Tilda T123 fragment from the original quizzes."""
from pathlib import Path
import base64
import json

ROOT = Path(__file__).resolve().parents[1]
QUIZZES = [
    ('Test_Prodavec_25.html', 'Продавец', '25 вопросов · Продажи, касса и склад'),
    ('Test_scretar_25v1.html', 'Секретарь · Вариант 1', '25 вопросов · Первичные документы'),
    ('Test_scretar_25v2.html', 'Секретарь · Вариант 2', '25 вопросов · С перемешиванием ответов'),
    ('Test_scretar_30.html', 'Секретарь · Расширенный', '30 вопросов · Работа в 1С:УНФ'),
]
items = []
for filename, title, description in QUIZZES:
    source = (ROOT / filename).read_text()
    extra = '''<style>body {min-height:0 !important; padding:12px !important; box-sizing:border-box !important;} .quiz-container {min-width:0 !important; padding:clamp(16px,4vw,30px) !important;} .option-item {overflow-wrap:anywhere;} .option-item:focus-visible {outline:3px solid #f59e0b; outline-offset:2px;}</style>
<script>
(function () {
 function enhance() {
  document.querySelectorAll('.option-item').forEach(function(el) {
   el.tabIndex=0; el.setAttribute('role','button');
   el.onkeydown=function(event) {if(event.key==='Enter'||event.key===' ') {event.preventDefault();el.click();}};
  });
 }
 new MutationObserver(enhance).observe(document.getElementById('options-container'),{childList:true});
 enhance();
 new ResizeObserver(function(){parent.postMessage({type:'ural-quiz-height',height:document.body.offsetHeight},'*');}).observe(document.body);
})();
</script>'''
    source = source.replace('function restartQuiz() {\n    initQuiz();\n}', "function restartQuiz() {\n    parent.postMessage({type:'ural-quiz-lock'},'*');\n}")
    source = source.replace('<div class="quiz-container" id="quiz-box">', '<div class="quiz-container" id="quiz-box"><div class="variant-toolbar"><span>1С:УНФ</span></div>')
    extra += """<style>
body {padding:4px !important;}
.variant-toolbar {display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #334155;}
.variant-toolbar span {grid-column:2;color:#f59e0b;font-size:20px;font-weight:800;white-space:nowrap;}
body > .app-header,.quiz-container > .brand-header,#game-stage > .header-title,#result-stage > .header-title {display:none !important;}
@media(max-width:420px){.variant-toolbar {grid-template-columns:1fr auto 1fr;}.variant-toolbar span {font-size:18px;}}
</style>"""
    if filename == 'Test_scretar_25v2.html':
        extra += """<style>
#question-timer {grid-column:3;grid-row:1;justify-self:end;color:#cbd5e1;font:700 20px/1.2 system-ui,sans-serif;font-variant-numeric:tabular-nums;}
#question-timer[hidden] {display:none !important;}
#question-timer.timer-urgent {color:#fca5a5;}
@media(max-width:420px){#question-timer{font-size:18px;}}
.variant-toolbar span {grid-row:1;}
.timeout-feedback {background:#451a1a !important;border-left-color:#ef4444 !important;color:#fecaca !important;}
</style>"""
        extra += '<script>' + (ROOT / 'tools/variant2-timer.js').read_text() + '</script>'
        source = source.replace('<button class="btn-next" onclick="startQuiz()">', '<p style="color:#cbd5e1;font-size:15px;line-height:1.5;text-align:center">На каждый вопрос — 12 секунд. Если время истечёт, ответ будет засчитан как ошибка.</p><button class="btn-next" onclick="startQuiz()">', 1)
    source = source.replace('</body>', extra + '</body>')
    items.append(dict(internal_back=True, title=title, description=description, html=base64.b64encode(source.encode()).decode()))
fragment = '''<!-- Insert this entire fragment in ONE Tilda T123 HTML block. Set page password in Tilda before publishing. -->
<section id="ural-tests" lang="ru">
<style>
#ural-tests {background:#0f172a;color:#f1f5f9;font:16px/1.6 system-ui,sans-serif;padding:20px 16px 32px;min-height:70vh;box-sizing:border-box;}
#ural-tests.ut-compact {padding-top:8px;}
#ural-tests.ut-compact #ut-back {display:none;}
#ural-tests * {box-sizing:border-box;}
#ural-tests [hidden] {display:none!important;}
#ural-tests .ut-wrap {max-width:960px;margin:auto;}
#ural-tests .ut-brand {text-align:center;color:#f59e0b;font-size:16px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;}
#ural-tests #ut-heading:focus {outline:none;}
#ural-tests h1 {text-align:center;font-size:clamp(28px,5vw,44px);line-height:1.15;margin:16px 0;color:#fff;font-weight:750;}
#ural-tests #ut-menu > p {text-align:center;}
#ural-tests p {color:#cbd5e1;margin:0 0 28px;}
#ural-tests .ut-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;}
#ural-tests button {font:inherit;cursor:pointer;}
#ural-tests .ut-card {text-align:left;color:#f1f5f9;background:#1e293b;border:1px solid #475569;border-radius:16px;padding:24px;transition:border-color .2s,background .2s;}
#ural-tests .ut-card:hover {border-color:#f59e0b;background:#27364d;}
#ural-tests button:focus-visible {outline:3px solid #f59e0b;outline-offset:4px;}
#ural-tests .ut-card strong {display:block;font-size:21px;margin-bottom:8px;}
#ural-tests .ut-card span {display:block;color:#cbd5e1;font-size:14px;}
#ural-tests .ut-card em {display:block;color:#fbbf24;font-style:normal;margin-top:24px;}
#ural-tests .ut-back {background:transparent;border:1px solid #64748b;color:#fff;border-radius:8px;padding:10px 16px;margin:0 0 20px;}
#ural-tests iframe {display:block;width:100%;border:0;min-height:550px;background:#0f172a;}
#ural-tests .ut-note {text-align:center;font-size:14px;margin-top:24px;}
@media(max-width:600px){#ural-tests .ut-grid{grid-template-columns:1fr;}#ural-tests .ut-card{padding:20px;}}
</style>
<div class="ut-wrap">
<div id="ut-menu">
<div class="ut-brand">СТРАТЕГ</div>
<h1 tabindex="-1" id="ut-heading">Проверка знаний 1С:УНФ</h1>
<p>Выберите тест для подготовки сотрудника. После прохождения вы увидите результат и рекомендации по обучению.</p>
<div class="ut-grid" id="ut-cards"></div>
<p class="ut-note">Результаты отображаются на экране и не отправляются на сервер.</p>
</div>
<div id="ut-player" hidden>
<button type="button" class="ut-back" id="ut-back">← К выбору теста</button>
<div id="ut-frame-slot"></div>
</div>
<noscript>Для выбора и прохождения тестов включите JavaScript в браузере.</noscript>
</div>
<script>
(function(){
'use strict';
const quizzes=__DATA__;
const root=document.getElementById('ural-tests');
const menu=root.querySelector('#ut-menu'), player=root.querySelector('#ut-player'), slot=root.querySelector('#ut-frame-slot');
let frame=null,lastButton=null;
quizzes.forEach(function(quiz){
 const button=document.createElement('button');button.type='button';button.className='ut-card';
 const title=document.createElement('strong');title.textContent=quiz.title;
 const description=document.createElement('span');description.textContent=quiz.description;
 const action=document.createElement('em');action.textContent='Открыть тест →';
 button.append(title,description,action);
 button.addEventListener('click',function(){
  lastButton=button;root.classList.toggle('ut-compact',quiz.internal_back);
  frame=document.createElement('iframe');frame.title='Тест: '+quiz.title;
  frame.setAttribute('sandbox','allow-scripts');
  frame.srcdoc=new TextDecoder().decode(Uint8Array.from(atob(quiz.html),function(c){return c.charCodeAt(0);}));
  slot.replaceChildren(frame);menu.hidden=true;player.hidden=false;
  if(quiz.internal_back)frame.focus();else root.querySelector('#ut-back').focus();root.scrollIntoView({block:'start'});
 });
 root.querySelector('#ut-cards').append(button);
});
window.addEventListener('message',function(event){
 if(!frame||event.source!==frame.contentWindow||!event.data)return;
 if(event.data.type==='ural-quiz-lock'){window.dispatchEvent(new Event('ural-tests-lock'));return;}
 if(event.data.type!=='ural-quiz-height')return;
 const height=event.data.height;
 if(typeof height==='number'&&Number.isFinite(height)&&height>0&&height<100000)frame.style.height=Math.ceil(height+8)+'px';
});
function returnToMenu(){
 if(!window.confirm('Вернуться к выбору теста? Текущее прохождение будет сброшено.'))return;
 slot.replaceChildren();frame=null;player.hidden=true;menu.hidden=false;root.classList.remove('ut-compact');
 if(lastButton)lastButton.focus();
}
root.querySelector('#ut-back').addEventListener('click',returnToMenu);
})();
</script>
</section>
'''.replace('__DATA__', json.dumps(items, ensure_ascii=False))
(ROOT / 'tilda' / 'test-block.html').write_text(fragment)
(ROOT / 'tilda' / 'preview.html').write_text('<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Уралстратег — Тесты</title><body style="margin:0">'+fragment+'</body></html>')
print('Built Tilda block and standalone preview')
