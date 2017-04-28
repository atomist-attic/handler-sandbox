import { HandleResponse, HandleEvent, Execute, HandleCommand, Respond, CommandRespondable, Response, HandlerContext, CommandPlan, ResponseMessage, MessageMimeTypes } from '@atomist/rug/operations/Handlers'
import { TreeNode, Match, PathExpression } from '@atomist/rug//tree/PathExpression'
import { EventHandler, ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent } from '@atomist/rug/operations/Decorators'
import { Project } from '@atomist/rug/model/Core'
import { renderKitties } from './SlackTemplates'

@CommandHandler("KittySearch", "Search for kitty snippets")
@Tags("youtube", "kitty", "kitties")
@Intent("find kitties")
@Secrets("secret://team?path=google/api-token")
class KittySearch implements HandleCommand {

  @Parameter({ description: "What kind of kitties?", pattern: "^.*$" })
  kind: string;

  handle(command: HandlerContext): CommandPlan {
    let result = new CommandPlan()
    result.add(search(this.kind))
    return result;
  }
}

export let searcher = new KittySearch();

@ResponseHandler("SendSnippets", "Sends kitty video links to slack")
class KittiesResponder implements HandleResponse<any>{

  handle( @ParseJson response: Response<any>): CommandPlan {
    return CommandPlan.ofMessage(new ResponseMessage(renderKitties(response.body), MessageMimeTypes.SLACK_JSON));
  }
}

function search(kind: string): CommandRespondable<Execute> {
  return {
    instruction:
    {
      name: "http",
      kind: "execute",
      parameters:
      {
        method: "get",
        url: `https://www.googleapis.com/youtube/v3/search?part=id,snippet&videoEmbeddable=true&type=video&q=cats+${kind}+&key=#{secret://team?path=google/api-token}`
      }
    },
    onSuccess: { kind: "respond", name: "SendSnippets" }
  }
}

export let kittRes = new KittiesResponder();
