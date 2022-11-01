import * as github from "../api/github"
import React from "react";
import { ListGroup } from "react-bootstrap";
import { Nav } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { githubOwner, githubRepo } from "../config/github/github"

export class WorkshopsList extends React.Component {
    constructor () {
        super()
        this.state = { workshops: [], prs: [] }
      }
    
      componentDidMount() {
        const owner = githubOwner;
        const repo = githubRepo;
        const path = "themes/default/content/resources";
        github.getContents(owner, repo, path, "master").then( resp => {
            this.setState({workshops: resp})
        });

        github.getPRs(owner, repo).then( resp => {
            console.log("prs:", resp)
            this.setState({prs: resp})
        });
      }
    
      render () {
        const { workshops, prs } = this.state
        const openPrs = (prs && prs.length > 0) ? prs.filter(p => {
            // right now just keying off the timestamp in the branch name to know if the pr was
            // opened by this tool. we should probably update this to use something else.
            return p.head.ref.includes("-16"); 
        }) : [];

        return (
            <div style={{padding: "15px"}}>
                <div style={{paddingBottom: "20px"}}>
                    {
                        openPrs.length ? (
                            <div>
                                <h5>Select an open PR to edit</h5>
                                <ListGroup>
                                    {
                                        openPrs.map( (pr,i) => {
                                            return (
                                                <ListGroup.Item key={i} action>
                                                    <LinkContainer to={`/workshop/edit/${pr.head.ref}/${pr.head.ref.split("-16")[0]}`}>
                                                        <Nav.Link>{pr.head.ref.split("-16")[0]}</Nav.Link>
                                                    </LinkContainer>
                                                </ListGroup.Item>
                                            )
                                        })
                                    }
                                </ListGroup>
                            </div>
                        ) : (
                            <div></div>
                        )
                    }
                </div>
                <h5>Select an existing workshop to edit</h5>
                 { 
                    workshops.length ?  (
                        <ListGroup>
                            {workshops.map( (ws,i) => {
                                return (
                                    <ListGroup.Item key={i} action>
                                        <LinkContainer to={`/workshop/edit/master/${ws.name}`}>
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