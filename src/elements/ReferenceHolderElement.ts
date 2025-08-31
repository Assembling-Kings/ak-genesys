import { isSimpleObject } from "@/helpers/checkers";
import { DragTransferData } from "@/types/DragData";
import { $CONST } from "@/values/ValuesConst";

type ReferenceDetails = { type?: string; img: string };
type SingleReference = ReferenceDetails & { name: string };
type NameReference = Nullable<Record<string, ReferenceDetails> | SingleReference>;

export class ReferenceHolderElement extends foundry.applications.elements.AbstractFormInputElement<NameReference> {
   static tagName = "reference-holder";
   static observedAttributes = super.observedAttributes.concat(["value", "types", "max", "drop-placeholder", "empty-placeholder", "readonly"]);

   static #typesDelimiterSplitPattern = /\W+/;
   static #typesDelimiter = " ";

   protected override _value: Record<string, ReferenceDetails> = {};

   #messageArea?: HTMLDivElement;
   #referencesArea?: HTMLDivElement;
   
   constructor() {
      super();
   }

   get types() {
      return this.#getTypesFromString(this.getAttribute("types"));
   }

   set types(newTypes) {
      if (newTypes && newTypes.length) {
         this.setAttribute("types", newTypes.map(aType => aType.trim()).filter(Boolean).join(ReferenceHolderElement.#typesDelimiter));
      } else {
         this.removeAttribute("types");
      }
   }

   get max() {
      return this.#getMaxFromString(this.getAttribute("max"));
   }

   set max(newMax) {
      if (Number.isInteger(newMax) && newMax! > 0) {
         this.setAttribute("max", newMax!.toString());
      } else {
         this.removeAttribute("max");
      }
   }

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

   #getTypesFromString(newTypesString: Nullable<string>) {
      return newTypesString?.split(ReferenceHolderElement.#typesDelimiterSplitPattern).filter(Boolean) ?? [];
   }

   #getMaxFromString(newMaxString: Nullable<string>) {
      const newMax = newMaxString?.trim();
      if (!newMax) { return null; }
      const maxAsNum = parseInt(newMax, 10);
      return isNaN(maxAsNum) || maxAsNum <= 0 ? null : maxAsNum;
   }

   protected override _getValue() {
      if (this.max === 1) {
         const firstEntry = Object.entries(this._value)[0] as Optional<[string, ReferenceDetails]>;
         if (!firstEntry) { return null; }
         const [refName, refDetails] = firstEntry;
         if (!refName) { return null; }
         const vir = new Map([
            ["name", refName],
            ["img", refDetails.img],
            [$CONST.SYSTEM.marker, ReferenceHolderElement.tagName],
         ]);
         /////////// Actually, always return the type
         if (this.types.length !== 1) { vir.set("type", refDetails.type!); }
         // const vir = {
         //    name: refName,
         //    img: refDetails.img,
         //    ...(this.types.length !== 1 && { type: refDetails.type }),
         //    // toString: () => { return JSON.stringify(this); },
         // };
         // vir.toString = ReferenceHolderElement.#valueToString.bind(vir);
         return vir;
         return refName ? {
            name: refName,
            img: refDetails.img,
            ...(this.types.length !== 1 && { type: refDetails.type }),
            toString: () => { return JSON.stringify(this); },
         } : null;
         // const [refName, refDetails] = Object.entries(this._value)[0];
         // return refName ? {
         //    name: refName,
         //    img: refDetails.img,
         //    ...(this.types.length !== 1 && { type: refDetails.type }),
         //    toString: () => { return JSON.stringify(this); },
         // } : null;
      }

      const refNames = Object.keys(this._value);
      if (!refNames.length) {
         return null;
      }

      const $value = new Map(Object.entries(foundry.utils.deepClone(this._value)));
      if (this.types.length === 1) {
         refNames.forEach((refName) => delete ($value.get(refName) as Partial<ReferenceDetails>).type);
      }
      // $value.toString = ReferenceHolderElement.#valueToString.bind($value);
      $value.set($CONST.SYSTEM.marker, ReferenceHolderElement.tagName);

      return $value;
   }

   protected override _setValue(value: any) {
      const newValue = ReferenceHolderElement.#cleanReferenceDetails(value, this.types.length !== 1);
      if (newValue === null) {
         throw new Error("The provided value doesn't follow the proper structure or contains all the needed data.");
      }

      this._value = newValue;
   }

   override attributeChangedCallback(attrName: string, oldValue: Nullable<string>, newValue: Nullable<string>) {
      let triggerChange = false;

      if (attrName === "value" && newValue !== null) {
         let finalValue: Nullable<Record<string, ReferenceDetails>> = null;

         if (newValue.trim() !== "") {
            try {
               finalValue = JSON.parse(newValue);
            } catch { }
         }

         this._setValue(finalValue);
         triggerChange = true;

      } else if (attrName === "types" && newValue) {
         const newTypes = this.#getTypesFromString(newValue);

         if (newTypes.length) {
            const valueEntries = Object.entries(this._value);
            for (const [refName, refDetails] of valueEntries) {
               if (!newTypes.includes(refDetails.type ?? "")) {
                  delete this._value[refName];
                  triggerChange = true;
               }
            }
         }

      } else if (attrName === "max" && newValue) {
         const newMax = this.#getMaxFromString(newValue);
         if (!newMax) { return; }

         const valueKeys = Object.keys(this._value);
         if (valueKeys.length > newMax) {
            for (let k = valueKeys.length - 1; k >= newMax; k--) {
               delete this._value[valueKeys[k]];
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

      if (triggerChange && this.abortSignal) {
         this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
         this._refresh();
      }
   }

   protected override _buildElements() {
      this.removeAttribute("value");

      const totalRefs = Object.keys(this._value).length;
      const $max = this.max;

      this.#messageArea = document.createElement("div");
      this.#messageArea.classList.add("message-area");

      if ((this.editable && totalRefs === $max) || (!this.editable && totalRefs !== 0)) {
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

   static #buildReference(refName: string, refDetails: ReferenceDetails, editable: boolean) {
      const preview = document.createElement("img");
      preview.src = refDetails.img;

      const name = document.createElement("span");
      name.appendChild(document.createTextNode(refName));
      let tooltipText = refName;
      if (refDetails.type) {
         let typeLabel = game.i18n.localize(`TYPES.Item.${refDetails.type}`);
         if (typeLabel === refDetails.type) {
            typeLabel = game.i18n.localize(`TYPES.Actor.${refDetails.type}`);
         }
         tooltipText = `${typeLabel}: ${tooltipText}`;
      }
      name.dataset.tooltipText = tooltipText;

      const reference = document.createElement("div");
      reference.appendChild(preview);
      reference.appendChild(name);

      if (editable) {
         const remove = document.createElement("a");
         remove.className = "icon fa-solid fa-xmark";
         remove.dataset.tooltipText = game.i18n.localize("ELEMENTS.REFERENCE_HOLDER.remove");
         reference.appendChild(remove);
      }

      return reference;
   }

   protected override _refresh() {
      this.#referencesArea?.replaceChildren(
         ...Object.entries(this._value).map(([refName, refDetails]) =>
            ReferenceHolderElement.#buildReference(refName, refDetails, this.editable)));
   }

   protected override _activateListeners() {
      this.#messageArea?.addEventListener("drop", this.#onDrop.bind(this), { signal: this.abortSignal });
      this.#referencesArea?.addEventListener("click", this.#onRemove.bind(this), { signal: this.abortSignal });
   }

   #onDrop(event: DragEvent) {
      event.preventDefault();
      const dropData: Partial<DragTransferData> = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);

      if (!this.editable) { return; }
      const $types = this.types;

      const cleanedData = ReferenceHolderElement.#cleanReferenceDetails(dropData.genesys, $types.length !== 1);

      if (cleanedData === null) { return; }
      const cleanedDataEntries = Object.entries(cleanedData);
      if (!cleanedDataEntries.length) { return; }
      const [refName, refDetails] = cleanedDataEntries[0];

      if ($types.length && !$types.includes(refDetails.type!)) { return; }

      let $value = this._value;
      if (Object.hasOwn($value, refName)) { return; }

      const $max = this.max;
      if ($max && Object.keys($value).length >= $max) { return; }

      if ($max === 1) { $value = this._value = {}; }

      $value[refName] = refDetails;

      this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
      this._refresh();
   }

   #onRemove(event: PointerEvent) {
      if ((event.target as HTMLElement).localName === "a" && (event.target as HTMLElement).previousElementSibling?.localName === "span") {
         const refName = (event.target as HTMLElement).previousElementSibling!.textContent as Nullable<string>;
         if (refName && Object.hasOwn(this._value, refName)) {
            delete this._value[refName];
            this.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
            this._refresh();
         }
      }
   }

   static #cleanReferenceDetails(referenceEntity: any, mustIncludeType: boolean) {
      if (referenceEntity === null) { return {}; }
      if (!isSimpleObject(referenceEntity)) { return null; }
      const referenceEntries = Object.entries(referenceEntity);
      if (referenceEntries.length === 0) { return {}; }

      if (referenceEntries.length >=2 && referenceEntries.length <=3) {
         if (typeof referenceEntity["name"] === "string") {
            const name = referenceEntity["name"].trim();

            if (name) {
               const [img, type] = ReferenceHolderElement.#extractReferenceDetails(referenceEntity, mustIncludeType);
               if (img) { return { [name]: { img, ...(mustIncludeType && { type }) } }; }
            }

            return null;
         }
      }

      const cleanReferences: Record<string, ReferenceDetails> = {};
      let hasReference = false;
      
      for (let [refName, refDetails] of referenceEntries) {
         if (isSimpleObject(refDetails)) {
            refName = refName.trim();
            if (refName) {
               const [img, type] = ReferenceHolderElement.#extractReferenceDetails(referenceEntity, mustIncludeType);
               if (img) {
                  cleanReferences[refName] = { img, ...(mustIncludeType && { type }) };
                  hasReference = true;
               }
            }
         }
      }

      return hasReference ? cleanReferences : null;
   }

   static #extractReferenceDetails(refDetails: Partial<ReferenceDetails>, mustIncludeType: boolean): [img: string, type: string | undefined] | [] {
      let { img, type } = refDetails;
      if (typeof img === "string") {
         img = img.trim();
         if (!img) { return []; }

         if (mustIncludeType) {
            if (typeof type === "string") {
               type = type.trim();
               if (!type) { return []; }
            } else { return []; }
         }

         return [img, type];
      }
      return [];
   }
}