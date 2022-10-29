import * as github from "../api/github"
import yaml from "yaml";
import React from "react";
import { WorkshopsForm } from "./form"
import buffer from "buffer"

export class WorkshopEdit extends React.Component {
    constructor () {
        super()
        this.state = { formData: {} }
    }
    
    componentDidMount() {
        const urlParts = this.props.location.pathname.split("/")
        const ref = urlParts[urlParts.length-2];
        const workshopName = urlParts[urlParts.length-1];
        const owner = "pulumi";
        const repo = "pulumi-hugo";
        const path = `themes/default/content/resources/${workshopName}/index.md`;
        github.getContents(owner, repo, path, ref).then( resp => {
            console.log(resp)
            let evbuff = new buffer.Buffer(resp.content, 'base64');
            let y = evbuff.toString('utf-8');
            const parsed = yaml.parseAllDocuments(y)[0].toJSON()
            this.setState({formData: parsed})
        });
    }

    render () {
        const { formData } = this.state
        return <WorkshopsForm mode="edit" data={formData} noValidate></WorkshopsForm>
    }
}