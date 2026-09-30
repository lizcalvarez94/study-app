const CLAVE = "diario-estudio-sesiones";

const formulario = document.getElementById("formulario");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const lista = document.getElementById("lista");
const textoRacha = document.getElementById("racha");
const textoVacio = document.getElementById("vacio");
const textoError = document.getElementById("error");

// Devuelve "YYYY-MM-DD" usando la fecha local (sin UTC).
function aClaveFecha(fecha) {
  const ano = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return ano + "-" + mes + "-" + dia;
}

// Suma (o resta) días a una fecha local.
function moverDias(fecha, dias) {
  const copia = new Date(fecha);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

function leerSesiones() {
  const texto = localStorage.getItem(CLAVE);
  if (!texto) {
    return [];
  }
  try {
    const datos = JSON.parse(texto);
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function guardarSesiones(sesiones) {
  localStorage.setItem(CLAVE, JSON.stringify(sesiones));
}

// Racha: días consecutivos con sesión que terminan hoy.
// Si hoy aún no tiene sesión, se empieza a contar desde ayer.
function calcularRacha(sesiones) {
  const diasConEstudio = new Set(sesiones.map(function (s) { return s.fecha; }));

  let racha = 0;
  let dia = new Date();

  if (!diasConEstudio.has(aClaveFecha(dia))) {
    dia = moverDias(dia, -1);
  }

  while (diasConEstudio.has(aClaveFecha(dia))) {
    racha++;
    dia = moverDias(dia, -1);
  }

  return racha;
}

function mostrar() {
  const sesiones = leerSesiones();

  // De la más reciente a la más antigua.
  sesiones.sort(function (a, b) {
    if (b.fecha !== a.fecha) {
      return b.fecha < a.fecha ? -1 : 1;
    }
    return b.id - a.id;
  });

  textoRacha.textContent = calcularRacha(sesiones);

  lista.innerHTML = "";
  textoVacio.style.display = sesiones.length === 0 ? "block" : "none";

  sesiones.forEach(function (s) {
    const item = document.createElement("li");
    item.textContent = s.fecha + " — " + s.tema + " (" + s.minutos + " min)";
    lista.appendChild(item);
  });
}

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();
  textoError.textContent = "";

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  if (!fecha) {
    textoError.textContent = "Elige una fecha.";
    return;
  }
  if (tema === "") {
    textoError.textContent = "Escribe el tema estudiado.";
    return;
  }
  if (!Number.isInteger(minutos) || minutos <= 0) {
    textoError.textContent = "Los minutos deben ser un número mayor que 0.";
    return;
  }

  const sesiones = leerSesiones();
  sesiones.push({ id: Date.now(), fecha: fecha, tema: tema, minutos: minutos });
  guardarSesiones(sesiones);

  formulario.reset();
  campoFecha.value = aClaveFecha(new Date());
  mostrar();
});

// Fecha por defecto: hoy.
campoFecha.value = aClaveFecha(new Date());
mostrar();
