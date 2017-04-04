import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'

@CommandHandler("StockQuote", "Get a real-time stock quote")
@Tags("stock", "quote")
@Intent("stock quote")
class GetStockQuote implements HandleCommand {

    @Parameter({description: "The stock symbol", pattern: "^.*$"})
    symbol: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> =
        {instruction:
              {name: "http",
              kind: "execute",
              parameters:
                  {method: "get",
                    url: `http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22${this.symbol}%22)&env=store://datatables.org/alltableswithkeys&format=json`}},
                    onSuccess: {kind: "respond", name: "SendStockQuote"}}
        plan.add(execute);
        return plan;
    }
}

export let stockQuote = new GetStockQuote();

@ResponseHandler("SendStockQuote", "Prints out stock quote message")
class StockQuoteResponder implements HandleResponse<any>{

  handle(@ParseJson response: Response<any>) : Plan {
    let quote = response.body().query.results.quote
    return Plan.ofMessage(new Message(`Latest price for ${quote.Name} (${quote.Symbol}) is ${quote.LastTradePriceOnly}${quote.Currency} (${quote.Change_PercentChange})`));
  }
}

export let stockQuoteResponder = new StockQuoteResponder();
