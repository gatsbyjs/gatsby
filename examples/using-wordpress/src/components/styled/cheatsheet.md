# Plain, Adapting based on Props, Nesting

```
<div 
  primary
  color={"blue"}
> 
  Example
</div>

const Wrapper = styled.section`
  padding: 4em;
  background: ${props => props.primary? 'green' :'white'};
  color: ${props => props.blue ? props.blue : 'white'};
  &:hover {
		background: palevioletred;
	}
`;
```

# Extending Styles

```
const Button = styled.button`
  font-size: 1em;
  border-radius: 3px;
`;

const TomatoButton = Button.extend`
  color: tomato;
`;
```

# Changing tag of styled component
we use withComponent 
```
const Button = styled.button`
  display: inline-block;
  //...
`;

cosnt Link = Button.withComponent('a');
```

# Seperating dynamic and static attributes 
use .attrs({})

```
const <Input size="2em"/>

const Input = styled.input.attrs({
  type: 'password',                         // static props
  margin: props => props.size || '1em',     // dynamic props
})`
  color: blud;
  margin: ${props => props.margin};
`; 
```

# Styling ANY components
example with react router's link:
```
const StyledLink = styled(Link)`
  color: red;
`;
```

# Theming, and Nested themes 
The <ThemeProvider> wrapper component will provie theme to all React components via context API. 
Can nest themes and even use functions to grap data from themes above. 

```
const Button = styled.button`
  font-size: 1em;
  color: ${props => props.theme.main};
  background-color: ${props => props.theme.bg};
`;

const theme= { 
  main: 'blue',
  bg: 'red',
}

// this swaps colors of font and background 
const invertedTheme = ({ main, bg }) => ({
  main: bg,
  bg: main
})

render(
  <ThemeProvider theme={theme}>
    <div>
      <Button>Themed</Button>
      <ThemeProvider theme={invertedTheme}>
        <Button>Inverted Themed</Button>
      </ThemeProvider>
    </div>
  </ThemeProvider>
)
```

# Getting theme wihtout styled components
If ever need to grab theme outside of styled components, use withTheme: 
```
import { withTheme } from 'styled-components'

class MyComponent extends React.Component {
  render() {
    console.log('Current theme: ', this.props.theme);
    // ...
  }
}

export default withTheme(MyComponent)
```

# Media Queries 
We can define some sizes and write functions to easily inject it anywhere

```
const sizes = { 
  desktop: 002, 
  tablet: 768,
  phone: 376,
}

// Iterate through the sizes and create a media template 
const media = Object.keys(sizes).reduce((acc, label) => {
  acc[label] = (...args) => css`
    @media (max-width: ${sizes[label] /16}em) {
      ${css(...args)}
    }
  `
  return acc
}, {})

const Content = styled.div`
	height: 3em;
	/* Now we have our methods on media and can use them instead of raw queries */
	${media.desktop`background: blue;`}
	${media.tablet`background: red;`}
	${media.phone`background: palevioletred;`}
`;
```

# Helpers 
**css**: helper to generate css 
```
const complexMixin = css `
  color: ${props => props.whiteColor? 'white': 'black'}
`;

const styledComp = styled.div`
  ${props => props.complex ? complexMixin: 'color: blue;'}
`;
```
**injectGlobal**
```
injectGlobal`
  @font-face {
    font-family: 'Operator Mono';
    src: url('../fonts/Operator-Mono.ttf');
  }

  body {
    margin: 0;
  }
`;
```



# Careful!
  * ref are passed using innerRef 
  * specificity issues if using styled components and classes 

# styled component functions
  * extend                -> extends a styled component 
  * withComponent         -> changes tag of component 
  * attrs({})             -> allows to define static and dynamic props more clearly 
  * keyframes             
  * ThemeProvider         -> gives children theme context
  * withTheme             -> theme HOC 
  * css                   -> writing css styles which can be used within styled components 
  * injectGlobal          -> adds the styles to the stylesheet directly (useful for font-face)