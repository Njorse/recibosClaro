// Variables globales
let items = [
    { code: '00000000007014838', desc: 'SERVICIO DELIVERY MOVIL', um: 'NIU', qty: 1, price: 15.00, type: 'gratuita' },
    { code: '000000000070054185', desc: 'OPPO RENO7 258GB', um: 'NIU', qty: 1, price: 2533.00, type: 'gravada' }
];

// Elementos del DOM
const elSerieNumero = document.getElementById('serie-numero');
const elFechaEmision = document.getElementById('fecha-emision');
const elRazonSocial = document.getElementById('razon-social');
const elDni = document.getElementById('dni');
const elDireccion = document.getElementById('direccion');
const elIgvPercent = document.getElementById('igv-percent');

const outSerie = document.getElementById('out-serie');
const outNumero = document.getElementById('out-numero');
const outFecha = document.getElementById('out-fecha');
const outRazon = document.getElementById('out-razon');
const outDni = document.getElementById('out-dni');
const outDireccion = document.getElementById('out-direccion');
const outIgvPercent = document.getElementById('out-igv-percent');

const itemsContainer = document.getElementById('items-container');
const outItems = document.getElementById('out-items');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Fecha actual por defecto
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    elFechaEmision.value = dd + '/' + mm + '/' + yyyy;

    // Listeners básicos
    elSerieNumero.addEventListener('input', updateHeader);
    elFechaEmision.addEventListener('input', updateHeader);
    elRazonSocial.addEventListener('input', updateHeader);
    elDni.addEventListener('input', updateHeader);
    elDireccion.addEventListener('input', updateHeader);
    elIgvPercent.addEventListener('input', updateTotals);

    document.getElementById('add-item-btn').addEventListener('click', addNewItem);
    
    document.getElementById('print-btn').addEventListener('click', () => window.print());
    document.getElementById('export-img-btn').addEventListener('click', exportToImage);
    document.getElementById('export-pdf-btn').addEventListener('click', exportToPDF);
    document.getElementById('export-csv-btn').addEventListener('click', exportToCSV);

    updateHeader();
    renderControls();
});

function updateHeader() {
    // Separar B095 - 00169669
    const parts = elSerieNumero.value.split('-');
    outSerie.textContent = parts[0] ? parts[0].trim() : 'B001';
    outNumero.textContent = parts[1] ? parts[1].trim() : '00000001';
    
    outFecha.textContent = elFechaEmision.value;
    outRazon.textContent = elRazonSocial.value;
    outDni.textContent = elDni.value;
    outDireccion.textContent = elDireccion.value;
    outIgvPercent.textContent = elIgvPercent.value;
}

function renderControls() {
    itemsContainer.innerHTML = '';
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'item-row';
        div.innerHTML = `
            <button class="btn-remove" onclick="removeItem(${index})">X</button>
            <input type="text" placeholder="Descripción" value="${item.desc}" oninput="updateItem(${index}, 'desc', this.value)">
            <div class="item-row-grid">
                <input type="number" placeholder="Cant." value="${item.qty}" step="1" oninput="updateItem(${index}, 'qty', this.value)">
                <input type="number" placeholder="Precio U." value="${item.price}" step="0.01" oninput="updateItem(${index}, 'price', this.value)">
                <input type="text" placeholder="Código" value="${item.code}" oninput="updateItem(${index}, 'code', this.value)">
                <select onchange="updateItem(${index}, 'type', this.value)" style="padding: 6px; font-size:12px; border:1px solid #ccc; border-radius:3px; margin-bottom:5px;">
                    <option value="gravada" ${item.type === 'gravada' ? 'selected' : ''}>Normal (Gravada)</option>
                    <option value="gratuita" ${item.type === 'gratuita' ? 'selected' : ''}>Gratuita (0 IGV)</option>
                </select>
            </div>
        `;
        itemsContainer.appendChild(div);
    });
    
    renderReceiptItems();
}

function updateItem(index, field, value) {
    if (field === 'qty' || field === 'price') {
        items[index][field] = parseFloat(value) || 0;
    } else {
        items[index][field] = value;
    }
    renderReceiptItems();
}

function removeItem(index) {
    items.splice(index, 1);
    renderControls();
}

function addNewItem() {
    items.push({
        code: '00000000000000000',
        desc: 'NUEVO PRODUCTO',
        um: 'NIU',
        qty: 1,
        price: 0.00,
        type: 'gravada'
    });
    renderControls();
}

