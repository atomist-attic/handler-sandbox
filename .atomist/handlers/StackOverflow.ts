import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, ResponseMessage, MessageMimeTypes} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import * as mustache from 'mustache'

const APISearchURL = `http://api.stackexchange.com/2.2/search/advanced?pagesize=3&order=desc&sort=relevance&site=stackoverflow&q=`
const SearchURL = `http://stackoverflow.com/search?order=desc&sort=relevance&q=`

//render for slack
function renderAnswers(response: any, query: string): string {
  if (response['items'].length == 0) {
    return "No answers found."
  }
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
			"title_link": "${SearchURL + query}"
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
@Intent("stacko")
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

  @Parameter({description: "Enter your search query", pattern: "^.*$"})
  query: string;

  handle(@ParseJson response: Response<any>) : Plan {
    return Plan.ofMessage(new ResponseMessage(renderAnswers(response.body, encodeURI(this.query)), MessageMimeTypes.SLACK_JSON));
   }
}

function search (query: string): Respondable<Execute> {
    let searchUrl = encodeURI(APISearchURL + query);
    
    return {instruction:
              {name: "http",
              kind: "execute",
              parameters:
                  {method: "get",
                    url: searchUrl}},
                    onSuccess: {kind: "respond", name: "SendSOAnswer", parameters: { query: query }}}
}

export let responder = new SOResponder();
