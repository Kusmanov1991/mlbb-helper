import json, re

def load(path, cut):
    src = open(path, encoding='utf8').read()
    src = src.split(cut)[0]
    ns = {}
    exec(src, ns)
    return ns

RNS = load('roam.py', '\nORDER=sorted')
XNS = load('lanes2.py', '\nJ=lambda')
RU = dict(RNS['RU']); RU.update(XNS['RU'])
RU.update({"Hirara": "Хирара", "Hilda": "Хильда", "Lukas": "Лукас", "Selena": "Селена", "Sora": "Сора"})

SLUG = {"popol-and-kupa": "popol", "x-borg": "xborg", "yu-zhong": "yuzhong", "yi-sun-shin": "yisunshin",
        "lapu-lapu": "lapulapu", "luo-yi": "luoyi"}
MH = {}
for line in open('mh.txt', encoding='utf8').read().strip().split('\n'):
    s, w, p, b = line.split('|')
    MH[SLUG.get(s, s)] = (float(w), float(p), float(b))
assert len(MH) == 133

# existing gold/mid ids + EN names, read from the pre-generation template
pre = open('template.pre-gen.html', encoding='utf8').read()
Hblock = re.search(r'const H=\{(.*?)\n\};', pre, re.S).group(1)
H_ALL = {k: (ru, en) for k, ru, en in re.findall(r'(\w+):\["([^"]+)","([^"]+)"\]', Hblock)}
ORDER_G = json.loads(re.search(r'const ORDER_G=(\[.*?\]);', pre).group(1))
ORDER_M = json.loads(re.search(r'const ORDER_M=(\[.*?\]);', pre).group(1))

P = XNS['P']
F = [0, 0, 0]
num = lambda v: ("%.1f" % v).replace(".", ",")
J = lambda x: json.dumps(x, ensure_ascii=False)

# ---------- hero records: id -> dict(en, ph, c, s) ----------
REC = {}
for k, (wr, ph, c, s) in RNS['R'].items():
    REC[k] = dict(en=RNS['EN'][k], ph=ph, c=c, s=s)
for D in (XNS['EXP'], XNS['JG']):
    for k, (en, wr, ph, c, s) in D.items():
        REC[k] = dict(en=en, ph=ph, c=c, s=s)

