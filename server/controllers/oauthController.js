const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');

const client_id = process.env.GITHUB_CLIENT_ID;
const client_secret = process.env.GITHUB_CLIENT_SECRET;

module.exports = {

  async githubData(req, res, next) {
    try {
      const code = req.query.code;
      const token = await getAccessToken(code);
      const githubData = await getGithubUser(token);

      res.locals.github = githubData
      res.locals.token = token

      return next()
    } catch (error) {
      return next({ error, message: 'something went wrong getting GitHub data', log: 'middleware error in the githubData function' });
    }
  }
}

// -------- helper functions --------------------------------------------------------
async function getAccessToken(code) {
  const res = await axios
    .post('https://github.com/login/oauth/access_token', {
      client_id,
      client_secret,
      code,
      scope: ['user:email'],
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });

  const params = new URLSearchParams(res);

  return params.get('access_token');
}

async function getGithubUser(access_token) {
  const res = await axios.get('https://api.github.com/user', {
    headers: {
      Authorization: `bearer ${access_token}`,
    },
  });
  return res.data;
}