import { GraphQLObjectType } from "graphql";
import { BehaviorSubject } from "rxjs";
import { filter, first, sampleTime } from "rxjs/operators";

const PAUSED = "paused";
const RUNNING = "running";

const controlFields = (fields, controller) => {
  Object.values(fields).forEach(field => {
    const oldResolve = field.resolve;
    field.resolve = (...args) => {
      controller._beforeResolver();
      return controller.state$
        .pipe(
          filter(state => state === RUNNING),
          first()
        )
        .toPromise()
        .then(() => {
          const result = oldResolve(...args);
          controller._afterResolver();
          return result;
        });
    };
  });
};

export const controlSchema = (schema, controller) => {
  Object.values(schema.getTypeMap()).forEach(type => {
    if (type instanceof GraphQLObjectType) {
      controlFields(type.getFields(), controller);
    }
  });
};

export class SchemaController {
  state$ = new BehaviorSubject(PAUSED);
  pendingResolvers$ = new BehaviorSubject(0);

  _beforeResolver() {
    this.pendingResolvers$.next(this.pendingResolvers$.getValue() + 1);
  }

  _afterResolver() {
    this.pendingResolvers$.next(this.pendingResolvers$.getValue() - 1);
  }

  pause() {
    this.state$.next(PAUSED);
  }

  run() {
    this.state$.next(RUNNING);
    return this.pendingResolvers$
      .pipe(sampleTime(0), filter(value => value === 0), first())
      .toPromise();
  }
}
