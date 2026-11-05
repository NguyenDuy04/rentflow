import { Options, Ora } from 'ora';

declare function spinner(text: Options["text"], options?: {
    silent?: boolean;
}): Ora;
declare function logAboveSpinner(message: string): void;

export { logAboveSpinner, spinner };
