import { HandleResponse, Execute, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext, CommandPlan, ResponseMessage } from '@atomist/rug/operations/Handlers'
import { ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent } from '@atomist/rug/operations/Decorators'

@CommandHandler("StockQuote", "Get a real-time stock quote")
@Tags("stock", "quote")
@Intent("stock quote")
class GetStockQuote implements HandleCommand {

  @Parameter({ description: "The stock symbol", pattern: "^.*$" })
  symbol: string

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
          url: `http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22${this.symbol}%22)&env=store://datatables.org/alltableswithkeys&format=json`
        }
      },
      onSuccess: { kind: "respond", name: "SendStockQuote" }
    });
    return plan;
  }
}

export let stockQuote = new GetStockQuote();

@ResponseHandler("SendStockQuote", "Prints out stock quote message")
class StockQuoteResponder implements HandleResponse<any>{

  handle( @ParseJson response: Response<any>): CommandPlan {
    let quote = (response.body as any).query.results.quote
    return CommandPlan.ofMessage(new ResponseMessage(`Latest price for ${quote.Name} (${quote.Symbol}) is ${quote.LastTradePriceOnly}${quote.Currency} (${quote.Change_PercentChange})`));
  }
}

export let stockQuoteResponder = new StockQuoteResponder();
