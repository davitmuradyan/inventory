import { memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as Dialog from "@radix-ui/react-dialog";
import * as Label from "@radix-ui/react-label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "../api/client";

const storeSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Max 200 characters"),
});

type StoreForm = z.infer<typeof storeSchema>;

const inputClass =
  "h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:border-gray-400";

interface StoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function StoreModalInner({ open, onOpenChange }: StoreModalProps) {
  const queryClient = useQueryClient();

  const form = useForm<StoreForm>({
    resolver: zodResolver(storeSchema),
    defaultValues: { name: "" },
    mode: "onSubmit",
  });

  const createMutation = useMutation({
    mutationFn: (body: StoreForm) => api.stores.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      onOpenChange(false);
    },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset({ name: "" });
    }
    onOpenChange(next);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Dialog.Title className="text-lg font-semibold text-gray-900">Add store</Dialog.Title>
          <Dialog.Description className="sr-only">Add store form</Dialog.Description>

          <form
            onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
            className="mt-4 space-y-4"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <Label.Root htmlFor="store-name" className="text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </Label.Root>
              <input
                id="store-name"
                className={inputClass}
                placeholder="Enter store name"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>
            {createMutation.error && (
              <p className="text-sm text-red-600">
                {getErrorMessage(createMutation.error)}
              </p>
            )}
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
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-70"
              >
                {createMutation.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const StoreModal = memo(StoreModalInner);
