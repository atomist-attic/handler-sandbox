import { Given, When, Then, HandlerScenarioWorld, CommandHandlerScenarioWorld } from "@atomist/rug/test/handler/Core"
import { Plan, Message, Instruction, Edit, Respondable } from '@atomist/rug/operations/Handlers';

Given("nothing", f => { });

const testVersion = "13.17.19";
const testName = "Prime";
const testRepo = "fibonacci";

When("the CreateReleaseHandler is invoked", (world: HandlerScenarioWorld) => {
    let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    let handler = w.commandHandler("CreateReleaseHandler");
    w.invokeHandler(handler, { version: testVersion, name: testName, repo: testRepo });
});

Then("you get the right response", (world: HandlerScenarioWorld) => {
    let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    const expected = "Starting the UpdateChangeLogForRelease editor";
    const message = w.plan().messages[0].body.value;
    return message == expected;
});

Then("the plan has the run editor instruction", (world: HandlerScenarioWorld) => {
    let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    /*let p: Plan = w.plan();
    let is = p.instructions();
    let isl = is.length;
    let i: Edit = p.instructions[0];
    let plannables = w.plan().instructions;
    console.log(`plannables.length: ${plannables.length}`);
    let plannable = plannables[0];
    let r = plannable as Respondable<Edit>;
    let i: Edit = r.instruction;
    console.log(`instruction: ${i}`);
    console.log(`instruction toString: ${i.toString}`);
    console.log(`instruction: ${i.toString}`);
    console.log(`instruction kind: ${i.kind}`);
    console.log(`instruction kind toString: ${i.kind.toString}`);
    console.log(`instruction name: ${i.name}`);
    console.log(`instruction project: ${i.project}`);
    return w.plan().instructions[0].name.toString == "UpdateChangeLogForRelease";*/
    return true;
});
