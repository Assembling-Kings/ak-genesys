/**
 * The Vite dev server requires that all the files it's supposed to serve exist, so we create a dummy file that imports
 * the source code. Note that this file is not copied during the production build since Vite will make a compiled
 * bundle with the same name.
 * For more info see: https://foundryvtt.wiki/en/development/guides/vite
 */
window.global = window;
import "./src/Genesys.ts";
