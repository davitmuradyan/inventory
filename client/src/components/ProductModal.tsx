import { memo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as Dialog from "@radix-ui/react-dialog";
import * as Label from "@radix-ui/react-label";
import * as Select from "@radix-ui/react-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDownIcon } from "./icons";
import { api, getErrorMessage } from "../api/client";
import type { Product } from "../api/types";

const addProductSchema = z.object({
  storeId: z.string().min(1, "Store is required"),
  name: z.string().min(1, "Name is required").max(200, "Max 200 characters"),
  category: z.string().min(1, "Category is required").max(100, "Max 100 characters"),
  price: z
    .union([z.string(), z.number()])
    .refine(
      (v) => v !== "" && v !== undefined && v !== null && !Number.isNaN(Number(v)),
      "Price is required"
    )
    .transform((v) => (typeof v === "string" ? parseFloat(v) : v))
    .pipe(z.number().positive("Price must be positive")),
  quantityInStock: z
    .union([z.string(), z.number()])
    .refine(
      (v) => v !== "" && v !== undefined && v !== null && !Number.isNaN(Number(v)),
      "Quantity is required"
    )
    .transform((v) => (typeof v === "string" ? parseInt(String(v), 10) : v))
    .pipe(z.number().int().min(0, "Quantity cannot be negative")),
});

const editProductSchema = addProductSchema.omit({ storeId: true });

type AddProductForm = z.infer<typeof addProductSchema>;
type EditProductForm = z.infer<typeof editProductSchema>;

const inputClass =
  "h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:border-gray-400";

const ADD_FORM_DEFAULTS = {
  storeId: "",
  name: "",
  category: "",
  price: "" as unknown as number,
  quantityInStock: "" as unknown as number,
};

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  product?: Product | null;
}

