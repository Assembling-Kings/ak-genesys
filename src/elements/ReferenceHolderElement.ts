import { isSimpleObject } from "@/helpers/checkers";
import { type DragTransferData } from "@/types/DragData";
import { $CONST } from "@/values/ValuesConst";

type ReferenceDetails = { type: string; img: string };
type NameReference
   = Nullable<Map<string | symbol, ReferenceDetails | string> | Map<"name" | "type" | "img" | symbol, string>>;

/**
 * A custom element primordially used to handle references by name. The element can handle any number of references but
 * has special behavior when the "max" is set to `1`. Additionally, if only a single type is allowed then the data
 * being passed to some methods might forego explicitly passing the type.
 */
export class ReferenceHolderElement extends foundry.applications.elements.AbstractFormInputElement<NameReference> {
   static tagName = "reference-holder";
   static observedAttributes = super.observedAttributes.concat([
      "value", "types", "max", "drop-placeholder", "empty-placeholder", "readonly",
   ]);

   // The "types" attribute accepts alphanumeric type names separated by any other character.
   static #typesDelimiterSplitPattern = /\W+/;
   static #typesDelimiter = " ";

   #value: Record<string, ReferenceDetails> = {};
   #messageArea?: HTMLDivElement;
   #referencesArea?: HTMLDivElement;

   constructor() {
      super();
   }

   /* The "types" attribute is kept as the source of truth for the allowed types. */
   get types() {
      return ReferenceHolderElement.#getTypesFromString(this.getAttribute("types"));
   }

