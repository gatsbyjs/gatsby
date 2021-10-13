
if (_CFLAGS_.MAJOR === '4') {
  console.log('We only load this for Gatsby 4')
} else {
  console.log('Old code path')
}

function isGatsby4() {
  return _CFLAGS_.MAJOR === '4'
}


if (isGatsby4()) {
  console.log('We only load this for Gatsby 4')
} else {
  console.log('Old code path')
}
