import * as yup from "yup";


export const variationSchema = yup.object({
  name: yup.string().required(),
  status: yup
    .boolean()
    .transform((val, originalVal) => {
      if (originalVal === "yes") return true;
      if (originalVal === "no") return false;
      return val;
    })
    .required(),
});
