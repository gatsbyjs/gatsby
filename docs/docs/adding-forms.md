---
title: Adding forms
---

Gatsby is built on top of React. So anything that is possible with a React form is possible in Gatsby. Let's start with the following page.

```JSX
import React from "react"

export default () => <div>Hello world!</div>
```

This gatsby page is a React component. When you want to create a form, you need to store the state of the form - what the user has entered. Convert your function (stateless) component to a class (stateful) component.

```JSX
import React from "react"

export default class IndexPage extends React.Component {
    render() {
        return (
            <div>Hello world!</div>
        )
    }
}
```

Now that you have created a class component, you can add `state` to the component.

```JSX
import React from "react"

export default class IndexPage extends React.Component {
    state = {
        firstName: '',
        lastName: '',
    }

    

    render() {
        return (
            <div>Hello world!</div>
        )
    }
}
```

And now we can add a few input fields

```JSX
import React from "react"

export default class IndexPage extends React.Component {
    state = {
        firstName: '',
        lastName: '',
    }

    render() {
        return (
            <form>
                <input type="text" name="firstName" />
                <input type="text" name="lastName" />
                <input type="submit" value="Submit" />
            </form>
        )
    }
}
```

When a user types into an input box, the state should update. Add an `onChange` prop to update state and add a `value` prop to keep the input up to date with the new state:

```JSX
import React from "react"

export default class IndexPage extends React.Component {
    state = {
        firstName: '',
        lastName: '',
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value,
        });
    }

    render() {
        return (
            <form>
                <input
                    type="text"
                    name="firstName"
                    value={this.state.firstName}
                    onChange={this.handleInputChange}
                />
                <input
                    type="text"
                    name="lastName"
                    value={this.state.lastName}
                    onChange={this.handleInputChange}
                />
                <input
                    type="submit"
                    value="Submit"
                />
            </form>
        )
    }
}
```

Now that our inputs are working, we want something to happen when we submit the form. Add `onSubmit` props to the form element and add `handleSubmit` to show an alert when the user submits the form:

```JSX
import React from "react"

export default class IndexPage extends React.Component {
    state = {
        firstName: '',
        lastName: '',
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value,
        });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        alert(`Welcome ${this.state.firstName} ${this.state.lastName}!`);
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    name="firstName"
                    value={this.state.firstName}
                    onChange={this.handleInputChange}
                />
                <input
                    type="text"
                    name="lastName"
                    value={this.state.lastName}
                    onChange={this.handleInputChange}
                />
                <input
                    type="submit"
                    value="Submit"
                />
            </form>
        )
    }
}
```

This form isn't doing anything besides showing the user information that they just entered. At this point, you may want to move this form to a component, send the form state to a backend server, or add robust validation. All of this is possible and more by leveraging the power of Gatsby and the React ecosystem!

Additional details about how to create React forms can be found in the react documentation at [https://reactjs.org/docs/forms.html](https://reactjs.org/docs/forms.html) (which happens to be built with Gatsby!)
