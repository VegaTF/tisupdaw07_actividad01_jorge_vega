const API_URL = 'https://jsonblob.com/api/jsonBlob/01a17308-3308-770b-b5c0-08a268d61600';
const TIEMPO_MAXIMO_API = 3000; // ms
const UNIDADES_INICIALES = 1;

const contenedorProductos = document.getElementById('lista-productos');
const elementoTotal = document.getElementById('precio-total');
const elementoMoneda = document.getElementById('moneda');
const contadorUnidades = document.getElementById('contador-unidades');
const resumenUnidades = document.getElementById('resumen-unidades');

let miCarrito;
const filas = new Map();

async function obtenerDatos() {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_API);

  try {
    const respuesta = await fetch(API_URL, { signal: controlador.signal });
    if (!respuesta.ok) {
      throw new Error(`La API respondió con estado ${respuesta.status}`);
    }
    return await respuesta.json();
  } catch (error) {
    console.warn('No se pudo consultar la API, se usan los productos de respaldo:', error);
    return PRODUCTOS_RESPALDO;
  } finally {
    clearTimeout(temporizador);
  }
}

async function iniciarApp() {
  try {
    const datos = await obtenerDatos();

    miCarrito = new Carrito(datos.products, datos.currency);
    miCarrito.productos.forEach(p => miCarrito.actualizarUnidades(p.sku, UNIDADES_INICIALES));
    elementoMoneda.textContent = miCarrito.currency;

    renderizarProductos();
    actualizarDOM();
  } catch (error) {
    contenedorProductos.textContent = 'Error al cargar los productos.';
    console.error('Error al cargar los productos:', error);
  }
}

function unidadesDe(sku) {
  return miCarrito.obtenerInformacionProducto(sku).quantity;
}

function cambiarUnidades(sku, unidades) {
  miCarrito.actualizarUnidades(sku, unidades);
  actualizarDOM();
}

function renderizarProductos() {
  contenedorProductos.textContent = '';
  filas.clear();

  if (miCarrito.productos.length === 0) {
    contenedorProductos.textContent = 'No hay productos disponibles.';
    return;
  }

  miCarrito.productos.forEach(producto => {
    const fila = document.createElement('div');
    fila.className = 'producto';

    const miniatura = document.createElement('div');
    miniatura.className = 'producto-miniatura';
    miniatura.textContent = producto.title.charAt(0).toUpperCase();

    const info = document.createElement('div');
    info.className = 'producto-info';

    const titulo = document.createElement('h3');
    titulo.className = 'producto-titulo';
    titulo.textContent = producto.title;

    const sku = document.createElement('span');
    sku.className = 'producto-sku';
    sku.textContent = `SKU: ${producto.sku}`;

    const precio = document.createElement('span');
    precio.className = 'producto-precio';
    precio.textContent = `${producto.price.toFixed(2)} ${miCarrito.currency} / ud.`;

    info.append(titulo, sku, precio);

    const selector = document.createElement('div');
    selector.className = 'selector-unidades';

    const botonMenos = document.createElement('button');
    botonMenos.type = 'button';
    botonMenos.className = 'boton-unidades';
    botonMenos.textContent = '-';

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.className = 'input-cantidad';

    const botonMas = document.createElement('button');
    botonMas.type = 'button';
    botonMas.className = 'boton-unidades';
    botonMas.textContent = '+';

    selector.append(botonMenos, input, botonMas);

    const subtotal = document.createElement('div');
    subtotal.className = 'producto-subtotal';

    fila.append(miniatura, info, selector, subtotal);
    contenedorProductos.append(fila);
    filas.set(producto.sku, { fila, input, botonMenos, subtotal });

    botonMenos.addEventListener('click', () => cambiarUnidades(producto.sku, unidadesDe(producto.sku) - 1));
    botonMas.addEventListener('click', () => cambiarUnidades(producto.sku, unidadesDe(producto.sku) + 1));
    input.addEventListener('input', () => cambiarUnidades(producto.sku, input.value));
    input.addEventListener('change', () => { input.value = unidadesDe(producto.sku); });
  });
}

function actualizarDOM() {
  const infoCarrito = miCarrito.obtenerCarrito();

  elementoTotal.textContent = infoCarrito.total;
  contadorUnidades.textContent = infoCarrito.unidades;
  resumenUnidades.textContent = infoCarrito.unidades;

  filas.forEach((refs, sku) => {
    const cantidad = unidadesDe(sku);

    refs.subtotal.textContent = `${miCarrito.obtenerSubtotal(sku)} ${miCarrito.currency}`;
    refs.botonMenos.disabled = cantidad === 0;
    refs.fila.classList.toggle('sin-unidades', cantidad === 0);
    if (document.activeElement !== refs.input) {
      refs.input.value = cantidad;
    }
  });
}

iniciarApp();
