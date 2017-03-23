import * as mustache from 'mustache'

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
  response['items'][ response['items'].length - 1 ].last = true;
  try{
    return mustache.render(kitty_videos, 
  {videos: response.items})
  }catch(ex) {
    return `Failed to render message using template: ${ex}`
  }
}

export {renderKitties}