NEW = {
 "aldous": ("Aldous", [-1, 0, 1], "Esmeralda 3.3,Karina 2.6,Cyclops 2.3,Estes 2.1,Wanwan 2.1,Obsidia 2.0", "Uranus 2.8,Helcurt 2.5,Xavier 2.5,X.Borg 2.5,Gatotkaca 2.3,Novaria 2.0"),
 "minsitthar": ("Minsitthar", F, "Natalia 3.7,Yin 2.8,Aulus 2.5,Karina 2.2,X.Borg 2.1,Yu Zhong 1.8", "Freya 4.5,Phoveus 4.1,Harith 3.3,Martis 2.9,Karrie 2.7,Lukas 2.3,Dyrroth 2.1,Julian 2.0,Kalea 1.5"),
 "benedetta": ("Benedetta", F, "Obsidia 3.1,Phoveus 3.0,Mathilda 2.6,Saber 2.5,Cyclops 2.4,Selena 2.0,Irithel 2.0,Yi Sun-shin 1.5", "X.Borg 3.7,Alpha 3.6,Baxia 3.5,Silvanna 3.2,Ixia 2.9,Hanabi 2.5,Thamuz 2.4,Gord 2.1,Carmilla 2.1,Natan 2.1,Luo Yi 2.0,Vexana 1.8,Aurora 1.8,Dyrroth 1.8"),
 "lukas": ("Lukas", F, "Phoveus 2.8,Balmond 2.8,Valentina 2.8,Baxia 2.7,Minsitthar 2.3", "Ling 3.4,Natalia 2.5,Fanny 2.3,Helcurt 2.3,Aldous 2.0,Chou 1.7"),
 "bane": ("Bane", F, "Lolita 5.5,Helcurt 1.9,Nolan 1.8,Novaria 1.8,Atlas 1.8", "Phoveus 3.1,Chip 2.9,Khufra 2.2,Odette 2.1,Baxia 2.1"),
 "hirara": ("Hirara", [1, 0, -1], "Phoveus 2.4,Saber 2.3,Odette 2.1,Valentina 1.9,Bruno 1.7,Suyou 1.4", "Karina 2.7,Hanzo 2.4,X.Borg 2.2,Lolita 2.2,Yin 2.2,Roger 1.8"),
 "silvanna": ("Silvanna", [-1, 0, 1], "Barats 3.4,Khufra 3.2,Edith 3.2,Ling 3.1,Benedetta 3.1,Lapu-Lapu 3.0,Belerick 2.9,Minotaur 2.9,Hylos 2.3,Yu Zhong 1.9,Akai 1.9,Roger 1.8,Kagura 1.7,Vale 1.6", "Aamon 2.7,Floryn 2.5,Angela 2.2,Cici 2.1,Valentina 2.1,Rafaela 2.1,Dyrroth 1.8"),
 "hilda": ("Hilda", F, "Esmeralda 3.0,Karrie 2.7,Atlas 2.7,Khufra 2.4,Kimmy 2.3,Carmilla 2.2", "Granger 3.3,Helcurt 2.8,Yin 2.7,Diggie 2.5,Harley 2.4"),
 "sora": ("Sora", [1, 0, -1], "Melissa 2.4,Khufra 2.2,Alice 2.1,Phoveus 1.9,Martis 1.7", "Estes 4.3,Popol and Kupa 2.7,Rafaela 2.1,Karina 2.0,Natan 1.6"),
 "freya": ("Freya", [1, 0, -1], "Minsitthar 4.6,Phoveus 4.6,Baxia 2.7,Edith 2.0,Franco 1.9", "Masha 3.2,Lolita 2.5,Yve 2.3,Ling 2.1,Gloo 2.1,Kagura 2.0"),
 "selena": ("Selena", [1, 0, 0], "Gloo 2.5,Popol and Kupa 2.1,Fredrinn 1.9,Lukas 1.9,Chip 1.9", "Benedetta 2.0,Ixia 1.9,X.Borg 1.9,Beatrix 1.8,Yin 1.6"),
 "alucard": ("Alucard", F, "Khufra 3.3,Fredrinn 3.3,Phoveus 3.2,Barats 2.7,Thamuz 2.6,Akai 2.3,Tigreal 2.1", "Natalia 3.3,Sun 2.9,Saber 2.8,Mathilda 2.5,Cyclops 2.2,Harith 2.1"),
 "jawhead": ("Jawhead", [-1, 0, 1], "Lolita 4.3,Sun 3.7,Gloo 3.4,Esmeralda 3.4,Popol and Kupa 3.2", "Arlott 2.3,Nolan 2.0,Saber 1.9,Granger 1.8,Helcurt 1.7"),
 "change": ("Chang'e", F, "Lolita 5.5,Popol and Kupa 3.0,Gloo 2.8,Claude 2.5,Esmeralda 2.4", "Diggie 3.1,Balmond 1.6,Martis 1.6,X.Borg 1.4,Alpha 1.4"),
 "harith": ("Harith", F, "Phoveus 4.9,Minsitthar 3.3,Popol and Kupa 2.8,Edith 2.5,Cyclops 2.4,Alucard 2.3,Akai 2.3,Freya 2.2,Miya 1.9", "Lolita 3.4,Yve 3.0,Suyou 2.6,Karina 2.6,Johnson 2.5,Khaleed 2.5,Lapu-Lapu 2.0,Kagura 2.0,Zetian 1.7,Yu Zhong 1.6,Clint 1.5"),
 "zilong": ("Zilong", [-1, 0, 1], "Chip 3.6,Popol and Kupa 2.8,Karina 2.7,Tigreal 2.7,Johnson 2.5,Hylos 2.4,Barats 2.2,Gatotkaca 2.1,Badang 1.6,Zetian 1.5", "X.Borg 3.2,Cici 2.7,Xavier 2.5,Diggie 2.3,Karrie 2.1,Angela 1.9"),
 "balmond": ("Balmond", [-1, 0, 1], "Cici 4.8,X.Borg 3.8,Angela 3.7,Valir 3.3,Estes 3.2,Hanzo 2.3,Claude 2.1,Chang'e 1.5", "Saber 3.3,Lukas 2.8,Barats 2.5,Chip 2.4,Martis 2.3"),
}
for k, (en, ph, c, s) in NEW.items():
    REC[k] = dict(en=en, ph=ph, c=c, s=s)

