This repository groups tests into two folders for clarity:

- test/unit/
  - Pure logic and model tests that do not require Flutter widgets or rendering.
  - Run with:

    ```powershell
    cd C:\Users\amigo\mobile_fitness
    flutter test test/unit -r expanded
    ```

- test/widget/
  - Widget tests that use the Flutter test harness (`WidgetTester`) and pump widgets.
  - Run with:

    ```powershell
    cd C:\Users\amigo\mobile_fitness
    flutter test test/widget -r expanded
    ```

Notes:
- The `FakePedometerAdapter` and `FakeTicker` are used in widget tests to avoid relying on native plugins and real timers.
- If you want to run the full suite, use `flutter test -r expanded`.
- CI: configure your pipeline to run unit tests (fast) separately from widget tests if desired. Widget tests require the Flutter test environment.
