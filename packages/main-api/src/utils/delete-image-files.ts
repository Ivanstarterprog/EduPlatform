import { existsSync, unlinkSync } from "fs";
import { join, resolve } from "path";

const root = resolve(__dirname, "..", "..", "..", "..");

export function deleteImageFiles(filename: string): void {
  const original = join(root, "uploads", "original", filename);
  const processed = join(root, "uploads", "processed", filename);

  if (existsSync(original)) unlinkSync(original);
  if (existsSync(processed)) unlinkSync(processed);
}
