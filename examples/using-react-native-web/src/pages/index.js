import React from 'react'
import { StyleSheet, View, Text, Switch, Button, ActivityIndicator } from 'react-native'

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
})


const Container = (props) => (
  <View {...props} style={[styles.container,props.style]}/>
)


const IndexPage = () => (
  <View>
    <Container>
    <Text>Hi people</Text>
    </Container>
    <Container>
      <Button onPress={() => alert(`it works!`)} title="Press me"/>
    </Container>
    <Container>
      <ActivityIndicator size="large"/>
    </Container>
    <Container>
      <Switch/>
    </Container>
    <span style={{ padding: 10 }}>
      Normal span text also works
    </span>
  </View>
)

export default IndexPage
