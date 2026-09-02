import { z } from "zod";

/** Bulk page's per-line schema — same shape as the single dialog's line schema plus a `productId` (the dialog gets its product from context; a bulk line picks one per row). */
export interface BulkStockAdjustmentFormMessages {
  productRequired: string;
  locationRequired: string;
  quantityRequired: string;
  reasonRequired: string;
  noteRequiredForOther: string;
  itemsMinOne: string;
}

function createLineSchema(messages: BulkStockAdjustmentFormMessages) {
  return z
    .object({
      productId: z.string().min(1, { error: messages.productRequired }),
      locationId: z.string().min(1, { error: messages.locationRequired }),
      mode: z.enum(["newQuantity", "changeQuantity"]),
      newQuantity: z.string(),
      changeQuantity: z.string(),
      reason: z.string().min(1, { error: messages.reasonRequired }),
      note: z.string().max(2000).optional().or(z.literal("")),
    })
    .superRefine((values, ctx) => {
      const quantityField = values.mode === "newQuantity" ? "newQuantity" : "changeQuantity";
      const raw = values[quantityField];
      if (raw.trim() === "" || Number.isNaN(Number(raw))) {
        ctx.addIssue({ code: "custom", path: [quantityField], message: messages.quantityRequired });
      }
      if (values.reason === "OTHER" && (!values.note || values.note.trim() === "")) {
        ctx.addIssue({ code: "custom", path: ["note"], message: messages.noteRequiredForOther });
      }
    });
}

export function createBulkStockAdjustmentSchema(messages: BulkStockAdjustmentFormMessages) {
  return z.object({
    items: z.array(createLineSchema(messages)).min(1, { error: messages.itemsMinOne }),
  });
}

export type BulkStockAdjustmentFormValues = z.infer<ReturnType<typeof createBulkStockAdjustmentSchema>>;
export type BulkStockAdjustmentLineValues = BulkStockAdjustmentFormValues["items"][number];
