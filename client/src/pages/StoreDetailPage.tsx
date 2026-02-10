import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { ProductListParams } from "../api/types";
import type { Product } from "../api/types";
import { PencilIcon, TrashIcon } from "../components/icons";
import { useDeleteProduct } from "../hooks/useDeleteProduct";
import { ProductModal } from "../components/ProductModal";
import { DeleteProductConfirmModal } from "../components/DeleteProductConfirmModal";
import { QueryErrorAlert } from "../components/QueryErrorAlert";

const LIMIT = 10;

function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const {
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    productToDelete,
    handleDeleteClick,
    handleDeleteConfirm,
    isPending: deleteIsPending,
    error: deleteError,
  } = useDeleteProduct(id ?? undefined);

  const params: ProductListParams = useMemo(
    () => ({ limit: LIMIT, offset: page * LIMIT }),
    [page]
  );

  const { data: store, isLoading: storeLoading, isError: storeError, error: storeErr, refetch: refetchStore } = useQuery({
    queryKey: ["store", id],
    queryFn: () => api.stores.get(id!),
    enabled: !!id,
  });

  const { data: summary } = useQuery({
    queryKey: ["store-summary", id],
    queryFn: () => api.stores.summary(id!),
    enabled: !!id,
  });

  const { data: productsData, isLoading: productsLoading, isError: productsError, error: productsErr, refetch: refetchProducts } = useQuery({
    queryKey: ["store-products", id, params],
    queryFn: () => api.stores.products(id!, params),
    enabled: !!id,
  });

  if (!id) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-gray-700">Invalid store ID.</p>
        <Link to="/stores" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline">
          Back to stores
        </Link>
      </div>
    );
  }

  if (storeLoading || !store) {
    if (storeError && storeErr) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <QueryErrorAlert
            title="Error loading store"
            error={storeErr}
            onRetry={() => refetchStore()}
          />
          <Link to="/stores" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
            ← Back to stores
          </Link>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-12 text-gray-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" aria-hidden />
        <span>Loading store…</span>
      </div>
    );
  }

  const totalPages = productsData ? Math.ceil(productsData.total / LIMIT) : 0;

  return (
    <div>
      <div className="mb-4">
        <Link to="/stores" className="text-sm font-medium text-blue-600 hover:underline">
          ← Stores
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">{store.name}</h1>

      {summary && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Summary</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Total products</p>
              <p className="text-xl font-semibold text-gray-900">{summary.totalProducts}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Inventory value</p>
              <p className="text-xl font-semibold text-gray-900">
                ${summary.totalInventoryValue.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Low stock (≤{summary.lowStockThreshold})</p>
              <p className="text-xl font-semibold text-gray-900">{summary.lowStockCount}</p>
            </div>
          </div>
          {summary.byCategory.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase text-gray-500">By category</p>
              <table className="w-full max-w-md border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="py-1.5 font-medium text-gray-700">Category</th>
                    <th className="py-1.5 font-medium text-gray-700">Products</th>
                    <th className="py-1.5 font-medium text-gray-700">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.byCategory.map((row) => (
                    <tr key={row.category} className="border-b border-gray-100">
                      <td className="py-1.5 text-gray-900">{row.category}</td>
                      <td className="py-1.5 text-gray-600">{row.productCount}</td>
                      <td className="py-1.5 text-gray-600">${row.totalValue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <h2 className="mb-3 text-lg font-semibold text-gray-900">Products</h2>
      {productsError && productsErr && (
        <QueryErrorAlert
          title="Failed to load products"
          error={productsErr}
          onRetry={() => refetchProducts()}
          className="mb-4"
        />
      )}
      {productsLoading && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-8 text-sm text-gray-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" aria-hidden />
          Loading products…
        </div>
      )}
      {!productsLoading && !productsError && productsData && (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            {productsData.items.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">No products in this store.</div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productsData.items.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">${p.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.quantityInStock}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(p);
                              setEditModalOpen(true);
                            }}
                            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            aria-label="Edit product"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(p)}
                            className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-600"
                            aria-label="Delete product"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page + 1} of {totalPages} ({productsData.total} total)
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      <ProductModal
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setEditingProduct(null);
        }}
        mode="edit"
        product={editingProduct ?? undefined}
      />
      <DeleteProductConfirmModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        product={productToDelete}
        onConfirm={handleDeleteConfirm}
        isPending={deleteIsPending}
        error={deleteError}
      />
    </div>
  );
}

export { StoreDetailPage };
export default StoreDetailPage;
