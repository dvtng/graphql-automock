import { BehaviorSubject } from "rxjs";
import { filter, first, sampleTime } from "rxjs/operators";

export const PAUSED = "paused";
export const RUNNING = "running";

export class Controller {
  state$ = new BehaviorSubject({ name: PAUSED });
  pendingQueries$ = new BehaviorSubject(0);

  _beforeQuery() {
    this.pendingQueries$.next(this.pendingQueries$.getValue() + 1);
  }

  _afterQuery() {
    this.pendingQueries$.next(this.pendingQueries$.getValue() - 1);
  }

  _when(stateName) {
    return this.state$
      .pipe(
        filter(state => state.name === stateName),
        first()
      )
      .toPromise();
  }

  pause() {
    this.state$.next({ name: PAUSED });
  }

  run(options = {}) {
    this.state$.next({ name: RUNNING, networkError: options.networkError });
    return this.pendingQueries$
      .pipe(
        sampleTime(0),
        filter(value => value === 0),
        first()
      )
      .toPromise();
  }
}
