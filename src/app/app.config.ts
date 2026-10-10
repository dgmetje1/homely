import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { Router, provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { TransitionScroller } from './view-transitions/transition-scroller';
import { Direction, pageStateOf, transitionTypes } from './view-transitions/transition-types';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      // Every router navigation now runs inside document.startViewTransition().
      withViewTransitions({
        skipInitialTransition: true,
        // Runs in an injection context, so we can peek at the navigation that triggered it.
        onViewTransitionCreated: ({ transition, from, to }) => {
          const direction = inject(Router).currentNavigation()?.extras.state?.['direction'] as
            | Direction
            | undefined;
          // Tag the transition so CSS can choreograph each kind of navigation differently.
          for (const type of transitionTypes(pageStateOf(from), pageStateOf(to), direction)) {
            transition.types?.add(type);
          }
          inject(TransitionScroller).attach(transition);
        },
      }),
    ),
    provideAppInitializer(() => inject(TransitionScroller).init()),
  ],
};
