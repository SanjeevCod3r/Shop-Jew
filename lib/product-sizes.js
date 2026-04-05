/** Matches product detail page: rings need a size before add-to-cart. */
export function productRequiresSize(product) {
  if (!product) return false;
  if (Array.isArray(product.ringSizes) && product.ringSizes.length > 0) return true;
  const c = (product.category || "").toLowerCase();
  return c.includes("ring");
}

export function getProductSizeOptions(product) {
  if (product?.ringSizes?.length > 0) return product.ringSizes;
  return [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8];
}
