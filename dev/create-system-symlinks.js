import { access, lstat, rm, unlink, symlink } from "fs/promises";
import path from "path";
import { createInterface } from "readline/promises";
import { stdin, stdout } from "process";

const SYMLINK_FOLDER = "static";
const SYMLINK_PAIRS = [
   { target: ["tplt"], source: ["tplt"] },
];

const readLine = createInterface({
   input: stdin,
   output: stdout,
});

console.log(
   "The script that is about to run will create symbolic links between your working directory and some directories "
   + "under the system's installation. This will allow the developer to take advantage of the HMR setup that's in "
   + "place. Notice that some directories/files might be deleted on the system's installation directory as part of "
   + "this script, so make sure you're providing the correct path.\n",
);
let systemRoot = await readLine.question(
   "Provide the full path to the system's directory that'll be used for development: ",
);
readLine.close();
console.log("");

if (!systemRoot.endsWith("ak-genesys")) {
   throw new Error("The provided path doesn't point to the system's directory.");
}

await access(systemRoot);
if (!(await lstat(systemRoot)).isDirectory()) {
   throw new Error("The provided path doesn't point to a directory.");
}

try {
   const sourcePathsToCheck = [
      SYMLINK_FOLDER, ...SYMLINK_PAIRS.map((pair) => path.join(SYMLINK_FOLDER, ...pair.source)),
   ];
   for (const targetSourcePath of sourcePathsToCheck) {
      await access(targetSourcePath);
      if (!(await lstat(SYMLINK_FOLDER)).isDirectory()) {
         throw new Error(
            `The path "${targetSourcePath}" points to a file instead of a directory.`,
         );
      }
   }
} catch {
   throw new Error(
      `The "${SYMLINK_FOLDER}" directory doesn't exist or doesn't have the proper structure. `
      + "Make sure to run the build process at least once before running this script.",
   );
}

for (const targetNestedPath of SYMLINK_PAIRS) {
   const sourcePath = path.resolve(SYMLINK_FOLDER, ...targetNestedPath.source);
   const targetPath = path.resolve(systemRoot, ...targetNestedPath.target);

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
         await rm(targetPath, { recursive: true, force: true });
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

console.log("The script finished successfully!");