function renderReceiptItems() {
    outItems.innerHTML = '';
    const igvRate = (parseFloat(elIgvPercent.value) || 18) / 100;
    
    let opGravadas = 0;
    let opGratuitas = 0;
    let totalIGV = 0;
    let totalGeneral = 0;

    items.forEach(item => {
        const total = item.qty * item.price;
        let valorUnitario = 0;
        
        if (item.type === 'gravada') {
            valorUnitario = item.price / (1 + igvRate);
            opGravadas += (valorUnitario * item.qty);
            totalIGV += (total - (valorUnitario * item.qty));
            totalGeneral += total;
        } else {
            valorUnitario = 0;
            opGratuitas += total;
            totalGeneral += total; // A veces las operaciones gratuitas no suman al total a pagar, pero en el ejemplo de Claro sí sumaban al final. Asumimos suma simple.
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.code}</td>
            <td>${item.desc}</td>
            <td>${item.um}</td>
            <td>${item.qty}</td>
            <td>${item.price.toFixed(2)}</td>
            <td>${valorUnitario.toFixed(2)}</td>
            <td>${total.toFixed(2)}</td>
        `;
        outItems.appendChild(tr);
    });

    // Actualizar Totales
    document.getElementById('out-op-gravadas').textContent = opGravadas.toFixed(2);
    document.getElementById('out-op-gratuitas').textContent = opGratuitas.toFixed(2);
    document.getElementById('out-igv').textContent = totalIGV.toFixed(2);
    document.getElementById('out-total').textContent = totalGeneral.toFixed(2);

    // Actualizar texto SON:
    const partes = totalGeneral.toFixed(2).split('.');
    const soles = numeroALetras(parseInt(partes[0]));
    const centimos = partes[1];
    document.getElementById('out-letras').textContent = `${soles.toUpperCase()} Y ${centimos}/100 SOLES`;
}

function updateTotals() {
    outIgvPercent.textContent = elIgvPercent.value;
    renderReceiptItems();
}

// ========================
// EXPORTS
// ========================
function exportToImage() {
    const receiptEl = document.getElementById('receipt');
    
    // Guardar estilos actuales para restaurar
    const originalShadow = receiptEl.style.boxShadow;
    receiptEl.style.boxShadow = 'none'; // Quitar sombra para la imagen
    
    html2canvas(receiptEl, { scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Boleta_Claro_${outSerie.textContent}-${outNumero.textContent}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // Restaurar estilos
        receiptEl.style.boxShadow = originalShadow;
    });
}

async function exportToPDF() {
    const receiptEl = document.getElementById('receipt');
    const originalShadow = receiptEl.style.boxShadow;
    receiptEl.style.boxShadow = 'none';
    
    try {
        const canvas = await html2canvas(receiptEl, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        pdf.save(`Boleta_Claro_${outSerie.textContent}-${outNumero.textContent}.pdf`);
    } finally {
        receiptEl.style.boxShadow = originalShadow;
    }
}

function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Serie,Numero,Fecha,Cliente,DNI,Direccion,Total\n";
    
    // Datos principales
    csvContent += `${outSerie.textContent},${outNumero.textContent},${outFecha.textContent},"${outRazon.textContent}",${outDni.textContent},"${outDireccion.textContent}",${document.getElementById('out-total').textContent}\n\n`;
    
    // Detalle
    csvContent += "Codigo,Descripcion,Cantidad,PrecioUnitario,Total\n";
    items.forEach(item => {
        csvContent += `${item.code},"${item.desc}",${item.qty},${item.price.toFixed(2)},${(item.qty * item.price).toFixed(2)}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Venta_${outSerie.textContent}-${outNumero.textContent}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ========================
// NUMEROS A LETRAS (Simple)
// ========================
function numeroALetras(num) {
    const unidades = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiun', 'veintidos', 'veintitres', 'veinticuatro', 'veinticinco', 'veintiseis', 'veintisiete', 'veintiocho', 'veintinueve'];
    const decenas = ['cero', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const centenas = ['cero', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    if (num === 0) return 'cero';
    if (num === 100) return 'cien';
    
    if (num < 30) return unidades[num];
    
    if (num < 100) {
        const dec = Math.floor(num / 10);
        const uni = num % 10;
        return decenas[dec] + (uni > 0 ? ' y ' + unidades[uni] : '');
    }
    
    if (num < 1000) {
        const cen = Math.floor(num / 100);
        const rest = num % 100;
        return centenas[cen] + (rest > 0 ? ' ' + numeroALetras(rest) : '');
    }
    
    if (num < 1000000) {
        const mil = Math.floor(num / 1000);
        const rest = num % 1000;
        const strMil = mil === 1 ? 'mil' : numeroALetras(mil) + ' mil';
        return strMil + (rest > 0 ? ' ' + numeroALetras(rest) : '');
    }
    
    return num.toString(); // Fallback for very large numbers
}
