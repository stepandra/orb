
export function asciiToHex(text) {
  const hexBytes = [];
  for (let i = 0; i < text.length; ++i) {
    const charCode = text.charCodeAt(i);
    if (charCode > 0xff) {
      // Consider supporting non-ascii characters:
      // http://monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
      throw new Error(`Cannot encode wide character with value ${charCode}`);
    }
    hexBytes.push(('0' + charCode.toString(16)).slice(-2));
  }
  return hexBytes.join('');
}

export function hexToString(hexString) {
  const bytes = [];
  if (hexString.length % 2 !== 0) {
    throw new Error('hexString has odd length, ignoring: ' + hexString);
  }
  for (let i = 0; i < hexString.length; i += 2) {
    const hexByte = hexString.slice(i, i + 2);
    bytes.push(String.fromCharCode(parseInt(hexByte, 16)));
  }
  return bytes.join('');
}
