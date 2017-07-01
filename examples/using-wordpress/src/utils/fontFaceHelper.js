// this function is used to import custom fonts
export function fontFaceHelper(name, src, fontWeight = 'normal', fontStyle = 'normal') {
  return `
    @font-face{
      font-family: "${name}";
      src: url(${require('../assets/fonts/' + src + '.woff')}) format("woff"),
           url(${require('../assets/fonts/' + src + '.woff2')}#${name}) format("woff2");

      font-style: ${fontStyle};
      font-weight: ${fontWeight};
    }
  `
}

//mapping with font-files:
// Ultra 		    900	
// Black 		    800
// Heavy 	      700
// Bold 		    600
// Medium	      500
// Book 		    400
// Light 		    300
// ExtraLight 	200
// Thin     	  100
// Hairline 	  0 ? 

//OR

// Ultra 		    1000	
// Black 		    900
// Heavy 	      800
// Bold 		    700
// Medium	      600
// Book 		    500
// Light 		    400
// ExtraLight 	300
// Thin     	  200
// Hairline 	  100 ? 