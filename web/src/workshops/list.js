import * as github from "../api/github"
import React from "react";
import { ListGroup } from "react-bootstrap";
import { Nav } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

export class WorkshopsList extends React.Component {
    constructor () {
        super()
        this.state = { workshops: [] }
      }
    
      componentDidMount() {
        const owner = "pulumi";
        const repo = "pulumi-hugo";
        const path = "themes/default/content/resources";
        github.getContents(owner, repo, path).then( resp => {
            this.setState({workshops: resp})
        });
      }
    
      render () {
        const { workshops } = this.state
        return (
            <div style={{padding: "15px"}}>
                <h5>Select a workshop to edit.</h5>
                 { 
                    workshops.length ?  (
                        <ListGroup>
                            {workshops.map( (ws,i) => {
                                return (
                                    <ListGroup.Item key={i} action>
                                        <LinkContainer to={`/workshop/edit/${ws.name}`}>
                                            <Nav.Link>{ws.name}</Nav.Link>
                                        </LinkContainer>
                                    </ListGroup.Item>
                                )
                            })}
                        </ListGroup>
                    ) : (
                    <span>Loading workshops...</span>
                    )
                }
            </div>
        )
      }
}