function ProductModalInner({ open, onOpenChange, mode, product }: ProductModalProps) {
  const queryClient = useQueryClient();

  const { data: stores } = useQuery({
    queryKey: ["stores"],
    queryFn: () => api.stores.list(),
    enabled: open && mode === "add",
  });

  const createMutation = useMutation({
    mutationFn: (body: AddProductForm) => api.products.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: EditProductForm) => api.products.update(product!.id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onOpenChange(false);
    },
  });

  const addForm = useForm<AddProductForm>({
    resolver: zodResolver(addProductSchema),
    defaultValues: ADD_FORM_DEFAULTS,
    mode: "onSubmit",
  });

  const editForm = useForm<EditProductForm>({
    resolver: zodResolver(editProductSchema),
    mode: "onSubmit",
    values: product
      ? {
          name: product.name,
          category: product.category,
          price: product.price,
          quantityInStock: product.quantityInStock,
        }
      : undefined,
  });

  const onAddSubmit = (data: AddProductForm) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: EditProductForm) => {
    updateMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const title = mode === "add" ? "Add product" : "Edit product";

  const handleOpenChange = (next: boolean) => {
    if (!next && mode === "add") {
      addForm.reset(ADD_FORM_DEFAULTS);
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
          <Dialog.Title className="text-lg font-semibold text-gray-900">{title}</Dialog.Title>
          <Dialog.Description className="sr-only">{title} form</Dialog.Description>

          {mode === "add" && (
            <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="mt-4 space-y-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <Label.Root htmlFor="storeId" className="text-sm font-medium text-gray-700">
                  Store <span className="text-red-500">*</span>
                </Label.Root>
                <Controller
                  name="storeId"
                  control={addForm.control}
                  render={({ field }) => (
                    <Select.Root
                      value={field.value || undefined}
                      onValueChange={(v) => field.onChange(v ?? "")}
                    >
                      <Select.Trigger
                        id="storeId"
                        className={`${inputClass} w-full flex items-center justify-between [&>span]:text-left`}
                      >
                        <Select.Value placeholder="Select store" />
                        <Select.Icon className="shrink-0 text-gray-500">
                          <ChevronDownIcon className="h-4 w-4" />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content
                          className="z-[100] w-[398px] rounded-md border border-gray-200 bg-white shadow-lg"
                          position="popper"
                          sideOffset={4}
                        >
                          <Select.Viewport>
                            {stores?.map((s) => (
                              <Select.Item
                                key={s.id}
                                value={s.id}
                                className="relative flex w-full cursor-pointer select-none items-center rounded py-2 pl-3 pr-9 text-sm outline-none data-[highlighted]:bg-gray-100 data-[state=checked]:bg-gray-100"
                              >
                                <Select.ItemText className="flex-1">{s.name}</Select.ItemText>
                                <Select.ItemIndicator className="absolute right-3 inline-flex items-center text-gray-600">
                                  ✓
                                </Select.ItemIndicator>
                              </Select.Item>
                            ))}
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  )}
                />
                {addForm.formState.errors.storeId && (
                  <p className="text-sm text-red-600">{addForm.formState.errors.storeId.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root htmlFor="add-name" className="text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </Label.Root>
                <input
                  id="add-name"
                  className={inputClass}
                  placeholder="Enter product name"
                  {...addForm.register("name")}
                />
                {addForm.formState.errors.name && (
                  <p className="text-sm text-red-600">{addForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root htmlFor="add-category" className="text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </Label.Root>
                <input
                  id="add-category"
                  className={inputClass}
                  placeholder="Enter category"
                  {...addForm.register("category")}
                />
                {addForm.formState.errors.category && (
                  <p className="text-sm text-red-600">{addForm.formState.errors.category.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root htmlFor="add-price" className="text-sm font-medium text-gray-700">
                  Price <span className="text-red-500">*</span>
                </Label.Root>
                <input
                  id="add-price"
                  type="text"
                  inputMode="decimal"
                  className={inputClass}
                  placeholder="0.01"
                  {...addForm.register("price")}
                />
                {addForm.formState.errors.price && (
                  <p className="text-sm text-red-600">{addForm.formState.errors.price.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root htmlFor="add-qty" className="text-sm font-medium text-gray-700">
                  Quantity <span className="text-red-500">*</span>
                </Label.Root>
                <input
                  id="add-qty"
                  type="text"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="0"
                  {...addForm.register("quantityInStock")}
                />
                {addForm.formState.errors.quantityInStock && (
                  <p className="text-sm text-red-600">
                    {addForm.formState.errors.quantityInStock.message}
                  </p>
                )}
              </div>
              {error && (
                <p className="text-sm text-red-600">{getErrorMessage(error)}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Dialog.Close asChild>
                  <button type="button" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-70"
                >
                  {isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          )}

          {mode === "edit" && product && (
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="mt-4 space-y-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <Label.Root className="text-sm font-medium text-gray-700">Store</Label.Root>
                <p className="text-sm text-gray-500">Store cannot be changed</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root htmlFor="edit-name" className="text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </Label.Root>
                <input
                id="edit-name"
                className={inputClass}
                placeholder="Enter product name"
                {...editForm.register("name")}
              />
                {editForm.formState.errors.name && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root htmlFor="edit-category" className="text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </Label.Root>
                <input
                id="edit-category"
                className={inputClass}
                placeholder="Enter category"
                {...editForm.register("category")}
              />
                {editForm.formState.errors.category && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.category.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root htmlFor="edit-price" className="text-sm font-medium text-gray-700">
                  Price <span className="text-red-500">*</span>
                </Label.Root>
                <input
                  id="edit-price"
                  type="number"
                  step={0.01}
                  min={0.01}
                  className={inputClass}
                  placeholder="0.01"
                  {...editForm.register("price")}
                />
                {editForm.formState.errors.price && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.price.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label.Root htmlFor="edit-qty" className="text-sm font-medium text-gray-700">
                  Quantity <span className="text-red-500">*</span>
                </Label.Root>
                <input
                  id="edit-qty"
                  type="number"
                  min={0}
                  className={inputClass}
                  placeholder="0"
                  {...editForm.register("quantityInStock")}
                />
                {editForm.formState.errors.quantityInStock && (
                  <p className="text-sm text-red-600">
                    {editForm.formState.errors.quantityInStock.message}
                  </p>
                )}
              </div>
              {error && (
                <p className="text-sm text-red-600">{getErrorMessage(error)}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Dialog.Close asChild>
                  <button type="button" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-70"
                >
                  {isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const ProductModal = memo(ProductModalInner);
