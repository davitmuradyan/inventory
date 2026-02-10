import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "../components/icons";
import { StoreModal } from "../components/StoreModal";
import { QueryErrorAlert } from "../components/QueryErrorAlert";

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50];

function StoreListPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { data: stores, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["stores"],
    queryFn: () => api.stores.list(),
  });

  const filtered = useMemo(
    () =>
      (stores ?? []).filter((s) =>
        search.trim()
          ? s.name.toLowerCase().includes(search.trim().toLowerCase())
          : true
      ),
    [stores, search]
  );

  const total = filtered.length;
  const totalPages = useMemo(
    () => Math.ceil(total / rowsPerPage) || 1,
    [total, rowsPerPage]
  );
  const start = page * rowsPerPage;
  const items = useMemo(
    () => filtered.slice(start, start + rowsPerPage),
    [filtered, start, rowsPerPage]
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Manage Stores</h1>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            ADD NEW STORE
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
            placeholder="Search stores"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" aria-hidden />
          <span>Loading stores…</span>
        </div>
      )}

      {isError && error && (
        <QueryErrorAlert
          title="Error loading stores"
          error={error}
          onRetry={() => refetch()}
          className="mx-5 my-8 sm:mx-6"
        />
      )}

      {!isLoading && !isError && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="px-4 py-3 font-medium text-gray-700">
                    <span className="inline-flex items-center gap-0.5">Store name</span>
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">Created</th>
                  <th className="w-24 px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-gray-500">
                      No stores found.
                    </td>
                  </tr>
                ) : (
                  items.map((store) => (
                    <tr key={store.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-900">{store.name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(store.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/stores/${store.id}`}
                          className="text-sm font-medium text-gray-900 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {total > 0 && (
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
              <div className="text-sm text-gray-600">
                {total === 0
                  ? "0 of 0"
                  : `${start + 1}-${Math.min(start + items.length, total)} of ${total}`}
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
          )}
        </>
      )}
      <StoreModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </div>
  );
}

export { StoreListPage };
export default StoreListPage;
