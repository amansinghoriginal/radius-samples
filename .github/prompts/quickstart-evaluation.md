Background:
    - Radius is a cloud-native application platform.
    - The Radius Quick Start is written for a completely new Radius user.
    - You are validating the GitHub Codespaces path of that Quick Start.

Environment:
    - You are already inside the Radius Samples Dev Container opened by the
      GitHub Codespaces option in the documentation.
    - The Dev Container has already created a local k3d Kubernetes cluster and
      installed the Radius CLI. Treat those as satisfied prerequisites.
    - The rendered documentation is served at
      http://127.0.0.1:1313/quick-start/.
    - Playwright and Chromium are installed globally. NODE_PATH is configured,
      so Node.js scripts can import or require Playwright without npm install.
    - localhost ports are directly reachable; do not create additional port
      forwards except those explicitly created by tutorial commands.

Goal:
    - Act as a naive, literal first-time Radius user.
    - Read the rendered Quick Start in the browser, choose the GitHub Codespaces
      path where the installation instructions offer alternatives, and follow
      the tutorial in order.
    - The GitHub Codespaces tab is an entry point into the environment, not an
      installation command. Verify that it contains a link to
      `https://codespaces.new/radius-project/samples`, then confirm the
      Dev Container-provided CLI with the documented `rad version` command and
      continue. The externally hosted badge image itself is not a required
      tutorial outcome and may be unavailable in an isolated browser.
    - Determine whether a new user can complete the tutorial without missing
      context, ambiguity, undocumented recovery, or output mismatches.
    - Compare every documented expected result with the observed result.

Permitted harness mechanics:
    - At the beginning, you may run `rad version`,
      `kubectl config current-context`, and `kubectl cluster-info` as environment
      sanity checks.
    - `rad initialize` is interactive. Copy
      `.github/scripts/quickstart-initialize.exp` into the evaluation directory
      as the next numbered evidence file, then run that copy with the absolute
      `todolist` working directory and the next numbered transcript path as its
      two arguments. It spawns the exact `rad initialize` command and accepts
      the documented default **Yes** selection in a pseudo-terminal. Do not
      write or use a different initialization helper.
      Bubble Tea redraws and erases its live frames, so the transcript may
      contain only terminal-control sequences. A zero exit status plus the
      generated `app.bicep` and successful later tutorial outcomes are the
      durable evidence of initialization; do not fail only because transient
      TUI text is absent from the transcript.
    - `rad run app.bicep` is long-lived. Copy
      `.github/scripts/quickstart-run.exp` into the evaluation directory as the
      next numbered evidence file. Start that copy with `nohup` in the
      background, passing the absolute `todolist` working directory and the
      next numbered transcript path. Save the helper process ID in the
      evaluation directory and use another shell for later tutorial steps. Do
      not write or use a different `rad run` helper. Its live TUI frames may
      also be erased from the transcript; validate deployment through the
      documented localhost pages and application graph.
    - `rad app delete todolist` requires confirmation. Copy
      `.github/scripts/quickstart-delete.exp` into the evaluation directory as
      the next numbered evidence file, then run that copy with the absolute
      `todolist` working directory and next numbered transcript path. It spawns
      the exact documented command and selects **Yes** in its pseudo-terminal.
      Do not write or use a different deletion helper.
    - You may use bounded waits for documented resources and localhost pages to
      become ready. Initialization may take up to ten minutes; all other waits
      must not exceed five minutes.
    - You may create Playwright scripts inside the evaluation directory to read
      the rendered tutorial, inspect localhost pages, and capture screenshots.
    - You may stop background processes that you started after all documented
      checks and cleanup are complete.

Evaluation criteria:
    - Commands must be the commands shown in the rendered Quick Start. Do not
      replace them with equivalent commands or add diagnostic Radius or
      Kubernetes commands.
    - Ignore volatile values such as timestamps, generated pod names, IDs,
      ages, ordering, and whitespace. Core resource names, types, statuses,
      relationships, and user-visible behavior must match.
    - Verify that `rad initialize` reports successful installation, creation of
      the default environment, scaffolding of the `todolist` application, and
      local configuration. Because transient TUI frames are not durable in the
      transcript, verify these semantically through a successful command exit,
      the generated application definition, and the later tutorial outcomes.
    - Verify that the generated `app.bicep` exists and semantically matches the
      application definition shown in the documentation.
    - Verify that `rad run app.bicep` completes deployment and starts the
      documented localhost experiences.
    - In the Todo List application, verify the user-visible "No connections
      defined" state described by the tutorial.
    - In the Radius Dashboard, verify that the `todolist` application and its
      resources are visible.
    - Verify that `rad app graph` contains the documented Radius container and
      underlying Kubernetes resources.
    - Run the documented application deletion. Skip the optional Radius purge
      and record it as an optional section that was intentionally skipped.

Failure behavior:
    - Fail immediately when an instruction is ambiguous, a required command
      fails, expected output or behavior does not match, or a required page
      does not become ready within the bounded wait.
    - Do not debug, repair, retry with different commands, inspect product
      internals, search the web, install packages, or modify the documentation.
    - Record the failure and the evidence already collected, then stop.

Evidence:
    - At the start, create one directory named `evaluation-<UTC timestamp>` in
      the repository root.
    - Store every command output used for evaluation in that directory.
    - Prefix evidence filenames with a two-digit sequence and underscore, in
      execution order, for example `01_environment.txt`.
    - Store every Playwright screenshot there with the same numbering scheme.
    - Helper scripts must remain in that directory.
    - Tutorial-created files, including the `todolist` directory and generated
      `app.bicep`, may remain where the tutorial instructs.
    - Create exactly one final `report.md` in the evaluation directory. Include:
        - environment and tool versions;
        - one section for each tutorial step;
        - observed versus expected behavior;
        - references to evidence files;
        - ambiguities or failures;
        - the skipped optional purge.

Final report contract:
    1. `report.md` must exist even when evaluation fails.
    2. Its final line must be exactly `## STATUS: SUCCESS` or
       `## STATUS: FAILURE`.
    3. That status line must occur exactly once in the entire report.
    4. Never use either status phrase for an individual step.
