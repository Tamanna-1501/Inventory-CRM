import { prisma } from "@/lib/prisma";

// type: "ORDER" | "LOW_STOCK" | "PAYMENT" | "MESSAGE"
export async function notifyUsers(userIds, payload) {
  if (!userIds || userIds.length === 0) return;
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, ...payload })),
  });
}

// Role ke naam se notify karo. Naam wahi likho jo Role table mein hai.
export async function notifyRoles(roleNames, payload) {
  const users = await prisma.user.findMany({
    where: { role: { name: { in: roleNames } }, status: "active" },
    select: { id: true },
  });
  await notifyUsers(
    users.map((u) => u.id),
    payload
  );
}