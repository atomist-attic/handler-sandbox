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

import { Pattern } from '@atomist/rug/operations/RugOperation';

/**
 * Common parameters used across multiple Rugs.
 */
export const CommonParameters = {

    versionParameter: {
        displayName: "Release Version",
        description: "semantic version to release",
        pattern: "^\\d+\\.\\d+\\.\\d+$",
        validInput: "a valid semantic version of the form M.N.P, e.g., 1.2.3",
        minLength: 5,
        maxLength: 100
    },
    nameParameter: {
        displayName: "Release Name",
        description: "name for release",
        pattern: Pattern.any,
        validInput: "a description of the valid input",
        minLength: 1,
        maxLength: 50
    }
};
