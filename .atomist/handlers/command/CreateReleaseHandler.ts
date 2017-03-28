/*
 * Copyright © 2017 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { HandleCommand, HandlerContext, HandleResponse, MappedParameters, Message, Plan, Response } from '@atomist/rug/operations/Handlers';
import { CommandHandler, ResponseHandler, Parameter, MappedParameter, Tags, Intent } from '@atomist/rug/operations/Decorators';
import { Pattern } from '@atomist/rug/operations/RugOperation';

import { CommonParameters } from '../../utils/Parameters';

/**
 * Prepare and cut a release in a repository.
 */
@CommandHandler("CreateReleaseHandler", "prepare and cut a release in a repository")
@Tags("github", "release")
@Intent("release")
export class CreateReleaseHandler implements HandleCommand {

    @Parameter({
        ...CommonParameters.versionParameter
    })
    version: string;

    @Parameter({
        ...CommonParameters.nameParameter
    })
    name: string;

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    handle(command: HandlerContext): Plan {
        let plan: Plan = new Plan();
        const changeLogEditor = "UpdateChangeLogForRelease";
        plan.add({
            instruction: {
                name: changeLogEditor,
                project: this.repo,
                kind: "edit",
                parameters: { version: this.version, name: this.name }
            },
            onSuccess: { kind: "respond", name: "ChangeLogEditorSuccess" },
            onError: { kind: "respond", name: "HandleUpdateChangeLogError" }
        });
        let message: Message = new Message(`Starting the ${changeLogEditor} editor`);
        return plan.add(message);
    }
}

export const createReleaseHandler = new CreateReleaseHandler();

@ResponseHandler("ChangeLogEditorSuccess", "handle update change log editor handler errors")
export class ChangeLogEditorSuccess implements HandleResponse<any>{

    handle(response: Response<any>): Message {
        return new Message(`Successfully edited the change log`);
    }
}
export const changeLogEditorSuccess = new ChangeLogEditorSuccess();

@ResponseHandler("HandleUpdateChangeLogError", "handle update change log editor handler errors")
export class HandleUpdateChangeLogError implements HandleResponse<any>{

    handle(response: Response<any>): Message {
        let message = response.body();
        return new Message(`Failed editing the change log: ${message}`);
    }
}
export const handleUpdateChangeLogError = new HandleUpdateChangeLogError();
