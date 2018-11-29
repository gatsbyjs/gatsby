const isDate = string => {
  // When encountering a numberstring like "404" or "13", the
  // [ES spec](http://www.ecma-international.org/ecma-262/6.0/#sec-date-time-string-format)
  // only specifies behavior for 4-digit YYYY years. Numberstrings in the
  // formats YYY, YY, Y are out-of-spec. V8 interprets most as valid dates,
  // except "13"-"31" (Spidermonkey is stricter and disallows all).
  const num = parseInt(string, 10)
  if (isFinite(num) && num < 1000) return false

  return isFinite(new Date(string).getTime())
}

module.exports = isDate
