import fs from 'fs/promises';
import path from 'path';
import { warnAboutMissingReferences } from '../utils.js';

class CatalogPersister {
  constructor(params) {
    this.messagesPath = params.messagesPath;
    this.codec = params.codec;
    this.extension = params.extension;
    this.sourceLocale = params.sourceLocale;
  }
  getFileName(locale) {
    return locale + this.extension;
  }
  getFilePath(locale) {
    return path.join(this.messagesPath, this.getFileName(locale));
  }
  async read(locale) {
    const filePath = this.getFilePath(locale);
    let content;
    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        return [];
      }
      throw new Error(`Error while reading ${this.getFileName(locale)}:\n> ${error}`, {
        cause: error
      });
    }
    try {
      const messages = this.codec.decode(content, {
        locale,
        sourceLocale: this.sourceLocale
      });
      assertNoArrayMessages(messages);
      return messages;
    } catch (error) {
      throw new Error(`Error while decoding ${this.getFileName(locale)}:\n> ${error}`, {
        cause: error
      });
    }
  }
  async write(messages, context) {
    const filePath = this.getFilePath(context.locale);
    warnAboutMissingReferences(messages);
    const content = this.codec.encode(messages, context);
    try {
      const outputDir = path.dirname(filePath);
      await fs.mkdir(outputDir, {
        recursive: true
      });
      await fs.writeFile(filePath, content);
    } catch (error) {
      console.error(`❌ Failed to write catalog: ${error}`);
    }
  }
  async getLastModified(locale) {
    const filePath = this.getFilePath(locale);
    try {
      const stats = await fs.stat(filePath);
      return stats.mtime;
    } catch {
      return undefined;
    }
  }
}

// The codecs read arrays fine (numeric path segments), but the runtime only
// supports strings — enforced here where the runtime's rules apply.
function assertNoArrayMessages(messages) {
  for (const message of messages) {
    const segments = message.segments;
    if (!Array.isArray(segments)) continue;
    const firstIndex = segments.findIndex(segment => typeof segment === 'number');
    if (firstIndex === -1) continue;
    const arrayPath = segments.slice(0, firstIndex).join('.');
    throw new Error(`Message at \`${arrayPath}\` resolved to an array, but only strings are supported. See https://next-intl.dev/docs/usage/translations#arrays-of-messages`);
  }
}

export { CatalogPersister as default };
