import { schema, uiSchema } from "../config/workshops/schema"
import validator from "@rjsf/validator-ajv6";
import * as jsonSchemaForms from "@rjsf/bootstrap-4";
import * as github from "../api/github"
import yaml from "yaml";
import React from "react";

const Form = jsonSchemaForms.default

export class WorkshopsForm extends React.Component {

    constructor (props) {
        super(props);
        this.state = { loading: false };
        this.render = this.render.bind(this);
        this.submit = this.submit.bind(this);
    }
    
    componentDidMount() {
    }

    submit(form) {
        const owner = "pulumi";
        const repo = "pulumi-hugo";
        const branch = Date.now();

        // create file contents
        const dashes = "---\n";
        const doc = new yaml.Document();
        doc.contents = form.formData;
        const fileContents = `${dashes}${doc.toString()}${dashes}`;
        console.log(fileContents);

        const fileName = `themes/default/content/resources/${form.formData.url_slug}/index.md`;
        const config = {
            owner: owner,
            repo: repo,
            branch: branch,
            fileContents: fileContents,
            fileName: fileName
        }

        this.setState({loading: true})

        // github.testGH(config).then(res => {
        //     this.setState({loading: false})
        //     window.open(res.body.html_url, '_blank');
        // }).catch(err => {
        //     this.setState({loading: false})
        //     console.log(err)
        // }) ;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        };
        fetch('/gh', requestOptions)
            .then(response => response.json())
            .then(res => {
                this.setState({ loading: false});
                console.log("data", res)
                window.open(res.body.html_url, '_blank');
            });
    }

    render () {
        const { loading } = this.state;
        return loading ? <div style={{margin: "100px"}}>Submitting PR.....</div>
        : (
            <div style={{ padding: "20px" }}>
                <Form schema={schema} uiSchema={uiSchema} formData={this.props.data} validator={validator} noValidate={this.props.noValidate} onSubmit={this.submit}></Form>
            </div>
        )
    }
}
