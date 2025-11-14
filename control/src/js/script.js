// ====================================
// Configuración API
// ====================================
const API_URL = 'http://localhost:8080/api/sensores';

// ====================================
// Gestión de datos desde API
// ====================================
class BaseDatosSensores {
  constructor() {
    this.sensores = [];
  }

  async cargar() {
    try {
      const respuesta = await fetch(API_URL);
      if (!respuesta.ok) throw new Error('Error al obtener datos');
      const datos = await respuesta.json();
      this.sensores = datos.map(d => ({
        id: d.id,
        fecha: d.fecha,
        sensorId: d.sensorId,
        nivel: d.nivelDeAguaCm,
        tipo: d.tipoAlerta.toLowerCase()
      }));
      return this.sensores;
    } catch (error) {
      console.error('Error cargando datos:', error);
      return [];
    }
  }

  async filtrar(fecha, tipo) {
    try {
      let url = `${API_URL}/filtrar?`;
      if (fecha) url += `fecha=${fecha}&`;
      if (tipo) url += `tipo=${tipo}`;
      
      const respuesta = await fetch(url);
      if (!respuesta.ok) throw new Error('Error al filtrar');
      const datos = await respuesta.json();
      return datos.map(d => ({
        id: d.id,
        fecha: d.fecha,
        sensorId: d.sensorId,
        nivel: d.nivelDeAguaCm,
        tipo: d.tipoAlerta.toLowerCase()
      }));
    } catch (error) {
      console.error('Error filtrando datos:', error);
      return this.sensores;
    }
  }
}

const db = new BaseDatosSensores();

// ====================================
// Elementos del DOM
// ====================================
const btnProyecto = document.getElementById('btn-proyecto');
const btnEmpresa = document.getElementById('btn-empresa');
const btnSensores = document.getElementById('btn-sensores');
const seccionProyecto = document.getElementById('seccion-proyecto');
const seccionEmpresa = document.getElementById('seccion-empresa');
const seccionSensores = document.getElementById('seccion-sensores');
const formBusqueda = document.getElementById('form-busqueda');
const tablaBody = document.getElementById('tbody-sensores');
const climaDiv = document.getElementById('clima-actual');

// ====================================
// Navegación
// ====================================
function mostrarSeccion(seccion, boton) {
  document.querySelectorAll('section').forEach(sec => sec.classList.add('seccion-oculta'));
  document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('activo'));

  seccion.classList.remove('seccion-oculta');
  seccion.classList.add('seccion-activa');
  boton.classList.add('activo');

  if (seccion.id === 'seccion-sensores') {
    db.cargar().then(() => {
      cargarSensores();
      cargarClima();
    });
  }
}

btnProyecto.addEventListener('click', () => mostrarSeccion(seccionProyecto, btnProyecto));
btnEmpresa.addEventListener('click', () => mostrarSeccion(seccionEmpresa, btnEmpresa));
btnSensores.addEventListener('click', () => mostrarSeccion(seccionSensores, btnSensores));

// ====================================
// Cargar sensores + paginación + gráfica
// ====================================
let paginaActual = 1;
const registrosPorPagina = 10;

async function cargarSensores(fecha = '', tipo = '') {
  const sensores = await db.filtrar(fecha, tipo);
  mostrarPagina(sensores, 1);
  mostrarGrafica(sensores);

  formBusqueda.addEventListener('submit', async e => {
    e.preventDefault();
    const fecha = document.getElementById('fecha').value;
    const tipo = document.getElementById('tipo').value;
    const sensoresF = await db.filtrar(fecha, tipo);
    mostrarPagina(sensoresF, 1);
    mostrarGrafica(sensoresF);
  });
}

