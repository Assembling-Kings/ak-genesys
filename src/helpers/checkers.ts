/**
 * A type guard function that checks if the passed value is a plain object.
 * @param value Any value that we want to confirm is a plain object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isSimpleObject(value: any): value is object {
   if (typeof value !== "object" || value === null) {
      return false;
   }
   const objPrototype = Object.getPrototypeOf(value);
   return objPrototype === null || objPrototype === Object.prototype;
}
