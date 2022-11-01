import { Octokit } from "@octokit/core";
const token = process.env.GITHUB_TOKEN


export const openPR = async function(ev, _) {

    let b = ev.body;
    let evbuff = new Buffer(b, 'base64');
    let body = evbuff.toString('utf-8');
    
    const config = JSON.parse(body);
    const owner = config.owner
    const repo = config.repo
    const branch = config.branch
    const fileName = config.fileName
    const fileContents = config.fileContents

    // base64 encode file contents.
    let buff = new Buffer(fileContents);
    let base64data = buff.toString('base64');

    const masterSha = await getLastSha(owner, repo, "master");
    await createBranch(owner, repo, branch, masterSha)
    const lastSha = await getLastSha(owner, repo, branch);
    const treeSha = await createFile(owner, repo, base64data, lastSha, fileName);
    const newSha = await createCommit(owner, repo, "adding new workshop", treeSha, lastSha);
    await updateRef(owner, repo, branch, newSha);
    const response = await createPR(owner, repo, branch);
    return {
        statusCode: 200,
        body: JSON.stringify(response)
    }
}

export const updatePR = async function(ev, _) {

    let b = ev.body;
    let evbuff = new Buffer(b, 'base64');
    let body = evbuff.toString('utf-8');
    
    const config = JSON.parse(body);

    const owner = config.owner
    const repo = config.repo
    const branch = config.branch
    const fileContents = config.fileContents
    const fileName = config.fileName

    let buff = new Buffer(fileContents);
    let base64data = buff.toString('base64');

    const lastSha = await getLastSha(owner, repo, branch);
    const treeSha = await createFile(owner, repo, base64data, lastSha, fileName);
    const newSha = await createCommit(owner, repo, "adding new workshop", treeSha, lastSha);
    const response = await updateRef(owner, repo, branch, newSha);
    return {
        statusCode: 200,
        body: JSON.stringify(response)
    }
}


async function createPR(owner, repo, branch) {

    const parts = branch.split("-");
    const remove = parts[parts.length-1];
    const prName = parts.join(" ").replace(remove, "");

    const octokit = new Octokit({ auth: token });
    const title = `New Workshop - ${prName}`;
    const body  = "This worskshop was generated using PulumiPress";
    const head  = `${branch}`;
    const base  = "master";


    const response = await octokit.request(
        `POST /repos/{owner}/{repo}/pulls`, { owner, repo, title, body, head, base }
    );

    return {
        statusCode: response.status,
        body: response.data,
    };
}

async function createBranch(owner, repo, branch, sha) {
    const octokit = new Octokit({ auth: token });
    const ref = `refs/heads/${branch}`;

    const response = await octokit.request(
        `POST /repos/{owner}/{repo}/git/refs`, { owner, repo, ref, sha }
    );

    return {
        statusCode: 200,
        body: JSON.stringify(response),
    };
}

async function getLastSha(owner, repo, branchName) {
    const octokit = new Octokit({ auth: token });

    const response = await octokit.request(
        `GET /repos/{owner}/{repo}/branches/{branchName}`, { owner, repo, branchName }
    );

    return response.data.commit.sha;
}

async function createFile(owner, repo, contents, lastSha, path: string) {

    const octokit = new Octokit({ auth: token });
    const content = contents;
    const encoding = "base64";

    const response = await octokit.request(
        `POST /repos/{owner}/{repo}/git/blobs`, { owner, repo, content, encoding }
    );
    
    const sha = response.data.sha;
    const octokit2 = new Octokit({ auth: token })
            const base_tree = lastSha,
            tree = [
                {
                    path: path,
                    mode: "100755",
                    type: "blob",
                    sha: sha
                }
            ]

    const response2 = await octokit.request(
        // @ts-ignore
        `POST /repos/{owner}/{repo}/git/trees`, { owner, repo, base_tree, tree }
    );

    return response2.data.sha;
}

async function createCommit(owner, repo, msg, treeSha, lastCommitSha) {

    const octokit = new Octokit({ auth: token });
    const message = msg;
    const author = { name: "sean", email: "sean.holung@gmail.com"};
    const parents = [
            lastCommitSha,
        ];
    const tree = treeSha;

    const response = await octokit.request(
        `POST /repos/{owner}/{repo}/git/commits`, { owner, repo, message, author, parents, tree }
    );

    return response.data.sha;

}


async function updateRef(owner, repo, branch, newSha) {

    const octokit = new Octokit({ auth: token });
    const ref = `refs/heads/${branch}`;
    const sha = newSha;


    const response = await octokit.request(
        `POST /repos/{owner}/{repo}/git/refs/heads/{branch}`, { owner, repo, branch, ref, sha }
    );

    return response.data;

}