RU_OF_ID = {}
for k, v in H_ALL.items():
    RU_OF_ID[k] = v[0]
for k, r in REC.items():
    RU_OF_ID[k] = RU[r['en']]
EN_OF_ID = {k: v[1] for k, v in H_ALL.items()}
for k, r in REC.items():
    EN_OF_ID[k] = r['en']
ID_OF_EN = {v: k for k, v in EN_OF_ID.items()}
for k in MH:
    assert k in EN_OF_ID, k

LANE_IDS = {
 "roam": [k for k in RNS['R']] + ["hilda", "jawhead"],
 "exp": [k for k in XNS['EXP']] + ["aldous", "minsitthar", "benedetta", "lukas", "silvanna", "sora", "freya", "zilong", "jawhead", "hilda", "bane"],
 "jungle": [k for k in XNS['JG']] + ["hirara", "alucard", "balmond", "bane", "lukas", "freya"],
 "gold": ORDER_G + ["harith"],
 "mid": ORDER_M + ["selena", "change"],
}

# ---------- descriptions and tips ----------
DESC = dict(RNS['DESC'])
TIP = dict(RNS['TIP']); TIP.update(XNS['TIP'])
TIP.update({
 "aldous": "Его удар копит силу за каждое добивание. Не давай ему спокойно фармить: после 16-й минуты он убивает с одного удара.",
 "minsitthar": "Его ультимейт запрещает рывки в зоне. Не прыгай к нему, пока ультимейт активен.",
 "benedetta": "Во время рывка она уходит от контроля. Давай контроль, когда она стоит на месте после атаки.",
 "lukas": "Он лечится в затяжной драке. Берите предметы против лечения: «Трезубец» и «Господство льда».",
 "bane": "Лолита блокирует его снаряды щитом и даёт против него +5,5 п.п.",
 "hirara": "На Мифической чести её банят в 76% игр, чаще всех. Если бан свободен, договоритесь заранее, кто её банит.",
 "silvanna": "Её ультимейт запирает тебя с ней один на один. Не ходи один, когда ультимейт у неё готов.",
 "hilda": "Она сильна в кустах и в драке один на один. Держитесь вместе и проверяйте кусты.",
 "sora": "Против него лучше всего работают Мелисса и Хуфра (+2,4 и +2,2 п.п.).",
 "freya": "Минситтар и Фовиус дают против неё по +4,6 п.п.: они ломают её прыжки.",
 "selena": "Проверяй кусты умениями: она ставит в них ловушки. После попадания её стрелы сразу уходи вбок.",
 "alucard": "Он лечится от урона. Нужны предметы против лечения и контроль: Хуфра и Фредрин дают по +3,3 п.п.",
 "jawhead": "Он хватает и бросает одного героя к своей команде. Лолита даёт против него +4,3 п.п.",
 "change": "Она бьёт с дистанции по прямой. Лолита блокирует её снаряды щитом (+5,5 п.п.).",
 "harith": "Он маг с рывками на линии золота. Против него лучше всего Фовиус (+4,9 п.п.): каждый рывок Харита даёт Фовиусу прыжок.",
 "zilong": "Его сильно контрят Чип и Пополь (+3,6 и +2,8 п.п.). Дави его до 10-й минуты.",
 "balmond": "Слабее всего до 10-й минуты: заходи в его лес в начале игры.",
})

