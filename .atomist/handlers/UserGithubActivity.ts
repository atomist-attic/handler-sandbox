import { HandleResponse, HandleEvent, Execute, Respondable, HandleCommand, Respond, Instruction, Response, HandlerContext, Plan } from '@atomist/rug/operations/Handlers'
import { TreeNode, Match, PathExpression } from '@atomist/rug//tree/PathExpression'
import { EventHandler, ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent } from '@atomist/rug/operations/Decorators'
import { Project } from '@atomist/rug/model/Core'
import { renderKitties } from './SlackTemplates'

@CommandHandler("UserGithubActivity", "Search and display a users recent Github activity")
@Tags("github", "users")
@Intent("recent github activity")
@Secrets("github://user_token?scopes=repo")
class GithubSearcher implements HandleCommand {

  @Parameter({ description: "Number of days to search", pattern: "^.*$" })
  days: number = 1

  @MappedParameter("atomist://correlation_id")
  corrid: string

  handle(command: HandlerContext): Plan {
    let result = new Plan()
    result.add(search(this.days))
    return result;
  }
}

export let searcher = new GithubSearcher();

@ResponseHandler("SendActivity", "Sends recent GithubActivity to slack")
class ActivityResponder implements HandleResponse<any>{

  handle( @ParseJson response: Response<any>): Plan {
    //return new Message(renderKitties(response.body()))
    //console.log()
    let notes: any[] = response.body();

    let relevant = notes.filter(function (note) {
      return ["assign", "author", "comment", "manual", "state_change"].indexOf(note.reason) != -1
    })
    relevant.forEach(function (note) {
      console.log(note.reason, note.subject.type, note.repository.full_name, note.subject.title, note.subject.url)
    })
    return new Plan();
  }
}

function search(days: number): Respondable<Execute> {

  let date = new Date();
  date.setDate(date.getDate() - days);
  let since = date.toISOString();
  console.log("Since: " + since)
  return {
    instruction:
    {
      name: "http",
      kind: "execute",
      parameters:
      {
        method: "get",
        url: `https://api.github.com/notifications?access_token=#{github://user_token?scopes=repo}&all=true&participating=true&since${since}`
      }
    },
    onSuccess: { kind: "respond", name: "SendActivity" },
    onError: { kind: "respond", name: "HandleError" }
  }
}

@ResponseHandler("HandleError", "Renders the error")
class ErrorRenderer implements HandleResponse<any>{

  handle( @ParseJson response: Response<any>): Plan {
    //return new Message(renderKitties(response.body)
    console.log(JSON.stringify(response.body()))
    console.log(response.code)
    console.log(response.msg)
    return new Plan();
  }
}
export let errors = new ErrorRenderer();
export let display = new ActivityResponder();
