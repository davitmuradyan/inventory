import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { ProductListParams } from "../api/types";
import type { Product } from "../api/types";
import {
  SearchIcon,
  FilterIcon,
  ChevronDownIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "../components/icons";
import { useDeleteProduct } from "../hooks/useDeleteProduct";
import { ProductModal } from "../components/ProductModal";
import { DeleteProductConfirmModal } from "../components/DeleteProductConfirmModal";
import { QueryErrorAlert } from "../components/QueryErrorAlert";

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50];
const LOW_STOCK_THRESHOLD = 10;

function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    priceMin: "",
    priceMax: "",
    stockMin: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [nameSort, setNameSort] = useState<"asc" | "desc" | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addModalOpen, setAddModalOpen] = useState(false);
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
  } = useDeleteProduct();

  const { data: editProduct } = useQuery({
    queryKey: ["product", editId],
    queryFn: () => api.products.get(editId!),
    enabled: Boolean(editId),
  });

  useEffect(() => {
    if (editId && editProduct) {
      setEditingProduct(editProduct);
      setEditModalOpen(true);
    }
  }, [editId, editProduct]);

  const handleEditModalOpenChange = useCallback(
    (open: boolean) => {
      setEditModalOpen(open);
      if (!open) {
        setEditingProduct(null);
        if (editId) {
          setSearchParams((prev) => {
            prev.delete("edit");
            return prev;
          });
        }
      }
    },
    [editId, setSearchParams]
  );

  const params: ProductListParams = useMemo(
    () => ({
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      ...(filters.priceMin !== "" && !Number.isNaN(Number(filters.priceMin)) && { priceMin: Number(filters.priceMin) }),
      ...(filters.priceMax !== "" && !Number.isNaN(Number(filters.priceMax)) && { priceMax: Number(filters.priceMax) }),
      ...(filters.stockMin !== "" && !Number.isNaN(Number(filters.stockMin)) && { stockMin: Number(filters.stockMin) }),
    }),
    [rowsPerPage, page, filters]
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["products", params],
    queryFn: () => api.products.list(params),
  });

  const items = useMemo(() => {
    let list = data?.items ?? [];
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s)
      );
    }
    if (nameSort) {
      list = [...list].sort((a, b) => {
        const c = a.name.localeCompare(b.name);
        return nameSort === "asc" ? c : -c;
      });
    }
    return list;
  }, [data?.items, search, nameSort]);

  const total = data?.total ?? 0;
  const totalPages = useMemo(
    () => Math.ceil(total / rowsPerPage) || 1,
    [total, rowsPerPage]
  );
  const hasFilters = useMemo(
    () =>
      filters.priceMin !== "" ||
      filters.priceMax !== "" ||
      filters.stockMin !== "",
    [filters]
  );

  const setFilter = useCallback((key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  }, []);

  const clearFilter = useCallback((key: keyof typeof filters | "price") => {
    setFilters((prev) => {
      const next = { ...prev };
      if (key === "stockMin") next.stockMin = "";
      if (key === "priceMin") next.priceMin = "";
      if (key === "priceMax") next.priceMax = "";
      if (key === "price") {
        next.priceMin = "";
        next.priceMax = "";
      }
      return next;
    });
    setPage(0);
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === items.length) return new Set<string>();
      return new Set(items.map((p) => p.id));
    });
  }, [items]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const statusLabel = useCallback(
    (qty: number) => (qty <= LOW_STOCK_THRESHOLD ? "Low stock" : "Active"),
    []
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Manage Products</h1>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            ADD NEW PRODUCT
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon className="h-5 w-5" />
          </span>
          <input
            type="search"
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-gray-400">
            <FilterIcon className="h-4 w-4" />
          </span>
          {hasFilters && (
            <>
              {(filters.priceMin !== "" || filters.priceMax !== "") && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">
                  Price
                  <button
                    type="button"
                    onClick={() => clearFilter("price")}
                    className="ml-0.5 hover:opacity-80"
                    aria-label="Remove price filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.stockMin !== "" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">
                  Stock ≥ {filters.stockMin}
                  <button
                    type="button"
                    onClick={() => clearFilter("stockMin")}
                    className="ml-0.5 hover:opacity-80"
                    aria-label="Remove stock filter"
                  >
                    ×
                  </button>
                </span>
              )}
            </>
          )}
          <select
            value={filters.stockMin}
            onChange={(e) => setFilter("stockMin", e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
          >
            <option value="">Quantity</option>
            <option value="0">Any</option>
            <option value="1">1+</option>
            <option value="5">5+</option>
            <option value="10">10+</option>
          </select>
          <select
            value={filters.priceMin && filters.priceMax ? `${filters.priceMin}-${filters.priceMax}` : ""}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) {
                setFilters((prev) => ({ ...prev, priceMin: "", priceMax: "" }));
              } else {
                const [min, max] = v.split("-").map(Number);
                setFilters((prev) => ({ ...prev, priceMin: String(min), priceMax: String(max) }));
              }
              setPage(0);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
          >
            <option value="">Price</option>
            <option value="0-25">$0 – $25</option>
            <option value="25-50">$25 – $50</option>
            <option value="50-100">$50 – $100</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" aria-hidden />
          <span>Loading products…</span>
        </div>
      )}

      {isError && error && (
        <QueryErrorAlert
          title="Error loading products"
          error={error}
          onRetry={() => refetch()}
          className="mx-5 my-8 sm:mx-6"
        />
      )}

      {!isLoading && !isError && data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && selectedIds.size === items.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
                    />
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    <button
                      type="button"
                      onClick={() => setNameSort(nameSort === "asc" ? "desc" : "asc")}
                      className="inline-flex items-center gap-0.5 hover:text-gray-900"
                    >
                      Product name
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform ${nameSort === "desc" ? "rotate-180" : ""}`}
                      />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">Category</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Quantity</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Price</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Status</th>
                  <th className="w-24 px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      No products match your filters.
                    </td>
                  </tr>
                ) : (
                  items.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{p.name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.category}</td>
                      <td className="px-4 py-3 text-gray-600">{p.quantityInStock}</td>
                      <td className="px-4 py-3 text-gray-600">${p.price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            p.quantityInStock <= LOW_STOCK_THRESHOLD
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {statusLabel(p.quantityInStock)}
                        </span>
                      </td>
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
                            className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            aria-label="Delete product"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row sm:px-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Rows per page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(0);
                }}
                className="rounded border border-gray-200 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
              >
                {ROWS_PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              {total === 0
                ? "0 of 0"
                : `${page * rowsPerPage + 1}-${page * rowsPerPage + items.length} of ${total}`}
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
                aria-label="First page"
              >
                <ChevronsLeftIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p: number;
                if (totalPages <= 5) p = i;
                else if (page < 3) p = i;
                else if (page >= totalPages - 2) p = totalPages - 5 + i;
                else p = page - 2 + i;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`min-w-[2rem] rounded py-1.5 text-sm font-medium ${
                      p === page ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {p + 1}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
                aria-label="Last page"
              >
                <ChevronsRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      <ProductModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        mode="add"
      />
      <ProductModal
        open={editModalOpen}
        onOpenChange={handleEditModalOpenChange}
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

export { ProductListPage };
export default ProductListPage;
