import * as yup from "yup";

export const createUserSchema = yup.object({
//   body: yup.object({
    name: yup.string().min(2, "Name must be at least 2 characters").required(),
    email: yup.string().email("Invalid email").required(),
    password: yup.string().min(6, "Password must be at least 6 characters").required(),     
//   }),
});



export const loginUserSchema = yup.object({
  email: yup.string().email("Invalid email").required(),
  password: yup.string().required("Password is required"),
});