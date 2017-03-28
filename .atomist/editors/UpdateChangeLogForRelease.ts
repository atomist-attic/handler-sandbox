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

import { EditProject } from '@atomist/rug/operations/ProjectEditor';
import { Project } from '@atomist/rug/model/Project';
import { Pattern } from '@atomist/rug/operations/RugOperation';
import { Editor, Parameter, Tags } from '@atomist/rug/operations/Decorators';
import { File } from '@atomist/rug/model/File';

import { CommonParameters } from '../utils/Parameters';

/**
 * Insert a new release header and name in a change log file.
 */
@Editor("UpdateChangeLogForRelease", "move unreleased entries in change log under a release")
@Tags("changelog", "release")
export class UpdateChangeLogForRelease implements EditProject {

    @Parameter({
        ...CommonParameters.versionParameter
    })
    version: string;

    @Parameter({
        ...CommonParameters.nameParameter
    })
    name: string;

    edit(project: Project) {
        const changeLogPath = "CHANGELOG.md";
        if (!project.fileExists(changeLogPath)) {
            console.log(`Project ${project.name()} has no change log`);
            return;
        }

        let changeLog: File = project.findFile(changeLogPath);
        let changeLogContents = changeLog.content();

        let slugRegEx = /Unreleased.*https:\/\/github\.com\/(.+?\/.+?)\/compare\//;
        let slugMatches = slugRegEx.exec(changeLogContents);
        if (slugMatches == null || slugMatches.length < 2) {
            console.log("failed to determine repo slug");
            return;
        }
        let slug = slugMatches[1];

        let previousRegEx = /compare\/(\d+\.\d+\.\d+)\.\.\.HEAD/;
        let previousMatches = previousRegEx.exec(changeLogContents);
        if (previousMatches == null || previousMatches.length < 2) {
            console.log("failed to determine previous version");
            return;
        }
        let previous = previousMatches[1];

        let now = new Date();
        let month = now.getMonth() + 1;
        let monthString: string = month.toString();
        if (month < 10) {
            monthString = `0${month}`;
        }
        let date = now.getDate();
        let dateString: string = date.toString();
        if (date < 10) {
            dateString = `0${date}`;
        }
        let today = `${now.getFullYear()}-${monthString}-${dateString}`;

        let releaseMarkdown = `[Unreleased]: https://github.com/${slug}/compare/${this.version}...HEAD

## [${this.version}] - ${today}

[${this.version}]: https://github.com/${slug}/compare/${previous}...${this.version}

${this.name} release`;

        let newContents = changeLogContents.replace(/\[Unreleased\]:.*/, releaseMarkdown);
        changeLog.setContent(newContents);
    }
}

export const updateChangeLogForRelease = new UpdateChangeLogForRelease();
