const express = require("express"),
    app = express(),
    cors = require('cors'),
    atob = require('atob'),
    blob = require('node-blob'),
    fetch = require('node-fetch'),
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

const process_text = async (readme) => {
    const token_resp = await fetch("https://developer.expert.ai/oauth2/token", {
    method: 'POST',
    body: JSON.stringify({
        "username": process.env.EAI_USERNAME,
        "password": process.env.EAI_PASSWORD
    }),
    headers: {'Content-Type': 'application/json'}
    })
    token = await token_resp.text()
    auth = `Bearer ${token}`
    console.log(auth)
    const response = await fetch("https://nlapi.expert.ai/v2/analyze/standard/en", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        Authorization: auth,
        body: JSON.stringify({
            "document": {
                "text": readme
            }
        })
    })

    analyzed_text = await response
    console.log(analyzed_text)
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
    // console.log(response)
    let decodedreadme = atob(response.data.content)
    await process_text(decodedreadme)
    // const token = await fetch("https://developer.expert.ai/oauth2/token", {
    //     method: 'POST',
    //     body: JSON.stringify({
    //         "username": "kmukabe@gmail.com",
    //         "password": "Watashiwabaka8*"
    //     }),
    //     headers: {'Content-Type': 'application/json'}
    // })
    
    // console.log(token)
    return res.status(201).send({success: true, readme: decodedreadme, shortened: "Shortened"})
});

app.listen(3000, ()=> {
    console.log("Server running on port 3000");
})