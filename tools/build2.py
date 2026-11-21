import os
import json, re
d = json.load(open('gen3_out.json', encoding='utf8'))
s = open('template.html', encoding='utf8').read()

def rep(a, b, count=1):
    global s
    assert s.count(a) == count, (s.count(a), a[:80])
    s = s.replace(a, b)

for m in ('H_GEN', 'ORDER_GEN', 'B_GEN', 'E_GEN', 'BL_GEN'):
    rep('/*%s*/' % m, d[m])

# gold / mid additions
s = re.sub(r'(const ORDER_G=\[[^\]]*)\]', r'\1,"harith"]', s, count=1)
s = re.sub(r'(const ORDER_M=\[[^\]]*)\]', r'\1,"selena","change"]', s, count=1)
i = s.index('const EG={'); j = s.index('\n};', i)
s = s[:j] + ',\n' + d['EG_ADD'] + s[j:]
i = s.index('const EM={'); j = s.index('\n};', i)
s = s[:j] + ',\n' + d['EM_ADD'] + s[j:]
i = s.index('{id:"nana",wr:47.13'); j = s.index('\n', i)
s = s[:j] + ',\n' + d['BLM_ADD'] + s[j:]
rep('const LANES={', '// Мифическая честь (25–49 звёзд), 7 дней: [винрейт, бан-рейт]\n' + d['MH'] + '\nconst LANES={')

# runtime
i = s.index('const $=s=>document.querySelector(s);'); j = s.index('</script>')
import importlib.util as _iu
_sp=_iu.spec_from_file_location('matchups',os.path.join(os.path.dirname(os.path.abspath(__file__)),'matchups.py')); _m=_iu.module_from_spec(_sp); _sp.loader.exec_module(_m)
MU_JS = 'const MU=' + json.dumps(_m.MU, ensure_ascii=False) + ';\n'
s = s[:i] + MU_JS + open('runtime.js', encoding='utf8').read() + s[j:]

# markup
rep('<title>Контрпики по всем линиям</title>', '<title>Контрпики MLBB по всем линиям</title>')
rep('данные матчапов на 15–16 ноября 2026', 'матчапы на 15–17 ноября, винрейты и баны Мифической чести на 17 ноября 2026')
rep('''      <button type="button" data-mode="known">Знаю, кто на линии</button>
      <button type="button" data-mode="blind">Пикаю вслепую</button>''',
    '''      <button type="button" data-mode="known">Знаю врага</button>
      <button type="button" data-mode="blind">Вслепую</button>
      <button type="button" data-mode="draft">Баны</button>
      <button type="button" data-mode="roampick">Пик роума</button>''')
rep('<div class="seg lane" role="group" aria-label="Линия">', '<div class="seg lane" id="laneSeg" role="group" aria-label="Линия">')
rep('''  <section class="card" id="result" aria-live="polite"></section>''',
    '''  <section class="picker" id="pickPred" aria-label="Составы команд" hidden>
    <h2>Составы команд</h2>
    <div id="teams"></div>
    <input id="q3" type="search" placeholder="Поиск героя: Линг, ling…" autocomplete="off" aria-label="Поиск героя для команды">
    <div class="grid scroll" id="grid3"></div>
  </section>

  <section class="card" id="result" aria-live="polite"></section>''')
rep('<div class="empty" id="empty" hidden>Такого героя в списке нет. Попробуй другое написание.</div>',
    '<div class="empty" id="empty" hidden></div>')
rep('<p class="hint">Отметь открытых врагов с любых линий. Можно никого не отмечать: тогда порядок идёт по винрейту.</p>',
    '<p class="hint">Отметь открытых врагов с любых линий. Можно никого не отмечать: тогда порядок идёт по винрейту с учётом риска контрпика.</p>')
rep('''  <section class="card">
    <h2>Что менять в сборке по ситуации</h2>''', '''  <section class="card" id="sitCard">
    <h2>Что менять в сборке по ситуации</h2>''')
rep('Оценка = винрейт героя за 7 дней минус 50, плюс его преимущества и минус его слабости против отмеченных врагов. Учитываются только матчапы, по которым есть статистика, поэтому отметить можно не любого героя.',
    'Оценка = винрейт героя на Мифической чести за 7 дней минус 50, плюс его преимущества и минус его слабости против отмеченных врагов, минус самый сильный контрпик с его линии, который ещё не в бане (враг может взять его позже). Учитываются только матчапы, по которым есть статистика, поэтому отметить можно не любого героя.</div>\n    <div><b>Баны.</b> Винрейт и бан-рейт взяты по Мифической чести (25–49 звёзд) за 7 дней. Список отсортирован по угрозе = (винрейт − 50) + бан-рейт / 20. У героев, которых банят очень часто, винрейт посчитан по меньшему числу игр. Порядок драфта: пики идут змейкой 1-2-2-2-2-1, последний пик у команды, которая пикает второй.')
rep('для части героев последние данные от патча 2.2.16a)', 'для части героев последние данные от патча 2.2.16a; матчапы посчитаны по всем рангам)')
rep('<div>Источник: <a href="https://mlbbhub.com/counter">mlbbhub.com/counter</a>, <a href="https://mlbbhub.com/statistics">mlbbhub.com/statistics</a></div>',
    '<div>Источник: <a href="https://mlbbhub.com/counter">mlbbhub.com/counter</a>, <a href="https://mlbbhub.com/statistics">mlbbhub.com/statistics</a>, <a href="https://mlbbhub.com/draft">mlbbhub.com/draft</a></div>')

