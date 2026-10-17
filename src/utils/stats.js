import { CATEGORIES, STATUSES, WARRANTY_WARNING_DAYS } from '../constants/assetOptions';
import { daysBetween, todayISO } from './dates';

/**
 * Summary numbers for the dashboard.
 * Retired assets are excluded from the "active value" because the company
 * no longer uses them.
 */
export function computeStats(assets, today = todayISO()) {
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  let totalValue = 0;
  let activeValue = 0;

  for (const asset of assets) {
    byStatus[asset.status] = (byStatus[asset.status] ?? 0) + 1;
    byCategory[asset.category] = (byCategory[asset.category] ?? 0) + 1;
    const price = Number(asset.purchasePrice) || 0;
    totalValue += price;
    if (asset.status !== 'Retired') activeValue += price;
  }

  // Warranties ending between today and WARRANTY_WARNING_DAYS from now,
  // for assets that are still in service.
  const expiringSoon = assets
    .filter((a) => a.warrantyExpiry && a.status !== 'Retired')
    .map((a) => ({ ...a, daysLeft: daysBetween(today, a.warrantyExpiry) }))
    .filter((a) => a.daysLeft >= 0 && a.daysLeft <= WARRANTY_WARNING_DAYS)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return {
    total: assets.length,
    totalValue,
    activeValue,
    byStatus,
    byCategory,
    expiringSoon,
  };
}
