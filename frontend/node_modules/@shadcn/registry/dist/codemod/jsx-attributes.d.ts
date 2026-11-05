import { types } from '@babel/core';

interface JsxAttribute {
    attribute: types.JSXAttribute;
    element: types.JSXOpeningElement;
}
declare function getJsxAttributes(file: types.File): JsxAttribute[];
declare function removeJsxAttributes(code: string, indexes: number[]): string;
declare function removeJsxAttribute(code: string, { attribute, element }: JsxAttribute): string;
declare function setJsxAttributeInitializer(code: string, attribute: types.JSXAttribute, text: string): string;

export { type JsxAttribute, getJsxAttributes, removeJsxAttribute, removeJsxAttributes, setJsxAttributeInitializer };
