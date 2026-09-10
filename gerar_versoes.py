#!/usr/bin/env python3
# gerar_versoes.py v1.10 (10/09/2026) — trava DIVERGÊNCIA também pro
# APP_VERSAO do index.html (achado na proposta do contador: ficou 4 entregas
# desatualizado, 1.158.0 vs header 1.162.0, porque só o header e o export
# const VERSAO dos módulos eram checados — essa linha à parte, não).
# gerar_versoes.py v1.9 (09/09/2026) — ARQ ganha js/cofre-imagem.js (quality
# gate/pré-tratamento da foto, app v1.150.0).
# gerar_versoes.py v1.8 (08/09/2026) — ROLA o changelog do header do index.html
# pra CHANGELOG_APP.md: o cabeçalho mantém só as 5 versões mais recentes
# ("NOVIDADES (Beta vX)"); tudo abaixo disso vai pro .md (mais recente primeiro),
# só o que ainda não estiver lá (idempotente). Também passa a manter a linha
# "LINHAS:" do header. Hábito do Nicola não muda: changelog continua escrito no
# header; o rolo é automático na entrega. Antes: 7.332 linhas de changelog no
# index (30% do arquivo).
# v1.7 (07/09/2026) — versoes.json ganha `detalhes` por arquivo:
# linhas e funcoes (function declaradas; no index, seções + módulos importados).
# Lido pela tela Código do Raiz Gestão. `arquivos` continua igual (o app lê).
# v1.6 (06/09/2026) — + js/vitrine.js (R8 fatia 4)
# v1.5 (06/09/2026) — + js/minutas.js (R8 fatia 3)
# v1.4 (06/09/2026) — + js/contratos.js (R8 fatia 2)
# v1.3 (06/09/2026) — TRAVA: em todo módulo .js, a constante
# `export const VERSAO` tem que ser igual à "Versão:" do header. Se diferir,
# aborta a entrega (foi a causa dos 6 "cache segurou" falsos de 06/09: header
# bumpado, constante esquecida — ⚙️ › Versões lê a constante como "rodando").
# v1.2 (06/09/2026) — também grava o IMPORT MAP no index.html
# (bloco entre <!-- RZ-IMPORTMAP:INICIO --> e <!-- RZ-IMPORTMAP:FIM -->): cada
# módulo passa a ser importado como ./js/X.js?v=<versão do próprio arquivo>.
# URL nova a cada versão = nenhum cache (navegador, SW, proxy da operadora)
# consegue devolver módulo velho. Vale pra import() do index E pros imports
# estáticos dentro dos módulos (o navegador aplica o import map aos dois).
# Bloco é 1 linha só: regravar não muda o LINHAS do header.
# v1.1 (06/09/2026) — + js/financeiro.js (R8 fatia 1)
# v1.0 (06/09/2026) — gera versoes.json (a verdade do que
# deveria estar no ar) a partir dos headers dos arquivos do app. Rodado por
# Claude a cada entrega; o Deploy_Raiz.ps1 v2.10 publica e compara com o site.
import re, os, json, sys, datetime, io
ARQ = ['index.html','sw.js','js/cadastros.js','js/financeiro.js','js/contratos.js','js/minutas.js','js/vitrine.js','js/cofre-api.js','js/cofre-app.js','js/cofre-ativos.js','js/cofre-controles.js','js/cofre-documentos.js','js/cofre-imagem.js','js/cofre-estado.js','js/cofre-navegacao.js','js/cofre-ui.js','js/cofre-validacoes.js','js/comum-licenca.js','js/comum-minha-empresa.js','js/comum-pessoas.js','js/comum-sobre.js','js/ativos/ativos-boot.js','js/ativos/ativos-markup.js']
out = {'app': 'patrimonio', 'gerado_em': datetime.datetime.now().isoformat(timespec='seconds'), 'arquivos': {}, 'detalhes': {}}
for f in ARQ:
    s = io.open(f, encoding='utf-8').read()
    m = re.search(r"VERSÃO: Beta v([0-9.]+)", s) or re.search(r"Versão: ([0-9]+\.[0-9]+(?:\.[0-9]+)?)", s)
    if not m: print('SEM VERSÃO:', f); sys.exit(1)
    if f.endswith('.js') and f != 'sw.js':
        c = re.search(r"^export const (?:VERSAO|COFRE_VERSAO)\s*=\s*'([0-9.]+)'", s, re.M)
        if not c: print('SEM export const VERSAO:', f); sys.exit(1)
        if c.group(1) != m.group(1): print(f'DIVERGÊNCIA em {f}: header {m.group(1)} × VERSAO {c.group(1)} — corrija antes de entregar'); sys.exit(1)
    if f == 'index.html':
        # v1.10 — achado real (proposta do contador, 10/09/2026): APP_VERSAO
        # ficou 4 entregas atrás do header (1.158.0 enquanto o header já
        # dizia 1.162.0) — ninguém lembrou de editar essa linha à parte.
        # Mesmo defeito que o comentário da própria linha já registrava ter
        # acontecido antes (v1.37.1→v1.38.3). Trava igual à divergência de VERSAO.
        c = re.search(r'const APP_VERSAO\s*=\s*"Beta v([0-9.]+)"', s)
        if not c: print('SEM APP_VERSAO em index.html'); sys.exit(1)
        if c.group(1) != m.group(1): print(f'DIVERGÊNCIA em index.html: header {m.group(1)} × APP_VERSAO {c.group(1)} — corrija antes de entregar'); sys.exit(1)
    out['arquivos'][f] = m.group(1)
    linhas = s.count('\n') + (0 if s.endswith('\n') else 1)
    if f.endswith('.html'):
        funcoes = len(re.findall(r'<section\b', s)) + len(re.findall(r"import\(['\"]\./js/", s))
    else:
        funcoes = len(re.findall(r'^\s*(?:export\s+)?(?:async\s+)?function\s+[\w$]+\s*\(', s, re.M))
    out['detalhes'][f] = {'linhas': linhas, 'funcoes': funcoes}
