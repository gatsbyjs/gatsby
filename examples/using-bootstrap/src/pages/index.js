import React from "react"
import { Button, Container, Card, Col, Row } from "react-bootstrap"

import "bootstrap/dist/css/bootstrap.min.css"

class IndexPage extends React.Component {
  render() {
    return (
      <>
        <Container style={{ margin: `50px auto` }}>
          <h1>Hello World, Gatsby</h1>
          <p>
            The example of using Gatsby with Bootstrap. You can see all
            components here{` `}
            <a
              href="https://react-bootstrap.netlify.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              React Bootstrap
            </a>
          </p>
          <br />

          <Row>
            <Col key={1}>
              <Card>
                <Card.Body>
                  <Card.Title>Card Title</Card.Title>
                  <Card.Text>
                    Some quick example text to build on the card title and make
                    up the bulk of the card's content.
                  </Card.Text>
                  <Button variant="primary">Go somewhere</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col key={2}>
              <Card>
                <Card.Body>
                  <Card.Title>Card Title</Card.Title>
                  <Card.Text>
                    Some quick example text to build on the card title and make
                    up the bulk of the card's content.
                  </Card.Text>
                  <Button variant="primary">Go somewhere</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col key={3}>
              <Card>
                <Card.Body>
                  <Card.Title>Card Title</Card.Title>
                  <Card.Text>
                    Some quick example text to build on the card title and make
                    up the bulk of the card's content.
                  </Card.Text>
                  <Button variant="primary">Go somewhere</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    )
  }
}

export default IndexPage
