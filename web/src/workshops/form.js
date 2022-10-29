import { schema, uiSchema } from "../config/workshops/schema"
import validator from "@rjsf/validator-ajv6";
import * as jsonSchemaForms from "@rjsf/bootstrap-4";
import * as github from "../api/github"
import yaml from "yaml";
import React from "react";

const Form = jsonSchemaForms.default

const dev = false;

export class WorkshopsForm extends React.Component {

    constructor (props) {
        super(props);
        this.state = { 
            loading: false, 
            inprogress: localStorage.getItem("inprogress"),
        };
        this.render = this.render.bind(this);
        this.submit = this.submit.bind(this);
        this.send = this.send.bind(this);
    }
    
    componentDidMount() {

    }

    submit(form) {
        let owner = "pulumi";
        let repo = "pulumi-hugo";
        const path = "themes/default/content/resources";

        github.getContents(owner, repo, path, "master").then( existing => {
            const urlExists = existing.some(ws => {
                return ws.name === form.formData.url_slug;
            });
            if (!urlExists || this.props.mode === "edit") {
                this.send(form);
            } else {
                alert("url slug already exists. choose a different url.")
            }
        });
    }

    send(form) {
        let owner = "pulumi";
        let repo = "pulumi-hugo";

        if (dev) {
            owner = "sean1588";
            repo = "sean-test-project";
        }


        const branch = `${form.formData.url_slug}-${Date.now()}`;

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

        if (dev) {
            github.testGH(config).then(res => {
                this.setState({loading: false})
                console.log("data", res)
                localStorage.setItem("inprogress", "")
                window.open(res.body.html_url, '_blank');
            }).catch(err => {
                this.setState({ loading: false});
                alert("error: " + JSON.stringify(err));
                localStorage.setItem("inprogress", JSON.stringify(form.formData))
                this.setState({inprogress: localStorage.getItem("inprogress")})
            }) ;
        } else {
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
                    if (this.props.mode !== "edit") {
                        localStorage.setItem("inprogress", "")
                    }
                    window.open(res.body.html_url, '_blank');
                }).catch(err => {
                    this.setState({ loading: false});
                    alert("error: " + JSON.stringify(err));
                    if (this.props.mode !== "edit") {
                        localStorage.setItem("inprogress", JSON.stringify(form.formData))
                        this.setState({inprogress: localStorage.getItem("inprogress")})
                    }
                });
        }


    }

    render () {
        const { loading, inprogress } = this.state;
        const data = inprogress && this.props.mode !== "edit" ? JSON.parse(inprogress) : this.props.data
        return loading ? <div style={{margin: "100px"}}>Submitting PR.....</div>
        : (
            <div style={{ width: "67%", padding: "20px" }}>
                <Form schema={schema} uiSchema={uiSchema} formData={data} validator={validator} noValidate={this.props.noValidate} onSubmit={this.submit}></Form>
            </div>
        )
    }
}
