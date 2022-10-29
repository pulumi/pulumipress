import { Octokit } from "@octokit/core";


const token=""

export const testGH = async function(config) {
    const owner = config.owner
    const repo = config.repo
    const branch = config.branch
    const fileContents = config.fileContents
    const fileName = config.fileName

    const masterSha = await getLastSha(owner, repo, "master");
    await createBranch(owner, repo, branch, masterSha)
    const lastSha = await getLastSha(owner, repo, branch);
    const treeSha = await createFile(owner, repo, btoa(fileContents), lastSha, fileName);
    const newSha = await createCommit(owner, repo, "adding new workshop", treeSha, lastSha);
    await updateRef(owner, repo, branch, newSha);
    return await createPR(owner, repo, branch)
}

async function createPR(owner, repo, branch) {

    const parts = branch.split("-");
    const remove = parts[parts.length-1];
    const prName = parts.join(" ").replace(remove, "");

    const octokit = new Octokit({ auth: token }),
        title = `New Workshop - ${prName}`,
        body  = 'This worskshop was generated using PulumiPress',
        head  = `${branch}`,
        base  = 'master';


    const response = await octokit.request(
        `POST /repos/{owner}/{repo}/pulls`, { owner, repo, title, body, head, base }
    );

    return {
        statusCode: response.status,
        body: response.data,
    };
}

async function createBranch(owner, repo, branch, sha) {
    const octokit = new Octokit({ auth: token }),
        ref = `refs/heads/${branch}`
        // sha = '06413b14b92d06e26935e22775ecb71740706adb'

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

async function createFile(owner, repo, contents, lastSha, path) {

    const octokit = new Octokit({ auth: token }),
        content = contents,
        encoding = "base64"

    const response = await octokit.request(
        `POST /repos/{owner}/{repo}/git/blobs`, { owner, repo, content, encoding }
    );
    
    const sha = response.data.sha;
    const octokit2 = new Octokit({ auth: token })
            const base_tree = lastSha,
            tree = [
                {
                    path: path,
                    mode: "100644",
                    type: "blob",
                    sha: sha
                }
            ]

    const response2 = await octokit.request(
        `POST /repos/{owner}/{repo}/git/trees`, { owner, repo, base_tree, tree }
    );

    return response2.data.sha;
}

async function createCommit(owner, repo, msg, treeSha, lastCommitSha) {

    const octokit = new Octokit({ auth: token }),
        message = msg,
        author = { name: "sean", email: "sean.holung@gmail.com"},
        parents = [
            lastCommitSha,
        ],
        tree = treeSha

    const response = await octokit.request(
        `POST /repos/{owner}/{repo}/git/commits`, { owner, repo, message, author, parents, tree }
    );

    return response.data.sha;

}


async function updateRef(owner, repo, branch, newSha) {

    const octokit = new Octokit({ auth: token }),
        ref = `refs/heads/${branch}`,
        sha = newSha


    const response = await octokit.request(
        `POST /repos/{owner}/{repo}/git/refs/heads/{branch}`, { owner, repo, branch, ref, sha }
    );

    return response.data;

}

export async function getContents(owner, repo, path, ref) {

    const octokit = new Octokit({auth: token})
      
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}?ref={ref}', {
        owner: owner,
        repo: repo,
        path: path,
        ref: ref
      })

    return response.data;

}

export async function getPRs(owner, repo) {

    const octokit = new Octokit({auth: token})
      
    const response = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
        owner: owner,
        repo: repo
    })

    return response.data;

}