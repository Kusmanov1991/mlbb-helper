import json,re
src=open('roam.py',encoding='utf8').read()
RU=eval(re.search(r'^RU=(\{.*?\})\n',src,re.S|re.M).group(1))
RU.update({"Aldous":"Алдос","Barats":"Баратс","Roger":"Роджер","Baxia":"Баксия","Gatotkaca":"Гатоткача","Argus":"Аргус","Hayabusa":"Хаябуса","Minsitthar":"Минситтар","Kagura":"Кагура","Akai":"Акай"})
def P(s): return [(p.strip().rsplit(" ",1)[0].strip(),float(p.strip().rsplit(" ",1)[1])) for p in s.split(",") if p.strip()]
F=[0,0,0]
EXP={
"masha":("Masha",60.3,F,"Estes 3.4,Freya 3.2,Melissa 2.5,Bruno 2.2,Rafaela 2.0","Gloo 3.0,Lesley 2.9,Eudora 2.9,Cici 2.4,Yu Zhong 2.3,Brody 2.3,Pharsa 1.9"),
"argus":("Argus",56.8,[-1,0,1],"Terizla 3.2,Barats 3.2,Uranus 3.0,Ruby 2.3,Fredrinn 2.2","Karrie 2.9,Lunox 2.8,Helcurt 2.4,Arlott 2.2,Saber 2.2,Guinevere 2.1"),
"sun":("Sun",54.0,F,"Natan 5.2,Joy 3.8,Ruby 3.6,Marcel 3.5,Kimmy 3.4,Alucard 3.0,Faramis 2.8,Suyou 2.3,Badang 1.8,Aulus 1.8","Jawhead 3.7,Diggie 3.3,Harley 3.0,Karrie 2.8,Saber 2.8,Hanzo 2.7,Layla 2.7,Franco 2.5,Lesley 2.2"),
"aulus":("Aulus",53.5,F,"Alice 3.0,Yve 2.4,Floryn 2.4,Zhuxin 2.2,Estes 2.0","Gloo 3.2,Minsitthar 2.6,Tigreal 2.4,Natalia 2.3,Sun 1.8,Ruby 1.8,Eudora 1.6"),
"yuzhong":("Yu Zhong",49.0,F,"Masha 2.3,Wanwan 1.8,Cici 1.7,Claude 1.6,Harith 1.6","Gloo 2.5,Silvanna 2.1,Minsitthar 2.0,Atlas 1.7,Popol and Kupa 1.6"),
"esmeralda":("Esmeralda",46.9,F,"Lunox 3.4,Karrie 3.3,Dyrroth 3.2,Natan 3.1,Alice 2.6,Fredrinn 2.4,Julian 2.4,Guinevere 1.8","Lolita 5.7,Mathilda 4.3,Marcel 3.7,Diggie 3.6,Yin 3.6,Aldous 3.5,Lapu-Lapu 3.5,Jawhead 3.3,Phoveus 3.3,Akai 3.1,Hilda 3.0,Paquito 3.0,Grock 2.8,Chou 2.5,Chang'e 2.3,Badang 2.2,Granger 1.9,Freya 1.8,Roger 1.7"),
"alice":("Alice",50.7,F,"Angela 4.7,Karrie 4.1,Floryn 4.0,Estes 3.9,Valir 3.7,Edith 3.6,Diggie 3.4,Baxia 3.4,Yve 3.1,Cici 3.0,Dyrroth 3.0,Thamuz 2.5,Julian 2.4,Harley 2.4,Kimmy 2.3,Gord 1.8,Lylia 1.7","Gloo 3.8,Tigreal 3.6,Barats 3.6,Chip 3.6,Khufra 3.4,Atlas 3.3,Faramis 3.2,Phoveus 3.1,Akai 3.1,Johnson 3.0,Aulus 3.0,Zhask 2.8,Grock 2.8,Vexana 2.7,Minotaur 2.5,Sora 2.1,Kadita 2.1,Clint 1.3"),
"xborg":("X.Borg",49.9,F,"Mathilda 3.8,Benedetta 3.8,Helcurt 3.7,Floryn 3.5,Natalia 3.3,Ling 3.3,Zilong 3.2,Paquito 3.1,Valentina 3.1,Chou 3.0,Arlott 2.8,Joy 2.6,Aldous 2.3,Hirara 2.3,Nolan 2.3,Selena 1.9,Gusion 1.8,Kagura 1.7,Suyou 1.5,Chang'e 1.5","Barats 5.1,Baxia 5.0,Terizla 4.2,Martis 3.8,Phoveus 3.8,Hylos 3.7,Balmond 3.6,Ruby 3.3,Carmilla 3.2,Alpha 3.1,Gatotkaca 3.1,Tigreal 2.9,Cici 2.8,Fredrinn 2.3,Minsitthar 2.0,Vexana 1.9"),
"phoveus":("Phoveus",48.1,F,"Minsitthar 4.0,X.Borg 3.8,Barats 3.5,Alpha 3.4,Alice 3.1,Bane 3.1,Terizla 2.3,Gord 2.3,Balmond 2.1,Julian 2.1,Layla 2.0","Wanwan 6.6,Harith 4.9,Freya 4.6,Alucard 3.2,Ruby 3.1,Benedetta 3.0,Khaleed 2.8,Chou 2.8,Lukas 2.6,Joy 2.5,Hirara 2.4,Kagura 2.3,Kalea 2.0,Arlott 2.0,Sora 1.9,Paquito 1.8,Kadita 1.5"),
"terizla":("Terizla",50.5,[0,1,-1],"X.Borg 4.2,Valir 2.3,Karrie 2.2,Angela 2.1,Xavier 2.0","Argus 3.2,Phoveus 2.3,Odette 2.0,Vale 1.8,Lolita 1.7"),
"uranus":("Uranus",49.4,F,"Dyrroth 3.1,Karrie 3.0,Yve 2.9,Angela 2.7,Aldous 2.5,Kimmy 2.4","Gatotkaca 3.0,Argus 2.9,Yin 2.7,Zhask 2.1,Granger 2.0,Yi Sun-shin 1.9"),
"edith":("Edith",52.3,[0,1,0],"Lolita 4.9,Beatrix 2.6,Baxia 2.4,Karina 2.1,Hanzo 1.9,Layla 1.8","Alice 3.7,Harith 3.7,Silvanna 3.3,Mathilda 2.5,Claude 2.4,Freya 1.7"),
"khaleed":("Khaleed",50.1,F,"Phoveus 2.8,Yve 2.8,Lunox 2.6,Fredrinn 2.5,Leomord 2.0","Yin 3.3,Vale 2.8,Lolita 2.4,Helcurt 2.0,Hanabi 2.0,Miya 1.9"),
"lapulapu":("Lapu-Lapu",48.2,[1,0,-1],"Esmeralda 3.5,Harith 2.0,Mathilda 1.9,Claude 1.8,Cici 1.5","Silvanna 2.8,Popol and Kupa 2.7,Hanabi 2.3,Argus 2.1,Vale 1.9,Julian 1.4"),
"paquito":("Paquito",50.0,[1,0,0],"Esmeralda 3.0,Khufra 2.4,Phoveus 2.0,Melissa 1.9,Fredrinn 1.8","Natalia 3.5,X.Borg 3.0,Karina 2.7,Wanwan 1.7,Benedetta 1.7"),
"chou":("Chou",45.1,F,"Phoveus 2.8,Esmeralda 2.4,Cyclops 2.4,Khufra 1.9,Lukas 1.8","X.Borg 3.0,Fanny 2.5,Ixia 2.0,Beatrix 2.0,Natalia 1.7,Lylia 1.6"),
"thamuz":("Thamuz",48.9,[-1,0,1],"Cici 4.6,Valir 2.8,Wanwan 2.5,Benedetta 2.3,Yi Sun-shin 2.1","Alucard 2.6,Alice 2.5,Saber 2.0,Odette 2.0,Diggie 1.9,Dyrroth 1.7"),
"arlott":("Arlott",47.5,F,"Zhask 2.4,Argus 2.2,Jawhead 2.2,Phoveus 2.0,Chip 2.0,Lukas 1.9","X.Borg 2.8,Cici 2.7,Zhuxin 2.3,Kimmy 2.1,Natan 2.1,Nolan 1.7"),
"cici":("Cici",49.4,F,"Aamon 4.5,Estes 3.8,Diggie 2.8,Zilong 2.8,X.Borg 2.8,Arlott 2.7,Rafaela 2.7,Masha 2.4,Silvanna 2.1","Thamuz 4.6,Balmond 4.5,Alice 3.0,Hylos 2.8,Gloo 2.7,Lukas 2.3,Lancelot 2.2,Yu Zhong 1.8,Lylia 1.7,Lapu-Lapu 1.6"),
"guinevere":("Guinevere",51.2,[1,0,-1],"Wanwan 2.9,Diggie 2.6,Joy 2.5,Khufra 2.4,Argus 2.1","Lunox 2.4,Karrie 1.9,Julian 1.9,Esmeralda 1.7,Angela 1.6"),
"ruby":("Ruby",48.9,[1,0,-1],"X.Borg 3.3,Phoveus 3.1,Lolita 2.0,Aulus 1.8,Gord 1.7,Clint 1.4","Sun 3.6,Gloo 3.4,Argus 2.3,Karina 2.1,Joy 2.1"),
"badang":("Badang",50.2,F,"Karina 2.2,Lolita 2.2,Esmeralda 2.1,Khufra 2.0,Diggie 1.8","Fanny 2.7,Sun 1.8,Zilong 1.6,Hayabusa 1.2,Helcurt 1.1"),
"dyrroth":("Dyrroth",49.4,[-1,1,0],"Johnson 2.1,Nana 1.9,Minsitthar 1.8,Silvanna 1.8,Thamuz 1.7","Esmeralda 3.4,Uranus 3.2,Alice 3.0,Faramis 2.4,Moskov 2.1"),
"gatotkaca":("Gatotkaca",45.3,[-1,0,1],"X.Borg 3.1,Uranus 3.0,Lesley 2.9,Baxia 2.8,Mathilda 2.2","Odette 3.1,Saber 2.5,Miya 2.4,Zilong 2.0,Aurora 1.7"),
}
JG={
"ling":("Ling",52.6,F,"Natalia 5.5,Saber 4.0,Lukas 3.2,Floryn 3.1,Bruno 3.1,Karina 3.0,Melissa 2.8,Freya 2.1,Valentina 2.0","Gloo 3.6,X.Borg 3.3,Hanzo 3.2,Atlas 3.2,Silvanna 3.1,Gord 2.7,Novaria 2.7"),
"fanny":("Fanny",42.8,[1,0,0],"Moskov 3.1,Bruno 2.9,Badang 2.7,Faramis 2.6,Chou 2.5,Franco 2.5,Kalea 2.5,Lukas 2.1","Granger 3.5,Gloo 3.2,Clint 2.9,Yve 2.8,Atlas 2.7,Kimmy 2.5"),
"hayabusa":("Hayabusa",48.1,F,"Saber 2.6,Fredrinn 2.1,Lolita 2.0,Zhask 1.8,Eudora 1.8,Badang 1.3","Aamon 2.9,Zhuxin 2.2,Karrie 2.2,Yve 2.2,X.Borg 2.1,Nolan 2.1,Cecilion 1.7"),
"lancelot":("Lancelot",43.1,[0,-1,1],"Angela 3.3,Floryn 2.6,Cici 2.2,Bruno 1.9,Alucard 1.8","Atlas 2.6,Yin 2.5,Chip 1.9,Alpha 1.7,Granger 1.7,Aurora 1.3"),
"joy":("Joy",48.6,F,"Moskov 4.1,Marcel 3.1,Cyclops 2.9,Melissa 2.8,Brody 2.4,Ruby 2.2,Harley 2.0,Martis 1.7","Sun 3.8,Lolita 3.4,X.Borg 2.9,Lylia 2.8,Yve 2.5,Hanabi 2.5,Luo Yi 2.3,Guinevere 2.2,Suyou 1.9"),
"nolan":("Nolan",49.6,[1,0,-1],"Saber 3.9,Natalia 3.8,Hayabusa 2.1,Jawhead 2.0,Helcurt 1.7","Estes 4.0,Zhuxin 2.6,X.Borg 2.5,Yve 2.5,Baxia 2.3,Natan 2.2,Bane 2.0"),
"aamon":("Aamon",50.4,F,"Gloo 4.6,Lolita 3.8,Hayabusa 2.7,Silvanna 2.7,Atlas 2.6,Gusion 2.5","Cici 4.5,Marcel 3.1,Claude 2.9,Bruno 2.5,Xavier 2.4"),
"karina":("Karina",48.7,[-1,0,1],"Granger 4.7,Brody 4.0,Clint 3.0,Gloo 2.9,Lunox 2.8,Paquito 2.7,Hirara 2.6,Harith 2.5,Faramis 2.4,Ruby 2.1,Sora 2.0","Natalia 4.5,Kimmy 3.3,Marcel 3.0,Ling 3.0,Helcurt 2.9,Zilong 2.7,Aldous 2.6,Hanabi 2.5,Badang 2.2,Bruno 2.1,Minsitthar 2.1,Yi Sun-shin 1.7"),
"helcurt":("Helcurt",47.7,[0,-1,1],"Chip 3.9,Obsidia 2.9,Karina 2.9,Hilda 2.8,Natalia 2.7,Aldous 2.5,Argus 2.4,Mathilda 2.4,Eudora 2.3,Lukas 2.1,Khaleed 2.0,Kalea 1.9,Zetian 1.9,Jawhead 1.8,Roger 1.7,Badang 1.1","X.Borg 3.7,Valir 3.6,Xavier 3.2,Gord 2.8,Hanzo 2.6,Bane 2.0,Luo Yi 1.8,Cecilion 1.4"),
"saber":("Saber",51.2,F,"Balmond 3.4,Leomord 3.2,Miya 2.9,Baxia 2.9,Sun 2.8,Johnson 2.7,Alpha 2.6,Hanabi 2.6,Alucard 2.6,Gatotkaca 2.5,Belerick 2.5,Martis 2.4,Hylos 2.4,Argus 2.2,Nana 2.1,Thamuz 2.0,Jawhead 1.9","Ling 4.0,Nolan 4.0,Natalia 3.8,Yve 2.9,Lunox 2.9,Valentina 2.7,Hayabusa 2.6,Benedetta 2.5,Hirara 2.4,Brody 2.3,Irithel 2.3,Kaja 2.1,Moskov 2.1,Clint 1.5"),
"gusion":("Gusion",48.5,F,"Lolita 3.0,Chip 2.4,Roger 2.2,Khufra 2.1,Gloo 1.8","Yve 2.3,Valir 2.3,Aamon 2.2,X.Borg 2.1,Natalia 1.7,Suyou 1.6"),
"hanzo":("Hanzo",49.9,F,"Natalia 4.6,Ling 3.4,Hirara 2.7,Sun 2.5,Helcurt 2.3,Obsidia 2.1","Diggie 3.5,Ixia 3.2,Franco 2.8,Balmond 2.5,Alpha 2.2,Cecilion 1.9,Bane 1.8,Pharsa 1.4"),
"julian":("Julian",49.9,[1,0,0],"Guinevere 1.9,Minsitthar 1.7,Baxia 1.6,Tigreal 1.5,Hylos 1.4","Faramis 3.0,Alice 2.4,Esmeralda 2.3,Phoveus 2.1,Diggie 2.1"),
"suyou":("Suyou",49.6,[1,0,0],"Harith 2.2,Harley 1.7,Odette 1.6,Yve 1.5,Gusion 1.5","Natalia 2.7,Sun 2.3,X.Borg 1.5,Hirara 1.4,Yin 1.4"),
"yin":("Yin",49.6,[-1,0,1],"Wanwan 5.0,Esmeralda 3.6,Uranus 3.2,Irithel 2.7,Khaleed 2.6,Hilda 2.5,Lancelot 2.3,Hylos 2.1,Hirara 2.1,Obsidia 1.9,Zhask 1.9,Grock 1.8,Roger 1.7,Suyou 1.5","Faramis 3.1,Minsitthar 2.9,Floryn 2.8,Diggie 2.8,Ixia 2.7,Aurora 2.1,Luo Yi 1.9,Kalea 1.7"),
"fredrinn":("Fredrinn",51.3,F,"Valir 4.0,Gord 2.7,Karrie 2.4,X.Borg 2.3,Alpha 2.2,Cecilion 1.6,Aurora 1.5","Gloo 3.5,Alucard 3.2,Lunox 2.7,Khaleed 2.5,Joy 2.3,Argus 2.2,Hayabusa 2.1,Selena 1.8,Paquito 1.8"),
"akai":("Akai",50.1,F,"Marcel 3.2,Alice 3.1,Esmeralda 2.8,Kaja 2.8,Cyclops 2.5,Hanabi 2.0","Alucard 2.2,Silvanna 1.9,Granger 1.9,Harith 1.9,Nana 1.9"),
"barats":("Barats",51.6,F,"X.Borg 5.1,Alice 3.6,Gord 3.4,Yve 3.2,Valir 2.6,Alpha 2.6,Balmond 2.4,Lylia 1.9,Cecilion 1.8","Phoveus 3.5,Silvanna 3.4,Argus 3.2,Alucard 2.9,Zilong 2.2,Eudora 2.2,Brody 1.9"),
"baxia":("Baxia",45.5,F,"X.Borg 5.0,Karrie 3.5,Beatrix 3.0,Benedetta 3.0,Bane 2.9,Hanzo 2.8,Nolan 2.4,Clint 2.0","Obsidia 3.5,Alice 3.4,Zhask 3.2,Saber 2.9,Gatotkaca 2.8,Freya 2.7,Edith 2.4,Lukas 2.3,Julian 1.6"),
"leomord":("Leomord",49.9,F,"Valir 3.2,Zhuxin 2.7,Karrie 2.7,Melissa 2.2,Angela 2.0","Lolita 3.8,Saber 3.1,Natalia 2.5,Belerick 2.4,Popol and Kupa 2.3,Eudora 1.9,Roger 1.8"),
"alpha":("Alpha",48.9,[-1,0,1],"Benedetta 3.7,X.Borg 3.1,Valir 2.6,Diggie 2.5,Kaja 2.2,Lylia 2.1,Lancelot 1.7,Chang'e 1.4","Phoveus 3.4,Barats 2.6,Odette 2.6,Saber 2.6,Fredrinn 2.2"),
"martis":("Martis",47.2,F,"X.Borg 3.8,Minsitthar 3.0,Marcel 2.2,Balmond 2.1,Uranus 1.6,Chang'e 1.5","Chip 2.6,Saber 2.4,Moskov 1.9,Khufra 1.8,Sora 1.7"),
"roger":("Roger",48.2,F,"Yve 3.0,Leomord 2.3,Zhuxin 2.0,Popol and Kupa 1.9,Hirara 1.7","Harley 2.6,Gusion 2.3,Silvanna 1.8,Yin 1.7,Helcurt 1.7"),
"yisunshin":("Yi Sun-shin",49.1,[1,0,-1],"Lolita 1.9,Uranus 1.8,Karina 1.7,Xavier 1.4,Esmeralda 1.3","Thamuz 2.1,Khufra 1.9,Benedetta 1.4,Nana 1.4,Melissa 1.3"),
}
TIP={
"masha":"Самый сильный герой патча на линии опыта. Если бан свободен, тратьте его на неё.",
"argus":"Не добивай его под ультимейтом: в это время он бессмертен. Отойди и вернись, когда эффект закончится.",
"sun":"Бейте настоящего Сана и берите урон по области, чтобы убирать клонов.",
"aulus":"Каждое его умение открывает окно усиленных автоатак с замедлением и лечением. Не давай ему держать контакт.",
"yuzhong":"Отходи, когда на тебе копятся его метки: на полных стаках он лечится и бьёт сильнее.",
"esmeralda":"Она забирает чужие щиты, поэтому героям со щитами против неё тяжело.",
"alice":"Берите предметы против лечения: она живёт за счёт восстановления в драке.",
"xborg":"Сначала сбей его броню, затем отходи от взрыва ультимейта.",
"phoveus":"Не используй рывки рядом с ним: каждый рывок даёт ему прыжок на тебя.",
"terizla":"Он медленный. Держи дистанцию и не стой в зоне его ультимейта.",
"uranus":"Без предметов против лечения его не убить: нужны «Трезубец» и «Господство льда».",
"edith":"После ультимейта она стреляет издалека. Заходи, когда ультимейт в откате.",
"khaleed":"Сбивай контролем его восстановление, когда он останавливается лечиться.",
"lapulapu":"Отходи от его ультимейта и возвращайся, когда он закончится.",
"paquito":"Следи за его зарядами: усиленное умение бьёт намного больнее обычного.",
"chou":"Держи «Зимнюю корону» под его удар ногой: он выбивает тебя к своей команде.",
"thamuz":"Не стой в лаве под его ультимейтом: размен на его территории почти всегда проигран.",
"arlott":"Его рывки перезаряжаются по целям под контролем. Не давайте контроль на союзников зря.",
"cici":"Она бьёт на ходу и сильнее против героев с большим запасом здоровья. Лови её контролем.",
"guinevere":"Её комбо начинается с подброса. Уходи вбок от второго умения.",
"ruby":"Она лечится от урона по нескольким целям. Не стойте кучей и берите предметы против лечения.",
"badang":"Не дерись у стен: его стена и серия ударов прижимают к ней.",
"dyrroth":"Он режет броню и убивает за одно комбо. Не разменивайся вблизи без защиты.",
"gatotkaca":"Сейчас слабый пик. Следи за его прыжком ультимейта издалека.",
"ling":"Контроль в момент приземления со стены его убивает. Наталья даёт против него +5,5 п.п.",
"fanny":"Сейчас слабый пик. Забирайте у неё синий бафф: без энергии она не летает.",
"hayabusa":"Его ультимейт бьёт по одной цели слабее, если рядом союзники. Не ходи один.",
"lancelot":"Сейчас слабый пик. Мгновенный контроль ловит его между рывками.",
"joy":"Контроль сбивает ей ритм рывков. Без полной серии она не включит ультимейт.",
"nolan":"Не отдавай ему ранние драки за черепаху: дальше он слабеет.",
"aamon":"Не стой с низким здоровьем: его ультимейт добивает тем сильнее, чем меньше у тебя здоровья.",
"karina":"Грейнджер и Броуди дают против неё +4,7 и +4,0 п.п. После каждого добивания её умения сбрасываются.",
"helcurt":"Когда он гасит обзор, встаньте вместе у башни и не ходите поодиночке.",
"saber":"Его ультимейт подбрасывает одну цель. Держи под него «Зимнюю корону».",
"gusion":"Отходи вбок от его кинжалов: без них комбо не складывается.",
"hanzo":"Пока его демон дерётся, найдите и убейте настоящее тело.",
"julian":"У него нет ультимейта, вся сила в серии из трёх умений. Не подставляйся под третье.",
"suyou":"Он меняет стойку между дальним и ближним боем. Заходи, когда умения стойки потрачены.",
"yin":"В его арене ты остаёшься с ним один на один. Ванван даёт против него +5,0 п.п.",
"fredrinn":"Не бей его слишком долго: накопленный урон он возвращает ультимейтом.",
"akai":"Не стой у стен: его ультимейт прижимает к ним и оглушает.",
"barats":"Чем больше у него стаков, тем он крупнее и сильнее. Выходи из драки, чтобы стаки спали.",
"baxia":"Он режет лечение и щиты вокруг себя. Сейчас слабый пик.",
"leomord":"Верхом на коне он бьёт критами. Убивайте его до ультимейта или отходите.",
"alpha":"Заходите в его лес в начале игры, пока он слаб.",
"martis":"Во время умений у него иммунитет к контролю. Давай контроль между ними.",
"roger":"В форме волка он добивает цели с низким здоровьем. Не дерись с ним на малом запасе.",
"yisunshin":"Следи за выстрелом его ультимейта через всю карту, когда у тебя мало здоровья.",
}
ATK=["Swift Boots","Corrosion Scythe","Demon Hunter Sword","Golden Staff","Malefic Roar","Immortality"]
FIGHTER=["Tough Boots","War Axe","Hunter Strike","Brute Force Breastplate","Queen's Wings","Immortality"]
MF=["Tough Boots","Genius Wand","Concentrated Energy","Holy Crystal","Oracle","Immortality"]
FTANK=["Tough Boots","Thunder Belt","Brute Force Breastplate","Oracle","Antique Cuirass","Immortality"]
ASS=["Tough Boots","Hunter Strike","Blade of the Heptaseas","Malefic Roar","Blade of Despair","Immortality"]
MASS=["Arcane Boots","Genius Wand","Holy Crystal","Concentrated Energy","Divine Glaive","Winter Crown"]
JTANK=["Tough Boots","Thunder Belt","Cursed Helmet","Athena's Shield","Antique Cuirass","Immortality"]
NF="Выигрывай размены у своих миньонов. После двух предметов помогай команде на черепахе и в драках."
NFT="Держи линию и принимай урон на себя. В драке заходи после инициации роумера."
NJ="Чисти лес по кругу и приходи на линию, где у союзников есть контроль. Возмездие держи под черепаху и лорда."
NJT="Забирай черепаху и лорда. В драках заходи первым и принимай урон."
BUILD={}
for k in ["argus","sun","masha"]: BUILD[k]=(ATK,"Flicker",None,None,NF)
for k in ["aulus","yuzhong","terizla","khaleed","lapulapu","paquito","chou","thamuz","arlott","cici","ruby","badang","dyrroth","xborg"]: BUILD[k]=(FIGHTER,"Flicker",None,None,NF)
for k in ["guinevere","phoveus"]: BUILD[k]=(MF,"Flicker",None,None,NF)
for k in ["uranus","gatotkaca","edith","esmeralda"]: BUILD[k]=(FTANK,"Flicker",None,None,NFT)
for k in ["ling","fanny","hayabusa","lancelot","nolan","saber","helcurt","hanzo","suyou","yin","leomord","alpha","martis","roger","yisunshin"]: BUILD[k]=(ASS,"Retribution","Пламенное","Тип возмездия",NJ)
for k in ["joy","aamon","karina","gusion","julian"]: BUILD[k]=(MASS,"Retribution","Пламенное","Тип возмездия",NJ)
for k in ["fredrinn","akai","barats","baxia"]: BUILD[k]=(JTANK,"Retribution","Ледяное","Тип возмездия",NJT)
J=lambda x:json.dumps(x,ensure_ascii=False)
num=lambda v:("%.1f"%v).replace(".",",")
PH=["до 10-й минуты","с 10-й по 16-ю минуту","после 16-й минуты"]
def gen(R):
    EN={k:v[0] for k,v in R.items()}; ID={v:k for k,v in EN.items()}
    ORDER=sorted(R,key=lambda k:-R[k][1])
    H=",".join('%s:[%s,%s]'%(k,J(RU[EN[k]]),J(EN[k])) for k in ORDER if k!="alice")
    Bs=[]
    for k in ORDER:
        if k=="alice": continue
        i,s,r,rk,n=BUILD[k]
        Bs.append(' %s:{i:%s,s:%s,%sn:%s}'%(k,J(i),J(s),('r:%s,rk:%s,'%(J(r),J(rk)) if r else ''),J(n)))
    ER=[];BL=[]
    for k in ORDER:
        _,wr,ph,c,s=R[k]; c=P(c); s=P(s)
        picks=[[ID[n],e,"По ранговой статистике выигрывает этот матчап."] for n,e in c if n in ID][:4]
        if not picks:
            strong={n for n,_ in s}
            cand=[x for x in ORDER if x!=k and EN[x] not in strong][:3]
            picks=[[x,None,"Измеренного контрпика на этой линии нет. Это сильный герой патча (винрейт %s%%), и у врага нет против него преимущества."%num(R[x][1]),"wr"] for x in cand]
        t=[[RU[n],e] for n,e in c if n not in ID][:5]
        a=[[RU[n],e] for n,e in s if n in ID]
        tips=[]
        st=[PH[i] for i in range(3) if ph[i]==1]; wk=[PH[i] for i in range(3) if ph[i]==-1]
        if st or wk:
            parts=[]
            if st: parts.append("сильнее всего "+" и ".join(st))
            if wk: parts.append("слабее всего "+" и ".join(wk))
            txt=", ".join(parts); tips.append("По статистике "+txt+".")
        tips.append(TIP[k])
        ER.append(' %s:{ph:%s,p:%s,\n  t:%s,a:%s,\n  tips:%s}'%(k,J(ph),J(picks),J(t),J(a),J(tips)))
        BL.append('  {id:%s,wr:%s,c:%s,s:%s}'%(J(k),wr,J([[RU[n],e] for n,e in c]),J([[RU[n],e] for n,e in s])))
    return {"H":H,"B":",\n".join(Bs),"ER":",\n".join(ER),"BL":",\n".join(BL),"ORDER":ORDER}
out={"exp":gen(EXP),"jungle":gen(JG)}
json.dump(out,open("lanes2_out.json","w",encoding="utf8"),ensure_ascii=False)
print(out["exp"]["ORDER"][:5],out["jungle"]["ORDER"][:5])