function mostrarPagina(sensores, pagina) {
  const inicio = (pagina - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const sensoresPagina = sensores.slice(inicio, fin);
  const totalPaginas = Math.ceil(sensores.length / registrosPorPagina);

  const tablaBody = document.getElementById('tbody-sensores');
  tablaBody.innerHTML = '';

  if (sensoresPagina.length === 0) {
    tablaBody.innerHTML = '<tr><td colspan="4">No se encontraron datos.</td></tr>';
  } else {
    sensoresPagina.forEach(s => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${s.fecha}</td>
        <td>${s.sensorId}</td>
        <td>${s.nivel} cm</td>
        <td><span class="badge ${s.tipo}">${s.tipo.toUpperCase()}</span></td>
      `;
      tablaBody.appendChild(row);
    });
  }

  mostrarBotonesPaginacion(totalPaginas, sensores);
}

function mostrarBotonesPaginacion(totalPaginas, sensores) {
  const contenedor = document.getElementById('paginacion');
  contenedor.innerHTML = '';

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === paginaActual) btn.classList.add('activo');

    btn.addEventListener('click', () => {
      paginaActual = i;
      mostrarPagina(sensores, i);
    });

    contenedor.appendChild(btn);
  }
}

// ====================================
// Clima actual
// ====================================
async function cargarClima() {
  const lat = 4.669;
  const lon = -74.021;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=precipitation,precipitation_probability&timezone=America/Bogota`;

  try {
    const resp = await fetch(url);
    const data = await resp.json();
    const clima = data.current_weather;

    // Buscar la hora actual
    const ahora = new Date().toISOString().slice(0, 13);
    const index = data.hourly.time.findIndex(h => h.startsWith(ahora));
    const lluvia = index !== -1 ? `${data.hourly.precipitation[index]} mm` : 'N/A';
    const probLluvia = index !== -1 && data.hourly.precipitation_probability
      ? `${data.hourly.precipitation_probability[index]}%`
      : 'N/A';

    const fechaHora = new Date(clima.time).toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      hour12: true,
    });

    climaDiv.innerHTML = `
      <h3>Clima actual San Luis</h3>
      <p><strong>Temperatura:</strong> ${clima.temperature} °C</p>
      <p><strong>Viento:</strong> ${clima.windspeed} km/h</p>
      <p><strong>Hora de actualización:</strong> ${fechaHora}</p>
    `;
  } catch {
    climaDiv.innerHTML = `<p style="color:red;">Error al cargar el clima.</p>`;
  }
}

// ====================================
// Gráfica con colores por nivel
// ====================================
function mostrarGrafica(sensores) {
  const ctx = document.getElementById('grafica-niveles').getContext('2d');
  if (window.graficaNiveles) window.graficaNiveles.destroy();

  const datosOrdenados = [...sensores].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const fechas = datosOrdenados.map(s => s.fecha);
  const niveles = datosOrdenados.map(s => s.nivel);

  const coloresPuntos = datosOrdenados.map(s =>
    s.tipo === 'baja' ? 'rgba(0,200,0,0.8)' :
    s.tipo === 'media' ? 'rgba(255,200,0,0.9)' :
    'rgba(255,50,50,0.9)'
  );

  window.graficaNiveles = new Chart(ctx, {
    type: 'line',
    data: {
      labels: fechas,
      datasets: [{
        label: 'Nivel de agua (cm)',
        data: niveles,
        borderColor: 'rgba(0,100,255,0.6)',
        fill: true,
        tension: 0.3,
        pointRadius: 6,
        pointBackgroundColor: coloresPuntos,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Nivel (cm)' } },
        x: { title: { display: true, text: 'Fecha de medición' } }
      }
    }
  });
}

// ====================================
// Generar PDF
// ====================================
function generarPDF() {
  try {
    const { jsPDF } = window.jspdf;
    
    if (!jsPDF) {
      alert('Error: La librería jsPDF no se ha cargado correctamente.');
      console.error('jsPDF no disponible');
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Encabezado
    doc.setFontSize(16);
    doc.setTextColor(10, 86, 208);
    doc.text('Reporte de Sensores - Canal de Drenaje', 10, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 10, 25);
    
    // Tabla
    const tabla = document.getElementById('tabla-sensores');
    if (!tabla) {
      alert('Error: Tabla no encontrada');
      return;
    }
    
    const rows = [];
    const headers = ['Fecha', 'Sensor ID', 'Nivel (cm)', 'Tipo Alerta'];
    
    // Recopilar datos de la tabla visible
    const tbody = tabla.querySelector('tbody');
    tbody.querySelectorAll('tr').forEach(tr => {
      const celdas = tr.querySelectorAll('td');
      if (celdas.length > 0) {
        rows.push([
          celdas[0].textContent.trim(),
          celdas[1].textContent.trim(),
          celdas[2].textContent.trim(),
          celdas[3].textContent.trim()
        ]);
      }
    });
    
    if (rows.length === 0) {
      doc.text('No hay datos disponibles para mostrar.', 10, 35);
    } else {
      // Usar autoTable si está disponible
      if (doc.autoTable) {
        doc.autoTable({
          head: [headers],
          body: rows,
          startY: 35,
          styles: { 
            fontSize: 9, 
            cellPadding: 3,
            textColor: [0, 0, 0]
          },
          headStyles: { 
            fillColor: [10, 86, 208], 
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          alternateRowStyles: { 
            fillColor: [230, 240, 250] 
          },
          margin: { top: 35 }
        });
      } else {
        // Fallback: tabla simple si autoTable no está disponible
        let y = 35;
        doc.setFontSize(9);
        
        // Encabezados
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(10, 86, 208);
        headers.forEach((header, i) => {
          doc.rect(10 + (i * 40), y - 5, 40, 7, 'F');
          doc.text(header, 11 + (i * 40), y);
        });
        
        // Filas
        y += 10;
        doc.setTextColor(0, 0, 0);
        rows.forEach((row, idx) => {
          if (idx % 2 === 0) {
            doc.setFillColor(230, 240, 250);
            doc.rect(10, y - 5, 160, 7, 'F');
          }
          row.forEach((cell, i) => {
            doc.text(cell, 11 + (i * 40), y);
          });
          y += 7;
        });
      }
    }
    
    // Descargar
    const filename = 'Reporte_Sensores_' + new Date().getTime() + '.pdf';
    doc.save(filename);
    console.log('PDF descargado: ' + filename);
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Error al generar el PDF: ' + error.message);
  }
}

// ====================================
// Listener para botón PDF
// ====================================
// Se registra dentro de DOMContentLoaded

// ====================================
// Carga inicial
// ====================================
document.addEventListener('DOMContentLoaded', () => {
  // Registrar listener del botón PDF
  const btnPDF = document.getElementById('btn-imprimir-pdf');
  if (btnPDF) {
    btnPDF.addEventListener('click', generarPDF);
  }
  
  mostrarSeccion(seccionProyecto, btnProyecto);
});
