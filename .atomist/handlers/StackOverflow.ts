import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import * as mustache from 'mustache'

let APISearchURL = `http://api.stackexchange.com/2.2/search/advanced?pagesize=3&order=desc&sort=relevance&site=stackoverflow&q=`
let SearchURL = `http://stackoverflow.com/search?q=`

//render for slack
function renderAnswers(response: any): string {
  response['items'][ response['items'].length - 1 ].last = true;

  try{
    return mustache.render(`{
  "attachments": [
{{#answers.items}}
    {
      "fallback": "{{{title}}}",
      "author_name": "{{{owner.display_name}}}",
      "author_link": "{{{owner.link}}}",
      "author_icon": "{{{owner.profile_image}}}",
      "title": "{{{title}}}",
      "title_link": "{{{link}}}",
      "thumb_url": "https://slack-imgs.com/?c=1&o1=wi75.he75&url=https%3A%2F%2Fcdn.sstatic.net%2FSites%2Fstackoverflow%2Fimg%2Fapple-touch-icon%402.png%3Fv%3D73d79a89bded",
      "footer": "{{#tags}}{{.}}  {{/tags}}",
      "ts": {{{last_activity_date}}}
    }{{^last}},{{/last}}
{{/answers.items}},
		{
			"title": "See more >",
			"title_link": "${SearchURL}"
		}
  ]
}`,
  {answers: response})
  }catch(ex) {
    return `Failed to render message using template: ${ex}`
  }
}

@CommandHandler("StackOverflow", "Query Stack Overflow")
@Tags("StackOverflow")
@Intent("stacko", "stack overflow")
class GetSOAnswer implements HandleCommand {

    @Parameter({description: "Enter your search query", pattern: "^.*$"})
    query: string;

    handle(ctx: HandlerContext): Plan {
        let result = new Plan();
        result.add(search(this.query))
        return result;
    }
}

export let SOAnswer = new GetSOAnswer();

@ResponseHandler("SendSOAnswer", "Shows answers to a query on Stack Overflow")
class SOResponder implements HandleResponse<any>{

  handle(@ParseJson response: Response<any>) : Message {
    return new Message(renderAnswers(response.body()))
  }
}

function search (query: string): Respondable<Execute> {
    APISearchURL = encodeURI(APISearchURL + query);
    SearchURL = encodeURI(SearchURL + query);

    return {instruction:
              {name: "http",
              kind: "execute",
              parameters:
                  {method: "get",
                    url: APISearchURL}},
                    onSuccess: {kind: "respond", name: "SendSOAnswer", parameters: { query: query }}}
}

export let responder = new SOResponder();
