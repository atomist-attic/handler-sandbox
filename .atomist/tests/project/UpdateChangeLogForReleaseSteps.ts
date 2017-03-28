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

import { Project } from "@atomist/rug/model/Project";
import { Given, When, Then, ProjectScenarioWorld } from "@atomist/rug/test/project/Core";
import { File } from "@atomist/rug/model/File";

Given("a change log with unreleased entries", (p: Project) => {
    p.addFile("CHANGELOG.md", `# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

[Unreleased]: https://github.com/atomist-rugs/rug-editors/compare/0.22.0...HEAD

### Changed

-   Many a great thing

### Added

-   So many good things
-   Things even better than that

### Fixed

-   The ungood things, see [#123][123]

[123]: https://github.com/atomist-rugs/rug-editors/issue/123

## [0.22.0] - 2017-03-27

[0.22.0]: https://github.com/atomist-rugs/rug-editors/compare/0.21.0...0.22.0

Handler tests release

### Added

-   Tests for sample handlers

## [0.21.0] - 2017-03-27

[0.21.0]: https://github.com/atomist-rugs/rug-editors/compare/0.20.0...0.21.0

Handlers release

### Added

-   AddTypeScriptCommandHandler and AddTypeScriptEventHandler editors

### Removed

-   AddTypeScriptHandler was invalid

### Fixed

-   Do a better job cleaning the manifest added by AddManifestYml

### Changed

-   NewStarteRugProject also adds a command handler and an event
    handler

## [0.20.0] - 2017-03-26

[0.20.0]: https://github.com/atomist-rugs/rug-editors/compare/0.19.0...0.20.0

Format release

### Changed

-   Corrected Rug descriptions
-   Added semicolons to TypeScript code
-   Changed test step file names to Steps.ts

`);
});

Given("a change log with no unreleased entries", (p: Project) => {
    p.addFile("CHANGELOG.md", `# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

[Unreleased]: https://github.com/atomist-rugs/rug-editors/compare/0.22.0...HEAD

## [0.22.0] - 2017-03-27

[0.22.0]: https://github.com/atomist-rugs/rug-editors/compare/0.21.0...0.22.0

Handler tests release

### Added

-   Tests for sample handlers

## [0.21.0] - 2017-03-27

[0.21.0]: https://github.com/atomist-rugs/rug-editors/compare/0.20.0...0.21.0

Handlers release

### Added

-   AddTypeScriptCommandHandler and AddTypeScriptEventHandler editors

### Removed

-   AddTypeScriptHandler was invalid

### Fixed

-   Do a better job cleaning the manifest added by AddManifestYml

### Changed

-   NewStarteRugProject also adds a command handler and an event
    handler

## [0.20.0] - 2017-03-26

[0.20.0]: https://github.com/atomist-rugs/rug-editors/compare/0.19.0...0.20.0

Format release

### Changed

-   Corrected Rug descriptions
-   Added semicolons to TypeScript code
-   Changed test step file names to Steps.ts

`);
});

const testVersion = "2.7.18";
const testName = "Natural Log";
const changeLogPath = "CHANGELOG.md";

When("UpdateChangeLogForRelease is run", (p, world) => {
    let psworld = world as ProjectScenarioWorld;
    let editor = psworld.editor("UpdateChangeLogForRelease");
    psworld.editWith(editor, { version: testVersion, name: testName });
});

Then("the change log contains the release name", (p: Project) => {
    return p.fileContains(changeLogPath, testName);
});

Then("there are no unreleased entries", (p: Project) => {
    let cl: File = p.findFile(changeLogPath);
    let contents = cl.content();
    return /\.\.\.HEAD\s*## \[\d/.test(contents);
});

Then("the most recent version is correct", (p: Project) => {
    let cl: File = p.findFile(changeLogPath);
    let contents = cl.content();
    let matches = /\n## \[(\d+\.\d+\.\d+)\]/.exec(contents);
    if (matches == null || matches.length < 2) {
        return false;
    }
    let firstVersion = matches[1];
    return firstVersion == testVersion;
});

Then("the unreleased link refers to the correct version", (p: Project) => {
    let cl: File = p.findFile(changeLogPath);
    let contents = cl.content();
    let matches = /compare\/(\d+\.\d+\.\d+)\.\.\.HEAD/.exec(contents);
    if (matches == null || matches.length < 2) {
        return false;
    }
    let compareVersion = matches[1];
    return compareVersion == testVersion;
});

Then("the most recent release compare link uses previous release", (p: Project) => {
    let expected = `https://github.com/atomist-rugs/rug-editors/compare/0.22.0...${testVersion}`;
    return p.fileContains(changeLogPath, expected);
});

Then("the release date is correct", (p: Project) => {
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
    let cl: File = p.findFile(changeLogPath);
    let contents = cl.content();
    let matches = /\n## \[2\.7\.18\] - (\d+-\d+-\d+)/.exec(contents);
    if (matches == null || matches.length < 2) {
        return false;
    }
    let releaseDate = matches[1];
    return releaseDate == today;
});

Then("the previous release is not compared to HEAD", (p: Project) => {
    return !p.fileContains(changeLogPath, "0.22.0...HEAD");
});
