/**
 * Pre-populated example data for reviewers.
 * Fixed UUIDs so products can reference stores.
 */

export const SEED_STORES = [
  { id: "a0000001-0000-4000-8000-000000000001", name: "Downtown Store" },
  { id: "a0000002-0000-4000-8000-000000000002", name: "Mall Location" },
  { id: "a0000003-0000-4000-8000-000000000003", name: "Airport Kiosk" },
];

export const SEED_PRODUCTS = [
  { storeId: "a0000001-0000-4000-8000-000000000001", name: "Wireless Mouse", category: "Electronics", price: 29.99, quantityInStock: 45 },
  { storeId: "a0000001-0000-4000-8000-000000000001", name: "USB-C Cable", category: "Electronics", price: 12.5, quantityInStock: 120 },
  { storeId: "a0000001-0000-4000-8000-000000000001", name: "Organic Apples", category: "Produce", price: 4.99, quantityInStock: 80 },
  { storeId: "a0000001-0000-4000-8000-000000000001", name: "Whole Grain Bread", category: "Bakery", price: 3.49, quantityInStock: 3 },
  { storeId: "a0000002-0000-4000-8000-000000000002", name: "Laptop Stand", category: "Electronics", price: 45.0, quantityInStock: 22 },
  { storeId: "a0000002-0000-4000-8000-000000000002", name: "Desk Lamp", category: "Home", price: 34.99, quantityInStock: 15 },
  { storeId: "a0000002-0000-4000-8000-000000000002", name: "Notebook Pack", category: "Office", price: 8.99, quantityInStock: 200 },
  { storeId: "a0000003-0000-4000-8000-000000000003", name: "Travel Pillow", category: "Travel", price: 19.99, quantityInStock: 8 },
  { storeId: "a0000003-0000-4000-8000-000000000003", name: "Snack Bar Box", category: "Grocery", price: 14.99, quantityInStock: 50 },
];
