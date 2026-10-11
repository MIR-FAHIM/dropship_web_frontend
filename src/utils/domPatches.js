/**
 * Global DOM patch to prevent crashes in ReactQuill / Quill / Parchment.
 *
 * Quill's Parchment library calculates string split offsets based on its internal delta representation.
 * When DOM text nodes are normalized by the browser, affected by translation extensions (e.g. Google Translate),
 * or contain complex HTML/Bengali characters/surrogates, Quill may call Text.prototype.splitText(offset) with an
 * offset that exceeds the Text node's actual DOM length, throwing:
 * IndexSizeError: Failed to execute 'splitText' on 'Text': The offset X is larger than the Text node's length.
 *
 * Clamping the offset to [0, this.length] safely prevents this browser exception and lets Quill and React proceed smoothly.
 */
if (typeof window !== "undefined" && typeof Text !== "undefined" && Text.prototype) {
  if (!Text.prototype.__isSplitTextPatched) {
    const originalSplitText = Text.prototype.splitText;
    Text.prototype.splitText = function (offset) {
      const len = this.length || 0;
      let safeOffset = Number(offset);
      if (isNaN(safeOffset) || safeOffset < 0) {
        safeOffset = 0;
      } else if (safeOffset > len) {
        safeOffset = len;
      }
      return originalSplitText.call(this, safeOffset);
    };
    Text.prototype.__isSplitTextPatched = true;
  }
}
