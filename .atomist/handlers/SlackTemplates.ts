import * as mustache from 'mustache'
import { Message } from "slack-message-builder"

let kitty_videos = `{
  "attachments": [
    {{#videos}}
    {
      "fallback": "{{id.videoId}}: {{snippet.title}}",
      "color": "#36a64f",
      "title": "{{{snippet.title}}}",
      "title_link": "https://youtube.com/embed/{{id.videoId}}",
      "image_url": "{{{snippet.thumbnails.default.url}}}"
    }{{^last}}, {{/last}}
    {{/videos}}
  ]
}`

//render github issues for slack
function renderKitties(response: any): string {
  let slack = new Message()
  const videos: any[] = response.items;
  for (let i = 0; i < videos.length; i++) {
    let video = videos[i];
    slack = slack
      .attachment()
      .fallback(`${video.id.videoId}: ${video.snippet.title}`)
      .color("#36a64f")
      .title("")
      .titleLink(`https://youtube.com/embed/${video.id.videoId}`)
      .imageUrl(video.snippet.thumbnails.default.url)
      .end()
  }
  return JSON.stringify(slack.json())
  // response['items'][ response['items'].length - 1 ].last = true;
  // try{
  //   return mustache.render(kitty_videos, 
  // {videos: response.items})
  // }catch(ex) {
  //   return `Failed to render message using template: ${ex}`
  // }
}

export { renderKitties }