# ---------- builds ----------
ATK = XNS['ATK']; FIGHTER = XNS['FIGHTER']; MF = XNS['MF']; FTANK = XNS['FTANK']
ASS = XNS['ASS']; MASS = XNS['MASS']; JTANK = XNS['JTANK']
TANK = RNS['TANK']
MAGE = ["Arcane Boots", "Clock of Destiny", "Lightning Truncheon", "Genius Wand", "Holy Crystal", "Divine Glaive"]
NF, NFT, NJ, NJT = XNS['NF'], XNS['NFT'], XNS['NJ'], XNS['NJT']
NT = RNS['NT']
NEWB = " Шаблонная сборка: сверь с рекомендуемой в игре."

BUILD = {}  # key -> js object literal
def b_roam(items, bless, note):
    return '{i:%s,s:"Flicker",r:%s,n:%s}' % (J(items), J(bless), J(note))
def b_gen(items, spell, r, rk, note):
    return '{i:%s,s:%s,%sn:%s}' % (J(items), J(spell), ('r:%s,rk:%s,' % (J(r), J(rk)) if r else ''), J(note))
for k, (items, bless, note) in RNS['BUILD'].items():
    BUILD[k] = b_roam(items, bless, note)
for k, v in XNS['BUILD'].items():
    BUILD[k] = b_gen(*v)
for k in ["aldous", "minsitthar", "lukas", "sora", "jawhead", "benedetta", "hilda"]:
    BUILD[k] = b_gen(FIGHTER, "Flicker", None, None, NF + NEWB)
BUILD["silvanna"] = b_gen(MF, "Flicker", None, None, NF + NEWB)
BUILD["bane"] = b_gen(MF, "Flicker", None, None, NF + NEWB)
BUILD["freya"] = b_gen(ATK, "Flicker", None, None, NF + NEWB)
BUILD["zilong"] = b_gen(ATK, "Flicker", None, None, NF + NEWB)
BUILD["hirara"] = b_gen(ASS, "Retribution", "Пламенное", "Тип возмездия", NJ + NEWB)
BUILD["alucard"] = b_gen(ASS, "Retribution", "Пламенное", "Тип возмездия", NJ + NEWB)
BUILD["balmond"] = b_gen(JTANK, "Retribution", "Ледяное", "Тип возмездия", NJT + NEWB)
BUILD["selena"] = b_gen(MAGE, "Flicker", None, None, "Ставь ловушки в кустах на пути врага и добивай стрелой после оглушения." + NEWB)
BUILD["change"] = b_gen(MAGE, "Flicker", None, None, "Держи максимальную дистанцию: весь твой урон идёт с расстояния, рывка почти нет." + NEWB)
# per-lane overrides for heroes that play two lanes
OVR = {
 "hilda@roam": b_roam(TANK, "Маскировка", NT + NEWB),
 "jawhead@roam": b_roam(TANK, "Маскировка", NT + NEWB),
 "lukas@jungle": b_gen(ASS, "Retribution", "Пламенное", "Тип возмездия", NJ + NEWB),
 "freya@jungle": b_gen(ATK, "Retribution", "Пламенное", "Тип возмездия", NJ + NEWB),
 "bane@exp": b_gen(MF, "Flicker", None, None, NF + NEWB),
 "bane@jungle": b_gen(MASS, "Retribution", "Пламенное", "Тип возмездия", NJ + NEWB),
}

PH = ["до 10-й минуты", "с 10-й по 16-ю минуту", "после 16-й минуты"]
def wr(k): return MH[k][0]

def entry(k, lane_ids):
    r = REC[k]; c = P(r['c']); s = P(r['s'])
    ids = set(lane_ids)
    picks = []
    for n, e in c:
        pid = ID_OF_EN.get(n)
        if pid in ids and pid != k:
            why = "По ранговой статистике выигрывает этот матчап."
            if pid in DESC: why += " " + DESC[pid]
            picks.append([pid, e, why])
    picks = picks[:4]
    if not picks:
        strong = {ID_OF_EN.get(n) for n, _ in s}
        cand = sorted([x for x in lane_ids if x != k and x not in strong], key=lambda x: -wr(x))[:3]
        picks = [[x, None, "Измеренного контрпика на этой линии нет. Это сильный герой патча (винрейт %s%% на Мифической чести), и у врага нет против него преимущества." % num(wr(x)), "wr"] for x in cand]
    t = [[RU[n], e] for n, e in c if ID_OF_EN.get(n) not in ids][:5]
    a = [[RU[n], e] for n, e in s if ID_OF_EN.get(n) in ids]
    tips = []
    st = [PH[i] for i in range(3) if r['ph'][i] == 1]; wk = [PH[i] for i in range(3) if r['ph'][i] == -1]
    if st or wk:
        parts = []
        if st: parts.append("сильнее всего " + " и ".join(st))
        if wk: parts.append("слабее всего " + " и ".join(wk))
        tips.append("По статистике " + ", ".join(parts) + ".")
    tips.append(TIP[k])
    return ' %s:{ph:%s,p:%s,\n  t:%s,a:%s,\n  tips:%s}' % (k, J(r['ph']), J(picks), J(t), J(a), J(tips))

