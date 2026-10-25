class Carrito {
  constructor(productos, currency) {
    this.currency = currency;
    this.productos = productos.map(p => ({
      sku: p.SKU,
      title: p.title,
      price: parseFloat(p.price),
      quantity: 0
    }));
  }

  actualizarUnidades(sku, unidades) {
    const producto = this.productos.find(p => p.sku === sku);
    if (producto) {
      producto.quantity = Math.max(0, parseInt(unidades) || 0);
    }
  }

  obtenerInformacionProducto(sku) {
    const producto = this.productos.find(p => p.sku === sku);
    return producto ? { sku: producto.sku, quantity: producto.quantity } : null;
  }

  obtenerSubtotal(sku) {
    const producto = this.productos.find(p => p.sku === sku);
    return producto ? (producto.price * producto.quantity).toFixed(2) : null;
  }

  obtenerCarrito() {
    let total = 0;
    let unidades = 0;
    const productosComprados = [];

    this.productos.forEach(p => {
      if (p.quantity > 0) {
        total += p.price * p.quantity;
        unidades += p.quantity;
        productosComprados.push({
          sku: p.sku,
          title: p.title,
          quantity: p.quantity,
          subtotal: (p.price * p.quantity).toFixed(2)
        });
      }
    });

    return {
      total: total.toFixed(2),
      currency: this.currency,
      unidades: unidades,
      products: productosComprados
    };
  }
}
