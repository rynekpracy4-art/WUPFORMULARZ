(() => {
  const { PDFDocument, rgb } = PDFLib;
  const form = document.getElementById('recruitmentForm');
  const message = document.getElementById('message');
  const generateBtn = document.getElementById('generateBtn');
  const confirmDialog = document.getElementById('confirmDialog');
  const cancelGeneration = document.getElementById('cancelGeneration');
  const confirmGeneration = document.getElementById('confirmGeneration');
  const previewBtn = document.getElementById('previewBtn');

  const declarationsDetails = document.getElementById('declarationsDetails');
  const declarationConfirm = document.getElementById('declarationConfirm');
  const declarationCheckbox = form.elements.potwierdzenie;
  const declarationName = document.getElementById('declarationName');
  let declarationsRead = false;

  function updateDeclarationName() {
    const fullName = `${get('imie')} ${get('nazwisko')}`.trim();
    declarationName.textContent = fullName || '—';
  }
  form.elements.imie.addEventListener('input', updateDeclarationName);
  form.elements.nazwisko.addEventListener('input', updateDeclarationName);
  declarationsDetails.addEventListener('toggle', () => {
    if (declarationsDetails.open && !declarationsRead) {
      declarationsRead = true;
      declarationCheckbox.disabled = false;
      declarationConfirm.classList.remove('is-locked');
      declarationConfirm.querySelector('small').textContent = 'Zaznacz pole po zapoznaniu się z pełną treścią.';
    }
  });
  const clearBtn = document.getElementById('clearBtn');
  const needsDetails = document.getElementById('needsDetails');
  const previewDialog = document.getElementById('previewDialog');
  const previewFrame = document.getElementById('previewFrame');
  const closePreview = document.getElementById('closePreview');
  const downloadPreview = document.getElementById('downloadPreview');
  const completionDialog = document.getElementById('completionDialog');
  const closeCompletion = document.getElementById('closeCompletion');
  let previewUrl = null;
  let previewBytes = null;
  let previewFilename = 'Formularz_rekrutacyjny.pdf';

  // Współrzędne pochodzą bezpośrednio z pól oryginalnego PDF (A4, punkty PDF).
  const fields = {
    imie:[1,291.65095,576.8504,544.29507,591.2417], nazwisko:[1,291.65095,561.2599,544.29507,575.6511],
    obywatelstwo:[1,291.65095,546.2689,544.29507,560.06057], wiek:[1,291.65095,515.6875,544.29507,530.07876],
    pesel:[1,291.65095,495.29985,544.29507,515.0878], data_urodzenia:[1,291.65095,474.31254,544.29507,494.10057],
    wojewodztwo:[1,291.65095,372.97398,544.29507,386.7656], powiat:[1,291.65095,357.98304,544.29507,372.37434],
    gmina:[1,291.65095,342.3925,544.29507,357.3834], miejscowosc:[1,291.65095,327.40156,544.29507,341.79286],
    kod_pocztowy:[1,291.65095,312.41065,544.29507,326.80195], ulica:[1,291.65095,297.41975,544.29507,311.81105],
    nr_domu:[1,291.65095,281.82923,368.46437,296.22047], nr_lokalu:[1,453.67924,281.82923,544.29507,296.22047],
    telefon:[1,291.65095,266.23866,544.29507,280.62995], email:[1,291.65095,251.24774,544.29507,265.63905],
    zatrudniony_w:[1,291.65095,235.05756,544.29507,250.04846], typ_umowy:[1,291.65095,207.47425,544.29507,233.85828],
    data_rozp_zatr:[1,291.65095,163.10114,544.29507,206.27497], data_zakonczenia_zatr:[2,291.65095,696.1781,544.29507,765.1363],
    stanowisko_pracy:[2,291.65095,666.7959,544.29507,694.37918], opis_szczegolnych_potrzeb:[2,70.81236,163.10114,482.48426,214.66992],
    obszar_wsparcia_1:[3,94.81656,344.1914,381.66667,371.17506], obszar_wsparcia_2:[3,94.81656,310.01216,381.66667,336.99577],
    obszar_wsparcia_3:[3,94.81656,275.23323,381.66667,302.21687], imie_nazwisko_oswiadczenie:[4,70.81236,700.0,481.88417,715.0],
    miejscowosc_data:[5,121.0,333.0,254.0,347.0]
  };

  const checks = {
    plec_kobieta:[1,296.45179,533.6766,306.05345,543.87039], plec_mezczyzna:[1,420.67347,533.6766,430.27516,543.87039],
    wykszt_podstawowe:[1,312.4,460.5,322.5,470.6], wykszt_gimnazjalne:[1,312.4,443.5,322.5,453.6],
    wykszt_ponadgimnazjalne:[1,312.4,426.5,322.5,436.6], wykszt_policealne:[1,312.4,409.5,322.5,419.6],
    wykszt_wyzsze:[1,312.4,392.5,322.5,402.6], niepelnosprawnosc_tak:[2,351.6614,603.2344,363.0634,614.6275],
    niepelnosprawnosc_nie:[2,470.48216,603.2344,481.88417,614.6275], kraje_trzecie_tak:[2,351.6614,559.46096,363.0634,570.854],
    kraje_trzecie_nie:[2,470.48216,559.46096,481.88417,570.854], obce_pochodzenie_tak:[2,351.6614,529.4791,363.0634,540.8722],
    obce_pochodzenie_nie:[2,470.48216,529.4791,481.88417,540.8722], mniejszosc_tak:[2,351.6614,500.09693,363.0634,511.49003],
    mniejszosc_nie:[2,470.48216,500.09693,481.88417,511.49003], bezdomnosc_tak:[2,351.6614,426.3416,363.0634,437.7347],
    bezdomnosc_nie:[2,470.48216,426.3416,481.88417,437.7347], szczegolne_potrzeby_nie:[2,70.21226,235.65717,80.41404,245.85102],
    szczegolne_potrzeby_tak:[2,70.21226,220.06665,80.41404,230.26044], kadra_zarzadzajaca:[3,70.81236,736.95339,81.61425,747.7468],
    wyzszy_szczebel:[3,70.81236,719.5639,81.61425,730.35739], sredni_szczebel:[3,70.81236,689.5821,81.61425,700.37557],
    nizszy_szczebel:[3,70.81236,660.1999,81.61425,670.99337], prace_proste:[3,70.81236,630.218,81.61425,641.01156],
    obszar_1_poziom_1:[3,396.06916,353.18595,406.87107,363.9794], obszar_1_poziom_2:[3,445.27778,353.18595,456.07966,363.9794], obszar_1_poziom_3:[3,494.48637,353.18595,505.28825,363.9794],
    obszar_2_poziom_1:[3,396.06916,319.00666,406.87107,329.8001], obszar_2_poziom_2:[3,445.27778,319.00666,456.07966,329.8001], obszar_2_poziom_3:[3,494.48637,319.00666,505.28825,329.8001],
    obszar_3_poziom_1:[3,396.06916,284.22773,406.87107,295.02119], obszar_3_poziom_2:[3,445.27778,284.22773,456.07966,295.02119], obszar_3_poziom_3:[3,494.48637,284.22773,505.28825,295.02119]
  };

  const get = name => form.elements[name]?.value?.trim?.() ?? '';
  const selected = name => form.querySelector(`[name="${name}"]:checked`)?.value || '';
  const formatDatePL = value => value ? value.split('-').reverse().join('.') : '';
  const formatDateISO = value => value || '';

  const supportAreasByLevel = {
    kadra_zarzadzajaca: [
      'Strategiczne zarządzanie w administracji publicznej',
      'AI w strategii pracy urzędu',
      'Zarządzanie kryzysowe i obrona cywilna w administracji publicznej',
      'Public Relations i kreowanie wizerunku instytucji',
      'Psychologia podejmowania decyzji i odporność na stres',
      'Język obcy w zarządzaniu i projektach międzynarodowych',
      'Komunikacja interpersonalna',
      'Finanse w administracji publicznej',
      'Prawo zamówień publicznych i KPA'
    ],
    wyzszy_szczebel: [
      'Analizowanie informacji oraz podejmowanie decyzji',
      'Zaawansowane kompetencje cyfrowe i narzędzia IT (w tym elementy AI) w administracji publicznej',
      'Warsztaty kompetencji przyszłości 4K',
      'Skuteczna komunikacja i współpraca w zróżnicowanych zespołach (wiek, kultura, kompetencje)',
      'Komunikacja pisemna i ustna w administracji publicznej',
      'Cyberbezpieczeństwo w administracji publicznej',
      'Język obcy w komunikacji zawodowej',
      'Autoprezentacja i wystąpienia publiczne',
      'Sposoby rozwiązywania problemów w miejscu pracy'
    ],
    sredni_szczebel: [
      'Obsługa trudnego interesanta',
      'Organizacja pracy biurowej',
      'E-administracja w praktyce',
      'Standardy dostępności',
      'Kompetencje interpersonalne w pracy zespołowej',
      'Podstawowa komunikacja w języku obcym w obsłudze interesanta'
    ],
    nizszy_szczebel: [
      'Organizacja pracy własnej i współpraca w zespole',
      'Zarządzanie czasem i odporność na stres',
      'Kultura pracy i etyka w środowisku zawodowym',
      'Podstawowe narzędzia biurowe w pracy'
    ],
    prace_proste: [
      'Organizacja pracy własnej i współpraca w zespole',
      'Zarządzanie czasem i odporność na stres',
      'Kultura pracy i etyka w środowisku zawodowym',
      'Podstawowe narzzia biurowe w pracy'.replace('narzzia','narzędzia')
    ]
  };

  const supportAreaSelects = [...document.querySelectorAll('.support-area-select')];
  const supportHint = document.getElementById('supportHint');
  const isLanguageArea = value => /język|jezyk/i.test(value || '');

  function setSupportLevelMode(index, languageMode) {
    const row = document.querySelector(`[data-support-row="${index}"]`);
    if (!row) return;
    const fieldset = row.querySelector('.support-level-fieldset');
    const legend = fieldset?.querySelector('legend');
    const labels = [...(fieldset?.querySelectorAll('.support-level-segmented label span') || [])];
    const radios = [...(fieldset?.querySelectorAll('input[type="radio"]') || [])];
    const normalLabels = ['Podstawowy','Średniozaawansowany','Zaawansowany'];
    const languageLabels = ['A1/A2','B1/B2','C1'];
    if (legend) legend.textContent = languageMode ? 'Poziom języka *' : 'Preferowany poziom wsparcia *';
    labels.forEach((span, position) => { span.textContent = (languageMode ? languageLabels : normalLabels)[position]; });
    fieldset?.classList.toggle('is-language-mode', languageMode);
    radios.forEach(radio => { radio.checked = false; });
    const storage = form.elements[`jezyk_${index}_poziom`];
    if (storage) storage.value = '';
  }

  function setLanguageDetails(index, visible) {
    const box = document.getElementById(`languageDetails${index}`);
    const language = form.elements[`jezyk_${index}`];
    if (!box || !language) return;

    box.classList.toggle('hidden', !visible);
    language.required = visible;
    setSupportLevelMode(index, visible);
    if (!visible) language.value = '';
  }

  function updateLanguageDetails(select) {
    const index = Number(select.dataset.supportIndex);
    setLanguageDetails(index, isLanguageArea(select.value));
  }

  function supportAreaPdfValue(index) {
    const area = get(`obszar_wsparcia_${index}`);
    if (!isLanguageArea(area)) return area;
    const language = get(`jezyk_${index}`);
    const selectedLevel = selected(`obszar_${index}_poziom`);
    const languageLevel = ({'1':'A1/A2','2':'B1/B2','3':'C1'})[selectedLevel] || '';
    return [area, language ? `Język: ${language}` : '', languageLevel ? `Poziom: ${languageLevel}` : ''].filter(Boolean).join(' — ');
  }

  function refreshSupportAreaOptions() {
    const chosen = supportAreaSelects.map(select => select.value).filter(Boolean);
    supportAreaSelects.forEach(select => {
      [...select.options].forEach(option => {
        if (!option.value) return;
        option.disabled = option.value !== select.value && chosen.includes(option.value);
      });
    });
  }

  function populateSupportAreas(level) {
    const areas = supportAreasByLevel[level] || [];
    supportAreaSelects.forEach((select, index) => {
      select.innerHTML = '';
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = areas.length ? `Wybierz obszar wsparcia ${index + 1}` : 'Najpierw wybierz szczebel stanowiska';
      select.appendChild(placeholder);
      for (const area of areas) {
        const option = document.createElement('option');
        option.value = area;
        option.textContent = area;
        select.appendChild(option);
      }
      select.disabled = !areas.length;
      select.value = '';
      setLanguageDetails(index + 1, false);
    });
    if (supportHint) {
      supportHint.textContent = areas.length
        ? 'Lista obszarów została dopasowana do wybranego szczebla. Wybierz trzy różne obszary i określ poziom wsparcia.'
        : 'Najpierw wybierz szczebel stanowiska. Następnie wskaż trzy obszary wsparcia przypisane do wybranego szczebla.';
    }
    refreshSupportAreaOptions();
  }

  document.querySelectorAll('[name="szczebel"]').forEach(input => input.addEventListener('change', () => {
    populateSupportAreas(selected('szczebel'));
  }));
  supportAreaSelects.forEach(select => select.addEventListener('change', () => {
    refreshSupportAreaOptions();
    updateLanguageDetails(select);
  }));

  [1,2,3].forEach(index => {
    const row = document.querySelector(`[data-support-row="${index}"]`);
    row?.querySelectorAll(`input[name="obszar_${index}_poziom"]`).forEach(radio => {
      radio.addEventListener('change', () => {
        const storage = form.elements[`jezyk_${index}_poziom`];
        if (!storage) return;
        storage.value = isLanguageArea(get(`obszar_wsparcia_${index}`))
          ? ({'1':'A1/A2','2':'B1/B2','3':'C1'})[radio.value] || ''
          : '';
      });
    });
  });

  document.querySelectorAll('[name="szczegolne_potrzeby"]').forEach(el => el.addEventListener('change', () => {
    const yes = selected('szczegolne_potrzeby') === 'tak';
    needsDetails.classList.toggle('hidden', !yes);
    form.elements.opis_szczegolnych_potrzeb.required = yes;
    if (!yes) form.elements.opis_szczegolnych_potrzeb.value = '';
  }));

  function wrapLines(ctx, text, maxWidth) {
    const paragraphs = String(text).split(/\n/);
    const lines = [];
    for (const paragraph of paragraphs) {
      const words = paragraph.trim().split(/\s+/).filter(Boolean);
      if (!words.length) { lines.push(''); continue; }
      let line = '';
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width <= maxWidth) line = test;
        else { if (line) lines.push(line); line = word; }
      }
      if (line) lines.push(line);
    }
    return lines;
  }

  async function embedCanvas(pdfDoc, page, rect, painter) {
    const [, x1, y1, x2, y2] = rect;
    const width = x2 - x1, height = y2 - y1, scale = 5;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(10, Math.round(width * scale));
    canvas.height = Math.max(10, Math.round(height * scale));
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    painter(ctx, canvas, scale);
    const png = await pdfDoc.embedPng(canvas.toDataURL('image/png'));
    page.drawImage(png, { x:x1, y:y1, width, height });
  }

  async function drawText(pdfDoc, page, rect, text, options = {}) {
    if (!text) return;
    await embedCanvas(pdfDoc, page, rect, (ctx, canvas, scale) => {
      const multiline = !!options.multiline;
      const center = !!options.center;
      const padX = (options.padX ?? 4) * scale;
      const padY = (options.padY ?? 1) * scale;
      const availableWidth = canvas.width - 2 * padX;
      const availableHeight = canvas.height - 2 * padY;
      let fontPt = options.fontPt ?? (multiline ? 8.2 : 9.2);
      const minPt = options.minPt ?? 5.8;
      let lines = [];
      ctx.fillStyle = '#000';
      while (fontPt >= minPt) {
        ctx.font = `${fontPt * scale}px Arial, Helvetica, sans-serif`;
        lines = multiline ? wrapLines(ctx, text, availableWidth) : [String(text)];
        const lh = fontPt * scale * (options.lineHeight ?? 1.08);
        if (lines.length * lh <= availableHeight && lines.every(line => ctx.measureText(line).width <= availableWidth)) break;
        fontPt -= 0.2;
      }
      ctx.font = `${fontPt * scale}px Arial, Helvetica, sans-serif`;
      ctx.textBaseline = 'middle';
      const lineHeight = fontPt * scale * (options.lineHeight ?? 1.08);
      const maxLines = Math.max(1, Math.floor(availableHeight / lineHeight));
      const shown = lines.slice(0, maxLines);
      const totalH = shown.length * lineHeight;
      const startY = multiline ? (canvas.height - totalH)/2 + lineHeight/2 + (options.offsetY ?? 0) * scale : canvas.height/2 + (options.offsetY ?? 0) * scale;
      shown.forEach((line, i) => {
        const w = ctx.measureText(line).width;
        const x = center ? (canvas.width - w)/2 : padX;
        const y = multiline ? startY + i*lineHeight : startY;
        ctx.fillText(line, x, y);
      });
    });
  }

  async function drawCharacters(pdfDoc, page, rect, value, pattern) {
    if (!value) return;
    const clean = String(value).replace(/\D/g, '');
    await embedCanvas(pdfDoc, page, rect, (ctx, canvas, scale) => {
      ctx.fillStyle = '#000';
      ctx.font = `${9.2 * scale}px Arial, Helvetica, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const slots = pattern.length;
      const slotW = canvas.width / slots;
      let digit = 0;
      pattern.forEach((token, i) => {
        if (token === 'd' && digit < clean.length) {
          ctx.fillText(clean[digit++], (i + 0.5) * slotW, canvas.height/2 + 0.2*scale);
        }
      });
    });
  }


  async function drawDigitsPrecisely(pdfDoc, page, value, xCenters, yCenter, fontSize = 9.2) {
    if (!value) return;
    const clean = String(value).replace(/\D/g, '');
    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
    clean.slice(0, xCenters.length).split('').forEach((digit, i) => {
      const width = font.widthOfTextAtSize(digit, fontSize);
      page.drawText(digit, {
        x: xCenters[i] - width / 2,
        y: yCenter - fontSize * 0.34,
        size: fontSize,
        font,
        color: rgb(0,0,0)
      });
    });
  }

  function drawX(page, rect) {
    const [, x1, y1, x2, y2] = rect;
    const cx=(x1+x2)/2, cy=(y1+y2)/2;
    const size=Math.min(x2-x1,y2-y1)*0.36;
    page.drawLine({start:{x:cx-size,y:cy-size},end:{x:cx+size,y:cy+size},thickness:2.0,color:rgb(0,0,0)});
    page.drawLine({start:{x:cx-size,y:cy+size},end:{x:cx+size,y:cy-size},thickness:2.0,color:rgb(0,0,0)});
  }

  // Mniejszy znak dla punktów listy na stronie 3. Współrzędne są
  // skorygowane optycznie tak, aby X trafiał dokładnie w środek kropki,
  // zamiast zasłaniać tekst lub wychodzić poza znacznik.
  function drawPositionLevelX(page, rect) {
    const [, x1, y1, x2, y2] = rect;
    const cx = (x1 + x2) / 2 - 0.35;
    const cy = (y1 + y2) / 2 - 0.15;
    const size = 2.65;
    page.drawLine({start:{x:cx-size,y:cy-size},end:{x:cx+size,y:cy+size},thickness:1.55,color:rgb(0,0,0)});
    page.drawLine({start:{x:cx-size,y:cy+size},end:{x:cx+size,y:cy-size},thickness:1.55,color:rgb(0,0,0)});
  }

  async function redrawCharacterRow(pdfDoc, page, rect, text, slots, fontSize = 10.6) {
    const [, x1, y1, x2, y2] = rect;
    const width = x2 - x1;
    const height = y2 - y1;
    page.drawRectangle({ x:x1+0.35, y:y1+0.35, width:width-0.7, height:height-0.7, color:rgb(1,1,1) });
    page.drawRectangle({ x:x1, y:y1, width, height, borderColor:rgb(0,0,0), borderWidth:0.55 });
    const slotW = width / slots;
    for (let i=1; i<slots; i++) {
      page.drawLine({ start:{x:x1+i*slotW,y:y1}, end:{x:x1+i*slotW,y:y2}, thickness:0.45, color:rgb(0,0,0) });
    }
    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    String(text).slice(0,slots).split('').forEach((ch,i) => {
      const w = font.widthOfTextAtSize(ch,fontSize);
      page.drawText(ch,{x:x1+(i+0.5)*slotW-w/2,y:y1+(height-fontSize)/2+1.8,size:fontSize,font,color:rgb(0,0,0)});
    });
  }

  const fieldLabels = {
    imie:'Imię', nazwisko:'Nazwisko', obywatelstwo:'Obywatelstwo', wiek:'Wiek', pesel:'PESEL', data_urodzenia:'Data urodzenia',
    plec:'Płeć', wyksztalcenie:'Wykształcenie', wojewodztwo:'Województwo', powiat:'Powiat', gmina:'Gmina', miejscowosc:'Miejscowość',
    kod_pocztowy:'Kod pocztowy', ulica:'Ulica', nr_domu:'Numer domu', telefon:'Telefon', email:'Adres e-mail', zatrudniony_w:'Miejsce zatrudnienia',
    typ_umowy:'Typ umowy', data_rozp_zatr:'Data rozpoczęcia zatrudnienia', stanowisko_pracy:'Stanowisko pracy',
    niepelnosprawnosc:'Status niepełnosprawności', kraje_trzecie:'Osoba z krajów trzecich', obce_pochodzenie:'Osoba obcego pochodzenia',
    mniejszosc:'Przynależność do mniejszości', bezdomnosc:'Kryzys bezdomności', szczegolne_potrzeby:'Szczególne potrzeby',
    opis_szczegolnych_potrzeb:'Opis szczególnych potrzeb', szczebel:'Szczebel stanowiska', obszar_wsparcia_1:'Obszar wsparcia 1',
    obszar_1_poziom:'Poziom wsparcia 1', obszar_wsparcia_2:'Obszar wsparcia 2', obszar_2_poziom:'Poziom wsparcia 2',
    obszar_wsparcia_3:'Obszar wsparcia 3', obszar_3_poziom:'Poziom wsparcia 3', miejscowosc_podpisu:'Miejscowość podpisu',
    data_podpisu:'Data podpisu', potwierdzenie:'Potwierdzenie oświadczeń',
    jezyk_1:'Język dla obszaru 1', jezyk_1_poziom:'Poziom językowy dla obszaru 1', jezyk_1_inny:'Nazwa języka dla obszaru 1',
    jezyk_2:'Język dla obszaru 2', jezyk_2_poziom:'Poziom językowy dla obszaru 2', jezyk_2_inny:'Nazwa języka dla obszaru 2',
    jezyk_3:'Język dla obszaru 3', jezyk_3_poziom:'Poziom językowy dla obszaru 3', jezyk_3_inny:'Nazwa języka dla obszaru 3'
  };

  function validate() {
    message.textContent=''; message.className='';
    const invalid = [...form.querySelectorAll(':invalid')];
    if (invalid.length) {
      const unique = [];
      for (const el of invalid) {
        const label = fieldLabels[el.name] || el.name || 'Pole formularza';
        if (!unique.includes(label)) unique.push(label);
      }
      message.innerHTML = `<strong>Nie można wygenerować PDF.</strong><br>Sprawdź pola: ${unique.join(', ')}.`;
      message.className='error';
      const first = invalid[0];
      first.scrollIntoView({behavior:'smooth',block:'center'});
      setTimeout(()=>first.focus({preventScroll:true}),350);
      return false;
    }
    if (!/^\d{11}$/.test(get('pesel'))) {
      message.textContent='PESEL musi zawierać dokładnie 11 cyfr.';
      message.className='error';
      form.elements.pesel.scrollIntoView({behavior:'smooth',block:'center'});
      form.elements.pesel.focus();
      return false;
    }
    return true;
  }

  async function buildPdf() {
    let templateBytes;
    if (window.EMBEDDED_TEMPLATE_PDF) {
      const binary = atob(window.EMBEDDED_TEMPLATE_PDF);
      templateBytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) templateBytes[i] = binary.charCodeAt(i);
    } else {
      const response = await fetch('assets/formularz-wzor-v5.pdf', {cache:'no-store'});
      if (!response.ok) throw new Error('Nie udało się wczytać wzoru PDF.');
      templateBytes = new Uint8Array(await response.arrayBuffer());
    }
    const pdfDoc = await PDFDocument.load(templateBytes);
    // Wzór jest czystym, nieinteraktywnym PDF-em. Nie ma w nim widżetów ani pustych pól AcroForm.
    const pages = pdfDoc.getPages();

    const values = {
      imie:get('imie'), nazwisko:get('nazwisko'), obywatelstwo:get('obywatelstwo'), wiek:get('wiek'),
      wojewodztwo:get('wojewodztwo'), powiat:get('powiat'), gmina:get('gmina'), miejscowosc:get('miejscowosc'),
      kod_pocztowy:get('kod_pocztowy'), ulica:get('ulica'), nr_domu:get('nr_domu'), nr_lokalu:get('nr_lokalu'),
      telefon:get('telefon'), email:get('email'), zatrudniony_w:get('zatrudniony_w'), typ_umowy:get('typ_umowy'),
      data_rozp_zatr:formatDatePL(get('data_rozp_zatr')), data_zakonczenia_zatr:get('data_zakonczenia_zatr') || 'nadal',
      stanowisko_pracy:get('stanowisko_pracy'), opis_szczegolnych_potrzeb:get('opis_szczegolnych_potrzeb'),
      obszar_wsparcia_1:supportAreaPdfValue(1), obszar_wsparcia_2:supportAreaPdfValue(2), obszar_wsparcia_3:supportAreaPdfValue(3),
      imie_nazwisko_oswiadczenie:`${get('imie')} ${get('nazwisko')}`,
      miejscowosc_data:`${get('miejscowosc_podpisu')}, ${formatDatePL(get('data_podpisu'))}`
    };

    const multiline = new Set(['typ_umowy','data_rozp_zatr','data_zakonczenia_zatr','stanowisko_pracy','opis_szczegolnych_potrzeb','obszar_wsparcia_1','obszar_wsparcia_2','obszar_wsparcia_3']);
    for (const [name, value] of Object.entries(values)) {
      const rect=fields[name];
      if (rect && value) await drawText(pdfDoc,pages[rect[0]-1],rect,value,{multiline:multiline.has(name),center:name==='miejscowosc_data',fontPt:name==='miejscowosc_data'?9.0:(name.startsWith('obszar_')?8.0:undefined),offsetY:name==='miejscowosc_data'?0.4:0});
    }

    // PESEL i data: czytelne, pogrubione znaki w odtworzonych kratkach.
    const peselValue = String(get('pesel')).replace(/\D/g,'').slice(0,11);
    await redrawCharacterRow(pdfDoc, pages[0], fields.pesel, peselValue, 11, 10.8);

    // Data zgodna z nadrukiem formularza: RRRR-MM-DD, po jednym znaku w każdej kratce.
    const birthValue = formatDateISO(get('data_urodzenia'));
    await redrawCharacterRow(pdfDoc, pages[0], fields.data_urodzenia, birthValue, 10, 10.2);

    const marks=[
      `plec_${selected('plec')}`, `wykszt_${selected('wyksztalcenie')}`,
      ...['niepelnosprawnosc','kraje_trzecie','obce_pochodzenie','mniejszosc','bezdomnosc','szczegolne_potrzeby'].map(n=>`${n}_${selected(n)}`),
      selected('szczebel'), ...[1,2,3].map(n=>`obszar_${n}_poziom_${get(`obszar_${n}_poziom`)}`)
    ];
    const positionLevelMarks = new Set(['kadra_zarzadzajaca','wyzszy_szczebel','sredni_szczebel','nizszy_szczebel','prace_proste']);
    marks.forEach(name=>{
      const rect=checks[name];
      if(!rect) return;
      const page=pages[rect[0]-1];
      if(positionLevelMarks.has(name)) drawPositionLevelX(page,rect);
      else drawX(page,rect);
    });

    return await pdfDoc.save({useObjectStreams:false});
  }

  function filename() {
    const safe=`${get('nazwisko')}_${get('imie')}`.replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ_-]+/g,'_');
    return `Formularz_rekrutacyjny_${safe || 'uczestnika'}.pdf`;
  }

  function download(bytes, name) {
    const blob=new Blob([bytes],{type:'application/pdf'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }

  async function clearApplicationData() {
    form.reset();
    needsDetails.classList.add('hidden');
    form.elements.opis_szczegolnych_potrzeb.required = false;
    message.textContent = '';
    message.className = '';
    form.elements.obywatelstwo.value = 'polskie';
    form.elements.wojewodztwo.value = 'śląskie';
    form.elements.data_podpisu.value = new Date().toISOString().slice(0,10);
    supportAreaSelects.forEach((select, index) => {
      select.innerHTML = '<option value="">Najpierw wybierz szczebel stanowiska</option>';
      select.disabled = true;
      setLanguageDetails(index + 1, false);
    });
    if (supportHint) supportHint.textContent = 'Najpierw wybierz szczebel stanowiska. Następnie wskaż trzy obszary wsparcia przypisane do wybranego szczebla.';

    try { localStorage.clear(); } catch (_) {}
    try { sessionStorage.clear(); } catch (_) {}

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
    previewBytes = null;
    previewFrame.src = 'about:blank';

    try {
      if (indexedDB.databases) {
        const databases = await indexedDB.databases();
        databases.forEach(db => { if (db.name) indexedDB.deleteDatabase(db.name); });
      }
    } catch (_) {}
  }

  async function finishAfterDownload() {
    if (previewDialog.open) previewDialog.close();
    await clearApplicationData();
    completionDialog.showModal();
  }

  async function run(mode) {
    if (!validate()) return;
    generateBtn.disabled=true; previewBtn.disabled=true;
    const old=mode==='preview'?previewBtn.textContent:generateBtn.querySelector('span').textContent;
    if(mode==='preview') previewBtn.textContent='Tworzenie podglądu…'; else generateBtn.querySelector('span').textContent='Generowanie PDF…';
    try {
      const bytes=await buildPdf();
      if(mode==='preview') {
        if(previewUrl) URL.revokeObjectURL(previewUrl);
        previewBytes=bytes; previewFilename=filename();
        previewUrl=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
        previewFrame.src=previewUrl;
        previewDialog.showModal();
      } else {
        download(bytes,filename());
        setTimeout(() => finishAfterDownload(), 250);
      }
    } catch(err) {
      console.error(err);
      message.textContent='Nie udało się wygenerować PDF. Na GitHub Pages strona musi być otwierana przez adres HTTPS, nie bezpośrednio jako plik.';
      message.className='error';
    } finally {
      generateBtn.disabled=false; previewBtn.disabled=false;
      if(mode==='preview') previewBtn.textContent=old; else generateBtn.querySelector('span').textContent=old;
    }
  }

  let pendingMode = null;

  function askForConfirmation(mode) {
    if (!validate()) return;
    pendingMode = mode;
    confirmGeneration.textContent = mode === 'preview' ? 'Utwórz podgląd PDF' : 'Generuj i pobierz PDF';
    confirmDialog.showModal();
  }

  form.addEventListener('submit',e=>{e.preventDefault();askForConfirmation('download');});
  previewBtn.addEventListener('click',()=>askForConfirmation('preview'));
  cancelGeneration.addEventListener('click',()=>{pendingMode=null;confirmDialog.close();});
  confirmGeneration.addEventListener('click',()=>{
    const mode=pendingMode;
    pendingMode=null;
    confirmDialog.close();
    if(mode) run(mode);
  });
  confirmDialog.addEventListener('cancel',()=>{pendingMode=null;});
  closePreview.addEventListener('click',()=>previewDialog.close());
  downloadPreview.addEventListener('click',()=>{
    if(previewBytes) {
      download(previewBytes,previewFilename);
      setTimeout(() => finishAfterDownload(), 250);
    }
  });
  previewDialog.addEventListener('close',()=>{
    previewFrame.src='about:blank';
    if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null;}
  });

  closeCompletion.addEventListener('click',()=>{
    completionDialog.close();
    window.scrollTo({top:0,behavior:'smooth'});
  });
  completionDialog.addEventListener('cancel', event => event.preventDefault());

  clearBtn.addEventListener('click',()=>{
    if(confirm('Wyczyścić wszystkie wpisane dane?')) {
      form.reset(); needsDetails.classList.add('hidden'); message.textContent=''; declarationsRead=false; declarationCheckbox.disabled=true; declarationConfirm.classList.add('is-locked'); declarationsDetails.open=false; declarationConfirm.querySelector('small').textContent='Najpierw rozwiń i zapoznaj się z pełną treścią powyżej.'; updateDeclarationName();
      form.elements.obywatelstwo.value='polskie'; form.elements.wojewodztwo.value='śląskie';
      form.elements.data_podpisu.value=new Date().toISOString().slice(0,10);
    }
  });
  form.elements.data_podpisu.value=new Date().toISOString().slice(0,10);
})();
