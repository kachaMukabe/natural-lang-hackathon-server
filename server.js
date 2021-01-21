const express = require("express"),
    app = express(),
    cors = require('cors'),
    atob = require('atob'),
    blob = require('node-blob'),
    { Octokit } = require("@octokit/core"),
    bodyParser = require('body-parser');

app.use(cors())
app.use(bodyParser.json());
const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});

const repoDetails = (url) => {
    // https://github.com/octokit/core.js
    let base = url.replace("https://github.com/", "")
    let details = base.split("/")
    let user = details[0]
    let repo = details[1]

    return {user: user, repo: repo}
}
app.post('/repo', async (req, res)=>{
    if(!req.body.repoUrl){
        return res.status(400).send({success: "false", message: "Github repository url is required"});
    }
    let url = req.body.repoUrl;
    let details = repoDetails(url)

    const response = await octokit.request("GET /repos/{owner}/{repo}/readme", {
        owner: details.user,
        repo: details.repo
    })
    console.log(response)
    let decodedreadme = atob(response.data.content)
    return res.status(201).send({success: true, readme: decodedreadme, shortened: "Shortened"})
});

app.listen(3000, ()=> {
    console.log("Server running on port 3000");
})