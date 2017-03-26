import { HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message } from '@atomist/rug/operations/Handlers'
import { ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent } from '@atomist/rug/operations/Decorators'

@CommandHandler("TheBigLebowski", "Get a random quote from the The Big Lebowski")
@Tags("dude", "walter", "Lebowski, quote")
@Intent("the dude", "big lebowski", "what would the dude say")
class GetTheBigLebowskiQuote implements HandleCommand {

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> =
        {instruction:
              {name: "http",
              kind: "execute",
              parameters:
                  {method: "get",
                    url: ` http://lebowski.me/api/quotes/random`}},
                    onSuccess: {kind: "respond", name: "SendBigLebowskiQuote"}}
        plan.add(execute);
        return plan;
    }
}

export let theBigLebowskiQuote = new GetTheBigLebowskiQuote();

@ResponseHandler("SendBigLebowskiQuote", "Prints out a Big Lebowski quote")
class BigLebowskiResponder implements HandleResponse<any>{

  handle(@ParseJson response: Response<any>) : Message {
    let quote = response.body().quote.lines[0]
    let character = quote.character.name
    var text = quote.text as string
    // Sanitize text
    text = text.split("fucking").join("f******")
    text = text.split("fuck").join("f***")
    text = text.split("Fuck").join("F***")
    text = text.split("FUCKING").join("F******")
    text = text.split("FUCK").join("F***")
    text = text.split("Fucked").join("F*****")
    text = text.split("fucked").join("f*****")
    return new Message(`${character}: _ ${text} _`)
  }
}

export let bigLebowskiResponder = new BigLebowskiResponder();
