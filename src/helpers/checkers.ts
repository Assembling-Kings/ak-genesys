// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isSimpleObject(entity: any): entity is object {
   if (typeof entity !== "object" || entity === null) {
      return false;
   }
   const objPrototype = Object.getPrototypeOf(entity);
   return objPrototype === null || objPrototype === Object.prototype;
}