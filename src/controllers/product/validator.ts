import * as yup from "yup";

export const productSchema = yup.object({
  name: yup
    .string()
    .required("Product name is required")
    .max(100, "Name cannot exceed 100 characters"),

  gst: yup
    .number()
    .typeError("GST must be a valid number")
    .min(0, "GST cannot be negative")
    .max(100, "GST cannot exceed 100%")
    .required("GST is required")
    .transform((value, originalValue) => {
      if (typeof originalValue === "string") {
        const parsed = parseFloat(originalValue);
        return isNaN(parsed) ? undefined : parsed;
      }
      return value;
    }),

  hsn: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return null;
      const parsed = parseInt(originalValue);
      return isNaN(parsed) ? undefined : parsed;
    }),

  isActive: yup
    .boolean()
    .transform((value, originalValue) => {
      if (["yes", "1", 1].includes(originalValue)) return true;
      if (["no", "0", 0].includes(originalValue)) return false;
      return value;
    })
    .required("isActive field is required"),
    variants: yup.array().of(
      yup.object({
        variationId: yup
          .number()
          .typeError("Variation ID must be a valid number")
          .required("Variation ID is required"),
        price: yup
          .number()
          .typeError("Price must be a valid number")
          .min(0, "Price cannot be negative")
          .required("Price is required"),
        productQrCode: yup.string().nullable(),
        boxQuantity: yup
          .number()
          .typeError("Box Quantity must be a valid number") 
          .min(0, "Box Quantity cannot be negative")
          .nullable(),
        boxQrCode: yup.string().nullable(),
        stockInHand: yup
          .number()
          .typeError("Stock In Hand must be a valid number")
          .min(0, "Stock In Hand cannot be negative")
          .nullable(),
      })
    ),
});
