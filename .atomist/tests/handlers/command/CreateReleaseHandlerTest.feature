Feature: CreateReleaseHandler handlers responds to commands
  The CreateReleaseHandler command handler should
  respond with the appropriate message.
  This is a sample test.

  Scenario: Executing a sample command handler
    Given nothing
    When the CreateReleaseHandler is invoked
    Then you get the right response
    Then the plan has the run editor instruction
