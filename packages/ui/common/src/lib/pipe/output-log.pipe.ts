import { Pipe, PipeTransform } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'outputLog', pure: true })
export class OutputLogPipe implements PipeTransform {
  transform(value: any, truncate = true): SafeHtml {
    let result = '';
    if (typeof value === 'object') {
      result = JSON.stringify(value, null, 2);
    } else if (this.isJsonString(value)) {
      result = JSON.stringify(JSON.parse(value), null, 2);
    } else {
      result = this.repr(value);
    }
    if (truncate) {
      result =
        result.length > 8092
          ? result.substring(0, 8092) + ' (truncated)'
          : result;
    }
    const escaped = this.escapeHtmlTags(result);
    return escaped;
  }

  escapeHtmlTags(str: string) {
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  repr(obj: unknown): string {
    if (obj == null || typeof obj === 'string' || typeof obj === 'number')
      return String(obj);
    if (Array.isArray(obj))
      return '[' + Array.prototype.map.call(obj, this.repr).join(', ') + ']';
    if (obj instanceof HTMLElement)
      return '<' + obj.nodeName.toLowerCase() + '>';
    if (obj instanceof Text) return '"' + obj.nodeValue + '"';
    if (obj.toString) return obj.toString();

    return String(obj);
  }

  isJsonString(str: string) {
    try {
      const result = JSON.parse(str);
      if (typeof result === 'number') {
        return false;
      }
    } catch (e) {
      return false;
    }
    return true;
  }
}
