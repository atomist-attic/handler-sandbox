import { HandleResponse, Execute, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext, CommandPlan, ResponseMessage, MessageMimeTypes } from '@atomist/rug/operations/Handlers'
import { ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent } from '@atomist/rug/operations/Decorators'

@CommandHandler("xkcd", "Get the xkcd comic of the day")
@Tags("xkcd", "comic")
@Intent("xkcd")
class GetXkcdComic implements HandleCommand {

    handle(ctx: HandlerContext): CommandPlan {
        let plan = new CommandPlan();
        plan.add({
            instruction:
            {
                name: "http",
                kind: "execute",
                parameters:
                {
                    method: "get",
                    url: `http://xkcd.com/info.0.json`
                }
            },
            onSuccess: { kind: "respond", name: "SendXkcdComic" }
        });
        return plan;
    }
}

export let xkcdComic = new GetXkcdComic();

@ResponseHandler("SendXkcdComic", "Shows xkcd comic of the day")
class XkcdComicResponder implements HandleResponse<any>{

    handle( @ParseJson response: Response<any>): CommandPlan {
        let comic = response.body as any

        return CommandPlan.ofMessage(new ResponseMessage(
            `{
          "attachments": [
              {
                  "fallback": "xkcd comic of the day",
                  "title": "xkcd: ${comic.safe_title}",
                  "title_link": "https://xkcd.com/",
                  "image_url": "${comic.img}"
              }
          ]
      }`, MessageMimeTypes.SLACK_JSON
        )
        )
    }
}

export let xkcdComicResponder = new XkcdComicResponder();