   set types(newTypes) {
      if (Array.isArray(newTypes) && newTypes.length) {
         this.setAttribute("types", newTypes.flatMap((aType) => ReferenceHolderElement.#getTypesFromString(aType))
            .filter(Boolean).join(ReferenceHolderElement.#typesDelimiter));
      } else {
         this.removeAttribute("types");
      }
   }

   /* The "max" attribute is kept as the source of truth for the maximum number of allowed references. */
   get max() {
      return ReferenceHolderElement.#getMaxFromString(this.getAttribute("max"));
   }

   set max(newMax) {
      if (Number.isInteger(newMax) && newMax! > 0) {
         this.setAttribute("max", newMax!.toString());
      } else {
         this.removeAttribute("max");
      }
   }

   /* The "drop-placeholder" attribute is kept as the source of truth for the placeholder text of the message area when
    * it's being used as the drop area.
   */
   get dropPlaceholder() {
      return this.getAttribute("drop-placeholder");
   }

   set dropPlaceholder(newPlaceholder) {
      if (newPlaceholder) {
         this.setAttribute("drop-placeholder", newPlaceholder);
      } else {
         this.removeAttribute("drop-placeholder");
      }
   }

   /* The "empty-placeholder" attribute is kept as the source of truth for the placeholder text of the message area
    * when it's not being used as the drop area and the element has no references.
   */
   get emptyPlaceholder() {
      return this.getAttribute("empty-placeholder");
   }

   set emptyPlaceholder(newPlaceholder) {
      if (newPlaceholder) {
         this.setAttribute("empty-placeholder", newPlaceholder);
      } else {
         this.removeAttribute("empty-placeholder");
      }
   }

   protected override _getValue() {
      // When the element has a max of `1` the returned reference is flattened map with the reference's data.
      if (this.max === 1) {
         const firstEntry = Object.entries(this.#value)[0] as Optional<[string, ReferenceDetails]>;
         if (!firstEntry) { return null; }
         const [refName, refDetails] = firstEntry;
         if (!refName) { return null; }

         return new Map<string | symbol, string>([
            ["name", refName],
            ["img", refDetails.img],
            ["type", refDetails.type ?? this.types[0]],
            // Mark the returned value for special processing during form submission.
            [$CONST.SYSTEM.marker, ReferenceHolderElement.tagName],
         ]);
      }

      // If the max is not equal to `1` then clone the sanitized internal value.
      const valueEntries = Object.entries(foundry.utils.deepClone(this.#value));
      if (!valueEntries.length) { return null; }

      const theValue = new Map<string | symbol, ReferenceDetails | string>(valueEntries);
      // Mark the returned value for special processing during form submission.
      theValue.set($CONST.SYSTEM.marker, ReferenceHolderElement.tagName);
      return theValue;
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   protected override _setValue(value: any) {
      const theTypes = this.types;
      const newValue = ReferenceHolderElement.#cleanReferenceDetails(value, theTypes);
      if (newValue === null) {
         throw new Error("The provided value doesn't follow the proper structure or contains all the needed data.");
      }

      ReferenceHolderElement.#filterReferenceDetails(newValue, theTypes, this.max ?? Infinity);
      this.#value = newValue;
   }

   override attributeChangedCallback(attrName: string, _oldValue: Nullable<string>, newValue: Nullable<string>) {
      let triggerChange = false;

      if (attrName === "value" && newValue !== null) {
         let finalValue: Nullable<Record<string, ReferenceDetails>> = null;

         // Parse the new value and try to set it.
         if (newValue.trim() !== "") {
            try {
               finalValue = JSON.parse(newValue);
            } catch { /* Noop */ }
         }
         this._setValue(finalValue);
         triggerChange = true;
      } else if (attrName === "types" && newValue) {
         const newTypes = ReferenceHolderElement.#getTypesFromString(newValue);

         // Purge any reference that doesn't match any of the new types.
         if (newTypes.length) {
            const valueEntries = Object.entries(this.#value);
            for (const [refName, refDetails] of valueEntries) {
               if (!newTypes.includes(refDetails.type ?? "")) {
                  delete this.#value[refName];
                  triggerChange = true;
               }
            }
         }
      } else if (attrName === "max" && newValue) {
         const newMax = ReferenceHolderElement.#getMaxFromString(newValue);
         if (!newMax) { return; }

         // Purge any reference over the new max. References are removed in reverse insetion order.
         const valueKeys = Object.keys(this.#value);
         if (valueKeys.length > newMax) {
            for (let k = valueKeys.length - 1; k >= newMax; k--) {
               delete this.#value[valueKeys[k]];
            }
            triggerChange = true;
         }
      } else if (attrName === "drop-placeholder" && newValue && this.editable) {
         this.#messageArea?.replaceChildren(newValue);
      } else if (attrName === "empty-placeholder" && newValue && !this.editable) {
         this.#messageArea?.replaceChildren(newValue);
      } else if (attrName === "readonly" && this.abortSignal) {
         this._refresh();
      }

      // Only send a change event if the attribute was changed after the element has been rendered at least once.
      if (triggerChange && this.abortSignal) {
         this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
         this._refresh();
      }
   }

   protected override _buildElements() {
      this.removeAttribute("value");
      const totalRefs = Object.keys(this.#value).length;

      this.#messageArea = document.createElement("div");
      this.#messageArea.classList.add("message-area");

      if ((this.editable && totalRefs === this.max) || (!this.editable && totalRefs !== 0)) {
         // Hide the area if no more references can be added in non-readonly mode, or if there are references in
         // readonly mode.
         this.#messageArea.classList.add("concealed");
      } else {
         const placeholder = this.editable
            ? this.dropPlaceholder ?? game.i18n.localize("ELEMENTS.REFERENCE_HOLDER.drop")
            : this.emptyPlaceholder ?? game.i18n.localize("ELEMENTS.REFERENCE_HOLDER.empty");
         this.#messageArea.appendChild(document.createTextNode(placeholder));
      }

      this.#referencesArea = document.createElement("div");
      this.#referencesArea.className = "references-area";

      return [this.#messageArea, this.#referencesArea];
   }

   protected override _refresh() {
      this.#referencesArea?.replaceChildren(
         ...Object.entries(this.#value).map(([refName, refDetails]) =>
            ReferenceHolderElement.#buildReference(refName, refDetails, this.editable)));
   }

   static #buildReference(refName: string, refDetails: ReferenceDetails, editable: boolean) {
      const preview = document.createElement("img");
      preview.src = refDetails.img;

      const name = document.createElement("span");
      name.appendChild(document.createTextNode(refName));

      // Get the localized type name.
      let typeLabel = game.i18n.localize(`TYPES.Item.${refDetails.type}`);
      if (typeLabel === refDetails.type) {
         typeLabel = game.i18n.localize(`TYPES.Actor.${refDetails.type}`);
      }
      name.dataset.tooltipText = `${typeLabel}: ${refName}`;

      const reference = document.createElement("div");
      reference.appendChild(preview);
      reference.appendChild(name);

      // If the element is not in readonly mode then allow removing references.
      if (editable) {
         const remove = document.createElement("a");
         remove.className = "icon fa-solid fa-xmark";
         remove.dataset.tooltipText = game.i18n.localize("ELEMENTS.REFERENCE_HOLDER.remove");
         reference.appendChild(remove);
      }

      return reference;
   }

   protected override _activateListeners() {
      this.#messageArea?.addEventListener("drop", this.#onDrop.bind(this), { signal: this.abortSignal });
      this.#referencesArea?.addEventListener("click", this.#onRemove.bind(this), { signal: this.abortSignal });
   }

   #onDrop(event: DragEvent) {
      event.preventDefault();
      if (!this.editable) { return; }

      const theTypes = this.types;
      const dropData: Partial<DragTransferData>
         = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);

      const cleanedData = ReferenceHolderElement.#cleanReferenceDetails(dropData.genesys, theTypes);
      if (cleanedData === null) { return; }
      ReferenceHolderElement.#filterReferenceDetails(cleanedData, theTypes, 1);

      const dataEntries = Object.entries(cleanedData);
      if (!dataEntries.length) { return; }
      const [refName, refDetails] = dataEntries[0];

      const totalRefs = Object.keys(this.#value).length;
      const theMax = this.max;
      if (theMax === 1) {
         // Allow replacement behavior if only one reference is allowed. This is not super relevant because by default
         // the drop area is hidden if a reference is already present so this code path won't be normally reached.
         this.#value = {};
      } else if (theMax !== null && totalRefs >= theMax) {
         // Ignore any drop over the max allowed.
         return;
      }

      this.#value[refName] = refDetails;
      this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
      this._refresh();
   }

   #onRemove(event: PointerEvent) {
      if (
         (event.target as HTMLElement).localName === "a"
         && (event.target as HTMLElement).previousElementSibling?.localName === "span"
      ) {
         const refName = (event.target as HTMLElement).previousElementSibling!.textContent as Nullable<string>;
         if (refName && Object.hasOwn(this.#value, refName)) {
            delete this.#value[refName];
            this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
            this._refresh();
         }
      }
   }

   /**
    * A helper method for getting a list of types from a string.
    * @param newTypesString A string that will be parsed/split to get a list of types. It can also allow null values.
    * @returns An array of the parsed types.
    */
   static #getTypesFromString(newTypesString: Nullable<string>) {
      return newTypesString?.split(ReferenceHolderElement.#typesDelimiterSplitPattern).filter(Boolean) ?? [];
   }

   /**
    * A helper method for getting a max value from a string.
    * @param newMaxString A string that will be parsed to get a maximum value. It can also allow null values.
    * @returns A positive number if the string parses to a value, `null` otherwise.
    */
   static #getMaxFromString(newMaxString: Nullable<string>) {
      const newMax = newMaxString?.trim();
      if (!newMax) { return null; }
      const maxAsNum = parseInt(newMax, 10);
      return isNaN(maxAsNum) || maxAsNum <= 0 ? null : maxAsNum;
   }

   /**
    * A helper method to extract reference information from the passed value, if possible.
    * @param referenceEntity The value being inspected to extract valid reference information from.
    * @param theTypes The list of allowed types.
    * @returns An object with valid references for this element, `null` otherwise.
    */
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   static #cleanReferenceDetails(referenceEntity: any, theTypes: string[]): Nullable<Record<string, ReferenceDetails>> {
      if (referenceEntity === null) { return {}; }
      if (!isSimpleObject(referenceEntity)) { return null; }
      const referenceEntries = Object.entries(referenceEntity);
      if (referenceEntries.length === 0) { return {}; }

      // Case were a single flat reference was passed.
      if (typeof referenceEntity["name"] === "string") {
         const refName = referenceEntity["name"].trim();
         if (refName) {
            const [refImg, refType] = ReferenceHolderElement.#extractReferenceDetails(referenceEntity, theTypes);
            if (refImg && refType) { return { [refName]: { img: refImg, type: refType } }; }
         }
         return null;
      }

      // Case were potentially more than one reference was passed.
      const cleanReferences: Record<string, ReferenceDetails> = {};
      let hasReference = false;

      // eslint-disable-next-line prefer-const -- `refName` needs to be reassigned
      for (let [refName, refDetails] of referenceEntries) {
         if (isSimpleObject(refDetails)) {
            refName = refName.trim();
            if (refName) {
               const [refImg, refType] = ReferenceHolderElement.#extractReferenceDetails(referenceEntity, theTypes);
               if (refImg && refType) {
                  cleanReferences[refName] = { img: refImg, type: refType };
                  hasReference = true;
               }
            }
         }
      }

      return hasReference ? cleanReferences : null;
   }

   /**
    * A helper method that extracts reference details from the passed object. If the data is not valid then the
    * returned tuple will be empty.
    * @param refDetails An object that might contain information about a reference.
    * @param theTypes The list of allowed types.
    * @returns The sanitized reference information extracted from the passed object, if any.
    */
   static #extractReferenceDetails(
      refDetails: Partial<ReferenceDetails>, theTypes: string[],
   ): Emptiable<[img: string, type: string]> {
      let { img: refImg, type: refType } = refDetails;
      if (typeof refImg === "string") {
         refImg = refImg.trim();
         if (!refImg) { return []; }

         if (typeof refType === "string") {
            const cleanedType = ReferenceHolderElement.#getTypesFromString(refType);
            if (cleanedType.length === 1) {
               refType = cleanedType[0];
            } else { return []; }
         } else {
            // If no type can be extracted then check if the element only allows a single type. If so, infer said type.
            if (theTypes.length === 1) {
               refType = theTypes[0];
            } else {
               return [];
            }
         }

         return [refImg, refType];
      }
      return [];
   }

   /**
    * A helper method that modifies the passed references object by deleting references that are not of the proper type
    * or that go beyond the allowed maximum.
    * @param refsDetails Ab object that contains a list of references to filter.
    * @param theTypes A list of allowed types.
    * @param availableSpots The maximum number of references that this element can hold.
    */
   static #filterReferenceDetails(
      refsDetails: Record<string, ReferenceDetails>, theTypes: string[], availableSpots: number,
   ) {
      const refEntries = Object.entries(refsDetails);
      if (!refEntries.length) { return; }

      for (let k = 0; k < refEntries.length; k++) {
         const [refName, refDetails] = refEntries[k];
         if (availableSpots <= 0 || (theTypes.length && !theTypes.includes(refDetails.type))) {
            delete refsDetails[refName];
            continue;
         }
         availableSpots--;
      }
   }
}
