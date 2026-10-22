// Stock of a product inside one warehouse. Returns null when no warehouse is chosen.
export function stockIn(product, warehouseId) {
  if (!warehouseId) return null;
  const row = product?.stocks?.find((s) => s.warehouseId === Number(warehouseId));
  return row ? Number(row.quantity) : 0;
}

// "Warehouse 2: 100, Warehouse 3: 20" -> where else this product is available
export function stockElsewhere(product, warehouseId) {
  return (product?.stocks || [])
    .filter((s) => s.warehouseId !== Number(warehouseId) && Number(s.quantity) > 0)
    .map((s) => `${s.warehouse?.name || `Warehouse ${s.warehouseId}`}: ${s.quantity}`)
    .join(', ');
}