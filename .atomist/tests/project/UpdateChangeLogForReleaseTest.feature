# Copyright © 2017 Atomist, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

Feature: Prepare a change log for release
  Add release header to change log above the unreleased
  changes using the provided version and release name.
  It should work if there is no change log.


  Scenario: UpdateChangeLogForRelease works with unreleased entries
    Given a change log with unreleased entries
    When UpdateChangeLogForRelease is run
    Then parameters were valid
    Then changes were made
    Then the change log contains the release name
    Then there are no unreleased entries
    Then the most recent version is correct
    Then the unreleased link refers to the correct version
    Then the most recent release compare link uses previous release
    Then the release date is correct
    Then the previous release is not compared to HEAD


  Scenario: UpdateChangeLogForRelease works with no unreleased entries
    Given a change log with no unreleased entries
    When UpdateChangeLogForRelease is run
    Then parameters were valid
    Then changes were made
    Then the change log contains the release name
    Then there are no unreleased entries
    Then the most recent version is correct
    Then the unreleased link refers to the correct version
    Then the most recent release compare link uses previous release
    Then the release date is correct
    Then the previous release is not compared to HEAD


  Scenario: UpdateChangeLogForRelease does nothing if there is no change log
    Given an empty project
    When UpdateChangeLogForRelease is run
    Then parameters were valid
    Then no changes were made
