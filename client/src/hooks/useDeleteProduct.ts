import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Product } from "../api/types";

export function useDeleteProduct(storeId?: string) {
  const queryClient = useQueryClient();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => api.products.delete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: ["store-products", storeId] });
        queryClient.invalidateQueries({ queryKey: ["store-summary", storeId] });
      }
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    },
  });

  const handleDeleteClick = useCallback((product: Product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(
    (productId: string) => {
      deleteMutation.mutate(productId);
    },
    [deleteMutation]
  );

  const setDeleteConfirmOpenWithClear = useCallback((open: boolean) => {
    setDeleteConfirmOpen(open);
    if (!open) {
      setProductToDelete(null);
      deleteMutation.reset();
    }
  }, [deleteMutation]);

  return {
    deleteConfirmOpen,
    setDeleteConfirmOpen: setDeleteConfirmOpenWithClear,
    productToDelete,
    handleDeleteClick,
    handleDeleteConfirm,
    isPending: deleteMutation.isPending,
    error: deleteMutation.error,
    reset: deleteMutation.reset,
  };
}
