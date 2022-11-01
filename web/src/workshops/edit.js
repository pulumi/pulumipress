import * as github from "../api/github"
import yaml from "yaml";
import React from "react";
import { WorkshopsForm } from "./form"
import buffer from "buffer"
import { githubOwner, githubRepo } from "../config/github/github"
import { editMode } from "./form";

export class WorkshopEdit extends React.Component {
    constructor () {
        super()
        this.state = { formData: {}, ref: "" }
    }
    
    componentDidMount() {
        const urlParts = this.props.location.pathname.split("/")
        const ref = urlParts[urlParts.length-2];
        this.setState({ ref: ref });
        const workshopName = urlParts[urlParts.length-1];
        const owner = githubOwner;
        const repo = githubRepo;
        const path = `themes/default/content/resources/${workshopName}/index.md`;

        // get the file contents to populate form from github.
        github.getContents(owner, repo, path, ref).then( resp => {
            console.log(resp)
            let evbuff = new buffer.Buffer(resp.content, 'base64');
            let y = evbuff.toString('utf-8');
            const parsed = yaml.parseAllDocuments(y)[0].toJSON()
            this.setState({formData: parsed})
        });
    }

    render () {
        const { formData, ref } = this.state
        return <WorkshopsForm mode={editMode} branch={ref} data={formData} noValidate></WorkshopsForm>
    }
}