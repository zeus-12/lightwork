import { Request } from "express";

const ALLOWED_DOMAINS = ["http://localhost:3000"];
export const PORT = process.env.PORT;

export const corsOptionsDelegate = function (req: Request, callback: any) {
  let corsOptions;
  if (ALLOWED_DOMAINS.indexOf(req.header("Origin") as string) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};
