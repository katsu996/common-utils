'use strict';
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
function i(e) {
  return e ? e.charAt(0).toUpperCase() + e.slice(1) : '';
}
function n(e, t) {
  return e.length <= t ? e : e.slice(0, t) + '...';
}
exports.capitalize = i;
exports.truncate = n;
