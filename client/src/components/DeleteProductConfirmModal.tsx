import { memo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { Product } from "../api/types";
import { getErrorMessage } from "../api/client";

interface DeleteProductConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onConfirm: (productId: string) => void;
  isPending: boolean;
  error?: unknown;
}

function DeleteProductConfirmModalInner({
  open,
  onOpenChange,
  product,
  onConfirm,
  isPending,
  error,
}: DeleteProductConfirmModalProps) {
  const handleConfirm = () => {
    if (product) onConfirm(product.id);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Dialog.Title className="text-lg font-semibold text-gray-900">Delete product</Dialog.Title>
          <Dialog.Description className="mt-4 text-sm text-gray-600">
            Are you sure you want to delete this product? This cannot be undone.
          </Dialog.Description>
          {error ? (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {getErrorMessage(error)}
            </p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70"
            >
              {isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const DeleteProductConfirmModal = memo(DeleteProductConfirmModalInner);