css = '''
.mu{margin:10px 0 4px}.chip.inban{opacity:.55}.chip.inban small{color:var(--bad,#b42318)}.eyebrow{margin:0 0 4px;font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#777)}.mu li b{font-weight:600}
.seg.lane button{padding:10px 2px;font-size:14px}
.chip.banned{opacity:.45}
.empty .alts{margin-top:8px}
.banline{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;font-size:13px;color:var(--muted);background:var(--bad-soft);border-radius:10px;padding:6px 10px}
.banline .link{padding:2px 0}
.seq{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.sq{border-radius:8px;padding:6px 4px;text-align:center;font-size:12px;background:var(--panel-2);color:var(--muted);border:1px solid transparent}
.sq b{display:block;font-family:var(--display);font-weight:400;font-size:14px;color:var(--ink)}
.sq.us{background:var(--gold-soft)}
.sq.me{border-color:var(--gold);box-shadow:inset 0 0 0 1px var(--gold);color:var(--ink)}
.go{appearance:none;border:0;background:var(--gold);color:#16130a;font:inherit;font-weight:700;font-size:15px;padding:12px 14px;border-radius:10px;cursor:pointer;min-height:44px;text-align:center}
.next{font-size:15px;background:var(--panel-2);border-radius:10px;padding:10px 12px}
.next span{color:var(--muted)}
ul.bans{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.banrow{appearance:none;width:100%;border:1px solid var(--line);background:var(--panel);color:var(--ink);font:inherit;border-radius:10px;padding:8px 10px;display:flex;align-items:center;gap:10px;cursor:pointer;text-align:left;flex-wrap:wrap}
.banrow .bn{flex:1 1 140px;min-width:0;line-height:1.25}
.banrow .bn small{display:block;color:var(--muted);font-size:12px;font-variant-numeric:tabular-nums}
.banrow .mk{font-size:12px;font-weight:700;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:3px 9px}
.banrow[aria-pressed="true"]{background:var(--bad-soft);border-color:var(--bad)}
.banrow[aria-pressed="true"] b{text-decoration:line-through}
.banrow[aria-pressed="true"] .mk{background:var(--bad);border-color:var(--bad);color:#fff}
#bq{margin-top:8px}
#bfound{margin-top:8px}
.grid.scroll{max-height:320px;overflow-y:auto;padding:2px}
.chip.inus{background:var(--good-soft);border-color:var(--good)}
.chip.inthem{background:var(--bad-soft);border-color:var(--bad)}
.chip.inus[aria-pressed="true"],.chip.inthem[aria-pressed="true"]{color:var(--ink)}
#teams{display:flex;flex-direction:column;gap:8px}
.team{display:flex;flex-direction:column;gap:6px;border:1px solid var(--line);border-radius:12px;padding:8px;background:var(--panel)}
.team.on{border-color:var(--gold);box-shadow:inset 0 0 0 1px var(--gold)}
.tlabel{appearance:none;border:0;background:none;color:var(--ink);font:inherit;font-family:var(--display);font-size:15px;text-align:left;padding:2px;cursor:pointer}
.tlabel small{font-family:var(--body);color:var(--muted);font-size:12px;margin-left:6px}
.team.us .tlabel{color:var(--good)}.team.them .tlabel{color:var(--bad)}
.slots{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.slot{appearance:none;border:1px dashed var(--line);background:var(--panel-2);color:var(--muted);font:inherit;font-size:20px;border-radius:10px;min-height:64px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:4px 2px}
.slot.full{border-style:solid;font-size:11px;font-weight:600;color:var(--ink);line-height:1.1;text-align:center}
.slot.full span{overflow-wrap:anywhere}
.bar{height:14px;border-radius:999px;background:var(--bad-soft);overflow:hidden}
.bar span{display:block;height:100%;background:var(--good)}
.barlbl{display:flex;justify-content:space-between;font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}
'''
rep('@media (prefers-reduced-motion:no-preference)', css + '@media (prefers-reduced-motion:no-preference)')
# in-game Russian hero names (esports.ru / cyber.sports.ru lists)
RENAME = [("Фарсы","Фаши"),("Чжу Синь","Чжусинь"),("Луо И","Ло Йи"),("И Сун-Син","Ли Сун-Син"),("Ю Чжун","Юй Чжун"),("Чанъэ","Чан'Э"),
  ("Зетиан","Цзэтянь"),("Фарса","Фаша"),("Вейл","Вэйл"),("Аамон","Эймон"),("Бейн","Бэйн"),("Баратс","Бартс"),("Баксия","Баксий"),
  ("Дайрот","Дариус"),("Джавхед","Кусака"),("Калея","Калеа"),("Рафаэла","Рафаэль"),("Сильванна","Сильвана"),("Суё","Су Ё"),("Теризла","Тэризла")]
i = s.index('<script>'); j = s.index('</script>')
head, js, tail = s[:i], s[i:j], s[j:]
alias_start = js.index('const ALIAS='); alias_end = js.index('\n', alias_start)
alias = js[alias_start:alias_end]
js = js[:alias_start] + '@@ALIAS@@' + js[alias_end:]
for old, new in RENAME:
    js = re.sub(r'(?<![А-Яа-яЁё])' + re.escape(old) + r'(?![А-Яа-яЁё])', new, js)
js = js.replace('@@ALIAS@@', alias)
s = head + js + tail
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'index.html'), 'w', encoding='utf8').write(s)
print('ok', len(s))
