import React from "react"
import {
  StyleSheet,
  View,
  Text,
  Switch,
  Button,
  ActivityIndicator,
  CheckBox,
  Picker,
  ProgressBar,
  Linking,
  Animated,
  TouchableOpacity,
} from "react-native"

import GatsbyLink from "gatsby-link"

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 38,
  },
  headerSub: {
    marginTop: 10,
    fontSize: 18,
  },
  openLinkButton: {
    margin: 10,
    maxWidth: 400,
  },
  row: {
    flexDirection: `row`,
    alignItems: `center`,
  },
})

const Container = ({ style, ...props }) => (
  <View {...props} style={[styles.container, style]}/>
)

const Header = ({ children }) => (
  <Text style={styles.header}>{children}</Text>
)

const HeaderSub = ({ style, children }) => (
  <Text style={[styles.headerSub,style]}>{children}</Text>
)

const OpenLinkButton = ({ title, url }) => (
  <View style={styles.openLinkButton}>
    <Button onPress={() => Linking.openURL(url)} title={title}/>
  </View>
)

const Row = ({ children }) => <View style={styles.row}>{children}</View>


class StatefulSwitch extends React.Component {
  state = { value: true }

  render() {
    return (
      <Switch
        value={this.state.value}
        onValueChange={value => this.setState({ value })}
      />
    )
  }
}

class StatefulCheckBox extends React.Component {
  state = { value: true }

  render() {
    return (
      <CheckBox
        value={this.state.value}
        onValueChange={value => this.setState({ value })}
      />
    )
  }
}


class AnimationExample extends React.Component {
  state = {
    animatedValue: new Animated.Value(0),
  }

  animate = () => {
    Animated.timing(this.state.animatedValue, {
      toValue: 1,
      duration: 2000,
    }).start(() => {
      Animated.spring(this.state.animatedValue, {
        toValue: 0,
        friction: 1,
        tension: 6,
      }).start()
    })
  };

  render() {
    const scaleAnimation = this.state.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2],
    })
    const borderRadiusAnimation = this.state.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0],
    })
    const backgroundColorAnimation = this.state.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [`rgba(240, 60, 60, 1)`, `rgba(61, 150, 239, 1)`],
    })
    const rotateAnimation = this.state.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [`0deg`, `45deg`],
    })
    const translateXAnimation = this.state.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-150, 150],
    })
    return (
      <View style={{ width: 800, justifyContent: `center`, alignItems: `center` }}>
        <TouchableOpacity onPress={this.animate}>
          <Animated.View
            style={{
              transform: [
                { translateX: translateXAnimation },
              ],
            }}
          >
            <Animated.View
              style={{
                aspectRatio: 1,
                alignItems: `center`,
                justifyContent: `center`,
                width: 100,
                height: 100,
                borderRadius: borderRadiusAnimation,
                backgroundColor: backgroundColorAnimation,
                transform: [
                  { scale: scaleAnimation },
                  { rotate: rotateAnimation },
                ],
              }}
            >
              <Text style={{ color: `white`, fontSize: 24 }}>Press me</Text>
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    )
  }
}


const IndexPage = () => (
  <View>

    <Container>
      <Header>Gatsby using react-native-web</Header>
      <HeaderSub style={{ maxWidth: 600 }}>
        This is an example usage of <Text style={{ color: `red` }}>gatsby-plugin-react-native-web</Text>, which permit to share React component
        between your ReactNative mobile app and your Gatsby static website. Crazy right?
      </HeaderSub>
    </Container>

    <Container>
      <Row>
        <OpenLinkButton title="Go to plugin repo" url={`https://github.com/slorber/gatsby-plugin-react-native-web`}/>
        <OpenLinkButton title="Go to RNW repo" url={`https://github.com/necolas/react-native-web`}/>
        <OpenLinkButton title="Go to this page source code"
                        url={`https://github.com/gatsbyjs/gatsby/blob/master/examples/using-react-native-web/src/pages/index.js`}/>
      </Row>
    </Container>

    <View>
      <Row>
        <Container>
          <StatefulSwitch/>
        </Container>
        <Container>
          <StatefulCheckBox/>
        </Container>
        <Container>
          <ActivityIndicator size="large"/>
        </Container>
        <Container style={{ width: 300 }}>
          <ProgressBar indeterminate={true}/>
        </Container>
      </Row>
      <Row>
        <Container style={{ width: 300 }}>
          <Picker>
            <Picker.Item label="Goblet of Fire"/>
            <Picker.Item label="Order of the Phoenix"/>
          </Picker>
        </Container>
      </Row>
    </View>

    <Container>
      <AnimationExample/>
    </Container>

    <Container>
      <GatsbyLink to="page2">
        <Text>link to 2nd page</Text>
      </GatsbyLink>
    </Container>

  </View>
)

export default IndexPage
