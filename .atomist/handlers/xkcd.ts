import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'

@CommandHandler("xkcd", "Get the xkcd comic of the day")
@Tags("xkcd", "comic")
@Intent("xkcd")
class GetXkcdComic implements HandleCommand {

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> =
        {instruction:
              {name: "http",
              kind: "execute",
              parameters:
                  {method: "get",
                    url: `http://xkcd.com/info.0.json`}},
                    onSuccess: {kind: "respond", name: "SendXkcdComic"}}
        plan.add(execute);
        return plan;
    }
}

export let xkcdComic = new GetXkcdComic();

@ResponseHandler("SendXkcdComic", "Shows xkcd comic of the day")
class XkcdComicResponder implements HandleResponse<any>{

  handle(@ParseJson response: Response<any>) : Plan {
    let comic = response.body()
    return Plan.ofMessage(new Message(
      `{
          "attachments": [
              {
                  "fallback": "xkcd comic of the day",
                  "title": "xkcd: ${comic.safe_title}",
                  "title_link": "https://xkcd.com/",
                  "image_url": "${comic.img}"
              }
          ]
      }`
    )
    )
  }
}

export let xkcdComicResponder = new XkcdComicResponder();