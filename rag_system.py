"""
rag_system.py
-------------
Modulo RAG per sistema nutrizionistico.
Espone SistemaRAG come classe utilizzabile da Express via child_process o HTTP interno.

Dipendenze:
    pip install ollama chromadb python-dotenv
"""

import os
import json
import ollama
import chromadb
from chromadb.utils.embedding_functions import OllamaEmbeddingFunction
from dotenv import load_dotenv

load_dotenv()

OLLAMA_BASE_URL  = os.getenv("OLLAMA_BASE_URL",  "http://localhost:11434")
OLLAMA_CHAT      = os.getenv("OLLAMA_MODEL",      "llama3.2")
OLLAMA_EMBED     = os.getenv("OLLAMA_EMBED_MODEL","nomic-embed-text")
CHROMA_PATH      = os.getenv("CHROMA_PATH",       "./rag_db")


# ---------------------------------------------------------------------------
# Dati seed — knowledge base nutrizionistica estesa
# Categorie: linee guida, patologie, alimenti, micronutrienti,
#            pasti, intolleranze, stili alimentari, sport
# ---------------------------------------------------------------------------

LINEE_GUIDA = [

    # ── LINEE GUIDA GENERALI ────────────────────────────────────────────────

    {
        "id": "lin_001",
        "testo": """LINEE GUIDA NUTRIZIONALI — OMS (Organizzazione Mondiale della Sanità)
        Adulti: almeno 400g di frutta e verdura al giorno, preferibilmente di stagione e colori diversi.
        Zuccheri liberi: meno del 10% dell'apporto calorico totale giornaliero; ridurre ulteriormente al 5% per benefici aggiuntivi.
        Grassi saturi: meno del 10% delle calorie giornaliere. Preferire grassi insaturi (olio d'oliva, frutta secca, pesce).
        Grassi trans industriali: meno dell'1% dell'apporto energetico totale; da eliminare il più possibile.
        Sale: meno di 5g al giorno per prevenire ipertensione e malattie cardiovascolari.
        Fibre: almeno 25-30g al giorno da cereali integrali, legumi, frutta e verdura.
        Acqua: almeno 1.5-2 litri al giorno, aumentare con il caldo o attività fisica intensa.""",
        "categoria": "linee guida",
    },
    {
        "id": "lin_002",
        "testo": """LINEE GUIDA — LARN (Livelli di Assunzione di Riferimento di Nutrienti, Italia)
        Proteine: 0.9g per kg di peso corporeo al giorno per adulti sedentari. Aumentare a 1.2-1.6g/kg per sportivi.
        Carboidrati: 45-60% dell'energia totale giornaliera, privilegiando fonti a basso indice glicemico.
        Grassi totali: 20-35% dell'energia totale. Acidi grassi omega-3: almeno 250mg di EPA+DHA al giorno.
        Calcio: 1000mg/giorno per adulti, 1200mg per over 50 e donne in menopausa.
        Ferro: 10mg/giorno per uomini adulti, 18mg per donne in età fertile.
        Vitamina D: 15 microgrammi (600 UI) al giorno per adulti, 20 microgrammi per over 70.
        Folati: 400 microgrammi al giorno; 600 microgrammi in gravidanza per prevenire difetti del tubo neurale.
        Iodio: 150 microgrammi al giorno; usare sale iodato.""",
        "categoria": "linee guida",
    },
    {
        "id": "lin_003",
        "testo": """LINEE GUIDA — DIETA MEDITERRANEA
        La dieta mediterranea è riconosciuta dall'UNESCO come patrimonio culturale immateriale dell'umanità.
        Base della piramide alimentare: cereali integrali (pasta, pane, riso, orzo, farro) ad ogni pasto.
        Frutta e verdura: 5 porzioni al giorno di colori diversi per massimizzare i micronutrienti.
        Legumi: almeno 3-4 volte a settimana come fonte proteica principale alternativa alla carne.
        Pesce: 2-3 volte a settimana, privilegiando pesce azzurro (sardine, sgombro, acciughe) ricco di omega-3.
        Carne rossa: massimo 1-2 volte a settimana. Carne bianca (pollo, tacchino, coniglio) fino a 3 volte.
        Uova: 2-4 a settimana.
        Formaggi e latticini: con moderazione, preferire yogurt e formaggi freschi a basso contenuto di grassi.
        Olio extravergine d'oliva: condimento principale, 2-4 cucchiai al giorno.
        Frutta secca e semi: una piccola manciata al giorno (30g). Mandorle, noci, pistacchi.
        Dolci e zuccheri: occasionalmente, non più di 2-3 volte a settimana.
        Vino rosso: se consumato, massimo 1 bicchiere al giorno per le donne, 2 per gli uomini, solo durante i pasti.""",
        "categoria": "linee guida",
    },

    # ── PATOLOGIE E CONDIZIONI ───────────────────────────────────────────────

    {
        "id": "pat_001",
        "testo": """GESTIONE NUTRIZIONALE — IPERTENSIONE ARTERIOSA
        L'ipertensione arteriosa colpisce circa il 30% della popolazione adulta italiana.
        Dieta DASH (Dietary Approaches to Stop Hypertension): riduce la pressione sistolica di 8-14 mmHg.
        Alimenti da privilegiare: frutta fresca (banane, arance, kiwi ricchi di potassio), verdure a foglia verde
        (spinaci, bietole), legumi, pesce azzurro, latticini scremati, cereali integrali.
        Alimenti da ridurre drasticamente: sale da cucina (max 5g/giorno incluso quello nascosto nei cibi),
        insaccati (salame, prosciutto, mortadella), formaggi stagionati, cibi in scatola, dadi da brodo,
        salse industriali, patatine, snack salati.
        Alimenti da evitare: alcol in eccesso (max 1 unità alcolica al giorno), caffeina in eccesso (max 2 caffè),
        liquirizia (aumenta la pressione), energy drink.
        Potassio: fondamentale per abbassare la pressione — fabbisogno 3.5g/giorno. Fonti: banane, patate,
        fagioli, spinaci, avocado, albicocche secche.
        Magnesio: 300-400mg/giorno. Fonti: mandorle, semi di zucca, spinaci, cioccolato fondente, legumi.
        Riduzione peso: ogni kg perso riduce la pressione sistolica di circa 1 mmHg.""",
        "categoria": "patologie",
    },
    {
        "id": "pat_002",
        "testo": """GESTIONE NUTRIZIONALE — DIABETE TIPO 2 E RESISTENZA ALL'INSULINA
        Il diabete tipo 2 è spesso prevenibile e gestibile con dieta e stile di vita.
        Indice glicemico (IG): preferire alimenti a basso IG (< 55). Pane integrale IG 50, pane bianco IG 75.
        Carico glicemico: più importante dell'IG, considera anche la quantità di carboidrati per porzione.
        Carboidrati: non eliminare ma distribuire uniformemente nei pasti (45-60% delle calorie totali).
        Evitare picchi glicemici: non saltare i pasti, associare sempre carboidrati con proteine e grassi.
        Fibre solubili: fondamentali per rallentare l'assorbimento degli zuccheri. Avena, legumi, mele, orzo.
        Alimenti consigliati: cereali integrali, legumi, verdure non amidacee, frutta a basso IG (ciliegie,
        mele, pere), pesce, carni magre, olio d'oliva.
        Alimenti da limitare: zuccheri semplici, bevande zuccherate, succhi di frutta, dolci, pane bianco,
        riso bianco, patate (IG alto), frutta tropicale (mango, banane mature, uva).
        Alimenti da evitare: zucchero da tavola, miele in grandi quantità, sciroppo di glucosio-fruttosio.
        Cannella: alcuni studi suggeriscono un effetto positivo sulla sensibilità insulinica — 1-2g/giorno.
        Pasti: 3 pasti principali + 1-2 spuntini leggeri per mantenere stabile la glicemia.""",
        "categoria": "patologie",
    },
    {
        "id": "pat_003",
        "testo": """GESTIONE NUTRIZIONALE — INTOLLERANZA AL LATTOSIO
        Il lattosio è lo zucchero naturalmente presente nel latte e nei derivati. Circa il 50% degli italiani
        ha ridotta capacità di digerirlo in età adulta per diminuzione della lattasi intestinale.
        Sintomi: gonfiore addominale, crampi, diarrea, flatulenza dopo assunzione di latticini.
        Soglia individuale: molti intolleranti tollerano fino a 12g di lattosio al giorno (un bicchiere di latte).
        Alimenti da evitare: latte vaccino fresco, formaggi freschi (ricotta, mozzarella, stracchino),
        panna, burro in grandi quantità, gelato cremoso, besciamella tradizionale.
        Alimenti generalmente tollerati: formaggi stagionati (parmigiano, grana, pecorino stagionato, emmental)
        — il lattosio si degrada durante la stagionatura. Yogurt fermentato — i batteri lattici degradano
        parzialmente il lattosio. Latte delattosato. Burro chiarificato (ghee).
        Alternative vegetali: latte di soia (proteico), latte di avena (dolce, buono per cottura),
        latte di mandorla (leggero), latte di riso (molto dolce, basso contenuto proteico),
        latte di cocco (alto contenuto di grassi saturi, usare con moderazione).
        Calcio alternativo: broccoli (47mg/100g), cavolo riccio (150mg/100g), sardine con lische (330mg/100g),
        tofu con calcio (350mg/100g), mandorle (264mg/100g), fichi secchi, sesamo.
        Etichette: attenzione a "latte in polvere", "siero di latte", "caseina" negli ingredienti.""",
        "categoria": "patologie",
    },
    {
        "id": "pat_004",
        "testo": """GESTIONE NUTRIZIONALE — CELIACHIA E SENSIBILITÀ AL GLUTINE
        La celiachia è una malattia autoimmune che colpisce circa l'1% della popolazione italiana.
        Glutine: proteina presente in frumento, farro, kamut, orzo, segale, triticale e avena contaminata.
        Dieta: assolutamente priva di glutine per tutta la vita. Anche tracce possono causare danni intestinali.
        Cereali e amidi consentiti: riso, mais, grano saraceno, quinoa, amaranto, miglio, sorgo, teff,
        patate, tapioca, castagne, ceci (farina), lenticchie (farina).
        Cereali vietati: frumento (pasta, pane, pizza tradizionale, semolino, bulgur, couscous), farro,
        kamut, orzo, segale, triticale. Avena: consentita solo se certificata gluten-free.
        Rischio contaminazione crociata: fondamentale in cucina — usare utensili e superfici separate,
        olio di frittura non condiviso, toaster dedicato.
        Prodotti industriali: verificare sempre il simbolo della spiga barrata (gluten-free certificato).
        Etichette a rischio: "amido modificato", "malto", "sciroppo di malto", "proteine vegetali idrolizzate".
        Carenze nutrizionali frequenti nei celiaci non trattati: ferro, folati, vitamina B12, calcio, vitamina D.
        Reintroduzione: MAI reintrodurre il glutine autonomamente. Monitoraggio periodico con gastroenterologo.""",
        "categoria": "patologie",
    },
    {
        "id": "pat_005",
        "testo": """GESTIONE NUTRIZIONALE — SINDROME DEL COLON IRRITABILE (IBS)
        L'IBS colpisce il 10-15% della popolazione. Dieta a basso contenuto di FODMAP spesso efficace.
        FODMAP: Fermentable Oligosaccharides, Disaccharides, Monosaccharides And Polyols — zuccheri
        fermentabili che causano gonfiore e disturbi in soggetti sensibili.
        Alimenti ad alto FODMAP da limitare: aglio, cipolla, mele, pere, anguria, miele, latte,
        legumi in grandi quantità, grano, segale, cavolfiore, funghi, avocado, dolcificanti (sorbitolo,
        mannitolo, xilitolo).
        Alimenti a basso FODMAP generalmente tollerati: riso, avena, carote, zucchine, patate, pomodori,
        arance, uva, fragole, mirtilli, carne, pesce, uova, tofu, formaggio stagionato, olio d'oliva.
        Approccio a fasi: eliminazione totale per 4-8 settimane, poi reintroduzione graduale per identificare
        i trigger individuali. Da fare sempre con supervisione di un dietista specializzato.
        Probiotici: alcuni ceppi (Lactobacillus rhamnosus, Bifidobacterium infantis) possono migliorare i sintomi.
        Fibre solubili: psillio (bucce di psillio) spesso tollerato e utile per regolarizzare il transito.""",
        "categoria": "patologie",
    },
    {
        "id": "pat_006",
        "testo": """GESTIONE NUTRIZIONALE — IPERCOLESTEROLEMIA
        Il colesterolo LDL elevato è un fattore di rischio cardiovascolare modificabile con la dieta.
        Grassi saturi: principali responsabili dell'aumento del colesterolo LDL. Ridurre carni grasse,
        burro, formaggi grassi, olio di palma, olio di cocco, prodotti da forno industriali.
        Grassi trans: aumentano LDL e abbassano HDL — da eliminare completamente. Margarine solide,
        prodotti industriali con "grassi vegetali parzialmente idrogenati".
        Grassi insaturi: abbassano il colesterolo LDL. Olio extravergine d'oliva, avocado, frutta secca,
        olio di semi di lino, pesce grasso (salmone, sgombro, sardine).
        Omega-3: riducono i trigliceridi. Pesce azzurro 2-3 volte/settimana, semi di lino, noci.
        Fitosteroli: bloccano l'assorbimento del colesterolo — 2g/giorno riducono LDL del 10-15%.
        Presenti in: frutta secca, semi, cereali integrali. Disponibili anche in alimenti arricchiti.
        Fibre solubili: beta-glucani dell'avena e dell'orzo riducono il colesterolo LDL. 3g/giorno di
        beta-glucani (circa 70g di avena) riducono il colesterolo del 5%.
        Legumi: 1 porzione al giorno riduce LDL del 5%. Ricchi di fibre solubili e fitosteroli.
        Aglio: effetto modesto ma documentato sulla riduzione del colesterolo totale.""",
        "categoria": "patologie",
    },
    {
        "id": "pat_007",
        "testo": """GESTIONE NUTRIZIONALE — OSTEOPOROSI E SALUTE DELLE OSSA
        L'osteoporosi colpisce principalmente donne in post-menopausa e anziani. Prevenzione dalla giovinezza.
        Calcio: nutriente chiave per la mineralizzazione ossea. Fabbisogno: 1000mg/giorno adulti,
        1200mg over 50. Fonti principali: latte e derivati, sardine e alici con lische, tofu con calcio,
        cavolo riccio, broccoli, mandorle, semi di sesamo, legumi, acque calciche (oltre 300mg/L).
        Vitamina D: essenziale per l'assorbimento del calcio. Prodotta dalla pelle con l'esposizione solare
        (20 min/giorno). Fonti alimentari limitate: pesce grasso, tuorlo d'uovo, funghi esposti al sole.
        Spesso necessaria integrazione, soprattutto in anziani e persone con poca esposizione solare.
        Vitamina K2: fondamentale per indirizzare il calcio nelle ossa e non nelle arterie.
        Fonti: formaggi fermentati, natto (soia fermentata), verdure a foglia verde.
        Proteine: necessarie per la sintesi della matrice ossea. Non eliminare le proteine per paura dell'acidosi.
        Alimenti da limitare: alcol (inibisce gli osteoblasti), caffeina in eccesso (aumenta escrezione calcio),
        sale in eccesso (aumenta escrezione urinaria di calcio), fitati in eccesso (riducono assorbimento calcio).
        Attività fisica: esercizio con carico (camminata, pesi) stimola la formazione ossea.""",
        "categoria": "patologie",
    },
    {
        "id": "pat_008",
        "testo": """GESTIONE NUTRIZIONALE — ANEMIA SIDEROPENICA (CARENZA DI FERRO)
        L'anemia da carenza di ferro è la più comune al mondo, frequente in donne in età fertile e vegetariani.
        Sintomi: stanchezza cronica, pallore, difficoltà di concentrazione, unghie fragili, perdita capelli.
        Ferro eme (animale): maggiore biodisponibilità (15-35%). Fonti: carne rossa, fegato, molluschi
        (vongole, cozze), carne di cavallo, tonno.
        Ferro non-eme (vegetale): minore biodisponibilità (2-20%). Fonti: legumi (lenticchie, ceci, fagioli),
        tofu, tempeh, cereali integrali, spinaci, quinoa, semi di zucca, frutta secca, cacao.
        Aumentare l'assorbimento del ferro: vitamina C nello stesso pasto potenzia l'assorbimento del ferro
        non-eme fino a 3-6 volte. Es: lenticchie con succo di limone, spinaci con peperone crudo.
        Ridurre l'assorbimento del ferro: tè, caffè, cacao (tannini), calcio in grandi quantità, fitati
        (cereali integrali non ammollati). Non bere tè durante i pasti ricchi di ferro.
        Fabbisogno: 10mg/giorno uomini, 18mg donne in età fertile, 27mg in gravidanza.
        Cottura in pentola di ghisa: aumenta il contenuto di ferro negli alimenti acidi (pomodoro, limone).""",
        "categoria": "patologie",
    },

    # ── STILI ALIMENTARI ─────────────────────────────────────────────────────

    {
        "id": "stile_001",
        "testo": """ALIMENTAZIONE VEGETARIANA — LATTO-OVO VEGETARIANA
        La dieta vegetariana esclude carne e pesce ma include uova e latticini.
        Posizione ADA (American Dietetic Association): diete vegetariane ben pianificate sono salutari
        e nutrizionalmente adeguate per tutte le fasi della vita.
        Nutrienti critici da monitorare: vitamina B12 (solo in alimenti animali — uova e latte ne contengono
        piccole quantità ma spesso insufficienti), ferro (non-eme, minore biodisponibilità), zinco,
        omega-3 a catena lunga (EPA e DHA), iodio (se non si usa sale iodato).
        Proteine complete: combinare cereali + legumi per ottenere tutti gli aminoacidi essenziali.
        Non è necessario farlo nello stesso pasto — sufficiente nell'arco della giornata.
        Fonti proteiche: uova, formaggi, yogurt, latte, legumi (fagioli, lenticchie, ceci, soia),
        cereali (quinoa, amaranto proteine complete), frutta secca, semi.
        Vitamina B12: monitorare i livelli ematici annualmente. Integrare se necessario.
        Ferro: potenziare con vitamina C. Ammollare e cuocere bene i legumi per ridurre i fitati.
        Omega-3: semi di lino, semi di chia, noci, olio di lino per ALA (precursore). Considerare
        integratore di alghe DHA+EPA se i livelli ematici sono bassi.""",
        "categoria": "stili alimentari",
    },
    {
        "id": "stile_002",
        "testo": """ALIMENTAZIONE VEGANA
        La dieta vegana esclude tutti i prodotti di origine animale: carne, pesce, uova, latticini, miele.
        Nutrienti critici — integrazione quasi sempre necessaria:
        Vitamina B12: OBBLIGATORIA come supplemento. Nessuna fonte vegetale affidabile. Dosaggio: 
        2000 microgrammi settimanali o 50 microgrammi giornalieri di cianocobalamina.
        Vitamina D3: spesso carente anche in onnivori italiani. Preferire D3 da licheni (vegana).
        Omega-3 DHA+EPA: integratore da alghe marine (fonte originale degli omega-3 del pesce).
        Iodio: sale iodato o integratore. Alghe marine non affidabili per dose costante.
        Calcio: necessario monitoraggio. Fonti: tofu con calcio, bevande vegetali arricchite,
        cavolo riccio, broccoli, mandorle, sesamo, fichi secchi.
        Ferro: stesse strategie del vegetariano — vitamina C nei pasti.
        Zinco: semi di zucca, legumi, cereali integrali, noci. Assorbimento migliorato con ammollo.
        Proteine: quinoa, amaranto, soia (unica proteina vegetale completa equiparabile alle animali),
        combinazioni cereali-legumi, seitan (da evitare nei celiaci — è glutine puro).
        Monitoraggio: esami ematici ogni 6-12 mesi per B12, D, ferro, ferritina, zinco, omega-3.""",
        "categoria": "stili alimentari",
    },
    {
        "id": "stile_003",
        "testo": """ALIMENTAZIONE — PERDITA DI PESO GRADUALE E SOSTENIBILE
        La perdita di peso sana è di 0.5-1 kg a settimana — deficit calorico di 500-1000 kcal/giorno.
        Deficit calorico moderato: ridurre le calorie del 20-25% rispetto al fabbisogno mantenimento.
        Non scendere sotto: 1200 kcal/giorno per le donne, 1500 kcal per gli uomini senza supervisione medica.
        Proteine: aumentare a 1.2-1.6g/kg per preservare la massa muscolare durante il dimagrimento.
        Sazietà: privilegiare alimenti ad alto volume e bassa densità calorica — verdure, legumi, frutta,
        cereali integrali, proteine magre.
        Indice di sazietà: uova, legumi, patate bollite, avena hanno alto potere saziante.
        Evitare: diete drastiche sotto 800 kcal (perdita di massa muscolare, carenze nutrizionali,
        effetto yo-yo), eliminazione di interi macronutrienti, sostituti del pasto come unico alimento.
        Distribuzione pasti: 3 pasti principali + 1-2 spuntini pianificati prevengono abbuffate.
        Colazione: non saltarla — chi fa colazione ha migliore controllo del peso a lungo termine.
        Idratazione: bere 500ml di acqua prima dei pasti riduce l'assunzione calorica del 13%.
        Velocità del pasto: masticare lentamente, almeno 20 minuti per pasto — il segnale di sazietà
        impiega 20 min per raggiungere il cervello.""",
        "categoria": "stili alimentari",
    },
    {
        "id": "stile_004",
        "testo": """ALIMENTAZIONE — MANTENIMENTO DEL PESO E PESO FORMA
        Il mantenimento del peso richiede equilibrio tra entrate e uscite caloriche nel lungo periodo.
        Fabbisogno calorico basale (BMR) — formula di Mifflin-St Jeor:
        Uomini: (10 x peso kg) + (6.25 x altezza cm) - (5 x età) + 5
        Donne: (10 x peso kg) + (6.25 x altezza cm) - (5 x età) - 161
        Moltiplicatori attività: sedentario x1.2, leggermente attivo x1.375, moderatamente attivo x1.55,
        molto attivo x1.725, estremamente attivo x1.9.
        Strategia: bilanciare macronutrienti — 50% carboidrati, 25% proteine, 25% grassi come punto di partenza.
        Flessibilità: il 80-20 è sostenibile — 80% alimentazione equilibrata, 20% flessibilità.
        Monitoraggio: pesarsi sempre nelle stesse condizioni (mattino a digiuno, dopo aver urinato).
        Fluttuazioni normali di 1-2 kg quotidiane per ritenzione idrica, contenuto intestinale, ciclo.""",
        "categoria": "stili alimentari",
    },

    # ── MICRONUTRIENTI ───────────────────────────────────────────────────────

    {
        "id": "micro_001",
        "testo": """VITAMINA B12 (COBALAMINA)
        Vitamina essenziale presente quasi esclusivamente in alimenti di origine animale.
        Funzioni: sintesi del DNA, formazione dei globuli rossi, funzione neurologica, metabolismo proteico.
        Carenza: anemia megaloblastica, danni neurologici irreversibili, stanchezza cronica,
        formicolio alle mani e ai piedi, difficoltà cognitive. La carenza può svilupparsi lentamente
        (fegato accumula riserve per 3-5 anni).
        Fabbisogno: 2.4 microgrammi/giorno adulti, 2.6 in gravidanza, 2.8 in allattamento.
        Fonti animali (microgrammi/100g): fegato bovino 83, vongole 98, sardine 9, salmone 3.2,
        manzo 2.6, tonno 2.2, uova 1.1, latte intero 0.4, yogurt 0.4, parmigiano 1.5.
        Fonti vegetali: nessuna fonte vegetale affidabile. Alghe e lievito alimentare contengono
        analoghi inattivi che non svolgono la funzione della vera B12.
        Integrazione nei vegani: cianocobalamina — forma più stabile e studiata.
        Assorbimento: dipende dal fattore intrinseco gastrico. Over 50 e persone con gastrite atrofica
        possono avere ridotto assorbimento — preferire forme sublinguale o intramuscolare.
        Monitoraggio: dosaggio ematico di B12 e omocisteina (marker precoce di carenza funzionale).""",
        "categoria": "micronutrienti",
    },
    {
        "id": "micro_002",
        "testo": """VITAMINA D (CALCIFEROLO)
        La vitamina D è in realtà un ormone steroideo con recettori in quasi tutti i tessuti del corpo.
        Funzioni: assorbimento del calcio e del fosforo, salute ossea, funzione immunitaria,
        prevenzione di tumori, malattie autoimmuni, depressione, diabete tipo 2.
        Carenza molto diffusa in Italia (oltre il 50% della popolazione ha livelli insufficienti),
        soprattutto in inverno, negli anziani, nelle persone con carnagione scura, obese, con poca
        esposizione solare.
        Livelli ottimali: 25-OH-D3 nel sangue tra 40-60 ng/mL (100-150 nmol/L).
        Sintesi cutanea: 20-30 minuti di esposizione solare su viso e braccia a mezzogiorno d'estate.
        Vetro e protezione solare bloccano la sintesi. Impraticabile in inverno nelle latitudini italiane.
        Fonti alimentari (scarse): salmone (600-1000 UI/100g), sgombro (250 UI), sardine (300 UI),
        olio di fegato di merluzzo (8000 UI/cucchiaio), tuorlo d'uovo (40 UI), funghi esposti al sole.
        Integrazione: spesso necessaria in autunno-inverno. Dosi comuni: 1000-2000 UI/giorno.
        Dosi terapeutiche per correggere carenza: 4000-10000 UI/giorno sotto controllo medico.
        Forma D3 (colecalciferolo) preferibile alla D2 per efficacia e durata d'azione.""",
        "categoria": "micronutrienti",
    },
    {
        "id": "micro_003",
        "testo": """OMEGA-3 — ACIDI GRASSI ESSENZIALI
        Gli omega-3 sono acidi grassi polinsaturi essenziali che il corpo non può sintetizzare.
        Tipi principali: ALA (acido alfa-linolenico) — vegetale, precursore. EPA e DHA — animali/alghe,
        forme attive con effetti biologici diretti. Conversione ALA→EPA→DHA nel corpo: molto inefficiente
        (meno del 5-10%), quindi fonti dirette di EPA e DHA sono importanti.
        Funzioni: riduzione trigliceridi, protezione cardiovascolare, funzione cerebrale e visiva,
        riduzione infiammazione, salute mentale (depressione, ansia), sviluppo fetale.
        Fabbisogno EPA+DHA: almeno 250mg/giorno per adulti sani, 500mg per riduzione rischio cardiovascolare,
        1000mg per trigliceridi alti (sotto controllo medico).
        Fonti EPA+DHA: salmone selvaggio (2g/100g), sgombro (2.5g/100g), sardine (1.5g/100g),
        acciughe (1.5g/100g), aringa (1.8g/100g), tonno fresco (1g/100g), cozze (0.5g/100g).
        Fonti ALA vegetali: semi di lino (22g/100g), semi di chia (18g/100g), noci (9g/100g),
        olio di lino (53g/100g), olio di canapa.
        Per vegani: integratore di olio di alghe (fonte originale degli omega-3 nel pesce).
        Rapporto omega-6/omega-3: nella dieta occidentale è 15:1 — 20:1. Ideale: 4:1 o meno.
        Ridurre omega-6: limitare oli vegetali (mais, soia, girasole) a favore di olio d'oliva.""",
        "categoria": "micronutrienti",
    },

    # ── PASTI E TIMING ───────────────────────────────────────────────────────

    {
        "id": "pasti_001",
        "testo": """ORGANIZZAZIONE DEI PASTI — COLAZIONE
        La colazione dovrebbe fornire il 20-25% dell'energia giornaliera totale.
        Colazione ottimale: combinazione di carboidrati complessi + proteine + grassi buoni + fibre.
        Questo mix garantisce sazietà prolungata, energia stabile e assenza di picchi glicemici.
        Esempi di colazione equilibrata:
        - Porridge di avena con latte/bevanda vegetale + frutta fresca + noci + cucchiaio di burro di mandorle
        - Yogurt greco + granola integrale + frutti di bosco + semi di chia
        - Pane integrale tostato + uova strapazzate + avocado + pomodorini
        - Pancakes di avena e banana + yogurt + miele + frutta fresca
        Colazione sbagliata: solo caffè e cornetto (picco glicemico → crollo energetico a metà mattina),
        solo succo di frutta (alto contenuto di zuccheri senza fibre), biscotti industriali.
        Tempo: idealmente entro 1-2 ore dal risveglio. Chi si allena al mattino: spuntino leggero
        pre-allenamento o colazione post-allenamento entro 30-60 minuti.""",
        "categoria": "pasti",
    },
    {
        "id": "pasti_002",
        "testo": """ORGANIZZAZIONE DEI PASTI — PRANZO E CENA
        Il pranzo dovrebbe rappresentare il 35-40% dell'energia giornaliera, la cena il 25-30%.
        Piatto ideale (metodo del piatto Harvard): 50% verdure e ortaggi, 25% proteine magre,
        25% carboidrati complessi integrali, condito con olio extravergine d'oliva.
        Pranzo tipico equilibrato:
        - Pasta integrale al pomodoro e legumi + insalata mista + frutta
        - Riso integrale con verdure e tofu/pollo + minestrone
        - Insalata di quinoa con ceci, pomodori, cetrioli, feta, olio e limone
        Cena: preferire pasti leggeri e facilmente digeribili, soprattutto se ci si corica presto.
        Ridurre i carboidrati la sera non è obbligatorio ma può aiutare nella perdita di peso.
        Cena tipica equilibrata:
        - Pesce al forno con verdure grigliate e patate dolci
        - Minestrone di legumi e verdure + pane integrale + formaggio
        - Frittata di verdure + insalata + pane di segale
        Timing: cenare almeno 2-3 ore prima di andare a dormire per ottimizzare la digestione.
        Digiuno notturno: un intervallo di 12 ore tra cena e colazione è associato a benefici metabolici.""",
        "categoria": "pasti",
    },
    {
        "id": "pasti_003",
        "testo": """SPUNTINI E GESTIONE DELLA FAME
        Gli spuntini sono utili per mantenere stabile la glicemia e prevenire abbuffate ai pasti principali.
        Quando: a metà mattina (2-3 ore dopo colazione) e a metà pomeriggio (2-3 ore dopo pranzo).
        Non serve fare spuntini se i pasti principali sono sazianti e non si avverte fame.
        Spuntini sani ed equilibrati:
        - Frutta fresca (1 porzione, 150-200g) + 10-15 mandorle o noci
        - Yogurt greco naturale (150g) + frutti di bosco
        - Hummus di ceci (2-3 cucchiai) + verdure crude (carote, sedano, cetriolo)
        - Pane integrale (1 fetta) + avocado o burro di arachidi naturale
        - Ricotta (100g) + miele + noci
        - Edamame (100g) — ricchi di proteine e fibre
        Spuntini da evitare: merendine industriali, snack confezionati, biscotti, succhi zuccherati,
        barrette al cioccolato commerciali, crackers raffinati.
        Dimensioni: uno spuntino non dovrebbe superare 150-200 kcal.
        Pre-workout: banana + burro di mandorle, oppure pane integrale con miele, 30-60 min prima.
        Post-workout: proteine + carboidrati entro 30-60 min. Es: yogurt greco + frutta, oppure
        shake proteico + banana.""",
        "categoria": "pasti",
    },

    # ── NUTRIZIONE SPORTIVA ──────────────────────────────────────────────────

    {
        "id": "sport_001",
        "testo": """NUTRIZIONE SPORTIVA — PRINCIPI GENERALI
        L'alimentazione dello sportivo deve supportare l'allenamento, favorire il recupero e
        prevenire gli infortuni.
        Fabbisogno calorico aumentato rispetto a sedentari: +300-1000 kcal/giorno a seconda
        dell'intensità e durata dell'attività.
        Carboidrati: carburante principale per attività aerobica e anaerobica ad alta intensità.
        Fabbisogno: 5-7g/kg/giorno per sport di endurance, 3-5g/kg per sport di forza.
        Proteine: necessarie per sintesi e riparazione muscolare.
        Fabbisogno: 1.4-1.7g/kg/giorno per sport di forza, 1.2-1.6g/kg per endurance.
        Distribuire le proteine in 4-6 pasti/spuntini durante il giorno per massimizzare la
        sintesi proteica muscolare (MPS). Dose ottimale per pasto: 20-40g di proteine.
        Grassi: 20-35% delle calorie totali. Non eliminare i grassi — fondamentali per gli ormoni
        e le vitamine liposolubili.
        Idratazione: fondamentale. Pesarsi prima e dopo l'allenamento — ogni kg perso corrisponde
        a circa 1L di sudore. Reintegrare 1.5 volte il peso perso in liquidi.
        Elettroliti: per sessioni oltre 60-90 minuti o in condizioni di caldo, reintegrare sodio,
        potassio e magnesio con bevande isotoniche o alimenti ricchi (banana, acqua di cocco).""",
        "categoria": "sport",
    },
    {
        "id": "sport_002",
        "testo": """NUTRIZIONE SPORTIVA — TIMING DEI NUTRIENTI
        Il timing dei nutrienti ottimizza le prestazioni e il recupero.
        PRE-ALLENAMENTO (2-3 ore prima): pasto completo con carboidrati complessi + proteine moderate
        + grassi bassi. Es: pasta integrale con pollo e verdure, riso con legumi, pane integrale con uova.
        PRE-ALLENAMENTO (30-60 min prima): spuntino leggero a prevalenza di carboidrati semplici.
        Es: banana, pane bianco con miele, datteri, gel energetici per atleti.
        DURANTE L'ALLENAMENTO (oltre 60-90 min): 30-60g di carboidrati per ora. Gel, bevande isotoniche,
        banana, datteri, barrette energetiche.
        POST-ALLENAMENTO — finestra anabolica: entro 30-60 minuti dopo l'esercizio.
        Obiettivo: ripristinare le riserve di glicogeno e avviare la sintesi proteica muscolare.
        Ratio ottimale: 3-4g carboidrati : 1g proteine. Es: yogurt greco + frutta + cereali,
        latte + banana, shake proteico + frutta, pollo + riso, ricotta + pane integrale + marmellata.
        CENA post-allenamento serale: pasto completo con proteine abbondanti (30-40g) + carboidrati
        moderati + verdure abbondanti.
        PRIMA DI DORMIRE: caseina o yogurt greco (proteine a lento rilascio) può migliorare il
        recupero e la sintesi proteica notturna.""",
        "categoria": "sport",
    },
]


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _build_testo_paziente(dati: dict) -> str:
    """
    Costruisce il testo indicizzabile a partire dal dizionario paziente.
    Accetta sia campi obbligatori che opzionali.
    """
    righe = [f"PAZIENTE: {dati['nome']}"]
    if dati.get("eta"):        righe.append(f"Età: {dati['eta']} anni.")
    if dati.get("peso"):       righe.append(f"Peso: {dati['peso']} kg.")
    if dati.get("altezza"):    righe.append(f"Altezza: {dati['altezza']} cm.")
    if dati.get("note"):       righe.append(dati["note"])
    if dati.get("kcal"):       righe.append(f"Piano calorico: {dati['kcal']} kcal/giorno.")
    if dati.get("obiettivo"):  righe.append(f"Obiettivo: {dati['obiettivo']}.")
    return "\n".join(righe)


