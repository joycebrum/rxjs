import { COMPLETE_NOTIFICATION, errorNotification, nextNotification } from '../NotificationFactories';
import { OperatorFunction, ObservableNotification } from '../types';
import { Observable } from '../Observable';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * Represents all of the notifications from the source Observable as `next`
 * emissions marked with their original types within {@link ObservableNotification}
 * objects.
 *
 * <span class="informal">Wraps `next`, `error` and `complete` emissions in
 * {@link ObservableNotification} objects, emitted as `next` on the output Observable.
 * </span>
 *
 * ![](materialize.png)
 *
 * `materialize` returns an Observable that emits a `next` notification for each
 * `next`, `error`, or `complete` emission of the source Observable. When the
 * source Observable emits `complete`, the output Observable will emit `next` as
 * a Notification of type "complete", and then it will emit `complete` as well.
 * When the source Observable emits `error`, the output will emit `next` as a
 * Notification of type "error", and then `complete`.
 *
 * This operator is useful for producing metadata of the source Observable, to
 * be consumed as `next` emissions. Use it in conjunction with
 * {@link dematerialize}.
 *
 * ## Example
 *
 * Convert a faulty Observable to an Observable of Notifications
 *
 * ```ts
 * import { of, materialize, map } from 'rxjs';
 *
 * const letters = of('a', 'b', 13, 'd');
 * const upperCase = letters.pipe(map((x: any) => x.toUpperCase()));
 * const materialized = upperCase.pipe(materialize());
 *
 * materialized.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // - Notification { kind: 'N', value: 'A', error: undefined, hasValue: true }
 * // - Notification { kind: 'N', value: 'B', error: undefined, hasValue: true }
 * // - Notification { kind: 'E', value: undefined, error: TypeError { message: x.toUpperCase is not a function }, hasValue: false }
 * ```
 *
 * @see {@link ObservableNotification}
 * @see {@link dematerialize}
 *
 * @return A function that returns an Observable that emits
 * {@link ObservableNotification} objects that wrap the original emissions from the
 * source Observable with metadata.
 */
export function materialize<T>(): OperatorFunction<T, ObservableNotification<T>> {
  return (source) =>
    new Observable((subscriber) => {
      source.subscribe(
        createOperatorSubscriber(
          subscriber,
          (value) => {
            subscriber.next(nextNotification(value));
          },
          () => {
            subscriber.next(COMPLETE_NOTIFICATION);
            subscriber.complete();
          },
          (error) => {
            subscriber.next(errorNotification(error));
            subscriber.complete();
          }
        )
      );
    });
}