def bl(k):
    r = REC[k]
    return '  {id:%s,wr:%s,c:%s,s:%s}' % (J(k), wr(k), J([[RU[n], e] for n, e in P(r['c'])]), J([[RU[n], e] for n, e in P(r['s'])]))

out = {}
ORD = {}
for lane in ("roam", "exp", "jungle"):
    ORD[lane] = sorted(LANE_IDS[lane], key=lambda k: -wr(k))
E = {lane: ",\n".join(entry(k, ORD[lane]) for k in ORD[lane]) for lane in ORD}
out['E_GEN'] = ("// Матчапы роума, линии опыта и леса: p — герои своей линии с измеренным преимуществом, иначе сильные герои патча (метка \"wr\")\n"
                "const ER={\n%s\n};\nconst EX={\n%s\n};\nconst EJ={\n%s\n};" % (E['roam'], E['exp'], E['jungle']))
out['ORDER_GEN'] = "const ORDER_R=%s;\nconst ORDER_X=%s;\nconst ORDER_J=%s;" % (J(ORD['roam']), J(ORD['exp']), J(ORD['jungle']))
out['BL_GEN'] = " roam:[\n%s\n ],\n exp:[\n%s\n ],\n jungle:[\n%s\n ]" % tuple(",\n".join(bl(k) for k in ORD[l]) for l in ("roam", "exp", "jungle"))

tpl = open('template.html', encoding='utf8').read()
existing = set(re.findall(r'(\w+):\["[^"]+","[^"]+"\]', re.search(r'const H=\{(.*?)\n\};', tpl, re.S).group(1)))
gen_ids = sorted({k for l in ORD for k in ORD[l]} | {"selena", "change", "harith"})
out['H_GEN'] = " " + ",".join('%s:[%s,%s]' % (k, J(RU_OF_ID[k]), J(EN_OF_ID[k])) for k in gen_ids if k not in existing)
bkeys = [k for k in gen_ids if k != "harith" and k != "alice"]
for k in bkeys: assert k in BUILD, k
out['B_GEN'] = ",\n".join(' %s:%s' % (k, BUILD[k]) for k in bkeys) + ",\n" + ",\n".join(' %s:%s' % (J(k), v) for k, v in OVR.items())

out['B_GEN'] += ",\n zhask:" + b_gen(MAGE, "Flicker", None, None, "Ставь турель так, чтобы она била по линии из-за стены, и дерись рядом с ней." + NEWB)
# gold / mid additions
out['EG_ADD'] = entry("harith", LANE_IDS['gold'])
out['EM_ADD'] = entry("selena", LANE_IDS['mid']) + ",\n" + entry("change", LANE_IDS['mid'])
out['BLM_ADD'] = bl("selena") + ",\n" + bl("change")
out['MH'] = "const MH=%s;\n// популярность (пик + бан, %%) для сортировки списка героев\nconst POP=%s;" % (J({k: [v[0], v[2]] for k, v in MH.items()}), J({k: round(v[1]+v[2], 2) for k, v in MH.items()}))
out['RU_ALL'] = {k: RU_OF_ID[k] for k in MH}
json.dump(out, open('gen3_out.json', 'w', encoding='utf8'), ensure_ascii=False)
print({l: len(ORD[l]) for l in ORD}, len(gen_ids), "new H:", [k for k in gen_ids if k not in existing])