# ---------------------------------------------------------------------------
# Classe principale
# ---------------------------------------------------------------------------

class SistemaRAG:
    """
    Sistema RAG nutrizionistico con:
    - Chunking con overlap
    - Due collezioni separate: 'pazienti' e 'conoscenza' (linee guida + alimenti)
    - CRUD pazienti sul vector DB
    - Retrieval semantico con similarità coseno corretta
    - Generazione con Ollama con citazione fonti
    - Output JSON pulito, pronto per Express
    """

    def __init__(
        self,
        n_risultati:       int   = 3,
        soglia_similarita: float = 0.50,
        chat_model:        str   = OLLAMA_CHAT,
        embedding_model:   str   = OLLAMA_EMBED,
        chroma_path:       str   = CHROMA_PATH,
    ):
        self.n_risultati       = n_risultati
        self.soglia_similarita = soglia_similarita
        self.chat_model        = chat_model

        embedding_fn = OllamaEmbeddingFunction(
            url        = f"{OLLAMA_BASE_URL}/api/embeddings",
            model_name = embedding_model,
        )

        # metadata hnsw:space = cosine → distanze in [0,2], quindi 1 - dist/2
        # oppure con cosine direttamente: dist IN [0,1], similarità = 1 - dist
        chroma = chromadb.PersistentClient(path=chroma_path)

        collection_kwargs = dict(
            embedding_function = embedding_fn,
            metadata           = {"hnsw:space": "cosine"},  # FIX: metrica corretta
        )

        self.col_pazienti   = chroma.get_or_create_collection("pazienti",   **collection_kwargs)
        self.col_conoscenza = chroma.get_or_create_collection("conoscenza",  **collection_kwargs)

    # ------------------------------------------------------------------
    # Chunking
    # ------------------------------------------------------------------

    def _chunking(self, testo: str, chunk_size: int = 60, overlap: int = 15) -> list[str]:
        """
        Divide il testo in chunk sovrapposti di chunk_size parole.
        overlap: quante parole dell'ultimo chunk ricompaiono all'inizio del successivo.

        chunk_size abbassato a 60 parole (era 300, inutile per testi brevi).
        """
        parole = testo.split()
        chunks, i = [], 0
        while i < len(parole):
            chunk = " ".join(parole[i : i + chunk_size])
            chunks.append(chunk)
            i += chunk_size - overlap
        return chunks

    def _indicizza_in(self, collection, documenti: list[dict]) -> int:
        """Indicizza una lista di documenti in una collezione ChromaDB."""
        ids, testi, metadati = [], [], []

        for doc in documenti:
            chunks = self._chunking(doc["testo"])
            for j, chunk in enumerate(chunks):
                ids.append(f"{doc['id']}_chunk_{j}")
                testi.append(chunk)
                metadati.append({
                    "doc_id":    doc["id"],
                    "chunk_idx": j,
                    "categoria": doc.get("categoria", "generale"),
                })

        if ids:
            collection.upsert(ids=ids, documents=testi, metadatas=metadati)

        return len(ids)

    # ------------------------------------------------------------------
    # Seed dati statici (linee guida + alimenti)
    # ------------------------------------------------------------------

    def seed_conoscenza(self) -> int:
        """
        Indicizza le linee guida e gli alimenti nella collezione 'conoscenza'.
        Idempotente: upsert non duplica se gli ID esistono già.
        """
        return self._indicizza_in(self.col_conoscenza, LINEE_GUIDA)

    # ------------------------------------------------------------------
    # CRUD pazienti
    # ------------------------------------------------------------------

    def aggiungi_paziente(self, dati: dict) -> dict:
        """
        Aggiunge o aggiorna un paziente nel vector DB.

        dati (obbligatori): id, nome
        dati (opzionali):   eta, peso, altezza, note, kcal, obiettivo

        Ritorna: { "ok": bool, "id": str, "chunks": int }
        """
        if not dati.get("id") or not dati.get("nome"):
            return {"ok": False, "errore": "Campi 'id' e 'nome' obbligatori."}

        testo = _build_testo_paziente(dati)
        doc   = {"id": dati["id"], "testo": testo, "categoria": "paziente"}
        n     = self._indicizza_in(self.col_pazienti, [doc])

        return {"ok": True, "id": dati["id"], "chunks": n}

    def rimuovi_paziente(self, paziente_id: str) -> dict:
        """
        Rimuove tutti i chunk di un paziente dal vector DB.
        Ritorna: { "ok": bool, "rimossi": int }
        """
        # Recupera tutti gli ID dei chunk che appartengono a questo paziente
        risultati = self.col_pazienti.get(
            where={"doc_id": paziente_id},
            include=[]  # vogliamo solo gli ID
        )
        ids_da_rimuovere = risultati["ids"]

        if not ids_da_rimuovere:
            return {"ok": False, "errore": f"Paziente '{paziente_id}' non trovato."}

        self.col_pazienti.delete(ids=ids_da_rimuovere)
        return {"ok": True, "rimossi": len(ids_da_rimuovere)}

    def aggiorna_paziente(self, dati: dict) -> dict:
        """
        Aggiorna un paziente: rimuove i vecchi chunk e reindicizza.
        Ritorna: { "ok": bool, "id": str, "chunks": int }
        """
        rimosso = self.rimuovi_paziente(dati["id"])
        if not rimosso["ok"]:
            # Se non esiste, lo creiamo comunque (upsert semantico)
            pass
        return self.aggiungi_paziente(dati)

    def lista_pazienti(self) -> list[dict]:
        """
        Ritorna la lista dei pazienti unici presenti nel DB.
        Ritorna: [ { "id": str, "anteprima": str }, ... ]
        """
        tutti = self.col_pazienti.get(include=["documents", "metadatas"])
        visti = {}
        for doc_id, testo, meta in zip(
            tutti["ids"], tutti["documents"], tutti["metadatas"]
        ):
            pid = meta.get("doc_id", doc_id)
            if pid not in visti:
                visti[pid] = testo[:80] + "..."
        return [{"id": k, "anteprima": v} for k, v in visti.items()]

    # ------------------------------------------------------------------
    # Retrieval
    # ------------------------------------------------------------------

    def _retrieval_da(self, collection, query: str) -> list[dict]:
        """
        Retrieval su una singola collezione con filtro soglia similarità.
        Con hnsw:space=cosine, ChromaDB restituisce distanze coseno in [0,1].
        similarità = 1 - distanza
        """
        try:
            n = min(self.n_risultati, collection.count())
            if n == 0:
                return []

            risultati = collection.query(
                query_texts=[query],
                n_results=n,
                include=["documents", "distances", "metadatas"],
            )
        except Exception as e:
            print(f"[WARN] Retrieval error: {e}")
            return []

        filtrati = []
        for doc, dist, meta in zip(
            risultati["documents"][0],
            risultati["distances"][0],
            risultati["metadatas"][0],
        ):
            similarita = 1.0 - dist  # corretto con hnsw:space=cosine
            if similarita >= self.soglia_similarita:
                filtrati.append({
                    "testo":      doc,
                    "similarita": round(similarita, 3),
                    "categoria":  meta.get("categoria", "N/A"),
                    "doc_id":     meta.get("doc_id", "N/A"),
                })
        return filtrati

    def retrieval(self, query: str, solo_paziente_id: str = None) -> list[dict]:
        """
        Retrieval combinato su entrambe le collezioni.
        Se solo_paziente_id è specificato, filtra i risultati pazienti
        solo per quel paziente (utile per query contestualizzate).
        """
        # Conoscenza (linee guida + alimenti) — sempre inclusa
        risultati = self._retrieval_da(self.col_conoscenza, query)

        # Pazienti
        if solo_paziente_id:
            # Recupera solo i chunk di quel paziente e fa retrieval manuale
            # (ChromaDB non supporta filtri where + query insieme in tutte le versioni)
            tutti_paz = self._retrieval_da(self.col_pazienti, query)
            risultati += [r for r in tutti_paz if r["doc_id"] == solo_paziente_id]
        else:
            risultati += self._retrieval_da(self.col_pazienti, query)

        # Ordina per similarità decrescente e tronca
        risultati.sort(key=lambda x: x["similarita"], reverse=True)
        return risultati[: self.n_risultati * 2]  # restituisce più risultati se disponibili

    # ------------------------------------------------------------------
    # Generazione — risposta testuale libera
    # ------------------------------------------------------------------

    def _genera_risposta(self, query: str, contesto: list[dict]) -> dict:
        """
        Genera la risposta con Ollama usando il contesto recuperato.
        FIX: la scheda paziente viene sempre messa prima nel contesto,
        così il modello parte dai dati specifici del paziente e non
        dalle linee guida generali.
        """
        if not contesto:
            return {
                "risposta":    "Non ho trovato informazioni rilevanti per rispondere.",
                "fonti":       [],
                "similarita":  [],
                "ha_contesto": False,
            }

        # Boost paziente: scheda paziente sempre prima, poi il resto
        scheda_paziente   = [c for c in contesto if c["categoria"] == "paziente"]
        resto             = [c for c in contesto if c["categoria"] != "paziente"]
        contesto_ordinato = scheda_paziente + resto

        contesto_str = "\n\n".join([
            f"[Fonte {i+1} — {c['categoria']} | doc: {c['doc_id']} | sim: {c['similarita']:.0%}]:\n{c['testo']}"
            for i, c in enumerate(contesto_ordinato)
        ])

        prompt = f"""Sei un nutrizionista. Rispondi alla domanda tenendo conto PRIMA del
profilo del paziente (intolleranze, patologie, obiettivi calorici), poi delle linee guida pertinenti.

Inizia sempre con le considerazioni specifiche sul paziente, poi aggiungi i consigli generali coerenti.
Basati ESCLUSIVAMENTE sulle informazioni nel contesto. Non inventare nulla.
Se le informazioni non sono sufficienti, dillo esplicitamente.

CONTESTO:
{contesto_str}

DOMANDA: {query}

RISPOSTA (parti dal profilo del paziente, cita le fonti):"""

        try:
            response = ollama.chat(
                model    = self.chat_model,
                messages = [
                    {
                        "role":    "system",
                        "content": (
                            "Sei un assistente nutrizionista preciso e affidabile. "
                            "Rispondi sempre in italiano, in modo chiaro e conciso. "
                            "Parti sempre dai dati specifici del paziente prima di citare le linee guida generali."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                options={"temperature": 0.1, "num_predict": 600},
            )
            testo_risposta = response["message"]["content"]

        except Exception as e:
            testo_risposta = f"Errore nella generazione della risposta: {str(e)}"

        return {
            "risposta":    testo_risposta,
            "fonti":       [c["categoria"] for c in contesto_ordinato],
            "doc_ids":     [c["doc_id"]    for c in contesto_ordinato],
            "similarita":  [c["similarita"] for c in contesto_ordinato],
            "ha_contesto": True,
        }

    # ------------------------------------------------------------------
    # Generazione — piano nutrizionale settimanale in JSON
    # ------------------------------------------------------------------

    def _genera_tabella(self, query: str, contesto: list[dict]) -> dict:
        """
        Genera un piano nutrizionale settimanale strutturato in JSON.
        Usa format='json' di Ollama per forzare output parsabile.
        Genera un giorno alla volta per evitare troncamenti con llama3.2.
        """
        if not contesto:
            return {
                "risposta":    {},
                "fonti":       [],
                "ha_contesto": False,
            }

        # Boost paziente anche qui
        scheda_paziente   = [c for c in contesto if c["categoria"] == "paziente"]
        resto             = [c for c in contesto if c["categoria"] != "paziente"]
        contesto_ordinato = scheda_paziente + resto

        contesto_str = "\n\n".join([
            f"[Fonte {i+1} — {c['categoria']} | doc: {c['doc_id']}]:\n{c['testo']}"
            for i, c in enumerate(contesto_ordinato)
        ])

        giorni = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
        piano  = {}

        for giorno in giorni:
            schema_giorno = {
                "pasti": {
                    "Colazione": [{"alimento": "string", "grammatura": "string"}],
                    "Pranzo":    [{"alimento": "string", "grammatura": "string"}],
                    "Merenda":   [{"alimento": "string", "grammatura": "string"}],
                    "Cena":      [{"alimento": "string", "grammatura": "string"}]
                },
                "totale_giornaliero": {
                    "calorie_totali": 0,
                    "carboidrati_g":  0,
                    "grassi_g":       0,
                    "proteine_g":     0
                }
            }

            prompt = f"""Basandoti ESCLUSIVAMENTE sul contesto fornito, genera il piano nutrizionale
per {giorno}. Rispetta rigorosamente calorie, intolleranze e alimenti consigliati/da evitare.

CONTESTO:
{contesto_str}

RICHIESTA: {query}

Rispondi SOLO con un oggetto JSON che segue esattamente questa struttura:
{json.dumps(schema_giorno, ensure_ascii=False)}"""

            try:
                response = ollama.chat(
                    model  = self.chat_model,
                    format = "json",
                    messages = [
                        {
                            "role":    "system",
                            "content": (
                                "Sei un nutrizionista. Generi piani alimentari giornalieri in JSON. "
                                "Rispondi SOLO con JSON valido, nessun testo aggiuntivo."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                    options={"temperature": 0.1, "num_predict": 1024},
                )
                piano[giorno] = json.loads(response["message"]["content"])
            except Exception as e:
                piano[giorno] = {"errore": str(e)}

        return {
            "risposta":    {"piano_settimanale": piano},
            "fonti":       [c["categoria"] for c in contesto_ordinato],
            "doc_ids":     [c["doc_id"]    for c in contesto_ordinato],
            "similarita":  [c["similarita"] for c in contesto_ordinato],
            "ha_contesto": True,
        }

    # ------------------------------------------------------------------
    # Generazione — analisi andamento paziente
    # ------------------------------------------------------------------

    def analisi_andamento(self, paziente: dict, prima_visita: dict, ultima_visita: dict) -> dict:
        """
        Analizza l'andamento di un paziente confrontando prima e ultima visita.
        Non usa il RAG — lavora direttamente sui dati strutturati delle visite.

        paziente:      { nome, cognome, eta, obiettivo }
        prima_visita:  { data_visita, peso, bmi, bf }
        ultima_visita: { data_visita, peso, bmi, bf }
        """
        delta_peso = ultima_visita["peso"] - prima_visita["peso"]
        delta_bmi  = ultima_visita["bmi"]  - prima_visita["bmi"]
        delta_bf   = ultima_visita["bf"]   - prima_visita["bf"]

        prompt = f"""Sei un nutrizionista. Analizza l'andamento di questo paziente.

PAZIENTE: {paziente['nome']} {paziente['cognome']}, {paziente['eta']} anni
OBIETTIVO: {paziente.get('obiettivo', 'non specificato')}

PRIMA VISITA ({prima_visita['data_visita']}):
- Peso: {prima_visita['peso']} kg | BMI: {prima_visita['bmi']} | BF: {prima_visita['bf']}%

ULTIMA VISITA ({ultima_visita['data_visita']}):
- Peso: {ultima_visita['peso']} kg | BMI: {ultima_visita['bmi']} | BF: {ultima_visita['bf']}%

VARIAZIONI:
- Peso: {delta_peso:+.1f} kg | BMI: {delta_bmi:+.2f} | BF: {delta_bf:+.1f}%

Fornisci:
1. Valutazione generale dell'andamento (positivo/negativo/stabile)
2. Analisi dettagliata di ogni parametro
3. Consigli pratici per il proseguimento
Rispondi in italiano, in modo professionale ma comprensibile al paziente."""

        try:
            response = ollama.chat(
                model    = self.chat_model,
                messages = [
                    {"role": "system", "content": "Sei un nutrizionista esperto. Rispondi sempre in italiano."},
                    {"role": "user",   "content": prompt},
                ],
                options={"temperature": 0.3, "num_predict": 800},
            )
            testo = response["message"]["content"]
        except Exception as e:
            testo = f"Errore generazione analisi: {str(e)}"

        return {
            "analisi":       testo,
            "delta_peso":    round(delta_peso, 1),
            "delta_bmi":     round(delta_bmi, 2),
            "delta_bf":      round(delta_bf, 1),
            "ha_migliorato": delta_peso <= 0 and delta_bf <= 0,
        }

    # ------------------------------------------------------------------
    # Pipeline completa
    # ------------------------------------------------------------------

    def query(self, domanda: str, paziente_id: str = None) -> dict:
        """Risposta testuale libera con retrieval contestualizzato."""
        contesto = self.retrieval(domanda, solo_paziente_id=paziente_id)
        return self._genera_risposta(domanda, contesto)

    def tabella(self, domanda: str, paziente_id: str = None) -> dict:
        """Piano nutrizionale settimanale in JSON strutturato."""
        contesto = self.retrieval(domanda, solo_paziente_id=paziente_id)
        return self._genera_tabella(domanda, contesto)


# ---------------------------------------------------------------------------
# Entry point CLI  — usato da Express via child_process
#
# Uso:
#   python rag_system.py query   '{"domanda": "...", "paziente_id": "paz_001"}'
#   python rag_system.py add     '{"id": "paz_003", "nome": "Luca Bianchi", "eta": 30}'
#   python rag_system.py remove  '{"id": "paz_003"}'
#   python rag_system.py update  '{"id": "paz_003", "nome": "Luca Bianchi", "peso": 75}'
#   python rag_system.py list    '{}'
#   python rag_system.py seed    '{}'
#
# Ogni comando stampa un JSON su stdout — Express legge questo output.
# ---------------------------------------------------------------------------

def main():
    import sys

    if len(sys.argv) < 3:
        print(json.dumps({"ok": False, "errore": "Uso: rag_system.py <comando> '<json>'"  }))
        sys.exit(1)

    comando = sys.argv[1]
    try:
        payload = json.loads(sys.argv[2])
    except json.JSONDecodeError as e:
        print(json.dumps({"ok": False, "errore": f"JSON non valido: {e}"}))
        sys.exit(1)

    rag = SistemaRAG()

    if comando == "seed":
        n = rag.seed_conoscenza()
        print(json.dumps({"ok": True, "chunks_indicizzati": n}))

    elif comando == "query":
        domanda     = payload.get("domanda", "")
        paziente_id = payload.get("paziente_id")
        if not domanda:
            print(json.dumps({"ok": False, "errore": "Campo 'domanda' mancante."}))
        else:
            risultato = rag.query(domanda, paziente_id=paziente_id)
            print(json.dumps(risultato, ensure_ascii=False))

    elif comando == "add":
        print(json.dumps(rag.aggiungi_paziente(payload), ensure_ascii=False))

    elif comando == "remove":
        pid = payload.get("id")
        if not pid:
            print(json.dumps({"ok": False, "errore": "Campo 'id' mancante."}))
        else:
            print(json.dumps(rag.rimuovi_paziente(pid), ensure_ascii=False))

    elif comando == "update":
        print(json.dumps(rag.aggiorna_paziente(payload), ensure_ascii=False))

    elif comando == "list":
        print(json.dumps({"ok": True, "pazienti": rag.lista_pazienti()}, ensure_ascii=False))

    elif comando == "tabella":
        # Genera piano nutrizionale settimanale in JSON
        # body: { domanda: string, paziente_id?: string }
        domanda     = payload.get("domanda", "Genera un piano nutrizionale settimanale.")
        paziente_id = payload.get("paziente_id")
        risultato   = rag.tabella(domanda, paziente_id=paziente_id)
        print(json.dumps(risultato, ensure_ascii=False))

    elif comando == "analisi":
        # Analisi andamento paziente tra due visite
        # body: { paziente, prima_visita, ultima_visita }
        # paziente:      { nome, cognome, eta, obiettivo }
        # prima_visita:  { data_visita, peso, bmi, bf }
        # ultima_visita: { data_visita, peso, bmi, bf }
        paziente      = payload.get("paziente")
        prima_visita  = payload.get("prima_visita")
        ultima_visita = payload.get("ultima_visita")

        campi_mancanti = [k for k, v in {
            "paziente": paziente, "prima_visita": prima_visita, "ultima_visita": ultima_visita
        }.items() if not v]

        if campi_mancanti:
            print(json.dumps({"ok": False, "errore": f"Campi mancanti: {campi_mancanti}"}))
        else:
            risultato = rag.analisi_andamento(paziente, prima_visita, ultima_visita)
            print(json.dumps(risultato, ensure_ascii=False))

    else:
        print(json.dumps({"ok": False, "errore": f"Comando sconosciuto: '{comando}'"}))
        sys.exit(1)


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "test":
        rag = SistemaRAG()

        print("=" * 60)
        print("--- SEED ---")
        print(rag.seed_conoscenza())

        print("--- ADD PAZIENTE ---")
        print(rag.aggiungi_paziente({
            "id":        "paz_001",
            "nome":      "Mario Rossi",
            "eta":       45,
            "peso":      92,
            "note":      "Intollerante al lattosio. Ipertensione lieve.",
            "kcal":      1800,
            "obiettivo": "perdita di peso graduale, -0.5 kg a settimana",
        }))

        print("\n--- LIST ---")
        print(rag.lista_pazienti())

        print("\n--- QUERY (risposta libera) ---")
        print(rag.query("Cosa puo mangiare a colazione?", paziente_id="paz_001"))

        print("\n--- ANALISI ANDAMENTO ---")
        print(rag.analisi_andamento(
            paziente      = {"nome": "Mario", "cognome": "Rossi", "eta": 45, "obiettivo": "perdita peso"},
            prima_visita  = {"data_visita": "2025-01-10", "peso": 95.0, "bmi": 30.0, "bf": 28.0},
            ultima_visita = {"data_visita": "2025-06-01", "peso": 92.0, "bmi": 29.1, "bf": 26.5},
        ))

        # Tabella commentata di default — impiega ~5 minuti su CPU (7 chiamate LLM)
        # Decommentare per testare:
        print("--- TABELLA SETTIMANALE ---")
        print(rag.tabella("Genera un piano settimanale.", paziente_id="paz_001"))

        print("=" * 60)

    else:
        main()