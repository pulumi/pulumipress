
import React from 'react'
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

const header = () => {
    return (
        <Navbar bg="light" expand="lg">
            <LinkContainer to="/">
                <Navbar.Brand>PulumiPress</Navbar.Brand>
            </LinkContainer>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <NavDropdown title="Workshops" id="basic-nav-dropdown">
                        <NavDropdown.Item>
                            <LinkContainer to="/workshop/new">
                                <Nav.Link>Create</Nav.Link>
                            </LinkContainer>
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item>
                            <LinkContainer to="/workshop/list">
                                <Nav.Link>Edit</Nav.Link>
                            </LinkContainer>
                        </NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    )
}

export default header