#!/usr/bin/env node

const axios = require('axios')

const hookUrl = '{HOOK_URL}'
const dataUrl = (lang, since) => `https://github-trending-api.now.sh/repositories?language=${lang}&since=${since}`


const parseDate = (date = new Date()) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${month}-${day}`
}

const getData = (lang, count, since) => axios.get(dataUrl(lang, since))
  .then(res => {
    if (res.status !== 200) return Promise.reject(res)
    return res.data.slice(0, count)
  })
  .catch(e => {
    console.error(e)
    return []
  })


const template = (lang, data) => {
  if (!data || !data.length) return

  const titleTpl = lang => {
    const today = new Date()
    return `## ${lang} daily ${parseDate()}\n\n`
  }
  
  const mdTpl = ({name, description, stars, url}) => `### [${name}](${url}) \n\n${description} \n\nstars: ${stars} \n\n`
  
  return `${titleTpl(lang)} \n${data.map(mdTpl).join('\n')}`
}


const sendMessage = content => {
  if (!content) return

  const params = {
    msgtype: 'markdown',
    markdown: {
      content
    }
  }

  return axios.post(hookUrl, params)
    .then(res => `${parseDate()}:${res.status}\n`)
}


let [lang, count, since] = process.argv.slice(2)
lang = lang || 'javascript'
count = count || 10
since = since || 'daily'

getData(lang, count, since)
  .then(data => template(lang, data))
  .then(sendMessage)
  .then(console.log)
