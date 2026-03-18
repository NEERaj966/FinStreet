import fs from "fs/promises";
import path from "path";

const [, , rawTargetPath, rawDelayMs] = process.argv;

const safeDelayMs = Number(rawDelayMs);

const wait = (delayMs) =>
  new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

const isAllowedGeneratedFile = (targetPath) => {
  const normalizedPath = path.normalize(targetPath).toLowerCase();
  const importsDirectory = path
    .resolve(process.cwd(), "public", "imports")
    .toLowerCase();

  return (
    normalizedPath.startsWith(importsDirectory) &&
    [".json", ".csv", ".pdf"].includes(path.extname(normalizedPath))
  );
};

const main = async () => {
  if (!rawTargetPath || !Number.isFinite(safeDelayMs) || safeDelayMs < 0) {
    process.exit(0);
  }

  const targetPath = path.resolve(rawTargetPath);
  if (!isAllowedGeneratedFile(targetPath)) {
    process.exit(0);
  }

  await wait(safeDelayMs);

  try {
    await fs.unlink(targetPath);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
};

main().catch(() => {
  process.exit(0);
});
