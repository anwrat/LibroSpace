import { z } from "zod";
import type{ Request, Response, NextFunction } from "express";

export const validate =
  (schema: z.ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (err) {
        if(err instanceof z.ZodError){
            return res.status(400).json({
              message: "Validation error",
              errors: err.flatten(),
            });
        }
        return res.status(500).json({message:"Internal Server Error while validating"})
    }
  };
