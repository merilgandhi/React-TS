import * as yup from "yup";

export const sellerSchema = yup.object({
  name: yup
    .string()
    .required("Seller name is required")
    .max(100, "Name cannot exceed 100 characters"),

  email: yup.string().email("Invalid email format").nullable(),

  contactNumber: yup
    .string()
    .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),

  isActive: yup
    .mixed()
    .transform((v) => {
      if (typeof v === "boolean") return v;
      if (typeof v === "string") {
        if (v.toLowerCase() === "yes") return true;
        if (v.toLowerCase() === "no") return false;
      }
      return undefined; // force validation error
    })
    .required("isActive is required"),
});
