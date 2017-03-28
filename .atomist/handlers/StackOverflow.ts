import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import * as mustache from 'mustache'

let SOAnswers = `{
  "attachments": [
    {{#answers}}
    {
      "fallback": "Stack Overflow answers",
      "color": "#36a64f",
      "title": "{{{title}}}",
      "title_link": "{{{link}}}"
    }{{^last}}, {{/last}}
    {{/answers}}
  ]
}`

//render for slack
function renderAnswers(response: any): string {
  response['items'][ response['items'].length - 1 ].last = true;
  try{
    return mustache.render(SOAnswers,
  {answers: response.items})
  }catch(ex) {
    return `Failed to render message using template: ${ex}`
  }
}

@CommandHandler("StackOverflow", "Query Stack Overflow")
@Tags("StackExchange", "StackOverflow")
@Intent("stack", "stack overflow", "stack-overflow")
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
//    console.log(response.body())
  }
}

function search (query: string): Respondable<Execute> {
    return {instruction:
              {name: "http",
              kind: "execute",
              parameters:
                  {method: "get",
                    url: `http://api.stackexchange.com/2.2/search/advanced?pagesize=3&order=desc&sort=activity&site=stackoverflow&q=${query}`}},
                    onSuccess: {kind: "respond", name: "SendSOAnswer", parameters: { query: query }}}
}

export let responder = new SOResponder();
