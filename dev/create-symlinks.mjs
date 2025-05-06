import { access, mkdir, lstat, unlink, symlink } from "fs/promises";
import path from "path";
import { createInterface } from "readline/promises";
import { stdin, stdout } from "process";

const SYMLINK_FOLDER = "foundry";
const SYMLINK_PAIRS = [
   { target: ["client"], source: ["client"] },
   { target: ["common"], source: ["common"] },
   { target: ["tsconfig.json"], source: ["tsconfig.json"] },
   { target: ["lang"], source: ["public", "lang"] },
];

const readLine = createInterface({
   input: stdin,
   output: stdout,
});

let foundryRoot = await readLine.question("Provide the full path to the FoundryVTT install folder: ");
readLine.close();
console.log("");

// Confirm that the provided path exists.
try {
   // Some of the installs are currently nested.
   foundryRoot = await access(path.join(foundryRoot, "resources", "app"));
} catch {
   await access(foundryRoot);
}

if (!(await lstat(foundryRoot)).isDirectory()) {
   throw new Error("The provided path doesn't point to a directory.");
}

try {
   await access(SYMLINK_FOLDER);
   if (!(await lstat(SYMLINK_FOLDER)).isDirectory()) {
      throw new Error(
         "A file named `foundry` already exists inside the working directory. "
         + "Please remove it in order to create the necessary folder.",
      );
   }
} catch {
   await mkdir(SYMLINK_FOLDER);
}

for (const targetNestedPath of SYMLINK_PAIRS) {
   const sourcePath = path.join(foundryRoot, ...targetNestedPath.source);
   const targetPath = path.join(SYMLINK_FOLDER, ...targetNestedPath.target);

   let linkStats = null;
   try {
      linkStats = await lstat(targetPath);
   } catch {
      // The link doesn't exist, which is an acceptable state.
   }

   if (linkStats) {
      if (linkStats.isSymbolicLink()) {
         // Allow creating new symlinks in case the script is ran to point to a new path.
         await unlink(targetPath);
      } else {
         throw new Error(
            `The path "${targetPath}" already exists and is not a symlink.`
            + "Please remove it in order to create the necessary link.",
         );
      }
   }

   const originStats = await lstat(sourcePath);

   console.log(`Creating symlink at "${targetPath}" pointing to "${sourcePath}"...`);
   try {
      await symlink(sourcePath, targetPath, originStats.isDirectory() ? "dir" : "file");
   } catch (exception) {
      if (exception.code === "EPERM") {
         throw new Error("The script needs elevated privilages to create symlinks.");
      } else {
         throw exception;
      }
   }
}
