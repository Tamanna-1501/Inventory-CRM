// Final selling price: promotional price if set, otherwise the normal price.
export function hasPromo(product) {
  return (
    product?.promotionalPrice !== null &&
    product?.promotionalPrice !== undefined &&
    product?.promotionalPrice !== '' &&
    Number(product.promotionalPrice) > 0 &&
    Number(product.promotionalPrice) < Number(product.price)
  );
}

export function getFinalPrice(product) {
  return hasPromo(product) ? Number(product.promotionalPrice) : Number(product.price);
}