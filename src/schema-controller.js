import { BehaviorSubject } from "rxjs";
import { filter, first, sampleTime } from "rxjs/operators";

export const PAUSED = "paused";
export const RUNNING = "running";

export class SchemaController {
  state$ = new BehaviorSubject(PAUSED);
  pendingQueries$ = new BehaviorSubject(0);

  _beforeQuery() {
    this.pendingQueries$.next(this.pendingQueries$.getValue() + 1);
  }

  _afterQuery() {
    this.pendingQueries$.next(this.pendingQueries$.getValue() - 1);
  }

  when(state) {
    return this.state$
      .pipe(
        filter(s => s === state),
        first()
      )
      .toPromise();
  }

  pause() {
    this.state$.next(PAUSED);
  }

  run(options) {
    this.state$.next(RUNNING);
    return this.pendingQueries$
      .pipe(
        sampleTime(0),
        filter(value => value === 0),
        first()
      )
      .toPromise();
  }
}
