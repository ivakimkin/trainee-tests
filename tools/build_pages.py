"""Generate the static GitHub Pages entry point and Tilda embed."""
from pathlib import Path
import runpy

ROOT = Path(__file__).resolve().parents[1]
runpy.run_path(str(ROOT / 'tools/build_tilda.py'))
page = (ROOT / 'tilda/preview.html').read_text()
bridge = '''<style>body{margin:0;background:#0f172a}#ural-tests{min-height:0}</style>
<script>
(function(){
 function reportHeight(){parent.postMessage({type:'ural-tests-page-height',height:document.body.offsetHeight},'*');}
 new ResizeObserver(reportHeight).observe(document.body);
 window.addEventListener('load',reportHeight);
})();
</script>'''
page = page.replace('</body>', bridge + '</body>').replace('<title>', '<meta name="robots" content="noindex,nofollow"><title>', 1)
(ROOT / 'docs/index.html').write_text(page)
(ROOT / 'docs/.nojekyll').touch()
(ROOT / 'tilda/github-pages-embed.html').write_text('''<!-- Tilda T123: replace the URL if your GitHub Pages address differs. -->
<iframe id="ural-tests-embed"
 src="https://ivakimkin.github.io/trainee-tests/"
 title="Тестирование сотрудников — Уралстратег"
 sandbox="allow-scripts allow-same-origin allow-modals"
 referrerpolicy="strict-origin-when-cross-origin"
 style="display:block;width:100%;height:850px;border:0;background:#0f172a"
></iframe>
<script>
(function(){
 const frame=document.getElementById('ural-tests-embed');
 const expectedOrigin=new URL(frame.src).origin;
 window.addEventListener('message',function(event){
  if(event.origin!==expectedOrigin||event.source!==frame.contentWindow||!event.data||event.data.type!=='ural-tests-page-height')return;
  const height=event.data.height;
  if(typeof height==='number'&&Number.isFinite(height)&&height>0&&height<100000)frame.style.height=Math.ceil(height+8)+'px';
 });
})();
</script>
''')
print('Built docs/index.html and tilda/github-pages-embed.html')
