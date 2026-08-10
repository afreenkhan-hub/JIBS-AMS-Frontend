// Single source of truth for stock levels. Shared by the Stock Management
// page and the Super Admin "Low Stock" notification feed so both always
// agree on what's low.
// TODO(backend): replace with GET /api/stock once that endpoint exists.
export const stockRows = [
  { category: 'Laptop', current_stock: 24, minimum_stock_level: 5, vendor: 'TechSource Pvt Ltd', last_movement: 'Purchase +10', status: 'Available' },
  { category: 'Keyboard', current_stock: 7, minimum_stock_level: 10, vendor: 'Office World', last_movement: 'Assigned -3', status: 'Low' },
  { category: 'Mouse', current_stock: 9, minimum_stock_level: 10, vendor: 'Office World', last_movement: 'Return +1', status: 'Low' },
  { category: 'Monitor', current_stock: 18, minimum_stock_level: 5, vendor: 'DisplayHub', last_movement: 'Adjustment +2', status: 'Available' }
];
 
export function getLowStockRows(rows = stockRows) {
  return rows.filter((row) => Number(row.current_stock) < Number(row.minimum_stock_level));
}
 