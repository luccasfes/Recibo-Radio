// ====== CONTROLO DE TEMA (CLARO/ESCURO) ======
function toggleTheme() {
    const html = document.documentElement;
    const btn = document.getElementById('btn-theme');
    
    if (html.getAttribute('data-theme') === 'dark') {
        html.removeAttribute('data-theme');
        btn.textContent = '🌙 Modo Escuro';
        localStorage.setItem('theme', 'light');
    } else {
        html.setAttribute('data-theme', 'dark');
        btn.textContent = '☀️ Modo Claro';
        localStorage.setItem('theme', 'dark');
    }
}

// ====== MOTOR DE NÚMERO PARA EXTENSO ======
function numeroParaExtenso(valorNum) {
    if (isNaN(valorNum) || valorNum <= 0) return "";
    
    const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const dezenas10 = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const dezenas = ["", "dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

    function traduzirGrupo(n) {
        if (n === 100) return "cem";
        let c = Math.floor(n / 100), resto = n % 100, d = Math.floor(resto / 10), u = resto % 10;
        let partes = [];
        if (c > 0) partes.push(centenas[c]);
        if (resto > 0) {
            if (resto >= 10 && resto <= 19) partes.push(dezenas10[resto - 10]);
            else {
                if (d > 0) partes.push(dezenas[d]);
                if (u > 0) partes.push(unidades[u]);
            }
        }
        return partes.join(" e ");
    }

    let inteiros = Math.floor(valorNum);
    let centavos = Math.round((valorNum - inteiros) * 100);
    
    let grupos = [], temp = inteiros;
    while (temp > 0) { grupos.push(temp % 1000); temp = Math.floor(temp / 1000); }

    let sufixos = [["", ""], ["mil", "mil"], ["milhão", "milhões"], ["bilhão", "bilhões"]];
    let partesExtenso = [];

    for (let i = grupos.length - 1; i >= 0; i--) {
        let g = grupos[i];
        if (g > 0) {
            let txt = traduzirGrupo(g);
            if (i === 1 && g === 1) txt = ""; // "um mil" fica só "mil"
            let sufixo = g === 1 ? sufixos[i][0] : sufixos[i][1];
            partesExtenso.push((txt + " " + sufixo).trim());
        }
    }

    let resultado = partesExtenso.join(" e ");
    if (inteiros === 1) resultado += " real";
    else if (inteiros > 1) {
        if (grupos[0] === 0 && (grupos[1] === 0 || grupos.length < 2)) resultado += " de reais";
        else resultado += " reais";
    }

    if (centavos > 0) {
        let txtC = traduzirGrupo(centavos) + (centavos === 1 ? " centavo" : " centavos");
        resultado = inteiros > 0 ? resultado + " e " + txtC : txtC;
    }

    return resultado.charAt(0).toUpperCase() + resultado.slice(1);
}

// Analisa se a pessoa escreveu "1bi", "2.5mi", "10k", etc.
function extrairValorInteligente(str) {
    str = str.toLowerCase().replace(/\s/g, '');
    let multi = 1;
    if (str.includes('bi')) { multi = 1000000000; str = str.split('bi')[0]; }
    else if (str.includes('mi')) { multi = 1000000; str = str.split('mi')[0]; }
    else if (str.includes('k')) { multi = 1000; str = str.split('k')[0]; }
    else if (str.includes('mil')) { multi = 1000; str = str.split('mil')[0]; }

    if (multi === 1) str = str.replace(/\./g, '').replace(',', '.'); // Valor normal
    else str = str.replace(',', '.'); // Se escreveu 1,5bi
    
    let num = parseFloat(str);
    return isNaN(num) ? 0 : num * multi;
}

// Formatar as datas YYYY-MM-DD para DD/MM/YYYY
function formatarData(dataISO) {
  if (!dataISO) return "";
  const p = dataISO.split('-');
  return `${p[2]}/${p[1]}/${p[0]}`;
}

// ====== ATUALIZAÇÃO EM TEMPO REAL ======
function update() {
  let valInput = document.getElementById('in-valor').value;
  let valorReal = extrairValorInteligente(valInput);
  
  if (valorReal > 0) {
      document.getElementById('out-valor').textContent = valorReal.toLocaleString('pt-BR', {minimumFractionDigits: 2});
      let ext = numeroParaExtenso(valorReal);
      document.getElementById('in-extenso').value = ext;
      document.getElementById('out-extenso').textContent = ext + " ";
      
      // Inteligência da Linha: Se o texto for grande, a linha vazia desaparece para dar espaço
      if (ext.length > 35) {
          document.getElementById('extenso-spacer').style.display = 'none';
      } else {
          document.getElementById('extenso-spacer').style.display = 'inline-block';
      }
      
  } else {
      document.getElementById('out-valor').textContent = "";
      document.getElementById('in-extenso').value = "";
      document.getElementById('out-extenso').textContent = "";
      document.getElementById('extenso-spacer').style.display = 'inline-block';
  }

  // Outros campos
  document.getElementById('out-nome').textContent = document.getElementById('in-nome').value;
  document.getElementById('out-inicio').textContent = formatarData(document.getElementById('in-inicio').value);
  document.getElementById('out-fim').textContent = formatarData(document.getElementById('in-fim').value);
  
  document.getElementById('out-dia').textContent = document.getElementById('in-dia').value;
  document.getElementById('out-mes').textContent = document.getElementById('in-mes').value;
  document.getElementById('out-ano').textContent = document.getElementById('in-ano').value;
}

// ====== PREENCHE A DATA DE HOJE AO ABRIR ======
document.addEventListener("DOMContentLoaded", function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('btn-theme').textContent = '☀️ Modo Claro';
    }

    const hoje = new Date();
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    document.getElementById('in-dia').value = hoje.getDate().toString().padStart(2, '0');
    document.getElementById('in-mes').value = meses[hoje.getMonth()];
    document.getElementById('in-ano').value = hoje.getFullYear().toString().slice(-2);
    
    update();
});

// ====== EXPORTAR PARA WORD ======
function exportarWord() {
  const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Recibo</title></head><body>";
  const postHtml = "</body></html>";
  
  const element = document.getElementById('receipt').cloneNode(true);
  element.style.backgroundColor = "#ffffff"; 
  element.style.border = "1px solid #000";
  element.style.padding = "20px";
  element.style.fontFamily = "Arial, sans-serif";
  
  const html = preHtml + element.outerHTML + postHtml;
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
  
  const downloadLink = document.createElement("a");
  document.body.appendChild(downloadLink);
  
  if (navigator.msSaveOrOpenBlob) navigator.msSaveOrOpenBlob(blob, 'Recibo_Radio_Cidade.doc');
  else { downloadLink.href = url; downloadLink.download = 'Recibo_Radio_Cidade.doc'; downloadLink.click(); }
  document.body.removeChild(downloadLink);
}