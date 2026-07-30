import { db } from './index.ts';
import { products } from './schema.ts';
import { eq, and, desc } from 'drizzle-orm';
import { SavedProduct } from '../types.ts';
import { getOrCreateUser } from './users.ts';

export async function getUserProducts(userUid: string): Promise<SavedProduct[]> {
  try {
    const list = await db
      .select()
      .from(products)
      .where(eq(products.userUid, userUid))
      .orderBy(desc(products.createdAt));

    return list.map((p) => ({
      id: p.id,
      name: p.name,
      date: p.date,
      hpp: p.hpp,
      sellingPrice: p.sellingPrice,
      platformName: p.platformName,
      netProfit: p.netProfit,
      netMargin: p.netMargin,
      roi: p.roi,
      monthlySalesVolumeEstimate: p.monthlySalesVolumeEstimate,
    }));
  } catch (error) {
    console.error('Database query getUserProducts failed:', error);
    throw new Error('Database query failed. Could not fetch products.', { cause: error });
  }
}

export async function saveUserProduct(
  userUid: string,
  userEmail: string,
  product: SavedProduct
): Promise<SavedProduct> {
  try {
    const user = await getOrCreateUser(userUid, userEmail);

    const [saved] = await db
      .insert(products)
      .values({
        id: product.id,
        userId: user ? user.id : null,
        userUid: userUid,
        name: product.name,
        date: product.date,
        hpp: product.hpp,
        sellingPrice: product.sellingPrice,
        platformName: product.platformName,
        netProfit: product.netProfit,
        netMargin: product.netMargin,
        roi: product.roi,
        monthlySalesVolumeEstimate: product.monthlySalesVolumeEstimate || 0,
      })
      .onConflictDoUpdate({
        target: products.id,
        set: {
          name: product.name,
          hpp: product.hpp,
          sellingPrice: product.sellingPrice,
          platformName: product.platformName,
          netProfit: product.netProfit,
          netMargin: product.netMargin,
          roi: product.roi,
          monthlySalesVolumeEstimate: product.monthlySalesVolumeEstimate || 0,
        },
      })
      .returning();

    return {
      id: saved.id,
      name: saved.name,
      date: saved.date,
      hpp: saved.hpp,
      sellingPrice: saved.sellingPrice,
      platformName: saved.platformName,
      netProfit: saved.netProfit,
      netMargin: saved.netMargin,
      roi: saved.roi,
      monthlySalesVolumeEstimate: saved.monthlySalesVolumeEstimate,
    };
  } catch (error) {
    console.error('Database query saveUserProduct failed:', error);
    throw new Error('Database query failed. Could not save product.', { cause: error });
  }
}

export async function deleteUserProduct(userUid: string, productId: string): Promise<boolean> {
  try {
    await db
      .delete(products)
      .where(and(eq(products.id, productId), eq(products.userUid, userUid)));
    return true;
  } catch (error) {
    console.error('Database query deleteUserProduct failed:', error);
    throw new Error('Database query failed. Could not delete product.', { cause: error });
  }
}

export async function updateUserProductVolume(
  userUid: string,
  productId: string,
  volume: number
): Promise<boolean> {
  try {
    await db
      .update(products)
      .set({ monthlySalesVolumeEstimate: volume })
      .where(and(eq(products.id, productId), eq(products.userUid, userUid)));
    return true;
  } catch (error) {
    console.error('Database query updateUserProductVolume failed:', error);
    throw new Error('Database query failed. Could not update product volume.', { cause: error });
  }
}
