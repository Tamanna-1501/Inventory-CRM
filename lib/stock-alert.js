import { prisma } from "@/lib/prisma";
import { notifyRoles } from "@/lib/notify";

const LOW_STOCK_LIMIT = 5;

// Sale ya adjustment mein stock kam hone ke baad call karo
export async function checkLowStock(productId, warehouseId) {
  const stock = await prisma.stock.findUnique({
    where: { productId_warehouseId: { productId, warehouseId } },
    include: { product: true, warehouse: true },
  });

  if (stock && stock.quantity <= LOW_STOCK_LIMIT) {
    await notifyRoles(["admin", "supervisor"], {
      title: "Low stock",
      message: `${stock.product.name} (${stock.warehouse.name}) mein sirf ${stock.quantity} bacha hai`,
      type: "LOW_STOCK",
      link: `/products/${productId}`,
    });
  }
}