io.open('versoes.json', 'w', encoding='utf-8').write(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
print('versoes.json:', len(out['arquivos']), 'arquivos')
# ---- import map no index.html (v1.2) ----
mapa = {'./' + f: './' + f + '?v=' + v for f, v in out['arquivos'].items() if f.endswith('.js') and f != 'sw.js'}
bloco = '<script type="importmap">' + json.dumps({'imports': mapa}, ensure_ascii=False, separators=(',', ':')) + '</script>'
idx = io.open('index.html', encoding='utf-8').read()
ini, fim = '<!-- RZ-IMPORTMAP:INICIO -->', '<!-- RZ-IMPORTMAP:FIM -->'
if idx.count(ini) != 1 or idx.count(fim) != 1: print('index.html sem os marcadores RZ-IMPORTMAP'); sys.exit(1)
a = idx.index(ini) + len(ini); b = idx.index(fim)
novo = idx[:a] + '\n    ' + bloco + '\n    ' + idx[b:]
if novo != idx:
    io.open('index.html', 'w', encoding='utf-8', newline='\n').write(novo); print('import map regravado no index.html:', len(mapa), 'módulos')
else: print('import map já estava atual')

# ---- rolo do changelog (v1.8) ----
KEEP = 5
idx = io.open('index.html', encoding='utf-8').read()
doc = idx.index('<!DOCTYPE')
cab, corpo = idx[:doc], idx[doc:]
linhas_cab = cab.split('\n')
marcas = [i for i, l in enumerate(linhas_cab) if re.match(r'^   NOVIDADES \(Beta v', l)]
if len(marcas) > KEEP:
    corte = marcas[KEEP]
    # leva junto as linhas de moldura logo acima ("-----", "VERSÃO: Beta v…", vazias)
    while corte > 0 and (linhas_cab[corte-1].strip() == '' or re.match(r'^   -{10,}$', linhas_cab[corte-1]) or re.match(r'^   VERSÃO: Beta v', linhas_cab[corte-1])):
        corte -= 1
    fim = next(i for i in range(len(linhas_cab)-1, corte, -1) if re.match(r'^={10,}$', linhas_cab[i].strip()))
    bloco = linhas_cab[corte:fim]
    # o que já está no .md não vai de novo
    md_path = 'CHANGELOG_APP.md'
    md = io.open(md_path, encoding='utf-8').read() if os.path.exists(md_path) else ''
    ja = set(re.findall(r'NOVIDADES \(Beta v([0-9.]+)\)', md))
    versoes_bloco = re.findall(r'NOVIDADES \(Beta v([0-9.]+)\)', '\n'.join(bloco))
    novas = [v for v in versoes_bloco if v not in ja]
    if novas:
        # recorta só até antes da 1ª versão que já existe no .md
        limite = len(bloco)
        for i, l in enumerate(bloco):
            m = re.match(r'^   NOVIDADES \(Beta v([0-9.]+)\)', l)
            if m and m.group(1) in ja: limite = i; break
        # e as molduras imediatamente acima dela
        while limite > 0 and (bloco[limite-1].strip() == '' or re.match(r'^   -{10,}$', bloco[limite-1]) or re.match(r'^   VERSÃO: Beta v', bloco[limite-1])):
            limite -= 1
        texto = '\n'.join(l[3:] if l.startswith('   ') else l for l in bloco[:limite]).strip('\n')
        intro = ('# Changelog — Raiz Patrimônio (app)\n\n'
                 'Histórico completo de versões do `index.html`, movido automaticamente pelo `gerar_versoes.py`: '
                 'o cabeçalho do index mantém só as 5 versões mais recentes; na entrega, as mais antigas rolam pra cá '
                 '(mais recente primeiro). Não editar à mão — escreva o changelog no header do index, como sempre.\n\n---\n\n')
        resto = md[len(intro):] if md.startswith(intro) else md
        io.open(md_path, 'w', encoding='utf-8', newline='\n').write(intro + texto + '\n\n---\n\n' + resto if resto.strip() else intro + texto + '\n')
        print(f'changelog: {len(novas)} versão(ões) roladas pra {md_path} (v{novas[0]} … v{novas[-1]})')
    ponteiro = ['   ------------------------------------------------------------------',
                '   Versões anteriores (v' + versoes_bloco[-1] + ' … v' + versoes_bloco[0] + '): CHANGELOG_APP.md, na raiz do',
                '   repositório — o gerar_versoes.py rola pra lá automaticamente tudo além',
                '   das 5 versões mais recentes deste cabeçalho.', '']
    linhas_cab = linhas_cab[:corte] + ponteiro + linhas_cab[fim:]
    cab = '\n'.join(linhas_cab)
    idx = cab + corpo
# LINHAS do header sempre coerente com o arquivo final
n = idx.count('\n')
idx2 = re.sub(r'^   LINHAS: \d+', '   LINHAS: ' + str(n), idx, count=1, flags=re.M)
if idx2 != io.open('index.html', encoding='utf-8').read():
    io.open('index.html', 'w', encoding='utf-8', newline='\n').write(idx2); print('index.html: header/LINHAS atualizados —', n, 'linhas')
